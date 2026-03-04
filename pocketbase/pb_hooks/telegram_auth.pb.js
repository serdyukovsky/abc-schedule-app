/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/telegram-auth", (e) => {
  const fail = (status, message) => {
    console.log(`[telegram-auth] ${status} ${message}`);
    return e.json(status, { error: message, message });
  };

  const body = e.requestInfo().body || {};
  const initData = body.initData;
  if (!initData || typeof initData !== "string") return fail(400, "initData is required");

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

  if (!hash) return fail(400, "hash not found in initData");

  const dataCheckString = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("\n");

  const botToken = $os.getenv("TELEGRAM_BOT_TOKEN");
  if (!botToken) return fail(500, "TELEGRAM_BOT_TOKEN not configured");

  // PocketBase's $security.hs256 uses string keys (UTF-8 bytes), but Telegram's verification
  // requires a binary intermediate key (raw HMAC bytes). Python is the only reliable option here.
  let computedHash = "";
  try {
    const out = $os.cmd(
      "python3", "-c",
      "import sys,hmac,hashlib; s=hmac.new(b'WebAppData',sys.argv[1].encode(),hashlib.sha256).digest(); print(hmac.new(s,sys.argv[2].encode(),hashlib.sha256).hexdigest())",
      botToken,
      dataCheckString
    ).output();
    computedHash = toString(out).trim().toLowerCase();
  } catch (err) {
    console.log(`[telegram-auth] signature command failed: ${err}`);
    return fail(500, "Telegram signature verification failed");
  }

  if (!computedHash || !$security.equal(computedHash, hash)) return fail(401, "Invalid initData signature");

  // Keep a practical validity window because some Telegram Android clients
  // may reuse WebView session data longer than expected.
  const maxAgeRaw = $os.getenv("TELEGRAM_AUTH_MAX_AGE_SEC") || "86400";
  const futureSkewRaw = $os.getenv("TELEGRAM_AUTH_FUTURE_SKEW_SEC") || "300";
  const maxAgeSec = parseInt(maxAgeRaw, 10);
  const futureSkewSec = parseInt(futureSkewRaw, 10);
  const authMaxAgeSec = (!isNaN(maxAgeSec) && maxAgeSec > 0) ? maxAgeSec : 86400;
  const authFutureSkewSec = (!isNaN(futureSkewSec) && futureSkewSec > 0) ? futureSkewSec : 300;

  const authDate = parseInt(params["auth_date"] || "0", 10);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > authMaxAgeSec || authDate - now > authFutureSkewSec) {
    return fail(401, "initData expired");
  }

  let userData;
  try { userData = JSON.parse(params["user"] || "{}"); }
  catch (_) { return fail(400, "Invalid user data in initData"); }

  const telegramId = String(userData.id || "");
  if (!telegramId) return fail(400, "user.id not found in initData");

  let record;
  try {
    record = $app.findFirstRecordByFilter(
      "users",
      "telegramId = {:telegramId}",
      { telegramId }
    );
  } catch (_) {}

  if (!record) {
    try {
      const usersCollection = $app.findCollectionByNameOrId("users");
      const displayName =
        [userData.first_name || "", userData.last_name || ""].join(" ").trim() ||
        userData.username ||
        `Telegram ${telegramId}`;

      record = new Record(usersCollection);
      record.set("email", `tg_${telegramId}@telegram.local`);
      record.setEmailVisibility(false);
      record.setVerified(true);
      record.setRandomPassword();
      record.set("name", displayName);
      record.set("telegramId", telegramId);
      record.set("telegramUsername", userData.username || "");
      $app.save(record);
    } catch (err) {
      console.log(`[telegram-auth] user create failed for tg=${telegramId}: ${err}`);
      return fail(500, "Failed to create user");
    }
  }

  const nextUsername = userData.username || "";
  if (record.get("telegramUsername") !== nextUsername) {
    record.set("telegramUsername", nextUsername);
    $app.save(record);
  }

  return e.json(200, { token: record.newAuthToken(), record: record });
});
