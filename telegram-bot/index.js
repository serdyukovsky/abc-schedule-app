"use strict";

const { Telegraf, Markup } = require("telegraf");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const miniAppDeepLink =
  process.env.MINI_APP_DEEP_LINK ||
  "https://t.me/abcschedule_bot/app?startapp=main&mode=fullscreen";

const bot = new Telegraf(botToken);

const keyboard = Markup.inlineKeyboard([
  [Markup.button.url("Открыть расписание", miniAppDeepLink)],
]);

bot.start(async (ctx) => {
  await ctx.reply(
    "Добро пожаловать! Откройте мини-приложение по кнопке ниже.",
    keyboard
  );
});

bot.command("app", async (ctx) => {
  await ctx.reply("Открыть мини-приложение:", keyboard);
});

bot.catch((err) => {
  console.error("Telegram bot error:", err);
});

bot.launch().then(() => {
  console.log("Telegram bot started");
});

const shutdown = () => {
  bot.stop("SIGTERM");
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

