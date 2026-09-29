// POST /api/codes — 使用者上傳自己的邀碼
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  const code = String(body.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return Response.json({ error: 'format' }, { status: 400 });
  }
  try {
    await env.DB.prepare(
      "INSERT INTO codes (code, source) VALUES (?, 'user')"
    ).bind(code).run();
  } catch {
    return Response.json({ error: 'duplicate' }, { status: 409 });
  }
  const s = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM codes WHERE status = 'active'"
  ).first();
  return Response.json({ ok: true, pool: s.n });
}
