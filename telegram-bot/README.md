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
- `PB_ADMIN_EMAIL` (required)
- `PB_ADMIN_PASSWORD` (required)

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
