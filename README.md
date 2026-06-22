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
- **The Beat-the-Generators Standard** (`references/quality-bar.md`): the measurable quality bar (performance, design, accessibility, SEO+AEO, CRO, the AI front office) and a pass/fail launch gate that out-classes Wix/Squarespace/Webflow/Framer/Durable/10Web/v0.
- **Growth playbooks & audit**: `references/website-audit.md` (paste-a-URL audit), `references/local-seo-gbp.md` (local-first GBP playbook), `references/local-landing-pages.md` (per-city landing pages, done right), `references/aeo-guide.md` (AEO / `llms.txt` to win AI-answer-engine citations).
- **Build pipeline & gating** (`references/build-pipeline.md`): the ordered path from audit → build → §4 launch gate → risk-based build review → **universal human go-live gate** → deploy → monthly continuation, with Definition-of-Ready / Definition-of-Done checklists. The docs deploy itself is gated — pushes build-check only; publishing requires a manual run.
- **Niche atlas** (`references/niche-atlas.md`): 40 verticals / 318 niches, with a worked example in `references/verticals/law-firms.md`.
- **Template Library** (`references/template-library.md`): the complete 40-vertical atlas — 25 website templates per vertical (**1,000 total**), each mapped to niche, build-tier, layout, and palette — plus the **Top 40 Color Combinations**, **Top 50 Typography Pairings**, a **World-Class Feature Stack**, and a **Template Anatomy** guide.
- **Live compiler** (`tools/compile_agent.py`): renders a gold base + niche overlay + voice layer into a deployable agent
  (`system_prompt.txt`, `attio_field_map.json`, `n8n_routing.json`, `agent.manifest.json`).
- **Build tools**: `tools/gen_llms_txt.py` (auto-emits `/llms.txt` + `/llms-full.txt` for AI answer engines on every build — also wired into `site/build.py`) and `tools/audit_batch.py` (paste several URLs → a weighted competitor comparison grid).

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

## Portal (Alyxir Studio)

The full **Alyxir Studio** portal — the most advanced Orbit build — now lives under
[`portal/`](portal/). It's the consolidated receptionist app, partner/support
portals, the 25-vertical KB library, runbooks, and demo tooling, brought into this
repo as the umbrella project.

- **Receptionist app & demo tooling**: `portal/index.html`, `portal/orbit-*.html`,
  `portal/support-portal/app-code/` (`airlock-app.jsx`, `airlock-standalone.html`).
- **Serverless functions**: `portal/netlify/functions/` (`claude.js`, `enrich.js`).
- **KB library (25 verticals)**: `portal/support-portal/kb-library/`.
- **Setup runbooks**: `portal/support-portal/runbooks/` — start with
  [`ace-setup.md`](portal/support-portal/runbooks/ace-setup.md), which documents the
  11 live connection points, including **#5 Calendar / booking** (Google Calendar /
  Attio → real event creation + email/SMS confirmation) and **#11 the n8n
  provisioning webhook**.

> **Note:** this is a *code consolidation only*. The portal carries its own
> `portal/netlify.toml`, but Netlify-from-Git reads the **repo-root** `netlify.toml`
> (which builds the docs site). Wiring the portal up as a second deploy target — and
> implementing the live Google Calendar / auto-email automation (currently scripted,
> driven by external n8n flows not yet in version control) — is tracked as
> follow-up work, not part of this change.
