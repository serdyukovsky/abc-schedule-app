# Telegram Bot

This bot sends a fullscreen Mini App link on `/start` and `/app`.

## Local run

```bash
npm install
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN npm run bot:start
```

Optional env:

- `MINI_APP_DEEP_LINK` (default: `https://t.me/abcschedule_bot/app?startapp=main&mode=fullscreen`)
- `PB_URL` (default: `http://127.0.0.1:8090`)
- `PB_ADMIN_EMAIL` (optional, needed for `/schedule` and reminders)
- `PB_ADMIN_PASSWORD` (optional, needed for `/schedule` and reminders)
- `APP_BUILD_TAG` (optional, used for cache-busting mini app links)
- `REMIND_BEFORE_MIN` (default: `10`)
- `REMINDER_WINDOW_HALF_MIN` (default: `1`; total window = `T-REMIND ± HALF`, in minutes)
- `REMINDER_CHECK_EVERY_SEC` (default: `60`)
- `CONF_UTC_OFFSET_HOURS` (default: `7`, Altai conference timezone)

## systemd service example

Create `/etc/systemd/system/abcschedule-bot.service`:

```ini
[Unit]
Description=ABC Schedule Telegram Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/abc-schedule
Environment="TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN"
Environment="PB_URL=http://127.0.0.1:8090"
Environment="PB_ADMIN_EMAIL=admin@example.com"
Environment="PB_ADMIN_PASSWORD=your_password"
Environment="MINI_APP_DEEP_LINK=https://t.me/abcschedule_bot/app?startapp=main&mode=fullscreen"
ExecStart=/usr/bin/npm run bot:start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now abcschedule-bot.service
sudo systemctl status abcschedule-bot.service --no-pager
```
