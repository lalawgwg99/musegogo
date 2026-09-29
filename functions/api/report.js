// POST /api/report — 回報領到的碼是否可用
// body: { code, outcome: 'worked' | 'used_up' }
// 累積 3 次 used_up 就把該碼移出輪換
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  const code = String(body.code || '').trim().toUpperCase();
  const outcome = body.outcome;
  if (!/^[A-Z0-9]{6}$/.test(code) || (outcome !== 'worked' && outcome !== 'used_up')) {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  if (outcome === 'worked') {
    await env.DB.prepare('UPDATE codes SET confirmed = confirmed + 1 WHERE code = ?')
      .bind(code).run();
  } else {
    const r = await env.DB.prepare(
      'UPDATE codes SET used_up = used_up + 1 WHERE code = ? RETURNING used_up'
    ).bind(code).first();
    if (r && r.used_up >= 3) {
      await env.DB.prepare("UPDATE codes SET status = 'exhausted' WHERE code = ?")
        .bind(code).run();
    }
  }
  return Response.json({ ok: true });
}
