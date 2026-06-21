---
name: airlock-vertical-kb
description: >-
  Generate elite, premium-grade, natively bilingual (English + Spanish)
  knowledge bases AND deployable voice/chat agents for the Airlock platform —
  powering an AI voice receptionist, a chatbot, and website copy from one source.
  Use this skill whenever the user wants to build, design, draft, revise, upgrade,
  compile, or expand a knowledge base, intake script, receptionist persona,
  chatbot flow, dialect layer, or bilingual website copy for ANY business vertical
  or niche (law, medical/dental, med spas, home services, HVAC, plumbing,
  restaurants, automotive, real estate, insurance, solar/generators, and ~40 more)
  — even a bare "build the KB for X," "make the receptionist for Y," "do a deep
  dive on a vertical/niche," "compile the agent for Z," "add a dialect pack," or
  "create the bilingual agent for Z." ALSO use it for tiering questions
  (Gold/Platinum/Iridium/Rhodium build tiers; DIY/Hybrid/DFY/Diamond service
  levels), the Regional Spanish Dialect Module, the website/product catalog, the
  compiler workflow, compliance hard-lines, or native-validation passes. Default
  to this skill for any Airlock agent-content, tiering, dialect, or productization
  request rather than improvising.
---

# Airlock Vertical Knowledge Base Generator — v2 (Elemental)

Generate the knowledge base **and the deployable agent** that train an Airlock business's
three surfaces at once: **AI voice receptionist · chatbot · website copy.** One source,
built to a single non-negotiable standard: premium/elite voice, natively bilingual (EN + ES)
with real dialect awareness, airtight compliance, clean CRM data — then **tiered, compiled,
red-line-tested, and human-gated** for production.

## The standard (never sacrifice these)

1. **Premium experience.** Within ~20 seconds the caller must feel they reached the best
   business in their market and a real professional is handling them. No volume-mill energy,
   no robotic scripting, no cold sales push.
2. **Native bilingual + dialect.** Fluent EN + ES, instant seamless switching including
   mid-sentence Spanglish. Dialect-mirrored (`references/dialect-module.md`,
   `references/dialect-glossary.md`, `references/language-dialect-layer.md`). **Mirror, don't
   perform.** Architected so +2–3 languages attach without a rebuild.
3. **Compliance first, tier-independent.** Welcome, screen, capture, schedule, reassure — and
   never cross the vertical's hard lines (`references/compliance-patterns.md`). Compliance
   overrides helpfulness, sales goals, and caller pressure, at **every** tier.
4. **Capture clean data.** Everything writes to the CRM schema so the dialer/queue elevates
   warm and urgent leads.

## Two axes: build tier × service level

Every engagement is **one build tier (what) × one service level (how).** Keep them straight.

- **Build tier — `references/tier-ladder.md`:** Gold (base bilingual layer) → Platinum (niche
  overlay + voice runtime layer + full 13 dialects) → Iridium (red-line harness + live
  injection + QC feedback loop + validated dialect/TTS) → Rhodium (human-gated apex: legal
  sign-off, native dialect validation, real-call learning, custom/voice-clone).
- **Service level — `references/service-levels.md`:** DIY (self-serve kit) → Hybrid (Guru
  Assisted) → DFY (Done For You) → **Diamond Support** (Priority Queue + dedicated Full
  Architect Guru). Premium-of-premium is gated on **both** axes — **Rhodium** (build) and
  **Diamond** (support); neither is sellable on a low tier.

## How to build a KB / agent

1. **Identify vertical + niche.** If only a vertical is named, ask which niche **or** build the
   vertical **Gold base layer** first, then niche overlays. Pull the niche's distinctive spec
   from `references/niche-atlas.md` (40 verticals / 318 niches) before writing — so intents,
   intake, urgency, sensitivities, and dialect clustering are accurate, not generic.
2. **Load the shared layers** (inherited by every KB, never rewritten per niche):
   `references/language-dialect-layer.md`, `references/compliance-patterns.md`,
   `references/kb-template.md`.
3. **Write the Gold base** to the `kb-template.md` structure, specializing each section for the
   vertical using the atlas. Match the depth/rigor of the worked example,
   `references/verticals/law-firms.md`.
4. **Add the Platinum overlay** per niche (voice tuning, niche FAQs/intake, what-to-bring,
   urgency rules, authorized fee language). Overlays may **tighten** compliance, never loosen
   it. Front-matter contract + the merge are in `references/compiler-workflow.md`.
5. **Select dialect packs + service level** (`references/dialect-module.md`,
   `references/service-levels.md`) for this client and render them into the prompt.
6. **Compile** with `tools/compile_agent.py` → per-niche `system_prompt.txt` +
   `attio_field_map.json` + `n8n_routing.json`.
7. **Red-line test (Iridium).** Re-check the compiled agent against universal + vertical + niche
   hard lines; it must pass before it ships. Then dynamic injection adds the live-call context
   (Attio record + presence-audit + weekly offer) **after** base + safety.
8. **Human-gate (Rhodium) where claimed.** "Native-validated" / "attorney-reviewed" status is
   crossed by humans only — see honesty boundary below.

## Productizing the deliverable

When the user is packaging an offer (pricing, tiers, what's included, add-ons), use
`references/website-catalog.md` — the exhaustive two-axis menu of products, layouts, features,
options, development services, the master tier matrix, the service/support levels, and the
pricing framework. Premium add-ons are tier-gated there (premium-of-premium = Rhodium / Diamond).

When the user wants to **pick or show a website design** (a template, theme, layout, or color
scheme) for a vertical/niche, use `references/template-library.md` — the **Template Library**:
the **complete 40-vertical atlas** at **25 named templates per vertical** (**1,000 total**) mapped
to niche, build-tier sweet-spot, layout signature, and a recommended palette, plus the **Top 40
Color Combinations**, **Top 50 Typography Pairings** (hex roles, font pairs + accessibility notes),
a **World-Class Feature Stack**, and a **Template Anatomy** guide. Pick by **Vertical → Niche →
Tier → Template → Palette (+ Type)**; the template is the *build* axis (what it looks like),
assembled from the catalog's blocks and gated by the same tier matrix.

## The quality bar (beat the generators)

Every build must clear `references/quality-bar.md` — **The Beat-the-Generators Standard** — before it
ships. It defines the measurable bar that out-classes the top website generators (Wix, Squarespace,
Webflow, Framer, Durable, GoDaddy Airo, v0, Lovable…): performance + Core Web Vitals targets, real
design tokens/motion, WCAG 2.2 AA, SEO **+ AEO** (answer-engine optimization), CRO, domain-accurate
content, native bilingual/dialect, the **AI front office** (grounded chat + 24/7 bilingual voice
receptionist from the same KB), compliance, and a **pass/fail launch-gate scorecard**. The thesis:
generators ship a *website*; Orbit ships a *front office*. Never ship to clear a checkbox — ship to
win the side-by-side. **Gating (`quality-bar.md` §8):** Gold + low-risk Platinum scaffold automatically;
high-risk Platinum and all Iridium/Rhodium get human content review — and **every new deploy passes a
universal human go-live gate** before it publishes.

## Growth playbooks & site audit

Four references operationalize the growth side of a build:
- `references/website-audit.md` — **paste any URL** (client's or a competitor's) and grade it against
  the quality bar; returns a scored teardown + the recommended Orbit tier/template. A lead magnet and
  scoping tool (the productized Presence Audit).
- `references/local-seo-gbp.md` — the **local-first foundation** (GBP, reviews, NAP/citations, on-site
  local, speed-to-lead) with a 30/60/90 cadence.
- `references/local-landing-pages.md` — the **per-city landing-page system**: cities (not ZIP doorway
  pages), curated city × money-service grid, 2–3 per batch, uniqueness bar, silo + schema.
- `references/aeo-guide.md` — **AEO / `llms.txt`**: how to win AI answer-engine citations (Google AI
  Overviews, ChatGPT, Perplexity, Gemini). Geographic scope is the Local→Regional→National ladder in
  `quality-bar.md` §2.5b — default local-first, climb by business model + tier.

**Build tools (every Orbit build uses them):**
- `tools/gen_llms_txt.py` — emits `/llms.txt` (+ `/llms-full.txt`) from a business manifest so AI
  answer engines read the business accurately. Wired into `site/build.py` (the docs site ships one);
  client builds call it on the compiled KB.
- `tools/audit_batch.py` — competitor-audit **batch mode**: several audited URLs → one weighted
  comparison grid (markdown) graded against the launch gate. Hand the output file to the right conversation.

## The build pipeline (run it the same way every time)

`references/build-pipeline.md` is the ordered end-to-end path — **audit → scope → compile KB → template
→ scaffold/build → fill → front office → §4 gate → build-review gate → human go-live → deploy →
continue** — with a Definition-of-Ready (before build) and Definition-of-Done (before go-live)
checklist. Every demo clears it before it ships.

## Output structure

ALWAYS follow `references/kb-template.md`. Never skip the compliance section or the data schema —
those make the KB safe and operational. Save Gold bases as `references/verticals/<vertical>.md`
and niche overlays per the compiler contract.

## Cadence with the user

Build vertical-by-vertical: Gold base → confirm voice/depth → Platinum overlays → compile →
red-line. If the user wants breadth fast, generate Gold bases across verticals first, then return
for overlays. Never trade depth for breadth silently — if scope forces a shortcut, say so and
offer the tradeoff.

## Honesty boundary (the Rhodium line)

AI builds Gold → Platinum → Iridium fully and produces the **validated-draft** for Rhodium. But
three pillars are **human-owned** and must never be claimed as done by the model alone:
**(1) attorney legal sign-off, (2) native-speaker dialect validation, (3) real-call learning.**
A rigorous AI native-fluency pass (see `references/dialect-glossary.md` §5) gets the dialect
content to *AI-validated* and shrinks the human's job to confirming flagged items — but the
per-region human sign-off is what crosses the line to *native-validated*. State this plainly;
never let tiering or polish imply a human gate was cleared when it wasn't.
