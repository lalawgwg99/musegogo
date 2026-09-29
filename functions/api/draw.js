// GET /api/draw — 隨機發一組有效邀碼
export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    "SELECT code FROM codes WHERE status = 'active' ORDER BY RANDOM() LIMIT 1"
  ).first();
  if (!row) {
    return Response.json({ error: 'empty' }, { status: 404 });
  }
  await env.DB.prepare('UPDATE codes SET draws = draws + 1 WHERE code = ?')
    .bind(row.code).run();
  const s = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM codes WHERE status = 'active'"
  ).first();
  return Response.json({ code: row.code, pool: s.n });
}
