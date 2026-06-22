# Alyxir Backend Stack — Recommended Vendors (Product KB)

The model layer behind every Alyxir surface, configured to run on **one platform: Telnyx Voice AI**. The whole pipeline (STT → LLM → TTS → telephony) lives on Telnyx's owned backbone, so a deployment is just **attach the assistant to the Telnyx phone number** — no stitched-together vendors, no extra hops. Sub-200ms round-trip in production.

> **Why single-platform:** a "Frankenstack" (separate STT, LLM, TTS, carrier) adds a vendor boundary and a latency hop at each seam, and when something breaks at 2am every vendor blames the next. On Telnyx, one team owns the whole path — lower latency, lower cost, one escalation. This is also the cost lever that lets us pass savings to small businesses.

---

## The recommended stack

| Layer | Recommended vendor / model | Why | On Telnyx |
|---|---|---|---|
| **LLM** | **Anthropic Claude — Sonnet (latest, e.g. `claude-sonnet-4.x`)** | Selected for tone and bilingual quality; handles the dialect-aware persona and the Sales/Architect Guru logic. | Native — selectable as the assistant LLM in Mission Control / Assistants API; runs on Telnyx-hosted inference. |
| **STT (speech-to-text)** | **Deepgram Nova-3 (multilingual)** | Production STT for voice agents: tuned for real-world audio (background noise, crosstalk, far-field), 45+ languages incl. strong EN/ES, diarization, smart formatting, PII redaction, keyterm prompting. ~sub-200ms. | Native — Telnyx hosts Deepgram on its own infrastructure. |
| **TTS (text-to-speech) — primary** | **ElevenLabs — Flash v2.5** (real-time, ~75ms inference), voices from the **Bilingual / Spanish voice library** | Best-in-class naturalness and **Spanish dialect/accent quality** — the differentiator. Native accents per region, emotional range, real-time latency. Use Multilingual v2 only for any pre-rendered long-form. | Bring-your-own ElevenLabs key inside the Telnyx AI Assistant Builder. |
| **TTS — value/fallback** | **Telnyx-native: Ultra** (expressive) / **NaturalHD** (value) | Lowest latency + cost, fully on-network. Use for English-heavy or cost-sensitive accounts where premium ES dialect range isn't the priority. | Native. |
| **Telephony / carrier** | **Telnyx** (PSTN + SIP, Tier-1 carrier) | Owns the number, call control, DTMF, recording, real-time events. | Native — it's the platform. |
| **Orchestration / builder** | **Telnyx AI Assistant Builder** | No-code/low-code assembly of the above + versioning, testing, **canary deploys** (ties to the Proving Ground regression gate). | Native. |

---

## Voice-model selection by language profile

Pick the voice per the dominance/variety logic in the dialect layer:

| Caller profile | Voice recommendation |
|---|---|
| **ES-dominant** (Mexican, Caribbean, Central American, Colombian/Andean, etc.) | ElevenLabs bilingual/Spanish voice matched to the regional variety — clean Spanish, no Spanglish. This is where ElevenLabs earns its place over the native voices. |
| **Bilingual / code-switcher** | ElevenLabs bilingual voice that handles EN↔ES code-switching smoothly. |
| **EN-dominant** | Telnyx-native Ultra is fine (lower cost/latency); ElevenLabs if the brand wants premium voice as a trust signal. |

Each client/vertical KB names its specific chosen voice IDs per language so the assistant is deterministic, not picking voices at runtime.

---

## Configuration notes for Ace

- **One assistant per deployment**, attached to the client's Telnyx number. STT/LLM/TTS all set inside that assistant — nothing leaves the Telnyx backbone except the BYO ElevenLabs call.
- **Bring-your-own keys:** Anthropic (if not using Telnyx-hosted Claude) and ElevenLabs go in the Assistant Builder. Deepgram is already on-network.
- **Latency budget:** keep total RTT < 500ms (target sub-200ms). ElevenLabs Flash v2.5 (not Multilingual v2) for the live agent to stay in budget.
- **Barge-in / turn-taking:** enable interruption handling; Deepgram's real-time turn detection (Flux-class) helps. Test this hard — it's the #1 thing that makes a phone agent feel human or broken.
- **Versioning = the Proving Ground gate:** use the builder's testing + canary deploys so no prompt/KB/voice change ships without passing the eval bank.
- **Chatbot (text surface):** same Claude Sonnet model via API, same KB; no STT/TTS needed.

---

## Indicative cost (internal planning only — verify live, this moves)

- Telnyx bundled STT + TTS ≈ **$0.05–0.06/min**; open-source/hosted LLM inference ≈ **$0.025/min**; SIP separate. ElevenLabs BYO adds its own per-character/per-minute cost on top.
- This per-minute economics is the basis for the "agency-grade results at SMB-accessible price" thesis — flat telecom margins instead of compounding platform markups.

> **Caveat:** model names, voice models, and per-minute rates change frequently. Confirm current Telnyx-supported model strings, the latest Claude Sonnet version available on Telnyx, the current Deepgram model, and ElevenLabs voice IDs at build time. Treat this table as the recommended architecture, not a frozen parts list.
