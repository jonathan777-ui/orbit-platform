# Airlock Elemental Tier Ladder
*The build-quality axis for every Airlock agent. Each tier inherits everything below it and adds a layer. Pair with a **service level** (`service-levels.md`) — they are independent axes.*

| Tier | Banner | What it adds | Human-gated? |
|---|---|---|---|
| **Gold** | base | Hand-crafted bilingual base layer per vertical: 15-section KB (incl. §3 language/dialect, §5 compliance), neutral-Spanish floor + 6 macro-regions, per-vertical register + glossary. | no |
| **Platinum** | growth | Niche **overlay** (voice tuning, niche FAQs/intake, what-to-bring, urgency rules, authorized fee language) + the **Voice Runtime Layer** (`voice-runtime-layer.md`: turn-taking, barge-in, SSML, read-back, safety). All 13 regional dialects + voseo + Spanglish + location bias. Overlays may **tighten** compliance, never loosen it. | no |
| **Iridium** | premium | **Engineering spine:** static red-line regression harness (every agent re-checked against universal + vertical + niche hard lines, exit-fail on any miss), behavioral worst-case suite, dynamic live-call injection (Attio record + presence-audit + weekly offer appended after base+safety), and a QC feedback loop that proposes **versioned, human-approved** edits from midnight-Pacific dispositions. Native-validated dialect + dialect TTS + live switching. | partial (QC edits human-approved) |
| **Rhodium** | apex | The three pillars AI cannot self-certify, delivered as **ready-to-execute human work-packages**: (1) attorney legal sign-off, (2) native-speaker dialect validation, (3) real-call learning. Plus custom client dialect tuning, voice-clone/accent match, self-learning loop, indigenous greeting layer. | **yes — human owns the sign-off** |

## The compile path (Gold → live agent)
```
gold base (vertical)  +  platinum overlay (niche)  +  voice runtime layer
        └────────────────────── compile_agent.py ──────────────────────┘
                                        ↓
   per-niche  system_prompt.txt  +  attio_field_map.json  +  n8n_routing.json
                                        ↓
        iridium red-line harness (must pass)  →  dynamic injection at call time
                                        ↓
              rhodium human-gate (legal · dialect · real-call) before "validated"
```

## Compliance is tier-independent
Hard lines (911/988 routing, no-legal/medical/financial advice, HIPAA, anti-stalking, mandatory-reporter, etc.) are present at **every** tier and never weaken as you move down the ladder. Tiers add capability and polish — never permission to cross a line.

## Honest tier boundaries
- AI builds Gold → Platinum → Iridium fully, and produces the **validated-draft** for Rhodium.
- **Rhodium "validated" status is crossed by humans only:** an attorney signs the compliance lines, native speakers confirm the flagged dialect items, and real call volume trains the feedback loop. The packages make that human work minutes, not months — but they don't remove it.
