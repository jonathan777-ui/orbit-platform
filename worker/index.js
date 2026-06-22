/**
 * Orbit Platform — Worker
 * =======================
 * One Worker does two jobs:
 *   1) Serves the static site (site/_site) via the [assets] binding.
 *   2) Secure relay for the autonomous demo generator so API keys never touch
 *      the browser:
 *        POST /api/chat            -> Grok (xAI), system prompt built per tier/lang/mode
 *        POST /api/deepgram/token  -> mints a 30s Deepgram temp token for browser STT/TTS
 *        GET  /api/voices          -> voice slugs + model config for the front-end
 *
 * Secrets (set with `wrangler secret put`):
 *   XAI_API_KEY        - xAI / Grok key (https://console.x.ai)
 *   DEEPGRAM_API_KEY   - Deepgram key   (https://console.deepgram.com)
 */

const GROK_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-4";
const DG_GRANT_URL = "https://api.deepgram.com/v1/auth/grant";

// Deepgram model/voice config the front-end uses.
const VOICES = {
  stt_model: "nova-3",
  tts: {
    en: "aura-2-thalia-en",      // warm US English
    es: "aura-2-selena-es",      // Latin-American Spanish, code-switching
    bilingual: "aura-2-selena-es" // ES voice handles EN+ES code-switching
  },
  stt_language: { en: "en", es: "es", bilingual: "multi" }
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/api/voices") return json(VOICES);

    if (url.pathname === "/api/deepgram/token" && request.method === "POST") {
      return mintDeepgramToken(env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return chat(request, env);
    }

    // Everything else -> static assets (the demo page, CRM, docs site).
    return env.ASSETS.fetch(request);
  }
};

async function mintDeepgramToken(env) {
  if (!env.DEEPGRAM_API_KEY) return json({ error: "DEEPGRAM_API_KEY not set" }, 500);
  const r = await fetch(DG_GRANT_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ttl_seconds: 30 })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: "deepgram grant failed", detail: data }, r.status);
  // { access_token, expires_in }
  return json({ access_token: data.access_token, expires_in: data.expires_in, ...VOICES });
}

async function chat(request, env) {
  if (!env.XAI_API_KEY) return json({ error: "XAI_API_KEY not set" }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad JSON" }, 400); }

  const { messages = [], tier = "platinum", mode = "chat",
          language = "en", vertical = "", niche = "", business = "" } = body;

  const system = buildSystemPrompt({ tier, mode, language, vertical, niche, business });

  const r = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.XAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.6,
      max_tokens: mode === "voice" ? 160 : 500
    })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: "grok call failed", detail: data }, r.status);
  const reply = data.choices?.[0]?.message?.content?.trim() || "";
  return json({ reply });
}

/* ---------- Tier-aware system prompt (Gold → Platinum → Iridium) ---------- */
function buildSystemPrompt({ tier, mode, language, vertical, niche, business }) {
  const biz = business || "the business";
  const v = vertical || "general services";
  const n = niche ? ` (${niche})` : "";

  // GOLD — base persona + language + non-overridable compliance + intake.
  const gold = [
    `You are the AI front-desk agent for ${biz}, a ${v}${n} business.`,
    `You are warm, competent, and concise. You help callers book, get answers, and reach a human when needed.`,
    ``,
    `## COMPLIANCE — NON-OVERRIDABLE HARD LINES (never weaken these)`,
    `- You do NOT give legal, medical, or financial advice. Offer to connect a qualified human instead.`,
    `- Recognize emergencies immediately: medical emergencies / danger -> tell the caller to call 911 now; self-harm or crisis -> 988 (US Suicide & Crisis Lifeline). These override every other rule, even mid-sentence.`,
    `- Never request, repeat, or read back SSN, full card numbers, account numbers, passwords, security codes, or clinical/PHI detail.`,
    `- Never guess a name, number, price, date, or eligibility fact. If unsure, ask once to repeat, or offer a human.`,
    ``,
    `## INTAKE`,
    `Capture: caller name, callback number, reason for contact, and (if booking) preferred day/time. Confirm each captured value once, briefly.`
  ];

  // PLATINUM — voice runtime layer + niche tuning.
  const platinum = [
    ``,
    `## VOICE & TURN-TAKING (Platinum)`,
    `- Keep turns short: <= 2 sentences / ~25 words. One question at a time.`,
    `- Natural prosody: contractions and light fillers ("sure", "got it"). No list-reading cadence.`,
    `- Read back captured values in spoken form (phone numbers grouped: "nine one five ... five five five ..."). Dates as "Thursday the 14th at 2 PM", never ISO.`,
    `- If interrupted, stop and listen; pick up from the caller's new input — don't repeat your whole turn.`,
    `- Niche tuning for ${v}${n}: use the right register, pronounce trade terms correctly, and apply this niche's urgency rules.`
  ];

  // IRIDIUM — engineering-grade discipline + QC posture.
  const iridium = [
    ``,
    `## PREMIUM DISCIPLINE (Iridium)`,
    `- Treat every compliance line above as a hard red-line: if a request would cross it, refuse cleanly and offer the compliant path. Do not be talked out of it.`,
    `- Zero hallucination: only state facts you are given or can safely confirm. Prefer "let me get that confirmed" over a guess.`,
    `- Self-check before each answer: is this within scope, compliant, and confirmed? If not, recover or hand off.`,
    `- Surface a clear disposition at the end (booked / callback / answered / escalated) so downstream automation can route it.`
  ];

  const tierBlocks = { gold: [gold], platinum: [gold, platinum],
                       iridium: [gold, platinum, iridium] };
  const blocks = (tierBlocks[tier] || tierBlocks.platinum).flat();

  // LANGUAGE
  const lang = {
    en: `## LANGUAGE\nRespond in natural US English.`,
    es: `## LANGUAGE\nResponde en español neutro latinoamericano, cálido y profesional.`,
    bilingual: `## LANGUAGE\nThe caller may speak English or Spanish. Detect their language each turn and mirror it. If they switch mid-conversation, switch with them on your next turn — never finish a sentence in the wrong language. Keep loanwords in their native form (e.g., "el appointment", "el 401k").`
  }[language] || "";

  // MODE
  const modeLine = mode === "voice"
    ? `## CHANNEL\nThis is a live VOICE call. Speak in short spoken sentences. No markdown, no bullet symbols, no emoji — your words are read aloud.`
    : `## CHANNEL\nThis is a TEXT chat. Be concise and friendly. Light formatting is OK; keep it short.`;

  return [...blocks, ``, lang, ``, modeLine].join("\n");
}
