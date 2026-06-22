# Demo Worker — Grok + Deepgram relay

This Cloudflare Worker (`worker/index.js`) serves the static site **and** is the
secure relay for the autonomous demo generator, so API keys never touch the
browser. It powers `voice-demo.html` (Chatbot + Voice Receptionist, tiers,
English / Español / Bilingual).

## Endpoints
| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Calls **Grok** with a tier/language/mode-aware system prompt. Body: `{messages, tier, mode, language, vertical, niche, business}` → `{reply}`. |
| `/api/deepgram/token` | POST | Mints a **30s Deepgram temp token** for browser STT/TTS. Returns `{access_token, ...voice config}`. |
| `/api/voices` | GET | Returns the STT/TTS model + voice slugs. |
| `/api/lead` | POST | Writes a captured demo lead into Supabase (the same table the Lead Desk CRM reads). Optionally forwards to n8n. |
| everything else | — | Served from `site/_site` (demos, CRM, docs). |

## Demo registry, landing page & sharing
- **`demos.json`** — the registry. Each entry deep-links as `/voice-demo.html?demo=<id>` and is rendered as a card on **`/demos.html`** (the share hub, which also links the Lead Desk). `promptExtra` is the Claude-authored premium niche brief; the Worker combines it with the tier template. **Add your 19 live demos here.**
- **Share** — the 📨 Share button (on `/demos.html` cards and inside a demo) opens a pre-written, interest-piquing prospect email (EN or ES) with the demo link, via `mailto:` → Gmail compose.

## Lead capture secrets (optional but recommended)
To persist demo leads into the Lead Desk, set:
```bash
npx wrangler secret put SUPABASE_URL      # https://YOUR-PROJECT.supabase.co
npx wrangler secret put SUPABASE_KEY      # anon (or a restricted) key with insert on leads
# optional: forward each lead to a reachable n8n webhook
npx wrangler secret put N8N_LEAD_WEBHOOK  # e.g. https://<tunnel>/webhook/lead-intake
```
Without `SUPABASE_*`, `/api/lead` still returns OK but doesn't persist (the UI says so).

## Post-call follow-up: Google Calendar (Meet) + Gmail
`POST /api/schedule-followup` creates a **Google Calendar event with a Google Meet
link**, auto-invites the prospect (Google emails the calendar invite), and sends a
warm follow-up email via the **Gmail API** ("hop on a call at that time, or use the
Meet video link"). The demo's lead-capture modal calls it when a follow-up time is set.

Body: `{name, email, startISO, durationMin?, timeZone?, format, business, notes}`.

### Set up the Gmail + Calendar API (one time)
1. **Google Cloud Console** → create/select a project.
2. **APIs & Services → Enable APIs**: enable **Gmail API** and **Google Calendar API**.
3. **OAuth consent screen**: set it up (External or Internal for Workspace); add your
   account as a test user if it stays in "testing".
4. **Credentials → Create OAuth client ID → Web application**. Add an authorized redirect
   URI you'll use to grab the token (e.g. `https://developers.google.com/oauthplayground`).
5. Get a **refresh token** for your account with these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/calendar.events`
   Easiest path: [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) →
   gear icon → "Use your own OAuth credentials" → paste client id/secret → authorize those
   two scopes → "Exchange authorization code for tokens" → copy the **refresh token**.
6. Set the Worker secrets:
   ```bash
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put GOOGLE_REFRESH_TOKEN
   npx wrangler secret put FROM_EMAIL        # your sending address (e.g. jonathan@orbitaiautomation.com)
   npx wrangler secret put GOOGLE_TIMEZONE   # optional, e.g. America/Phoenix (default America/New_York)
   ```
The event is created on the token owner's **primary** calendar; the prospect is added as an
attendee so Google sends them the invite automatically.

> Simpler alternative: do the OAuth in **n8n** (Gmail + Google Calendar nodes have
> click-through auth) and have the Worker forward to an n8n webhook — but n8n must be
> reachable from the Worker (a public URL / tunnel), which the serverless path above avoids.

---

## Set up the exact APIs

### 1. Grok (xAI)
- Get a key at **https://console.x.ai** → API Keys → Create. (Starts with `xai-`.)
- The API is **OpenAI-compatible**:
  - Base URL: `https://api.x.ai/v1`
  - Endpoint: `POST /chat/completions`
  - Auth header: `Authorization: Bearer $XAI_API_KEY`
  - Model: **`grok-4`** (older slugs like `grok-4-fast*`, `grok-3` redirect to current Grok).
- The Worker already calls this for you in `chat()`.

Sanity check from your terminal:
```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $XAI_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"grok-4","messages":[{"role":"user","content":"Say hi in 5 words"}]}'
```

### 2. Deepgram (STT + TTS)
- Get a key at **https://console.deepgram.com** → API Keys → Create (role **Member** or higher — required to mint temp tokens).
- Models used:
  - **STT:** `nova-3` (live WebSocket `wss://api.deepgram.com/v1/listen`). Language `en`, `es`, or `multi` (bilingual auto-detect).
  - **TTS:** **Aura-2** (`https://api.deepgram.com/v1/speak`). Voices: `aura-2-thalia-en` (English) and `aura-2-selena-es` (Spanish, code-switches EN/ES for bilingual). Swap any voice slug in `worker/index.js → VOICES`.
- **Browser security:** the page never holds your Deepgram key. The Worker calls
  `POST https://api.deepgram.com/v1/auth/grant` (`Authorization: Token $DEEPGRAM_API_KEY`,
  body `{"ttl_seconds":30}`) to mint a short-lived JWT; the browser uses that to
  connect directly to Deepgram. A fresh token is minted per listen/speak.

Sanity check (TTS → mp3 file):
```bash
curl -s "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=mp3" \
  -H "Authorization: Token $DEEPGRAM_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"Hello from Airlock."}' --output hello.mp3
```

---

## Run & deploy

### Local
```bash
cp .dev.vars.example .dev.vars     # paste your two keys (git-ignored)
python site/build.py               # build the static assets
npx wrangler dev                   # http://localhost:8787/voice-demo.html
```

### Production (Cloudflare Workers)
Set the secrets once, then deploy (your Git integration already runs `wrangler deploy`):
```bash
npx wrangler secret put XAI_API_KEY
npx wrangler secret put DEEPGRAM_API_KEY
```
The demo is then live at `/voice-demo.html` on the Worker URL.

### Other hosting avenues (GitHub Pages / Netlify)
Those are static-only and can't hold keys. Host `voice-demo.html` there, open
**Advanced → API base URL**, and point it at your deployed Worker
(`https://orbit-platform.<subdomain>.workers.dev`) so `/api/*` resolves to the relay.

---

## Tiers (Gold → Platinum → Iridium)
The system prompt is assembled by tier in `buildSystemPrompt()`:
- **Gold** — persona + language + **non-overridable compliance** (911/988, no legal/medical/financial advice, no SSN/PHI read-back, no guessing) + intake.
- **Platinum** — adds the **Voice Runtime Layer**: short turns, one question at a time, spoken read-back, barge-in recovery, niche tuning.
- **Iridium** — adds **premium discipline**: hard red-line refusals, zero-hallucination self-checks, end-of-call disposition for downstream routing.

> Built and verified by editing/deploying, but **not run live here** — exercise it
> with real keys. Mic capture needs HTTPS (or `localhost`).
