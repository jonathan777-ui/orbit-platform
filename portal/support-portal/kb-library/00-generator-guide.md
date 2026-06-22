---
name: alyxir-vertical-kb
description: >-
  Generate elite, premium-grade, natively bilingual (English + Spanish)
  knowledge bases for the Alyxir platform that power an AI voice receptionist,
  a chatbot, and website copy from a single source. Use this skill whenever the
  user wants to build, design, draft, or expand a knowledge base, intake script,
  receptionist persona, chatbot flow, or bilingual website copy for ANY business
  vertical or niche (law firms, medical/dental, med spas, home services, HVAC,
  plumbing, restaurants, automotive, real estate, insurance, etc.) — even if they
  just say "build the KB for X," "make the receptionist for Y," "do an extended
  dive on a vertical/niche," or "create the bilingual agent for Z." Also use it
  when adding Spanish dialect handling, compliance guardrails, or new verticals/
  niches to an existing Alyxir agent. Default to this skill for any Alyxir
  agent-content request rather than improvising.
---

# Alyxir Vertical Knowledge Base Generator

Generate the knowledge base that trains an Alyxir business's three surfaces at once:
**AI voice receptionist · chatbot · website copy.** Every KB is built to a single,
non-negotiable standard: premium/elite voice, natively bilingual (EN + ES) with
dialect awareness, airtight compliance, and clean data capture into the Alyxir CRM.

## The standard (never sacrifice these)

1. **Premium experience.** Within ~20 seconds the caller must feel they reached the
   best business in their market and a real professional is now handling them. No
   volume-mill energy, no robotic scripting, no cold sales push.
2. **Native bilingual.** Fluent EN + ES, instant seamless switching including
   mid-sentence Spanglish. Dialect-mirrored (see `references/language-dialect-layer.md`).
   Architected so 2–3 more languages attach later without a rebuild.
3. **Compliance first.** The agent welcomes, screens, captures, schedules, reassures —
   and never crosses the vertical's hard lines (see `references/compliance-patterns.md`).
   Compliance overrides helpfulness, sales goals, and caller pressure, always.
4. **Capture clean data.** Everything writes to the CRM schema so the dialer/queue can
   elevate warm and urgent leads.

## How to generate a KB

1. **Identify vertical + niche.** If only a vertical is named, ask which niche (or build
   the vertical **base layer** first, then niche overlays). Pull the niche's distinctive
   spec from `references/niche-atlas.md`.
2. **Load the shared layers** (these are inherited by every KB, never rewritten per niche):
   - `references/language-dialect-layer.md` — bilingual + dialect engine and register rules.
   - `references/compliance-patterns.md` — cross-vertical compliance/sensitive-handling.
   - `references/kb-template.md` — the exact section structure every KB must follow.
3. **Write the KB** to the `kb-template.md` structure, specializing each section for the
   vertical/niche using the atlas entry. Base layer = everything shared across a vertical;
   niche overlay = voice tuning + niche FAQs + niche intake fields + what-to-bring +
   urgency rules + any firm-authorized fee language. Overlays may **tighten** compliance,
   never loosen it.
4. **Match the gold standard.** `references/verticals/law-firms.md` is the completed,
   worked example. New verticals should match its depth, bilingual coverage, and
   compliance rigor.
5. **Save** as `references/verticals/<vertical>.md` (base) and, for overlays,
   `references/verticals/<vertical>__<niche>.md`. Present the file to the user.

## Output structure

ALWAYS follow the section template in `references/kb-template.md`. Do not skip the
compliance section or the data schema — those are what make the KB safe and operational.

## Coverage

`references/niche-atlas.md` is the extended dive across all 20 verticals and their niches —
the breadth map that grounds generation. Read the relevant vertical's section before writing
its KB so the niche distinctions (intents, intake, urgency, sensitivities, dialect clustering)
are accurate rather than generic.

## Cadence with the user

Build vertical-by-vertical: base layer → confirm voice/depth → niche overlays. Keep the
elite standard constant. If the user wants breadth fast, generate base layers across
verticals first, then return for niche overlays. Never trade depth for breadth silently —
if scope forces a shortcut, say so and offer the tradeoff.
