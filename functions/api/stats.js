// GET /api/stats — 池子統計
export async function onRequestGet({ env }) {
  const s = await env.DB.prepare(
    "SELECT COUNT(*) AS total, SUM(status = 'active') AS active FROM codes"
  ).first();
  return Response.json({ total: s.total, active: s.active });
}
