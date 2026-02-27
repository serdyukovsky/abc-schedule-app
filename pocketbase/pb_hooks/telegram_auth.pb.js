/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/telegram-auth", (e) => {
  const body = $apis.requestInfo(e).body;
  const initData = body.initData;

  if (!initData) {
    return e.json(400, { error: "initData is required" });
  }

  // Get pre-computed secret key from environment variable.
  // Generate it with:
  //   echo -n "WebAppData" | openssl dgst -sha256 -hmac "$BOT_TOKEN" -binary | xxd -p -c 64
  // Then set TELEGRAM_SECRET_KEY=<hex output>
  const secretKey = $os.getenv("TELEGRAM_SECRET_KEY");
  if (!secretKey) {
    return e.json(500, { error: "Telegram secret key not configured" });
  }

  // Parse initData as URL query string
  const params = {};
  let hash = "";
  const pairs = initData.split("&");
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(pair.substring(0, eqIdx));
    const value = decodeURIComponent(pair.substring(eqIdx + 1));
    if (key === "hash") {
      hash = value;
    } else {
      params[key] = value;
    }
  }

  if (!hash) {
    return e.json(400, { error: "hash not found in initData" });
  }

  // Build data_check_string: sort keys alphabetically, join with \n
  const dataCheckString = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("\n");

  // Validate: HMAC-SHA256(data_check_string, secret_key) == hash
  const computedHash = $security.hs256(dataCheckString, secretKey);

  if (!$security.equal(computedHash, hash)) {
    return e.json(401, { error: "Invalid initData signature" });
  }

  // Check auth_date is not too old (24 hours for conference use)
  const authDate = parseInt(params["auth_date"] || "0");
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return e.json(401, { error: "initData expired" });
  }

  // Extract user info from the JSON-encoded "user" param
  let userData;
  try {
    userData = JSON.parse(params["user"] || "{}");
  } catch (err) {
    return e.json(400, { error: "Invalid user data in initData" });
  }

  const telegramId = String(userData.id || "");
  if (!telegramId) {
    return e.json(400, { error: "user.id not found in initData" });
  }

  // Find or create user by telegramId
  let record;
  try {
    record = $app.findFirstRecordByFilter(
      "users",
      "telegramId = {:telegramId}",
      { telegramId: telegramId }
    );
  } catch (err) {
    // User not found — will create below
  }

  if (!record) {
    // Create new user
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
    record.set(
      "name",
      [userData.first_name, userData.last_name].filter(Boolean).join(" ")
    );
    record.setVerified(true);

    $app.save(record);
  } else {
    // Update username if changed
    if (
      userData.username &&
      record.get("telegramUsername") !== userData.username
    ) {
      record.set("telegramUsername", userData.username);
      $app.save(record);
    }
  }

  // Generate auth token
  const token = record.newAuthToken();

  return e.json(200, { token: token, record: record });
});
