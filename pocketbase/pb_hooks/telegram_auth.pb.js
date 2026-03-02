/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/telegram-auth", (e) => {
  const body = e.requestInfo().body || {};
  const initData = body.initData;
  if (!initData || typeof initData !== "string") return e.json(400, { error: "initData is required" });

  const params = {};
  let hash = "";

  for (const pair of initData.split("&")) {
    const i = pair.indexOf("=");
    if (i === -1) continue;
    const key = decodeURIComponent(pair.slice(0, i));
    const value = decodeURIComponent(pair.slice(i + 1));

    if (key === "hash") { hash = value.toLowerCase(); continue; }
    params[key] = value;
  }

  if (!hash) return e.json(400, { error: "hash not found in initData" });
  console.log("[tg-auth] keys=", Object.keys(params).join(","), " hash=", hash);

  const dataCheckString = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("\n");
  console.log("[tg-auth] dcs=", dataCheckString);

  const botToken = $os.getenv("TELEGRAM_BOT_TOKEN");
  if (!botToken) return e.json(500, { error: "TELEGRAM_BOT_TOKEN not configured" });

  let computedHash = "";
  try {
    const py = [
      "import sys,hmac,hashlib",
      "dcs=sys.argv[1].encode()",
      "bot=sys.argv[2].encode()",
      "secret=hmac.new(b'WebAppData', bot, hashlib.sha256).digest()",
      "print(hmac.new(secret, dcs, hashlib.sha256).hexdigest())"
    ].join("\n");

    const out = $os.cmd("python3", "-c", py, dataCheckString, botToken).output();
    computedHash = toString(out).trim().toLowerCase();
  } catch (err) {
    console.log("[tg-auth] verify exception:", String(err));
    return e.json(500, { error: "Telegram signature verification failed" });
  }

  console.log("[tg-auth] computed=", computedHash);
  if (!computedHash || !$security.equal(computedHash, hash)) return e.json(401, { error: "Invalid initData signature" });

  const authDate = parseInt(params["auth_date"] || "0", 10);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > 86400 || authDate - now > 300) return e.json(401, { error: "initData expired" });

  let userData;
  try { userData = JSON.parse(params["user"] || "{}"); }
  catch (_) { return e.json(400, { error: "Invalid user data in initData" }); }

  const telegramId = String(userData.id || "");
  if (!telegramId) return e.json(400, { error: "user.id not found in initData" });

  let record;
  try { record = $app.findFirstRecordByFilter("users", "telegramId = {:telegramId}", { telegramId }); } catch (_) {}

  if (!record) {
    const collection = $app.findCollectionByNameOrId("users");
    record = new Record(collection);

    const syntheticEmail = `tg_${telegramId}@telegram.local`;
    const randomPassword = $security.randomString(32);

    record.set("email", syntheticEmail);
    record.set("password", randomPassword);
    record.set("passwordConfirm", randomPassword);
    record.set("telegramId", telegramId);
    record.set("telegramUsername", userData.username || "");
    record.set("firstName", userData.first_name || "");
    record.set("lastName", userData.last_name || "");
    record.set("name", [userData.first_name, userData.last_name].filter(Boolean).join(" "));
    record.setVerified(true);

    $app.save(record);
  } else if (userData.username && record.get("telegramUsername") !== userData.username) {
    record.set("telegramUsername", userData.username);
    $app.save(record);
  }

  return e.json(200, { token: record.newAuthToken(), record: record });
});
