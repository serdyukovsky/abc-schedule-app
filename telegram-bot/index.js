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

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Reminder window: fire reminder when event starts in [REMIND-WINDOW … REMIND+WINDOW] min
const REMIND_BEFORE_MIN = intEnv("REMIND_BEFORE_MIN", 10);
const WINDOW_HALF_MIN   = Math.max(0, intEnv("REMINDER_WINDOW_HALF_MIN", 2));
const SCHEDULER_INTERVAL_MS = Math.max(15_000, intEnv("REMINDER_CHECK_EVERY_SEC", 60) * 1000);

// Conference timezone: PocketBase stores times as "conference local" in UTC field.
// Set CONF_UTC_OFFSET_HOURS to the conference timezone offset (e.g. 6 for UTC+6)
const CONF_OFFSET_HOURS = intEnv("CONF_UTC_OFFSET_HOURS", 7);
const CONF_OFFSET_MS = CONF_OFFSET_HOURS * 3_600_000;

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
  const nowConf  = confNow();
  const winStart = new Date(nowConf.getTime() + (REMIND_BEFORE_MIN - WINDOW_HALF_MIN) * 60_000);
  const winEnd   = new Date(nowConf.getTime() + (REMIND_BEFORE_MIN + WINDOW_HALF_MIN) * 60_000);

  // Query target events first and then collect user schedules for them.
  // This avoids relying on relation-field filters in user_schedules.
  let reminderEvents;
  try {
    reminderEvents = await pb.collection("events").getFullList({
      filter: `startTime >= '${toPbDate(winStart)}' && startTime <= '${toPbDate(winEnd)}'`,
      sort: "startTime",
    });
  } catch (err) {
    console.error("[reminders] fetch failed:", err.message);
    return;
  }

  if (!reminderEvents.length) return;
  console.log(`[reminders] ${reminderEvents.length} event(s) in T-${REMIND_BEFORE_MIN} window`);

  for (const event of reminderEvents) {
    let schedules;
    try {
      schedules = await pb.collection("user_schedules").getFullList({
        filter: `event = '${event.id}'`,
        expand: "event.speaker,user",
      });
    } catch (err) {
      console.error(`[reminders] schedules fetch failed for event ${event.id}:`, err.message);
      continue;
    }

    if (!schedules.length) continue;

    for (const sched of schedules) {
      const user = sched.expand?.user;
      const expandedEvent = sched.expand?.event || event;
      if (!user?.telegramId || !expandedEvent) continue;

      let sentMarker = null;
      try {
        sentMarker = await pb.collection("sent_reminders").create({ user: sched.user, event: sched.event });
      } catch {
        continue; // already sent for this user/event
      }

      const speaker     = expandedEvent.expand?.speaker;
      const speakerLine = speaker?.name ? `\n👤 ${esc(speaker.name)}` : "";
      const eventLink   = withBuildTag(`${miniAppBaseLink}?startapp=event_${expandedEvent.id}&mode=fullscreen`);

      const text =
        `🔔 <b>Через ${REMIND_BEFORE_MIN} минут начнётся:</b>\n\n` +
        `<b>${esc(expandedEvent.title)}</b>\n` +
        `📍 ${esc(expandedEvent.location)} · ${fmtTime(expandedEvent.startTime)}` +
        speakerLine;

      try {
        await bot.telegram.sendMessage(user.telegramId, text, {
          parse_mode: "HTML",
          ...Markup.inlineKeyboard([
            [Markup.button.url("📅 Открыть в расписании", eventLink)],
          ]),
        });
        console.log(`[reminders] → sent to ${user.telegramId} for "${expandedEvent.title}"`);
      } catch (err) {
        console.error(`[reminders] sendMessage to ${user.telegramId} failed:`, err.message);
        // Allow retry on the next scheduler tick if delivery failed.
        if (sentMarker?.id) {
          try {
            await pb.collection("sent_reminders").delete(sentMarker.id);
          } catch {}
        }
      }
    }
  }
}

/** Return conference-local "now" as a fake-UTC Date. */
function confNow() {
  return new Date(Date.now() + CONF_OFFSET_MS);
}

// ─── /testreminder command ───────────────────────────────────────────────────

async function handleTestReminder(ctx) {
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
      "Сначала открой приложение, чтобы завершить вход.\nПосле этого можно тестировать уведомления.",
      openKeyboard
    );
  }

  // Fetch all user schedules and filter by time in JS
  // (PocketBase doesn't support relation-field filters like event.startTime)
  const now = confNow();
  let allSchedules;
  try {
    allSchedules = await pb.collection("user_schedules").getFullList({
      filter: `user = '${user.id}'`,
      expand: "event,event.speaker",
    });
  } catch (err) {
    return ctx.reply(`Ошибка запроса расписания: ${err.message}`);
  }

  // Find future events first, then fall back to any today
  const nowMs = now.getTime();
  const dayStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const withEvent = allSchedules
    .filter((s) => s.expand?.event)
    .map((s) => ({ sched: s, ev: s.expand.event, startMs: new Date(s.expand.event.startTime).getTime() }))
    .sort((a, b) => a.startMs - b.startMs);

  let pick = withEvent.find((x) => x.startMs >= nowMs)
    || withEvent.find((x) => x.startMs >= dayStartMs);

  if (!pick) {
    return ctx.reply(
      "У тебя нет запланированных событий. Добавь что-нибудь в приложении, потом попробуй снова.",
      openKeyboard
    );
  }

  const ev = pick.ev;

  const speaker = ev.expand?.speaker;
  const speakerLine = speaker?.name ? `\n👤 ${esc(speaker.name)}` : "";
  const eventLink = withBuildTag(`${miniAppBaseLink}?startapp=event_${ev.id}&mode=fullscreen`);

  const text =
    `🧪 <b>Тестовое уведомление:</b>\n\n` +
    `<b>${esc(ev.title)}</b>\n` +
    `📍 ${esc(ev.location)} · ${fmtTime(ev.startTime)}` +
    speakerLine;

  try {
    await bot.telegram.sendMessage(telegramId, text, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("📅 Открыть в расписании", eventLink)],
      ]),
    });
    console.log(`[testreminder] → sent to ${telegramId} for "${ev.title}"`);
  } catch (err) {
    console.error(`[testreminder] sendMessage failed:`, err.message);
    return ctx.reply(`Ошибка отправки: ${err.message}`);
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
  // Fetch all user schedules and filter by day in JS
  // (PocketBase doesn't support relation-field filters like event.startTime)
  const nowConf  = confNow();
  const dayStartMs = Date.UTC(nowConf.getUTCFullYear(), nowConf.getUTCMonth(), nowConf.getUTCDate());
  const dayEndMs   = dayStartMs + 86_400_000;

  let allSchedules;
  try {
    allSchedules = await pb.collection("user_schedules").getFullList({
      filter: `user = '${userId}'`,
      expand: "event",
    });
  } catch {
    return ctx.reply("Не удалось получить расписание. Попробуй позже.");
  }

  const todaySchedules = allSchedules
    .filter((s) => {
      const ev = s.expand?.event;
      if (!ev) return false;
      const t = new Date(ev.startTime).getTime();
      return t >= dayStartMs && t < dayEndMs;
    })
    .sort((a, b) => new Date(a.expand.event.startTime) - new Date(b.expand.event.startTime));

  if (!todaySchedules.length) {
    return ctx.reply(
      "На сегодня в твоём плане нет докладов.\nДобавь интересные события в приложении 👇",
      openKeyboard
    );
  }

  const lines = todaySchedules
    .map((s) => {
      const ev = s.expand.event;
      return `• ${fmtTime(ev.startTime)} <b>${esc(ev.title)}</b>\n  📍 ${esc(ev.location)}`;
    })
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

// Persistent reply keyboard — always visible at the bottom of the chat
const menuKeyboard = Markup.keyboard([
  ["📋 Мой план на сегодня"],
  [Markup.button.webApp("🏔 Открыть расписание", miniAppDeepLink)],
]).resize();

// ─── /start ───────────────────────────────────────────────────────────────────

// Always responds instantly — no PocketBase calls here
bot.start(async (ctx) => {
  console.log(`[start] /start from ${ctx.from?.id} (@${ctx.from?.username})`);
  await ctx.reply(
    "Привет! 👋 Это официальный гид по Altay Business Camp 2026.\n\n" +
    "Я помогу тебе сориентироваться в 5 днях интенсива, не пропустить топовых спикеров " +
    "и собрать своё личное расписание.\n\n" +
    "Горы зовут! Используй кнопки внизу 👇",
    menuKeyboard
  );
});

// "Поехали!" → open mini app + show persistent menu
bot.action("onboarding_start", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    "Отлично, поехали! 🚀\n\nВнизу — кнопки для быстрого доступа:",
    menuKeyboard
  );
});

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.command("schedule", handleScheduleCommand);
bot.command("testreminder", handleTestReminder);

bot.command("help", async (ctx) => {
  const baseText =
    "<b>ABC Forum — расписание кемпа</b>\n\n" +
    "/schedule — мой план на сегодня\n" +
    "/testreminder — тест уведомления\n" +
    "/start — открыть приложение\n\n";

  await ctx.reply(
    `${baseText}Всё расписание — в приложении 👇`,
    { parse_mode: "HTML", ...openKeyboard }
  );
});

// ─── Text fallback ────────────────────────────────────────────────────────────

bot.hears("📋 Мой план на сегодня", handleScheduleCommand);

bot.on("text", async (ctx) => {
  await ctx.reply(
    "Используй кнопки внизу 👇",
    menuKeyboard
  );
});

bot.catch((err) => {
  console.error("Telegram bot error:", err);
});

// ─── Start ────────────────────────────────────────────────────────────────────

let remindersIntervalId = null;

function enableReminderScheduler() {
  if (remindersIntervalId) return;
  const tzLabel = `UTC${CONF_OFFSET_HOURS >= 0 ? "+" : ""}${CONF_OFFSET_HOURS}`;
  console.log(`[reminders] Scheduler active — every ${Math.round(SCHEDULER_INTERVAL_MS / 1000)}s, window T-${REMIND_BEFORE_MIN}min ±${WINDOW_HALF_MIN}min (${tzLabel})`);
  checkAndSendReminders();
  remindersIntervalId = setInterval(checkAndSendReminders, SCHEDULER_INTERVAL_MS);
}

async function start() {
  try {
    await bot.telegram.deleteWebhook({ drop_pending_updates: true });
    bot.startPolling();
    const me = await bot.telegram.getMe();
    console.log(`Telegram bot started: @${me.username} (id=${me.id})`);
    try {
      await bot.telegram.setMyCommands([
        { command: "schedule",     description: "Мой план на сегодня" },
        { command: "testreminder", description: "Тест уведомления" },
        { command: "help",         description: "Справка" },
      ]);
      // Menu button next to the message input — opens the mini app
      await bot.telegram.setChatMenuButton({
        menuButton: {
          type: "web_app",
          text: "Расписание",
          web_app: { url: miniAppDeepLink },
        },
      });
      console.log("Bot commands and menu button registered");
    } catch (err) {
      console.error("setMyCommands/menu failed:", err.message);
    }
  } catch (err) {
    console.error("FATAL: Failed to launch bot:", err.message);
    process.exit(1);
  }

  if (await pbAuth()) {
    enableReminderScheduler();
    // Startup diagnostics
    try {
      const now = confNow();
      const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const dayEnd = new Date(dayStart.getTime() + 86_400_000);
      const todayEvents = await pb.collection("events").getFullList({
        filter: `startTime >= '${toPbDate(dayStart)}' && startTime < '${toPbDate(dayEnd)}'`,
      });
      const totalSchedules = await pb.collection("user_schedules").getFullList();
      const totalUsers = await pb.collection("users").getFullList({ fields: "id,telegramId" });
      const usersWithTgId = totalUsers.filter((u) => u.telegramId);
      const sentReminders = await pb.collection("sent_reminders").getFullList();
      console.log(
        `[diag] Conference time: ${now.toISOString()} | ` +
        `Today events: ${todayEvents.length} | ` +
        `User schedules: ${totalSchedules.length} | ` +
        `Users with telegramId: ${usersWithTgId.length}/${totalUsers.length} | ` +
        `Sent reminders (total): ${sentReminders.length}`
      );
    } catch (err) {
      console.error("[diag] Startup diagnostics failed:", err.message);
    }
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
