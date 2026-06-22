# Orbit Voice Agent — Production Config

The runtime config for a live phone receptionist. The loop:

```
   Caller (PSTN)
        │
        ▼
  ┌─────────────┐   audio    ┌──────────────────┐  transcript  ┌──────────────┐
  │   TELNYX    │ ─────────▶ │  DEEPGRAM Nova-3  │ ───────────▶ │    CLAUDE     │
  │ Call Control│            │  streaming STT    │              │  (the brain)  │
  │  (telephony)│ ◀───────── │  + endpointing    │              │  KB system    │
  └─────────────┘   audio    └──────────────────┘              │  prompt       │
        ▲                                                        └──────┬───────┘
        │                    ┌──────────────────┐   text reply          │
        └──────────────────  │  DEEPGRAM Aura-2  │ ◀─────────────────────┘
            speech (TTS)     │  TTS (EN/ES)      │
                             └──────────────────┘
```

Telnyx owns the phone line and streams call audio both ways. Deepgram turns the caller's
speech into text (and, on the return leg, text back into speech). Claude is the only part
that *thinks* — it reads the transcript, applies the business's knowledge base, and decides
what to say. Deepgram does ears + mouth; Claude does the brain; Telnyx does the phone.

---

## config (drop into the voice runtime / n8n inbound flow)

```json
{
  "telephony": {
    "provider": "telnyx",
    "mode": "call_control",
    "media_streaming": "bidirectional",
    "codec": "PCMU/8000",
    "answer_on": "human",
    "amd_gate": true,
    "comment": "Transcription starts only after a human is detected (AMD). Consent/disclosure played first per TCPA."
  },
  "stt": {
    "provider": "deepgram",
    "model": "nova-3",
    "tier": "streaming",
    "language": "multi",
    "detect_language": ["en", "es"],
    "endpointing_ms": 300,
    "interim_results": true,
    "smart_format": true,
    "numerals": true,
    "rate_usd_per_min": 0.0077,
    "multilingual_surcharge_pct": 20,
    "comment": "Multilingual auto-detects EN/ES mid-stream. ~$0.0092/min with the +20% multilingual."
  },
  "llm": {
    "provider": "anthropic",
    "model_default": "claude-haiku-4-5-20251001",
    "model_escalate": "claude-sonnet-4-6",
    "escalate_when": ["compliance-sensitive", "complex booking", "low STT confidence"],
    "max_tokens": 400,
    "system_prompt_source": "vertical KB (positioning + FAQs + hard compliance limits)",
    "comment": "Haiku handles ~95% of turns cheaply; escalate to Sonnet only when needed."
  },
  "tts": {
    "provider": "deepgram",
    "model": "aura-2",
    "voice_en": "aura-2-asteria-en",
    "voice_es": "aura-2-celeste-es",
    "rate_usd_per_1m_chars": 30,
    "fallback_provider": "elevenlabs",
    "fallback_model": "eleven_flash_v2_5",
    "comment": "Aura-2 covers EN/ES and is cheapest. Swap to ElevenLabs Flash for a premium or cloned brand voice."
  },
  "turn_taking": {
    "barge_in": true,
    "vad": "deepgram",
    "silence_timeout_ms": 800,
    "comment": "Caller can interrupt; agent stops speaking immediately (barge-in). Deepgram Flux can replace simple VAD for smarter turn-ends."
  },
  "language": {
    "default": "en",
    "auto_switch": true,
    "spanish_register": "usted (warm, respectful) unless caller signals otherwise"
  },
  "latency_targets_ms": { "stt": 300, "llm_first_token": 500, "tts_first_byte": 200, "total_response": 1100 }
}
```

---

## demo vs production

| Layer | Production (live calls) | Demo (in-browser, free) |
|---|---|---|
| Telephony | Telnyx (real phone #) | none — runs in the browser |
| STT | Deepgram Nova-3 streaming | browser Web Speech API |
| LLM | Claude (Haiku → Sonnet) | same Claude, or offline KB |
| TTS | Deepgram Aura-2 (or ElevenLabs) | browser speechSynthesis |

The demo deliberately uses the browser's free speech so it costs nothing during testing — your
$200 Deepgram credit is spent only on real production calls.

## cost per 3-minute call (rough)
- STT (Deepgram, ~40% caller talk, multilingual): ~$0.011
- TTS (Aura-2, ~agent speech): ~$0.04–0.07
- LLM (Claude Haiku): a few cents
- **Telnyx telephony (~$0.05–0.06/min): ~$0.15–0.18 — the biggest line item**

Deepgram credit outlasts telephony spend by a wide margin. Budget Telnyx first.
Verify every published rate before client quoting — list prices drift.
