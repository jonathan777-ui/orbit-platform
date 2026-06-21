// Orbit demo brain — Groq chat + Deepgram Aura-2 TTS behind one Cloudflare Worker.
//
// Keys are read from encrypted Worker secrets (NEVER hard-code them here):
//   wrangler secret put GROQ_API_KEY
//   wrangler secret put DEEPGRAM_API_KEY
// Optional plain vars (wrangler.toml [vars] or dashboard):
//   GROQ_MODEL      default "llama-3.3-70b-versatile"
//   ALLOWED_ORIGIN  default "*" (lock to https://jonathan777-ui.github.io to restrict)
//
// Endpoints (both POST, JSON in):
//   POST /chat  { system, messages:[{role,content}] }  -> { reply }
//   POST /tts   { text, model }                         -> audio/mpeg (Aura-2)

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
});

function json(obj, origin, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);

    // ---- Groq chat brain ----
    if (request.method === "POST" && url.pathname === "/chat") {
      try {
        const { system, messages } = await request.json();
        const msgs = [];
        if (system) msgs.push({ role: "system", content: String(system) });
        for (const m of (messages || []).slice(-12)) {
          if (m && m.content) {
            msgs.push({
              role: m.role === "assistant" ? "assistant" : "user",
              content: String(m.content).slice(0, 2000),
            });
          }
        }
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: msgs,
            temperature: 0.5,
            max_tokens: 300,
          }),
        });
        const data = await r.json();
        const reply = (data && data.choices && data.choices[0] &&
          data.choices[0].message && data.choices[0].message.content || "").trim();
        return json({ reply }, origin);
      } catch (e) {
        // Empty reply -> the page's keyless engine takes over (never goes dead).
        return json({ reply: "", error: String(e) }, origin);
      }
    }

    // ---- Deepgram Aura-2 TTS ----
    if (request.method === "POST" && url.pathname === "/tts") {
      try {
        const { text, model } = await request.json();
        const m = String(model || "aura-2-thalia-en").replace(/[^a-z0-9-]/gi, "");
        const r = await fetch(`https://api.deepgram.com/v1/speak?model=${m}`, {
          method: "POST",
          headers: {
            Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: String(text || "").slice(0, 1800) }),
        });
        if (!r.ok) {
          return new Response(await r.text(), { status: r.status, headers: corsHeaders(origin) });
        }
        return new Response(r.body, {
          status: 200,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": r.headers.get("Content-Type") || "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      } catch (e) {
        return new Response(String(e), { status: 500, headers: corsHeaders(origin) });
      }
    }

    return new Response("Orbit demo brain — POST /chat or /tts.", {
      headers: corsHeaders(origin),
    });
  },
};
