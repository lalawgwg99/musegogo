// functions/_middleware.js — D1 schema 延遲初始化（冪等，第一次 API 請求時自動建表）
const SCHEMA = `CREATE TABLE IF NOT EXISTS codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'seed',
  status TEXT NOT NULL DEFAULT 'active',
  draws INTEGER NOT NULL DEFAULT 0,
  confirmed INTEGER NOT NULL DEFAULT 0,
  used_up INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;
const IDX = `CREATE INDEX IF NOT EXISTS idx_codes_status ON codes (status)`;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/') && context.env.DB) {
    await context.env.DB.prepare(SCHEMA).run();
    await context.env.DB.prepare(IDX).run();
  }
  return context.next();
}
