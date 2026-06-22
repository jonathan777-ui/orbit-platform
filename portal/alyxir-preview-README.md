# Alyxir — AI Receptionist Preview (deploy to Netlify)

A deploy-ready preview of the **website + chatbot + voice AI receptionist** for one business
(Track Dog Racing here). Drop it on Netlify, set keys, and a customer or rep can **talk to the
receptionist in the browser** — no Telnyx, no phone number, no 10DLC. That's all live-stage.

## How the preview works
Browser loop: **mic → STT → Claude (with the KB) → TTS → speaker.**
- **LLM** → `/.netlify/functions/claude` (holds your Anthropic key; the KB system prompt lives here).
- **STT** → browser Web Speech API (Chrome best; falls back to typing on Safari/Firefox).
- **TTS** → `/.netlify/functions/tts` → ElevenLabs Flash v2.5 (good, low-latency voice).
- **No keys yet?** It still demos: falls back to a built-in KB responder + the browser's own voice.

## Deploy (2 minutes)
1. **Netlify → Add new site → Deploy manually** and drag this whole folder in
   (or connect a repo containing it). `netlify.toml` wires the functions automatically.
2. **Site settings → Environment variables**, add:
   - `ANTHROPIC_API_KEY` — **required** for the live AI (without it the preview runs in offline KB mode).
   - `ELEVENLABS_API_KEY` — optional; unlocks the premium voice (without it, browser voice is used).
   - `ELEVENLABS_VOICE_ID` — optional; your chosen brand voice (defaults to a stock voice).
   - `MODEL` — optional; Claude model id (defaults to a current Sonnet).
3. **Redeploy** (env vars apply on next deploy). Open the site → tap **🎙 Talk to your receptionist**.

## Voice provider — switch with one env var
`tts.js` supports both providers; the front-end response is identical either way.

- **Qwen3 (cheap default, ~$0.005/reply, no subscription, Latin-American Spanish):**
  set `REPLICATE_API_TOKEN` and `TTS_PROVIDER=qwen`. Optional: `QWEN_VOICE` (default "Vivian"),
  `QWEN_MODEL` (default "qwen/qwen3-tts"). Language is passed from the conversation (es→Spanish,
  en→English, else auto). *Confirm the model's input field names on its Replicate page and tweak if needed.*
- **ElevenLabs (premium, ~$0.25–0.30/demo + ~$22/mo, accent / voice-clone control):**
  set `ELEVENLABS_API_KEY` and `TTS_PROVIDER=eleven`. Optional: `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL`.
- **No key / no provider:** the widget falls back to the browser's built-in voice (free).

**Dialect note:** the Spanish dialect/register (usted vs tú, regional vocab) is produced by **Claude** in
`claude.js` — the TTS only speaks it. Qwen3 renders one Latin-American Spanish accent (great for FL/TX);
ElevenLabs is the option when a client wants a specific accent or a cloned brand voice.

## What this is NOT (yet)
No real phone calls. Going live with inbound phone = **Telnyx (WebRTC/SIP) + Deepgram STT +
ElevenLabs + 10DLC/A2P + STIR/SHAKEN** — the P1 items on the Go-Live Credential Queue.

## Per-business
This bundle is Track Dog Racing. The Merge Engine produces the same `index.html` for any business
from its KB + Attio profile; the two functions are reused as-is (the KB prompt can be passed in per site).
