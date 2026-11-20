// Cloudflare Worker (free plan) that lets the website use Gemini without anyone entering a key.
// The Gemini key is a Cloudflare secret (GEMINI_KEY), never in the website code.
// ALLOWED_ORIGIN and MODEL are set in wrangler.toml.
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
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 400 } })
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, "content-type": "application/json" } });
  }
};
