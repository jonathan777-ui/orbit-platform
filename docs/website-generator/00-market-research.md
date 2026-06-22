# Market Research — Non-WordPress AI Website Generator for SMBs

**Audience focus:** non-technical small businesses and solopreneurs.
**Question:** Is a 10Web competitor for this audience better off NOT being built on WordPress?
**Date:** June 2026.

> **Confidence note:** Strategic conclusions (cost/security/performance favoring non-WP for
> this segment; lock-in as the key objection; competitor positioning) are well-supported
> across multiple sources. Specific figures — market sizes, some pricing, vendor performance
> claims, and security stats — vary by source or come from blogs/vendor pages and search
> snippets (several primary sources blocked direct fetch). Verify exact numbers against
> primary docs before putting them in a pitch deck.

---

## Bottom line up front

For non-technical SMBs/solopreneurs, **building NOT on WordPress is the stronger bet.** The
advantages WordPress brings (plugin ecosystem, deep technical SEO, code portability) matter
most to power users and agencies, not to this audience. Meanwhile WordPress's liabilities
(per-site hosting cost, continuous security patching, performance overhead) hit hardest
exactly in a many-low-touch-sites model. A static/edge-hosted, schema-driven generator gives
better margins, performance-by-default, and a near-trivial security surface.

The one thing that must be neutralized: **lock-in fear.** That's WordPress's strongest
marketing card and the loudest complaint against proprietary builders. Solve it with a
credible export path and you remove the best objection.

---

## 1. Competitive landscape

The market has split into four positioning tiers. **Almost no one competes where 10Web does**
— 10Web is nearly alone in generating *real WordPress sites*; Hostinger added a separate "AI
builder for WordPress 2.0" in 2026, but everyone else is proprietary or modern-JS.

| Tool | Stack | Entry price | Positioning |
|---|---|---|---|
| **10Web** | WordPress (Elementor + managed GCP) | ~$10–15/mo | AI speed + WordPress ownership |
| **Wix** (ADI) | Proprietary, no export | ~$17/mo | Broad SMB, most polished |
| **Hostinger** | Proprietary (+ separate WP product) | ~$3/mo promo, ~$11 renewal | Budget beginners |
| **Durable** | Proprietary, closed (Cloudflare) | Free / $25/mo | **Solopreneurs, service businesses** |
| **Squarespace** | Proprietary, no export | ~$16/mo | Design-conscious SMBs |
| **Dorik AI** | Proprietary no-code | Free / ~$15/mo | Beginners + agencies |
| **GoDaddy Airo** | Proprietary | Free / ~$60/yr | GoDaddy domain customers |
| **B12** | Proprietary + human-assisted | Free / ~$49–399/mo | Done-for-you pro services |
| **Framer AI** | React-based | Free / ~$15/mo | Designers, pixel-precision |
| **Webflow AI** | Proprietary + code export | ~$15/mo | Pro designers/agencies |
| **Relume** | Wireframe/component generator (exports to Webflow/Figma/React) | ~$38/mo | Pro designers |

**Tech-stack split:** Only 10Web (and Hostinger's separate "WP 2.0" product) generate true
WordPress sites. Framer is React-based. Everyone else (Wix, Durable, Squarespace, Dorik, B12,
GoDaddy Airo, Hocoos, Butternut, Hostinger's main builder) runs a closed proprietary platform.
Relume is the outlier — a wireframe/component generator that exports into Webflow/Framer/React.

**Implication:** For non-technical SMBs, the direct competitors are **Durable, GoDaddy Airo,
Hocoos, Wix, and Hostinger** — and the leaders there (Durable especially) are *already
non-WordPress and closed*. So "non-WordPress" is table stakes in this tier, not a
differentiator. Differentiation must come from **quality, performance, honest pricing, and an
anti-lock-in story.** Also notable: developer-focused code-gen tools (v0 by Vercel, Bolt.new,
Lovable) are adjacent but target a different ("vibe-coding") segment.

*Caveats: Durable's tiers were restructured (see deep-dive); Butternut/Hocoos pricing is thinly
documented; several headline prices are promotional vs. renewal rates.*

## 2. WordPress vs. non-WordPress (for THIS audience)

**For going non-WordPress (well-supported):**
- **Hosting cost / margin.** Managed WordPress runs ~$41–300+/mo per quality instance; static/
  edge hosting (e.g., Cloudflare Pages) has near-zero marginal cost and no egress fees. For a
  fleet of low-traffic SMB sites this is the single biggest economic argument.
- **Security/maintenance.** Patchstack data: ~96% of WordPress vulnerabilities live in
  *plugins*, ~57% need no authentication, and ~150 plugins were pulled from the repo in Dec
  2025 alone. Every WP site is an attack surface needing continuous patching. A static/edge
  site has almost no runtime attack surface — a major opex and risk advantage.
- **Performance.** Static/JS sites pass Core Web Vitals far more easily (WordPress ~43% pass
  rate per CrUX-based data). Speed comes by default. *(Vendor "10x faster" claims are
  cherry-picked — the real gap is meaningful but smaller; a well-optimized WP site can pass.)*

**For WordPress (matters LESS for non-technical SMBs):**
- **Portability** — its strongest card vs. Wix; but these SMBs rarely migrate, so it's more
  marketing than utility.
- **Plugin ecosystem** (65,000+ plugins) — huge breadth, but the same ecosystem is the source
  of ~96% of vulnerabilities. Moat and liability at once.
- **Deep SEO** — decisive only in competitive content niches, not typical local SMBs, where a
  fast static site matches or beats it.

**Verdict:** WordPress's advantages skew to power users; its costs skew to this model. For
non-technical SMBs the balance tilts non-WordPress — *provided* the common feature set (forms,
booking, simple commerce, CMS editing) is covered natively.

## 3. What customers want — and complain about

**Buying criteria (priority order):** ease of use → price → features/templates → reliable
support → SEO & e-commerce → custom domain. (Business.com weights pricing ~30%, ahead of
features and ease of use.)

**Loudest complaints — these are the opening:**
1. **Hidden/escalating costs.** Real cost often 2–3× the headline; AI credits, domains,
   traffic-tier upcharges. → *Compete with transparent, all-in pricing.*
2. **Billing & cancellation pain.** Surprise auto-renewals at multiples of last year's price;
   cancelling hosting doesn't cancel domain/email (Wix); refund refusals (GoDaddy ~3.8/10
   TrustScore). → *Win on honest, frictionless billing.*
3. **Lock-in / can't export.** Repeatedly named as a reason to avoid AI builders. → *Offer
   real export (static HTML / open format).*
4. **Bad default SEO** and **cookie-cutter AI output** ("repackaged templates with your
   text"). → *Compete on generation quality + clean technical SEO.*

**Price sensitivity:** genuinely budget-constrained (very small firms often <$500/mo total
marketing budget) but **value-driven, not just cheap** — ~68% of SMBs planned to *increase*
tool spending. They'll pay $15–30/mo for something that demonstrably works and doesn't surprise
them on the bill.

## 4. Market size & monetization

- **AI website builder segment:** ~$3.5B (2025) → ~$8–9B by 2030, **~20–25% CAGR**. Broader
  builder market figures vary widely by definition ($2.6B–$12.8B for 2024–25).
- **WordPress share is declining:** ~41.9% of the web (May 2026), down from 43.2% six months
  earlier — the decline accelerated and is WordPress-specific. A tailwind for non-WP entrants.
- **10Web traction:** only **$2M seed (2021)**, ~80 employees, "tens of thousands" of clients.
  *Not* a deeply funded incumbent — the category is still wide open.
- **Monetization to adopt:** tiered SaaS (annual discounts up to ~50%) + bundled per-site
  hosting + e-commerce fees (note Squarespace's 3% on lower tiers vs Wix's 0% — a place to
  undercut) + **agency/white-label** plans ($35–159/mo, effective ~$9/site at scale) + **AI
  generation credits.** The agency/white-label angle is a strong B2B2C wedge even when selling
  primarily to SMBs.

## 5. Recommendation

**For non-technical SMBs, yes — a non-WordPress generator is the better bet, but reframe the
goal.** Don't position as "10Web without WordPress" — 10Web's whole pitch *is* WordPress, and
this audience doesn't value it. The real competitors are Durable, Wix, GoDaddy, and Hostinger —
all proprietary, all generating loud complaints about hidden fees, billing traps, lock-in, and
bland AI output.

**Win by being the trustworthy, high-quality, fast option:** transparent all-in pricing, no
billing tricks, a real export path to kill lock-in fear, genuinely good (not cookie-cutter) AI
generation, and fast-by-default sites. The non-WordPress static/edge stack provides the margins,
performance, and low security burden to deliver that profitably — architecture and positioning
reinforce each other.

See [`01-architecture.md`](01-architecture.md) for the build and
[`02-durable-competitive-deep-dive.md`](02-durable-competitive-deep-dive.md) for how to beat
the leading incumbent in this segment.

---

## Sources (selected)

Landscape & pricing: 10web.io/pricing-platform, scribehow.com (10Web review 2026),
cybernews.com, tech.co, freakingnomads.com, hostinger.com/blog/product-updates-2026,
checkthat.ai, dorik.com/pricing, durable.com, help.webflow.com (May 2026 pricing),
vibecoding.gallery, toolworthy.ai, g2.com.

WordPress-vs-not: wpkraken.io, wiserreview.com, danubedata.ro (static hosting 2026),
devtoolreviews.com, searchenginejournal.com (2025 CWV CMS rankings), neodigit.fr, nandann.com,
patchstack.com (2025 mid-year + 2026 security reports), codeable.io, designrush.com,
expandedramblings.com, wpzoom.com.

SMB needs/complaints: business.com, networksolutions.com, connect4consulting.com,
arcticleaf.com, trustpilot.com (Wix, GoDaddy), bbb.org, consumeraffairs.com, localiq.com,
nerdwallet.com, dev.to (AI-builder hands-on tests).

Market size & monetization: market.us, precedenceresearch.com, thebusinessresearchcompany.com,
globalgrowthinsights.com, technavio.com, gravitykit.com, craftybase.com,
websitebuilderexpert.com, webgility.com, brizy.io, crunchbase.com (10Web), tracxn.com.
