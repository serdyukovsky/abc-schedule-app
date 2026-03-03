/// <reference path="../pb_data/types.d.ts" />

const APRIL_DAYS = [
  "2026-04-20",
  "2026-04-21",
  "2026-04-22",
  "2026-04-23",
  "2026-04-24",
];

const MARCH_DAYS = [
  "2026-03-03",
  "2026-03-04",
  "2026-03-05",
  "2026-03-06",
  "2026-03-07",
];

function remapDatePrefix(value, mapping) {
  const str = String(value || "");
  const m = str.match(/^(\d{4}-\d{2}-\d{2})([ T].*)$/);
  if (!m) return str;
  const nextPrefix = mapping[m[1]];
  return nextPrefix ? `${nextPrefix}${m[2]}` : str;
}

function applyDateMap(app, fromDays, toDays) {
  const mapping = {};
  for (let i = 0; i < fromDays.length && i < toDays.length; i += 1) {
    mapping[fromDays[i]] = toDays[i];
  }

  const events = app.findAllRecords("events");
  for (const event of events) {
    const startTime = String(event.get("startTime") || "");
    const startPrefix = startTime.slice(0, 10);
    if (!mapping[startPrefix]) continue;

    event.set("startTime", remapDatePrefix(startTime, mapping));
    event.set("endTime", remapDatePrefix(event.get("endTime"), mapping));
    app.save(event);
  }
}

migrate((app) => {
  applyDateMap(app, APRIL_DAYS, MARCH_DAYS);
}, (app) => {
  applyDateMap(app, MARCH_DAYS, APRIL_DAYS);
});
