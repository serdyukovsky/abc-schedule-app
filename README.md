# ABC Schedule App

Web mini-app for Altai Business Camp attendees.

## What the app does

- Shows event schedule by day and track
- Lets users add sessions to their personal plan
- Detects time conflicts between selected sessions
- Supports Telegram Mini App login (auto-auth from `initData`)

## Current stack

- Frontend: React 19 + Vite + TypeScript
- Backend/data: PocketBase (collections + JS hooks)
- Bot: Telegraf bot that opens the Mini App

## Project structure

- `client/` - web app UI and state
- `pocketbase/` - PocketBase binary, migrations, hooks, seed script
- `telegram-bot/` - Telegram bot source
- `dist/` - production web build output

## Local run

Requirements:

- Node.js 20+
- PocketBase binary at `pocketbase/pocketbase`

1. Install dependencies:

```bash
npm install
```

2. Start PocketBase:

```bash
npm run pb:dev
```

3. (Optional) Seed demo data:

```bash
node pocketbase/seed.mjs
```

4. Start frontend:

```bash
npm run dev
```

5. (Optional) Start Telegram bot:

```bash
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN npm run bot:start
```

## Telegram auth note

Telegram Mini App auth endpoint is implemented in `pocketbase/pb_hooks/telegram_auth.pb.js`.
PocketBase process must have `TELEGRAM_BOT_TOKEN` set, otherwise Telegram login will fail.
Optional auth window env for PocketBase process:

- `TELEGRAM_AUTH_MAX_AGE_SEC` (default `86400`)
- `TELEGRAM_AUTH_FUTURE_SKEW_SEC` (default `300`)

## Build

```bash
npm run build
```
