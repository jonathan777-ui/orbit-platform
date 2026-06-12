# Orbit Platform

Home for Orbit platform skills and tooling.

## Skills

### `skills/airlock-vertical-kb` — Airlock Vertical Knowledge Base Generator (v2, Elemental)

A Claude Code Skill that generates elite, natively bilingual (EN + ES) knowledge
bases **and** deployable voice/chat agents for the Airlock platform — powering an
AI voice receptionist, a chatbot, and website copy from one source.

**What it covers**

- **Build tiers** (`references/tier-ladder.md`): Gold → Platinum → Iridium → Rhodium.
- **Service levels** (`references/service-levels.md`): DIY → Hybrid → DFY → Diamond Support.
- **Regional Spanish Dialect Module** (`references/dialect-module.md`, `dialect-glossary.md`).
- **Voice Runtime Layer** (`references/voice-runtime-layer.md`): turn-taking, barge-in, SSML, read-back, safety.
- **Compliance hard-lines** (`references/compliance-patterns.md`) and the **KB template** (`references/kb-template.md`).
- **Niche atlas** (`references/niche-atlas.md`): 40 verticals / 318 niches, with a worked example in `references/verticals/law-firms.md`.
- **Live compiler** (`tools/compile_agent.py`): renders a gold base + niche overlay + voice layer into a deployable agent
  (`system_prompt.txt`, `attio_field_map.json`, `n8n_routing.json`, `agent.manifest.json`).

See [`skills/airlock-vertical-kb/SKILL.md`](skills/airlock-vertical-kb/SKILL.md) for the
full spec and [`UPGRADE-NOTES.md`](skills/airlock-vertical-kb/UPGRADE-NOTES.md) for the v1 → v2 changes.

## Installing the skill

Copy `skills/airlock-vertical-kb/` into your Claude Code skills directory
(e.g. `~/.claude/skills/airlock-vertical-kb/`). It's a drop-in replacement for v1
of the same skill name.

## Live docs site

The skill docs are published as a browsable static site via GitHub Pages:
**https://jonathan777-ui.github.io/orbit-platform/**

It's built from `skills/airlock-vertical-kb/` by `site/build.py` and deployed
automatically by `.github/workflows/pages.yml` on every push to `main`.
Build it locally with:

```bash
pip install markdown
python site/build.py   # outputs to site/_site/
```
