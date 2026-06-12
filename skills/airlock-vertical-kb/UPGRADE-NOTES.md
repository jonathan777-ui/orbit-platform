# Airlock Vertical KB — v2 Upgrade Notes

**Same skill name** (`airlock-vertical-kb`) → this is a **drop-in replacement** for v1.
Install: replace your existing `airlock-vertical-kb/` skill folder with this one.

## What's new in v2

| Area | v1 | v2 |
|---|---|---|
| Scope | generate a bilingual vertical KB | generate **+ tier + compile + red-line + human-gate** a deployable agent |
| Tiers | — | **Elemental build ladder** Gold → Platinum → Iridium → Rhodium (`references/tier-ladder.md`) |
| Service model | — | **DIY / Hybrid (Guru-Assisted) / DFY / Diamond Support** (`references/service-levels.md`) |
| Dialect | one shared dialect table | **Regional Spanish Dialect Module** — 16 varieties, tiered, AI-validated glossary (`references/dialect-module.md`, `dialect-glossary.md`) |
| Voice | (in template) | **Voice Runtime Layer** — turn-taking, barge-in, SSML, read-back, safety (`references/voice-runtime-layer.md`) |
| Build step | hand-written | **live compiler** `tools/compile_agent.py` (`references/compiler-workflow.md`) |
| Productizing | — | **Website & Platform Catalog** — two-axis menu + pricing framework (`references/website-catalog.md`) |
| Honesty | implicit | explicit **Rhodium human-gate** (legal · native dialect · real-call) stated in SKILL.md |

## Files carried forward unchanged
`references/language-dialect-layer.md`, `references/compliance-patterns.md`,
`references/kb-template.md`, `references/niche-atlas.md`, `references/verticals/law-firms.md`.

## Two-axis quick reference
- **Build tier = what you get** (Gold→Rhodium). Premium-of-premium build = **Rhodium**.
- **Service level = how it's delivered/supported** (DIY→Diamond). Premium-of-premium support = **Diamond**.
- A client picks **one of each**.

## The full KB tree
This skill is the *generator*. The complete generated corpus (40 Gold bases, 318 Platinum
overlays + compiled agents, the Iridium spine, the Rhodium work-packages) lives in your
`orbit-vertical-kb-COMPLETE.zip`. The skill's references are the authoritative specs that
corpus is built to.
