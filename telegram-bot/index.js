"use strict";

const { Telegraf, Markup } = require("telegraf");
// PocketBase CJS build — already a root dependency (pocketbase@0.26.x)
const PocketBase = require("pocketbase/cjs");

// ─── Config ──────────────────────────────────────────────────────────────────

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const pbUrl           = process.env.PB_URL            || "http://127.0.0.1:8090";
const pbAdminEmail    = process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.PB_ADMIN_PASSWORD;

// Mini App deep links
const miniAppBaseLink = process.env.MINI_APP_BASE_LINK || "https://t.me/abcschedule_bot/app";
const miniAppBuildTag = process.env.APP_BUILD_TAG || String(Math.floor(Date.now() / 1000));

function withBuildTag(url) {
  try {
    const u = new URL(url);
    u.searchParams.set("v", miniAppBuildTag);
    return u.toString();
  } catch {
    return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(miniAppBuildTag)}`;
  }
}

const miniAppDeepLink = withBuildTag(
  process.env.MINI_APP_DEEP_LINK || `${miniAppBaseLink}?startapp=main&mode=fullscreen`
);

// Reminder window: fire reminder when event starts in [REMIND-2 … REMIND+2] min
const REMIND_BEFORE_MIN = parseInt(process.env.REMIND_BEFORE_MIN || "15") || 15;
const WINDOW_HALF_MIN   = 2;

// Conference timezone: PocketBase stores times as "conference local" in UTC field.
// Set CONF_UTC_OFFSET_HOURS to the conference timezone offset (e.g. 6 for UTC+6)
const CONF_OFFSET_MS = (parseInt(process.env.CONF_UTC_OFFSET_HOURS || "0") || 0) * 3_600_000;

// ─── PocketBase client ────────────────────────────────────────────────────────

const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);

async function pbAuth() {
  if (!pbAdminEmail || !pbAdminPassword) {
    console.error("[pb] Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD");
    return false;
  }
  try {
    await pb.collection("_superusers").authWithPassword(pbAdminEmail, pbAdminPassword);
    console.log("[pb] Admin auth OK");
    return true;
  } catch (err) {
    console.error("[pb] Auth failed:", err.message);
    return false;
  }
}

/** Re-authenticates if token expired. Replies with error if ctx provided. */
async function ensureAuth(ctx) {
  if (pb.authStore.isValid) return true;
  const ok = await pbAuth();
  if (!ok && ctx) await ctx.reply("Сервис временно недоступен. Попробуйте позже.");
  return ok;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escape HTML special chars for safe use in parse_mode: "HTML" */
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Format HH:MM from a PocketBase date string (conference local time, no-tz). */
function fmtTime(dateStr) {
  if (!dateStr) return "";
  // Strip Z so JS treats it as local — mirrors parseUTCAsLocal() in client
  const d = new Date(String(dateStr).replace("Z", "").replace(" ", "T"));
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/** Convert a JS Date to PocketBase ISO filter string. */
function toPbDate(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function findUsersByTelegramId(telegramId) {
  return pb.collection("users").getFullList({
    filter: `telegramId = '${telegramId}'`,
  });
}

function pickUser(users) {
  return users[0] || null;
}

// ─── Reminder scheduler ───────────────────────────────────────────────────────

async function checkAndSendReminders() {
  if (!await ensureAuth(null)) return;

  // Compute the reminder window in conference-local time
  const nowConf  = new Date(Date.now() + CONF_OFFSET_MS);
  const winStart = new Date(nowConf.getTime() + (REMIND_BEFORE_MIN - WINDOW_HALF_MIN) * 60_000);
  const winEnd   = new Date(nowConf.getTime() + (REMIND_BEFORE_MIN + WINDOW_HALF_MIN) * 60_000);

  let schedules;
  try {
    schedules = await pb.collection("user_schedules").getFullList({
      filter: `event.startTime >= '${toPbDate(winStart)}' && event.startTime <= '${toPbDate(winEnd)}'`,
      expand: "event.speaker,user",
    });
  } catch (err) {
    console.error("[reminders] fetch failed:", err.message);
    return;
  }

  if (!schedules.length) return;
  console.log(`[reminders] ${schedules.length} schedule(s) in window`);

  for (const sched of schedules) {
    const user  = sched.expand?.user;
    const event = sched.expand?.event;
    if (!user?.telegramId || !event) continue;

    // Idempotency: create sent_reminders first — unique constraint blocks duplicates
    try {
      await pb.collection("sent_reminders").create({ user: sched.user, event: sched.event });
    } catch {
      continue; // already sent
    }

    const speaker     = event.expand?.speaker;
    const speakerLine = speaker?.name ? `\n👤 ${esc(speaker.name)}` : "";
    const eventLink   = withBuildTag(`${miniAppBaseLink}?startapp=event_${event.id}&mode=fullscreen`);

    const text =
      `🔔 <b>Через ${REMIND_BEFORE_MIN} минут начнётся:</b>\n\n` +
      `<b>${esc(event.title)}</b>\n` +
      `📍 ${esc(event.location)} · ${fmtTime(event.startTime)}` +
      speakerLine;

    try {
      await bot.telegram.sendMessage(user.telegramId, text, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("📅 Открыть в расписании", eventLink)],
        ]),
      });
      console.log(`[reminders] → sent to ${user.telegramId} for "${event.title}"`);
    } catch (err) {
      console.error(`[reminders] sendMessage to ${user.telegramId} failed:`, err.message);
    }
  }
}

// ─── /schedule command ────────────────────────────────────────────────────────

async function handleScheduleCommand(ctx) {
  const telegramId = String(ctx.from?.id);
  if (!await ensureAuth(ctx)) return;

  let users;
  try {
    users = await findUsersByTelegramId(telegramId);
  } catch {
    return ctx.reply("Не удалось получить данные. Попробуй позже.");
  }

  const user = pickUser(users);
  if (!user) {
    return ctx.reply(
      "Сначала открой приложение кнопкой ниже, чтобы завершить вход.\n" +
      "После этого команда /schedule будет показывать твой план.",
      openKeyboard
    );
  }

  const userId = user.id;
  // Use conference-local date for day boundaries (events stored as local-time-in-UTC)
  const nowConf  = new Date(Date.now() + CONF_OFFSET_MS);
  const dayStart = new Date(Date.UTC(nowConf.getUTCFullYear(), nowConf.getUTCMonth(), nowConf.getUTCDate()));
  const dayEnd   = new Date(dayStart.getTime() + 86_400_000);

  let schedules;
  try {
    schedules = await pb.collection("user_schedules").getFullList({
      filter: `user = '${userId}' && event.startTime >= '${toPbDate(dayStart)}' && event.startTime < '${toPbDate(dayEnd)}'`,
      expand: "event",
      sort: "event.startTime",
    });
  } catch {
    return ctx.reply("Не удалось получить расписание. Попробуй позже.");
  }

  if (!schedules.length) {
    return ctx.reply(
      "На сегодня в твоём плане нет докладов.\nДобавь интересные события в приложении 👇",
      openKeyboard
    );
  }

  const lines = schedules
    .map((s) => {
      const ev = s.expand?.event;
      if (!ev) return null;
      return `• ${fmtTime(ev.startTime)} <b>${esc(ev.title)}</b>\n  📍 ${esc(ev.location)}`;
    })
    .filter(Boolean)
    .join("\n\n");

  await ctx.reply(`<b>Твой план на сегодня:</b>\n\n${lines}`, {
    parse_mode: "HTML",
    ...openKeyboard,
  });
}

// ─── Bot setup ────────────────────────────────────────────────────────────────

const bot = new Telegraf(botToken);

const openKeyboard = Markup.inlineKeyboard([
  [Markup.button.url("🏔 Открыть расписание", miniAppDeepLink)],
]);

// ─── /start ───────────────────────────────────────────────────────────────────

// Always responds instantly — no PocketBase calls here
bot.start(async (ctx) => {
  console.log(`[start] /start from ${ctx.from?.id} (@${ctx.from?.username})`);
  await ctx.reply(
    "Привет! 👋 Это официальный гид по Altay Business Camp 2026.\n\n" +
    "Я помогу тебе сориентироваться в 5 днях интенсива, не пропустить топовых спикеров " +
    "и собрать своё личное расписание.\n\n" +
    "Горы зовут! Давай начнём?",
    Markup.inlineKeyboard([[Markup.button.callback("Поехали! 🚀", "onboarding_start")]])
  );
});

// "Поехали!" → open mini app
bot.action("onboarding_start", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    "Отлично, поехали! 🚀\n\nЖми кнопку ниже, чтобы открыть расписание:",
    openKeyboard
  );
});

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.command("schedule", handleScheduleCommand);

bot.command("help", async (ctx) => {
  const baseText =
    "<b>ABC Forum — расписание кемпа</b>\n\n" +
    "/schedule — мой план на сегодня\n" +
    "/start — открыть приложение\n\n";

  await ctx.reply(
    `${baseText}Всё расписание — в приложении 👇`,
    { parse_mode: "HTML", ...openKeyboard }
  );
});

// ─── Text fallback ────────────────────────────────────────────────────────────

bot.on("text", async (ctx) => {
  await ctx.reply(
    "Используй кнопку ниже, чтобы открыть расписание 👇",
    openKeyboard
  );
});

bot.catch((err) => {
  console.error("Telegram bot error:", err);
});

// ─── Start ────────────────────────────────────────────────────────────────────

let remindersIntervalId = null;

function enableReminderScheduler() {
  if (remindersIntervalId) return;
  console.log(`[reminders] Scheduler active — every 60s, window T-${REMIND_BEFORE_MIN}min ±${WINDOW_HALF_MIN}min`);
  checkAndSendReminders();
  remindersIntervalId = setInterval(checkAndSendReminders, 60_000);
}

async function start() {
  try {
    await bot.launch({ dropPendingUpdates: true });
    const me = await bot.telegram.getMe();
    console.log(`Telegram bot started: @${me.username} (id=${me.id})`);
    try {
      await bot.telegram.setMyCommands([
        { command: "schedule", description: "Мой план на сегодня" },
        { command: "help",     description: "Справка" },
      ]);
      console.log("Bot commands registered");
    } catch (err) {
      console.error("setMyCommands failed:", err.message);
    }
  } catch (err) {
    console.error("FATAL: Failed to launch bot:", err.message);
    process.exit(1);
  }

  if (await pbAuth()) {
    enableReminderScheduler();
  } else {
    console.error("[pb] Bot started without PocketBase auth; /start works, DB features unavailable until auth succeeds.");
  }

  // Recover quickly if PB is temporarily unavailable.
  setInterval(async () => {
    if (pb.authStore.isValid) return;
    const ok = await pbAuth();
    if (ok) {
      console.log("[pb] auth recovered");
      enableReminderScheduler();
    }
  }, 60_000);

  // Refresh admin token every 12h.
  setInterval(async () => {
    const ok = await pbAuth();
    if (!ok) {
      console.error("[pb] periodic re-auth failed");
      return;
    }
    enableReminderScheduler();
  }, 12 * 3_600_000);
}

start();

const shutdown = () => {
  bot.stop("SIGTERM");
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
