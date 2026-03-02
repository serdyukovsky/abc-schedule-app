/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data — add unique index for ticketCode
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegramId ON users (telegramId) WHERE telegramId != ''",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_ticketCode ON users (ticketCode) WHERE ticketCode != ''"
    ]
  }, collection)

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_ticket_code",
    "max": 64,
    "min": 0,
    "name": "ticketCode",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegramId ON users (telegramId) WHERE telegramId != ''"
    ]
  }, collection)

  collection.fields.removeById("text_ticket_code")

  return app.save(collection)
})
