# Airlock — REGIONAL SPANISH DIALECT MODULE
*A cross-cutting layer for every vertical agent. Loads alongside gold §3 + the Platinum voice layer; compiles into the system_prompt. Governed by one principle: **mirror, don't perform** — adapt words, register, and warmth; never caricature an accent.*

---

## How many Spanish dialects?

**Headline coverage: 1 neutral floor + 13 regional dialects + 2 cross-cutting varieties = 16 supported Spanish varieties**, plus an indigenous-greeting premium layer and +language extensibility.

There is no single "correct" count of Spanish dialects — linguists split them dozens of ways. What matters for a US-facing SMB receptionist is **the varieties your callers actually use.** So the module is scoped to the US Hispanic market first, then the rest of Latin America, then Spain.

### The neutral floor (ships with every agent)
**Español Neutro** — neutral Latin-American Spanish. No regional slang, `usted` by default for high-gravity verticals, universally understood vocabulary. Every agent speaks this until a variety is detected, then adapts.

### The 13 regional dialects (productized, tunable)
Grouped by macro-region:

| # | Dialect | Region | Default register | Signature markers |
|---|---|---|---|---|
| 1 | **Mexican (Central/Standard)** | CDMX & central MX | usted | "ahorita," "¿mande?," "platicar," "órale" |
| 2 | **Northern Mexican (Norteño)** | MX border states | usted/tú | clipped, direct; "qué onda," "troca" (truck) |
| 3 | **Yucatec / Southeastern** | Yucatán, Quintana Roo | usted | Maya-influenced intonation; "¿qué tanto?" |
| 4 | **Cuban** | Cuba & US Cuban | tú | fast, -s aspirated/dropped, "asere," "¿qué bolá?" |
| 5 | **Puerto Rican** | PR & US Boricua | tú | -r→-l ("Puelto Rico"), "chévere," "wepa" |
| 6 | **Dominican** | DR & US Dominican | tú | very fast, -s dropped, "qué lo que," "vaina" |
| 7 | **Central American (voseo)** | GT, SV, HN, NI | usted + **vos** | soft, formal; "vaya pues," "cabal," "¿va?" |
| 8 | **Costa Rican & Panamanian** | CR, PA | usted/vos | "pura vida" (CR), "¿qué xopá?" (PA) |
| 9 | **Colombian (Andean/Bogotá)** | Bogotá highlands | usted (warm) | precise, courteous; "¿me regala…?," "sumercé" |
| 10 | **Coastal Colombian & Venezuelan** | Caribbean coast, VE | tú | Caribbean-style, -s aspirated; "¿qué más?," "chévere," "pana" |
| 11 | **Andean (Peru/Ecuador/Bolivia)** | Andes | usted | measured, formal; "¿no más?," "casero/a" |
| 12 | **Rioplatense** | AR, UY | **vos** | "che," sh-sound for ll/y ("sho" for "yo"), direct |
| 13 | **Chilean** | Chile | tú | very fast, "po," "cachái," clipped endings |

### 2 cross-cutting varieties
| # | Variety | What it is | Why it matters |
|---|---|---|---|
| 14 | **US Latino / Spanglish** | US-born/raised sociolect, fluid code-switching ("una reservation para las 7," "el 401k") | **The most common US caller profile.** Never "correct" it — mirror it. |
| 15 | **Peninsular (Spain)** | Castilian + Andalusian + Canarian; `vosotros`, "vale," ceceo | Only when clearly detected; rare for US SMBs but available. |

### Premium niche layer
| 16 | **Indigenous greeting layer** | Warm greeting + handoff phrases in Nahuatl, K'iche'/Maya, Quechua, Mixteco | Signals deep respect in communities with large indigenous-language populations. Rhodium-only. |

> **+Language extensibility:** Portuguese, Haitian Creole, Vietnamese, Mandarin, Tagalog attach as sibling profiles with their own register + glossary. Intent map, compliance, intake, and booking are shared and never duplicated per language.

---

## Detection & selection logic (how the agent picks a variety)

1. **Language detect** — identify EN vs ES in the first exchange; continue in it; switch instantly if the caller switches (including mid-sentence).
2. **Regional bias from business location** — pre-seed the *likely* dialect from the SMB's city (e.g., a Miami business → Cuban/Caribbean bias; El Paso → Northern Mexican; LA → Mexican/US-Latino).
3. **Mirror the caller** — once cues are heard, adapt vocabulary, register, and warmth to the caller, **overriding** the location bias. The caller always wins.
4. **Confidence + fallback** — if the variety is unclear, stay on the **neutral floor**. Never guess into slang.
5. **Mirror, don't perform** — adapt words and warmth only. No exaggerated accents, no stereotype.

---

## TIER MATRIX — dialect capability by tier

| Capability | **Gold** (base) | **Platinum** | **Iridium** | **Rhodium** |
|---|:---:|:---:|:---:|:---:|
| Español Neutro floor | ✅ | ✅ | ✅ | ✅ |
| Auto language-detect + caller mirroring | ✅ | ✅ | ✅ | ✅ |
| Spanglish acceptance (never "corrected") | ✅ | ✅ | ✅ | ✅ |
| Per-vertical register default (usted/tú) | ✅ | ✅ | ✅ | ✅ |
| 6 macro-regions recognized + lightly adapted | ✅ | ✅ | ✅ | ✅ |
| **All 13 regional dialects, full vocab + register** | — | ✅ | ✅ | ✅ |
| **Voseo handling** (vos conjugation) | — | ✅ | ✅ | ✅ |
| **US-Latino / Spanglish sociolect mode** | — | ✅ | ✅ | ✅ |
| **Regional bias from business location** | — | ✅ | ✅ | ✅ |
| **Per-client register/formality lock** | — | ✅ | ✅ | ✅ |
| **Native-speaker-validated dialect content** | — | — | ✅ | ✅ |
| **Dialect-specific TTS / pronunciation tuning** | — | — | ✅ | ✅ |
| **Live per-call dialect confidence + dynamic switch** | — | — | ✅ | ✅ |
| **Dialect-aware number/date/currency read-back** | — | — | ✅ | ✅ |
| **Custom client-specific dialect tuning** (match the owner) | — | — | — | ✅ |
| **Brand-voice idiom pack** (the client's signature phrases) | — | — | — | ✅ |
| **Voice-clone / accent matching** | — | — | — | ✅ |
| **Self-learning dialect refinement from real calls** | — | — | — | ✅ |
| **Indigenous-language greeting layer** | — | — | — | ✅ |
| **+Additional validated language profile** | — | — | add-on | ✅ |

---

## Premium add-ons (à la carte) and where they unlock

Add-ons are sold on top of the base tier. **The richer the add-on, the higher the tier floor it requires** — the premium-of-premium options are gated to the top tiers so they stay a differentiator.

| Add-on | What it adds | Earliest tier | Positioning |
|---|---|---|---|
| **Extra Dialect Pack** | Any single regional dialect beyond the 6 macro-regions, fully tuned | Platinum | premium |
| **Voseo Pack** | Full vos handling (Central America / Rioplatense) | Platinum | premium |
| **Spanglish / Code-switch Mode** | Native US-Latino sociolect handling | Platinum | premium |
| **Regional Auto-Bias** | Dialect pre-seeded from the SMB's location | Platinum | premium |
| **Dialect TTS Voice** | Region-matched pronunciation in the spoken voice | Iridium | premium+ |
| **Dialect-aware Read-back** | Numbers/dates/money said the regional way | Iridium | premium+ |
| **+Language Profile** | Portuguese / Haitian Creole / etc. (built) | Iridium | premium+ |
| **Indigenous Greeting Layer** | Nahuatl / Maya / Quechua greeting + handoff | **Rhodium only** | **premium of premium** |
| **Voice-Clone / Accent Match** | Agent voice matches the region or the owner | **Rhodium only** | **premium of premium** |
| **Custom Client Dialect Tuning** | Agent matches the owner's own regional speech | **Rhodium only** | **premium of premium** |
| **Self-Learning Dialect Loop** | Dialect phrasing improves from the client's real calls | **Rhodium only** | **premium of premium** |
| **Validated +Language** | A second language signed off by native speakers | **Rhodium only** | **premium of premium** |

**The rule of the ladder:** *premium* features open at Platinum, *premium+* at Iridium, and *premium-of-premium* live only at Rhodium — so upgrading tiers is the only way to unlock the best, and the best can't be bought à la carte on a low tier.

---

## How it plugs into the KB
- **Loads with** every compiled agent: gold §3 (dialect rules) + this module's selected packs + the Platinum voice layer §A.2 (pronunciation/SSML).
- **Compiles into** the `system_prompt` (dialect rules rendered after persona, before scripts) and feeds `voice.say_as` for the dialect TTS add-on.
- **Validated by** the Rhodium `02-spanish-dialect/` package (native-speaker worksheets) — Iridium/Rhodium dialect content is exactly that package's signed output.
- **Glossary:** see `dialect-glossary.md` for the neutral floor lexicon, the cross-region swap table, and per-dialect cue cards.

*End of Dialect Module spec.*
