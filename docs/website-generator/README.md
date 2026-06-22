# Website Generator — Research & Architecture

Strategy, market research, and technical architecture for a **non-WordPress, AI-powered
website generator** targeting non-technical SMBs and solopreneurs — a competitor to
10Web / Durable / Wix. This complements the existing **Alyxir** vertical-spec generator
in [`../../portal/`](../../portal/) and the runnable MVP in [`../../sitegen/`](../../sitegen/).

## Contents

| Doc | What it covers |
|---|---|
| [`00-market-research.md`](00-market-research.md) | Competitive landscape, WordPress-vs-not tradeoffs, what SMBs want/complain about, market size & monetization, and the build recommendation. |
| [`01-architecture.md`](01-architecture.md) | Implementation-ready technical architecture: JSON site-schema as single source of truth, AI generation pipeline (constrained decoding + validate + repair), Puck visual editor, static rendering, multi-tenant Cloudflare hosting, tech stack, phased roadmap, risks. |
| [`02-durable-competitive-deep-dive.md`](02-durable-competitive-deep-dive.md) | Focused teardown of Durable (the incumbent to beat for this audience): pricing, product scope, complaints, competitor pricing table, and positioning opportunities. |

## TL;DR recommendation

For **non-technical SMBs/solopreneurs**, build **NOT on WordPress**. WordPress's advantages
(plugin ecosystem, deep technical SEO, code portability) accrue to power users; its costs
(per-site hosting, continuous security patching, performance overhead) hit hardest exactly
in a many-low-touch-sites model. A static/edge, schema-driven generator wins on margin,
performance-by-default, and a near-trivial security surface.

The decisive competitive wedge is **killing lock-in fear** — the #1 complaint against
proprietary builders (and Durable specifically). Offer real export (clean static HTML),
transparent/stable pricing, distinctive niche-aware output, and real SEO control.

> Sourcing note: figures in these docs come from 2024–2026 web research; market sizes,
> some pricing, and vendor performance claims vary by source or originate from vendor/agency
> blogs. Verify exact numbers against primary sources before using them in a pitch deck.
> Each doc carries its own confidence/uncertainty flags.
