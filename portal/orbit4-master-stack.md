# Orbit4 — Master Stack

The single source of truth for what tool does what job. Merges the voice-stack decisions from this build with the Grok + Nano Banana decisions from the earlier conversation. One row per job; if two tools could overlap, the "When" column shows they don't.

_Last updated: 2026-06-08. Verify all vendor pricing before quoting a client — list prices drift._

---

## 1. Voice receptionist (the live phone call)

The real-time loop. Latency is everything here, so every tool is chosen for speed.

| Job | Tool | Notes |
|---|---|---|
| Telephony (carries the call) | **Telnyx** | Inbound number; ~$0.05–0.06/min. Twilio is the interim fallback. |
| Live STT (caller → text) | **Deepgram Nova-3 (streaming)** | Multilingual EN/ES auto-detect, ~$0.0077/min (+20% multilingual). |
| The brain | **Claude** | Haiku 4.5 default; escalate to Sonnet for complex/compliance turns. Grounded in the vertical KB. |
| Live TTS (text → voice) | **Deepgram Aura-2** | EN + ES voices. ElevenLabs Flash is the premium / voice-clone swap. |
| Turn-taking / barge-in | **Deepgram VAD** | Caller can interrupt; AMD gate so transcription starts only after a human connects. |

**Demo mode:** the in-browser widget uses the browser's free Web Speech API for STT + TTS, so testing costs nothing. Deepgram/Telnyx are only spent on real production calls.

---

## 2. Post-call (after Telnyx fires "call ended")

Latency doesn't matter here, so a different, higher-quality transcription tool is used. **This is why Grok and Deepgram never conflict — they run at different times.**

| Job | Tool | Notes |
|---|---|---|
| Recording transcription | **Grok** | Triggered by Telnyx's call-ended webhook → fetch recording → transcribe → write transcript back to the deal/company in Attio. For CRM record, QA, summaries, training data. |

---

## 3. Website generation (visuals + copy)

| Job | Tool | Notes |
|---|---|---|
| Website images | **Nano Banana** (Gemini Flash Image) | **1 image per site.** Best-in-class bilingual generation incl. Spanish text rendered inside the image. |
| — source quality | **2K from Google AI Studio (free, no watermark)** for now | Export as **WebP at the real display width** (e.g. 1600px hero) — load speed beats raw resolution. |
| — automated later | **Paid Gemini Image API (~$0.02–0.04/image)** | The free *API* tier can't generate images, and free-tier terms allow Google to train on your data — not OK for client commercial use. Switch to paid API when the deployment engine auto-builds sites. Regenerate at 4K only for full-bleed retina heroes. |
| Website copy (EN/ES) | **Claude** | From the one vertical knowledge base. |
| Live web-chat answers | **Claude** via `/.netlify/functions/claude` | Same KB; offline fallback engine when no key. |
| Business discovery | **Claude + web_search** via `/.netlify/functions/enrich` | Finds site/logo/branding from a name; falls back to Company + Hours. |

---

## 4. Platform / infrastructure

| Job | Tool |
|---|---|
| Front-end hosting | **Netlify** (the Orbit4 bundle + functions) |
| Always-on backend (n8n, scraper) | **Oracle Cloud** |
| CRM / source of truth | **Attio** (Companies, People, Deals, Leads, Partners objects — live) |
| Automation / glue | **n8n** (Telnyx events, CRM sync, bootstrap workflows) |
| Domain registrar | **IONOS** (DNS → Netlify) |
| Front-end security (pre-launch) | **Cloudflare** (bot/malware, Turnstile, rate limit) — _to set up_ |

---

## The two questions that caused the conflict — now resolved

1. **Grok vs. Deepgram for STT?** Not a conflict. **Deepgram = live, during the call. Grok = the recording, after the call ends.** Different jobs, different moments.
2. **Where does Nano Banana fit?** Website *images only* — 1 per site, not in the voice loop.

---

## Cost reality (per 3-min call)

- Telnyx telephony: ~$0.15–0.18 ← **biggest line item**
- Deepgram STT: ~$0.01 · Aura-2 TTS: ~$0.04–0.07 · Claude Haiku: pennies
- Grok post-call transcription: per-recording, off the live path
- Nano Banana: ~$0.02–0.04 per site (one-time, when automated)

Budget Telnyx first; Deepgram credit ($200) outlasts telephony spend by a wide margin.

---

## Still open (not yet wired)

- Cloudflare + front-end security layer (before Orbit4 go-live)
- The Vault for API tokens (server-side encrypted — not a browser file)
- Deployment interface for white-label / reseller replication
- 10DLC/A2P registration for SMS (needed to *send*, not receive)
- Telnyx number + ElevenLabs voice + Anthropic key in Netlify env
