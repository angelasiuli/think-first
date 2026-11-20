// Forwards chat requests to Gemini so users need no key. GEMINI_KEY is a Cloudflare secret.
// ALLOWED_ORIGIN, MODEL and FALLBACK_MODEL live in wrangler.toml.
const BUSY = new Set([429, 500, 503]);
export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN;
    const cors = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "content-type" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || req.headers.get("origin") !== origin) return new Response("Forbidden", { status: 403, headers: cors });
    let body;
    try { body = await req.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }
    const { system, contents } = body || {};
    if (typeof system !== "string" || system.length > 4000 || !Array.isArray(contents) || contents.length > 60 || JSON.stringify(contents).length > 30000)
      return new Response("Bad request", { status: 400, headers: cors });
    const payload = JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 2048 } });
    const call = model => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_KEY }, body: payload });
    // On a busy model, retry once, then use the fallback.
    let r = await call(env.MODEL);
    if (BUSY.has(r.status)) { await new Promise(s => setTimeout(s, 800)); r = await call(env.MODEL); }
    if (BUSY.has(r.status) && env.FALLBACK_MODEL) r = await call(env.FALLBACK_MODEL);
    return new Response(r.body, { status: r.status, headers: { ...cors, "content-type": "application/json" } });
  }
};
