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

    if (url.pathname === "/api/lead" && request.method === "POST") {
      return createLead(request, env);
    }

    if (url.pathname === "/api/schedule-followup" && request.method === "POST") {
      return scheduleFollowup(request, env);
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
          language = "en", vertical = "", niche = "", business = "", promptExtra = "" } = body;

  const system = buildSystemPrompt({ tier, mode, language, vertical, niche, business, promptExtra });

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

/* ---------- Lead capture: demo conversation -> Supabase (Lead Desk) ---------- */
async function createLead(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad JSON" }, 400); }
  const { name = "", phone = "", email = "", reason = "",
          business = "", vertical = "", niche = "", demo = "" } = body;
  if (!name && !phone && !email) return json({ error: "need a name, phone, or email" }, 400);

  const now = new Date().toISOString();
  const lead = {
    name: name || "Demo lead",
    company: business || vertical || "",
    email, phone,
    stage: "New",
    value: 0,
    source: "Demo" + (business ? ": " + business : (vertical ? ": " + vertical : "")),
    owner: "",
    next_action: "Follow up on demo",
    notes: [reason && ("Reason: " + reason), niche && ("Niche: " + niche), demo && ("Demo: " + demo)]
      .filter(Boolean).join(" · "),
    created_at: now, updated_at: now
  };

  let stored = null;
  if (env.SUPABASE_URL && env.SUPABASE_KEY) {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_KEY,
        Authorization: `Bearer ${env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(lead)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: "supabase insert failed", detail: data }, r.status);
    stored = Array.isArray(data) ? data[0] : data;
  }

  // Optional: also notify a reachable n8n webhook (best-effort, non-blocking).
  if (env.N8N_LEAD_WEBHOOK) {
    request.ctx?.waitUntil?.(
      fetch(env.N8N_LEAD_WEBHOOK, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "demo.lead", lead: stored || lead, sent_at: now })
      }).catch(() => {})
    );
  }

  if (!stored && !env.SUPABASE_URL)
    return json({ ok: true, stored: false, note: "SUPABASE_URL/KEY not set — lead not persisted", lead });
  return json({ ok: true, stored: true, lead: stored || lead });
}

/* ---------- Google: post-call follow-up (Calendar + Meet + Gmail) ---------- */
async function googleAccessToken(env) {
  if (!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN)) return null;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });
  const data = await r.json().catch(() => ({}));
  return r.ok ? data.access_token : null;
}

function b64url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function scheduleFollowup(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad JSON" }, 400); }
  const {
    name = "", email = "", startISO = "", durationMin = 30,
    timeZone = env.GOOGLE_TIMEZONE || "America/New_York",
    format = "video", business = "", notes = ""
  } = body;

  if (!email) return json({ error: "prospect email required" }, 400);
  if (!startISO) return json({ error: "startISO (follow-up time) required" }, 400);

  const token = await googleAccessToken(env);
  if (!token) return json({ error: "google not configured", hint: "set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN" }, 500);

  const start = new Date(startISO);
  const end = new Date(start.getTime() + (Number(durationMin) || 30) * 60000);
  const who = name || email;
  const biz = business || "your business";

  // 1) Calendar event with a Google Meet link; Google emails the invite (sendUpdates=all).
  const eventReq = {
    summary: `Follow-up: ${biz} × Orbit AI`,
    description: `Quick follow-up about the AI receptionist demo for ${biz}.`
      + `\n\nWe can hop on a quick phone call at this time — or use the Google Meet video link on this invite if you'd prefer face-to-face.`
      + (notes ? `\n\nNotes: ${notes}` : ""),
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
    attendees: [{ email }],
    conferenceData: {
      createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } }
    },
    reminders: { useDefault: true }
  };
  const evRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(eventReq) });
  const ev = await evRes.json().catch(() => ({}));
  if (!evRes.ok) return json({ error: "calendar event failed", detail: ev }, evRes.status);
  const meetLink = ev.hangoutLink || ev.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri || "";
  const eventLink = ev.htmlLink || "";

  // 2) Warm custom follow-up email via Gmail.
  const from = env.FROM_EMAIL || "me";
  const whenStr = start.toLocaleString("en-US", { timeZone, weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const subject = `Follow-up scheduled — ${biz} × Orbit AI`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px">
    <p>Hi ${escapeHtml(name) || "there"},</p>
    <p>Thanks for checking out the AI receptionist demo for <strong>${escapeHtml(biz)}</strong> — I've put a quick follow-up on the calendar:</p>
    <p style="background:#f4f6fb;border:1px solid #e2e7f0;border-radius:10px;padding:14px 16px"><strong>${escapeHtml(whenStr)}</strong></p>
    <p>You'll get a calendar invite alongside this note. We can just <strong>hop on a quick phone call</strong> at that time — or if you'd rather, jump on the <strong>Google Meet video link</strong>:</p>
    ${meetLink ? `<p style="text-align:center;margin:22px 0"><a href="${meetLink}" style="background:#3a6ad6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;display:inline-block">Join the Google Meet →</a></p>` : ""}
    <p>Either way works — whatever's easiest for you. Talk soon!</p>
    <p style="margin-top:20px">— Jonathan<br><span style="color:#666">Orbit AI Automation</span></p>
  </div>`;
  const mime = [
    `To: ${email}`,
    from !== "me" ? `From: ${from}` : null,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "", html
  ].filter(v => v !== null).join("\r\n");

  let emailSent = false;
  const gmRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: b64url(mime) })
  });
  emailSent = gmRes.ok;

  return json({ ok: true, eventLink, meetLink, emailSent });
}

function escapeHtml(s) {
  return (s == null ? "" : String(s)).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Tier-aware system prompt (Gold → Platinum → Iridium) ---------- */
function buildSystemPrompt({ tier, mode, language, vertical, niche, business, promptExtra }) {
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

  // Claude-authored premium niche brief (hybrid: tier template + this brief).
  const brief = (promptExtra && promptExtra.trim())
    ? `\n## THIS BUSINESS — PREMIUM NICHE BRIEF\n${promptExtra.trim()}` : "";

  return [...blocks, brief, ``, lang, ``, modeLine].join("\n");
}
