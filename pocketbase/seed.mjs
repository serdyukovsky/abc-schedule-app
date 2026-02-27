// PocketBase seed script — creates collections and imports mock data
// Run: node pocketbase/seed.mjs

import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

// Auth as superuser
await pb.collection("_superusers").authWithPassword("admin@REDACTED.local", "REDACTED");
console.log("Authenticated as superuser");

// ── Helper: create or get collection ──────────────────────────────────────────

async function getOrCreateCollection(data) {
  try {
    const existing = await pb.collections.getOne(data.name);
    console.log(`  Collection "${data.name}" already exists (${existing.id})`);
    return existing;
  } catch {
    const created = await pb.collections.create(data);
    console.log(`  Collection "${data.name}" created (${created.id})`);
    return created;
  }
}

// ── Step 1: Create collections ────────────────────────────────────────────────

console.log("\n=== Creating collections ===");

const speakersCol = await getOrCreateCollection({
  name: "speakers",
  type: "base",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "photo", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
    { name: "bio", type: "text" },
    { name: "role", type: "text" },
    { name: "company", type: "text" },
  ],
  listRule: "",
  viewRule: "",
  createRule: null,
  updateRule: null,
  deleteRule: null,
});

const tracksCol = await getOrCreateCollection({
  name: "tracks",
  type: "base",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "color", type: "text" },
  ],
  listRule: "",
  viewRule: "",
  createRule: null,
  updateRule: null,
  deleteRule: null,
});

const eventsCol = await getOrCreateCollection({
  name: "events",
  type: "base",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "subtitle", type: "text" },
    { name: "description", type: "editor" },
    { name: "speaker", type: "relation", collectionId: speakersCol.id, cascadeDelete: false, maxSelect: 1 },
    { name: "track", type: "relation", collectionId: tracksCol.id, cascadeDelete: false, maxSelect: 1 },
    { name: "location", type: "text" },
    { name: "startTime", type: "date", required: true },
    { name: "endTime", type: "date", required: true },
    { name: "topics", type: "json" },
  ],
  listRule: "",
  viewRule: "",
  createRule: null,
  updateRule: null,
  deleteRule: null,
});

// Get the built-in users collection ID
const usersCol = await pb.collections.getOne("users");

const userSchedulesCol = await getOrCreateCollection({
  name: "user_schedules",
  type: "base",
  fields: [
    { name: "user", type: "relation", collectionId: usersCol.id, cascadeDelete: true, maxSelect: 1, required: true },
    { name: "event", type: "relation", collectionId: eventsCol.id, cascadeDelete: true, maxSelect: 1, required: true },
  ],
  listRule: "user = @request.auth.id",
  viewRule: "user = @request.auth.id",
  createRule: "@request.auth.id != '' && user = @request.auth.id",
  updateRule: null,
  deleteRule: "user = @request.auth.id",
});

// ── Step 2: Seed tracks ──────────────────────────────────────────────────────

console.log("\n=== Seeding tracks ===");

const trackData = [
  { name: "Ключевой доклад", color: "#FF6B35" },
  { name: "Технологии", color: "#007AFF" },
  { name: "Операции", color: "#34C759" },
  { name: "Лидерство", color: "#AF52DE" },
  { name: "Инвестиции", color: "#FF9500" },
  { name: "Маркетинг", color: "#FF2D55" },
  { name: "Финансы", color: "#5856D6" },
  { name: "Стартапы", color: "#00C7BE" },
  { name: "Панель", color: "#FF9F0A" },
  { name: "Нетворкинг", color: "#8E8E93" },
];

const trackMap = {};
for (const t of trackData) {
  try {
    const existing = await pb.collection("tracks").getFirstListItem(`name="${t.name}"`);
    trackMap[t.name] = existing.id;
    console.log(`  Track "${t.name}" exists (${existing.id})`);
  } catch {
    const created = await pb.collection("tracks").create(t);
    trackMap[t.name] = created.id;
    console.log(`  Track "${t.name}" created (${created.id})`);
  }
}

// ── Step 3: Seed speakers ────────────────────────────────────────────────────

console.log("\n=== Seeding speakers ===");

const speakerData = [
  { name: "Александр Петров", role: "Генеральный директор", company: "Altai Ventures" },
  { name: "Мария Иванова", role: "Директор по операциям", company: "GreenLogistics" },
  { name: "Дмитрий Соколов", role: "Технический директор", company: "TechAltai" },
  { name: "Елена Волкова", role: "Бизнес-коуч", company: "" },
  { name: "Сергей Кузнецов", role: "Партнер", company: "Siberia Capital" },
  { name: "Ольга Новикова", role: "Директор по маркетингу", company: "BrandAltai" },
  { name: "Виктор Орлов", role: "Директор по инновациям", company: "RusTech" },
  { name: "Наталия Федорова", role: "Финансовый директор", company: "AltaiBank" },
  { name: "Андрей Белов", role: "Руководитель по ИИ", company: "DataFlow" },
  { name: "Ирина Смирнова", role: "Руководитель по устойчивому развитию", company: "EcoAltai" },
  { name: "Павел Морозов", role: "Основатель", company: "ScaleUp Accelerator" },
  { name: "Юрий Лебедев", role: "Торговый представитель", company: "" },
  { name: "Анна Козлова", role: "HR-директор", company: "PeopleFirst" },
  { name: "Максим Попов", role: "Консультант по безопасности", company: "" },
  { name: "Катерина Орлова", role: "Руководитель по продукту", company: "InnoLab" },
  { name: "Роман Волков", role: "Футуролог", company: "TechVision" },
  { name: "Светлана Петрова", role: "Генеральный директор", company: "ShopAltai" },
  { name: "Игорь Сидоров", role: "Архитектор облачных решений", company: "CloudPro" },
];

const speakerMap = {};
for (const s of speakerData) {
  try {
    const existing = await pb.collection("speakers").getFirstListItem(`name="${s.name}"`);
    speakerMap[s.name] = existing.id;
    console.log(`  Speaker "${s.name}" exists (${existing.id})`);
  } catch {
    const created = await pb.collection("speakers").create(s);
    speakerMap[s.name] = created.id;
    console.log(`  Speaker "${s.name}" created (${created.id})`);
  }
}

// ── Step 4: Seed events ──────────────────────────────────────────────────────

console.log("\n=== Seeding events ===");

function createDate(year, month, day, hours, minutes) {
  return new Date(year, month, day, hours, minutes, 0, 0).toISOString().replace("T", " ");
}

const day1 = [2026, 3, 20];
const day2 = [2026, 3, 21];
const day3 = [2026, 3, 22];
const day4 = [2026, 3, 23];
const day5 = [2026, 3, 24];

const eventsData = [
  // Day 1
  { title: "Открывающий ключевой доклад: будущее бизнеса на Алтае", subtitle: "Видение и стратегия 2026", speakerName: "Александр Петров", track: "Ключевой доклад", location: "Главный зал", start: [...day1, 9, 0], end: [...day1, 10, 0], description: "Открывающий доклад о будущем развития бизнеса в Алтайском регионе.", topics: ["Стратегии регионального роста", "Инвестиционные возможности", "Бизнес-прогноз 2026"] },
  { title: "Устойчивые цепочки поставок", speakerName: "Мария Иванова", track: "Операции", location: "Зал A", start: [...day1, 10, 30], end: [...day1, 11, 30], description: "Как построить устойчивые и надежные цепочки поставок для современного бизнеса.", topics: ["Зеленая логистика", "Оптимизация затрат", "Управление рисками"] },
  { title: "Воркшоп по цифровой трансформации", speakerName: "Дмитрий Соколов", track: "Технологии", location: "Зал B", start: [...day1, 10, 30], end: [...day1, 12, 0], description: "Практический воркшоп по внедрению цифровой трансформации в традиционном бизнесе.", topics: ["Инструменты автоматизации", "Переезд в облако", "Аналитика данных"] },
  { title: "Лидерство в период неопределенности", speakerName: "Елена Волкова", track: "Лидерство", location: "Главный зал", start: [...day1, 12, 30], end: [...day1, 13, 30], description: "Навыки лидерства, которые помогают работать в условиях нестабильности.", topics: ["Адаптивное лидерство", "Устойчивость команды", "Принятие решений"] },
  { title: "Обед и нетворкинг", speakerName: "", track: "Нетворкинг", location: "Ресторан", start: [...day1, 13, 30], end: [...day1, 14, 30], description: "Обед и общение с участниками.", topics: [] },
  { title: "Тренды венчурного капитала", speakerName: "Сергей Кузнецов", track: "Инвестиции", location: "Зал A", start: [...day1, 14, 30], end: [...day1, 15, 30], description: "Актуальные тенденции венчурного рынка и региональные возможности.", topics: ["Финансирование стартапов", "Дью-дилидженс", "Стратегии выхода"] },
  { title: "Маркетинг в цифровую эпоху", speakerName: "Ольга Новикова", track: "Маркетинг", location: "Зал B", start: [...day1, 14, 30], end: [...day1, 15, 30], description: "Стратегии цифрового маркетинга для роста бизнеса.", topics: ["Социальные сети", "Контент-маркетинг", "Аналитика"] },
  { title: "Панель: женщины в бизнесе", speakerName: "Разные спикеры", track: "Панель", location: "Главный зал", start: [...day1, 16, 0], end: [...day1, 17, 0], description: "Панельная дискуссия с успешными предпринимательницами и руководителями.", topics: ["Гендерное равенство", "Карьерный рост", "Баланс работа-жизнь"] },
  // Day 2
  { title: "Ключевой доклад дня 2: инновационные экосистемы", speakerName: "Виктор Орлов", track: "Ключевой доклад", location: "Главный зал", start: [...day2, 9, 0], end: [...day2, 10, 0], description: "Как создавать и развивать инновационные экосистемы в регионах.", topics: ["Стартап-экосистемы", "Партнерства с вузами", "Государственная поддержка"] },
  { title: "Мастер-класс по финансовому планированию", speakerName: "Наталия Федорова", track: "Финансы", location: "Зал A", start: [...day2, 10, 30], end: [...day2, 12, 0], description: "Комплексные стратегии финансового планирования для растущего бизнеса.", topics: ["Управление денежными потоками", "Инвестиционное планирование", "Оценка рисков"] },
  { title: "ИИ в бизнес-операциях", speakerName: "Андрей Белов", track: "Технологии", location: "Зал B", start: [...day2, 10, 30], end: [...day2, 11, 30], description: "Практическое применение ИИ в ежедневных бизнес-операциях.", topics: ["Автоматизация процессов", "Предиктивная аналитика", "ИИ в клиентском сервисе"] },
  { title: "Устойчивые бизнес-практики", speakerName: "Ирина Смирнова", track: "Операции", location: "Зал A", start: [...day2, 12, 30], end: [...day2, 13, 30], description: "Внедрение устойчивых практик, полезных для бизнеса и экологии.", topics: ["Углеродный след", "Циркулярная экономика", "ESG-отчетность"] },
  { title: "Обед и круглый стол", speakerName: "", track: "Нетворкинг", location: "Ресторан", start: [...day2, 13, 30], end: [...day2, 14, 30], description: "Тематические круглые столы за обедом.", topics: [] },
  { title: "Масштабирование стартапа", speakerName: "Павел Морозов", track: "Стартапы", location: "Зал B", start: [...day2, 14, 30], end: [...day2, 15, 30], description: "Стратегии масштабирования стартапа от регионального уровня к национальному.", topics: ["Гроус-хакинг", "Формирование команды", "Привлечение инвестиций"] },
  { title: "Закрытие дня 2: вечерний нетворкинг", speakerName: "", track: "Нетворкинг", location: "Терраса", start: [...day2, 17, 0], end: [...day2, 19, 0], description: "Вечерний прием и общение с участниками.", topics: [] },
  // Day 3
  { title: "Ключевой доклад дня 3: выход на глобальные рынки", speakerName: "Юрий Лебедев", track: "Ключевой доклад", location: "Главный зал", start: [...day3, 9, 0], end: [...day3, 10, 0], description: "Выход на глобальные рынки из Алтайского региона.", topics: ["Экспортные стратегии", "Международные партнерства", "Торговое регулирование"] },
  { title: "HR-стратегии для современной компании", speakerName: "Анна Козлова", track: "Лидерство", location: "Зал A", start: [...day3, 10, 30], end: [...day3, 11, 30], description: "Современные HR-подходы для привлечения и удержания талантов.", topics: ["Политики удаленной работы", "Вовлеченность сотрудников", "Развитие талантов"] },
  { title: "Основы кибербезопасности", speakerName: "Максим Попов", track: "Технологии", location: "Зал B", start: [...day3, 10, 30], end: [...day3, 11, 30], description: "Ключевые практики кибербезопасности для бизнеса любого масштаба.", topics: ["Защита данных", "Предотвращение угроз", "Соответствие требованиям"] },
  { title: "Воркшоп по разработке продукта", speakerName: "Катерина Орлова", track: "Стартапы", location: "Зал A", start: [...day3, 12, 30], end: [...day3, 14, 0], description: "Практический воркшоп по методологиям разработки продукта.", topics: ["Исследование пользователей", "MVP-разработка", "Итерационные циклы"] },
  { title: "Нетворкинг-ланч", speakerName: "", track: "Нетворкинг", location: "Ресторан", start: [...day3, 14, 0], end: [...day3, 15, 0], description: "Неформальное общение за обедом.", topics: [] },
  // Day 4
  { title: "Ключевой доклад дня 4: технологии будущего", speakerName: "Роман Волков", track: "Ключевой доклад", location: "Главный зал", start: [...day4, 9, 0], end: [...day4, 10, 0], description: "Обзор технологий, которые будут формировать ближайшее десятилетие.", topics: ["Блокчейн", "Квантовые вычисления", "Биотехнологии"] },
  { title: "Мастер-класс по электронной коммерции", speakerName: "Светлана Петрова", track: "Маркетинг", location: "Зал A", start: [...day4, 10, 30], end: [...day4, 12, 0], description: "Как построить и масштабировать успешный e-commerce.", topics: ["Выбор платформы", "Привлечение клиентов", "Логистика"] },
  { title: "Глубокое погружение в облачную инфраструктуру", speakerName: "Игорь Сидоров", track: "Технологии", location: "Зал B", start: [...day4, 10, 30], end: [...day4, 11, 30], description: "Технический разбор современной облачной инфраструктуры.", topics: ["Архитектурные паттерны", "Оптимизация затрат", "Безопасность"] },
  { title: "Панель: региональное развитие", speakerName: "Разные спикеры", track: "Панель", location: "Главный зал", start: [...day4, 12, 30], end: [...day4, 13, 30], description: "Дискуссия о стратегиях регионального экономического развития.", topics: ["Инфраструктура", "Инвестиционные стимулы", "Удержание талантов"] },
  { title: "Вечерний гала-ужин", speakerName: "", track: "Нетворкинг", location: "Большой зал", start: [...day4, 19, 0], end: [...day4, 22, 0], description: "Торжественный ужин с развлекательной программой.", topics: [] },
  // Day 5
  { title: "Финальный ключевой доклад: план действий 2026", speakerName: "Александр Петров", track: "Ключевой доклад", location: "Главный зал", start: [...day5, 9, 0], end: [...day5, 10, 0], description: "Подведение итогов и формирование плана действий на год вперед.", topics: ["Ключевые выводы", "Дорожная карта внедрения", "Обязательства сообщества"] },
  { title: "Финал стартап-питчей", speakerName: "Финалисты конкурса", track: "Стартапы", location: "Главный зал", start: [...day5, 10, 30], end: [...day5, 12, 0], description: "Финальный раунд питча со жюри инвесторов.", topics: ["Питч-презентации", "Q&A-сессия", "Церемония награждения"] },
  { title: "Индивидуальные менторские сессии", speakerName: "Отраслевые менторы", track: "Лидерство", location: "Переговорные", start: [...day5, 12, 30], end: [...day5, 14, 0], description: "Запишитесь на персональные сессии с экспертами отрасли.", topics: ["Карьерные советы", "Бизнес-стратегия", "Технические рекомендации"] },
  { title: "Церемония закрытия и награждение", subtitle: "Подведение итогов", speakerName: "Организаторы", track: "Ключевой доклад", location: "Главный зал", start: [...day5, 15, 0], end: [...day5, 16, 30], description: "Закрытие мероприятия и награждение участников.", topics: ["Вручение наград", "Заключительные слова", "Анонсы будущих событий"] },
  { title: "Прощальный прием", speakerName: "", track: "Нетворкинг", location: "Терраса", start: [...day5, 16, 30], end: [...day5, 18, 0], description: "Финальная возможность пообщаться перед отъездом.", topics: [] },
];

// Create speakers for events that reference non-existing speakers (like "Разные спикеры")
const extraSpeakers = ["Разные спикеры", "Финалисты конкурса", "Отраслевые менторы", "Организаторы"];
for (const name of extraSpeakers) {
  if (!speakerMap[name]) {
    try {
      const existing = await pb.collection("speakers").getFirstListItem(`name="${name}"`);
      speakerMap[name] = existing.id;
    } catch {
      const created = await pb.collection("speakers").create({ name, role: "", company: "" });
      speakerMap[name] = created.id;
      console.log(`  Extra speaker "${name}" created`);
    }
  }
}

// Check if events already exist
const existingEvents = await pb.collection("events").getFullList();
if (existingEvents.length > 0) {
  console.log(`  ${existingEvents.length} events already exist, skipping seed`);
} else {
  for (const e of eventsData) {
    const record = {
      title: e.title,
      subtitle: e.subtitle || "",
      description: e.description,
      speaker: e.speakerName ? speakerMap[e.speakerName] || "" : "",
      track: trackMap[e.track] || "",
      location: e.location,
      startTime: createDate(...e.start),
      endTime: createDate(...e.end),
      topics: e.topics,
    };
    await pb.collection("events").create(record);
    console.log(`  Event "${e.title.substring(0, 40)}..." created`);
  }
}

console.log("\n=== Seed complete! ===");
console.log(`Tracks: ${Object.keys(trackMap).length}`);
console.log(`Speakers: ${Object.keys(speakerMap).length}`);
console.log(`Events: ${eventsData.length}`);
console.log(`\nAdmin panel: http://127.0.0.1:8090/_/`);
