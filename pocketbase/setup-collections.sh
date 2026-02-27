#!/bin/bash
# Setup PocketBase collections for ABC Schedule App
set -e

PB_URL="http://127.0.0.1:8090"
ADMIN_EMAIL="admin@abc.ru"
ADMIN_PASSWORD="admin12345678"

# Get admin token
TOKEN=$(curl -s "$PB_URL/api/collections/_superusers/auth-with-password" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "Admin authenticated"

# Helper function
create_collection() {
  local data="$1"
  local name=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
  curl -s "$PB_URL/api/collections" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Collection {d.get(\"name\",\"?\")} created: {d.get(\"id\",d.get(\"message\",\"?\"))}')"
}

# 1. speakers collection
echo "--- Creating speakers ---"
create_collection '{
  "name": "speakers",
  "type": "base",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "photo", "type": "file", "maxSelect": 1, "maxSize": 5242880, "mimeTypes": ["image/jpeg","image/png","image/webp"]},
    {"name": "bio", "type": "text"},
    {"name": "role", "type": "text"},
    {"name": "company", "type": "text"}
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}'

# 2. tracks collection
echo "--- Creating tracks ---"
create_collection '{
  "name": "tracks",
  "type": "base",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "color", "type": "text"}
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}'

# 3. events collection
echo "--- Creating events ---"
create_collection '{
  "name": "events",
  "type": "base",
  "fields": [
    {"name": "title", "type": "text", "required": true},
    {"name": "description", "type": "editor"},
    {"name": "speaker", "type": "relation", "collectionId": "", "cascadeDelete": false, "maxSelect": 1},
    {"name": "track", "type": "relation", "collectionId": "", "cascadeDelete": false, "maxSelect": 1},
    {"name": "location", "type": "text"},
    {"name": "startTime", "type": "date", "required": true},
    {"name": "endTime", "type": "date", "required": true},
    {"name": "topics", "type": "json"},
    {"name": "subtitle", "type": "text"}
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}'

# 4. user_schedules collection
echo "--- Creating user_schedules ---"
create_collection '{
  "name": "user_schedules",
  "type": "base",
  "fields": [
    {"name": "user", "type": "relation", "collectionId": "", "cascadeDelete": true, "maxSelect": 1, "required": true},
    {"name": "event", "type": "relation", "collectionId": "", "cascadeDelete": true, "maxSelect": 1, "required": true}
  ],
  "listRule": "user = @request.auth.id",
  "viewRule": "user = @request.auth.id",
  "createRule": "@request.auth.id != \"\" && user = @request.auth.id",
  "updateRule": null,
  "deleteRule": "user = @request.auth.id"
}'

echo ""
echo "=== Collections created! ==="
echo "Now fix relation fields via admin UI at $PB_URL/_/"
echo "- events.speaker → speakers"
echo "- events.track → tracks"
echo "- user_schedules.user → users"
echo "- user_schedules.event → events"
