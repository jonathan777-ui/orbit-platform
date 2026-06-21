# Orbit AI — THE BEAT-THE-GENERATORS STANDARD

*The quality bar every Orbit build must clear to out-class the top website generators —
Wix ADI / Wix Studio, Squarespace Blueprint, Webflow, Framer, Durable, GoDaddy Airo,
Hostinger AI, 10Web, B12, Relume, and the code-gen AIs (v0, Lovable, Bolt, Replit). This is
the **definition of "world-class"** for the Template Library (`template-library.md`) and the
KB it ships with. If a build doesn't clear Section 4's launch gate, it doesn't ship.*

---

## 0. The thesis — brochure vs. front office

Generators optimize for **"a site exists, fast."** Orbit optimizes for **"this business looks
like the market leader and never misses a customer."** A beautiful page that doesn't get found,
doesn't convert, can't answer the phone, and can't serve a Spanish-speaking caller loses every
time to one that does. We don't win by having more templates — we win on the compounding 20%:
**speed, trust, findability, conversion, and 24/7 bilingual answering — generated from one KB.**

> The generators ship a **website**. Orbit ships a **front office**: website + grounded chat +
> 24/7 bilingual AI voice receptionist + CRM/automation, all from the same source of truth, so
> the on-page promise and the phone experience never diverge.

---

## 1. Competitive teardown — what they do well, where they break, how we beat it

| Generator class | Examples | What they do well | Where they break | How Orbit beats it |
|---|---|---|---|---|
| **AI site builders** | Wix ADI, Squarespace Blueprint, Durable, GoDaddy Airo, Hostinger AI, B12, Mixo | Fast first draft, hosting, decent templates, basic SEO | Generic "template look", **filler/placeholder copy**, weak local SEO, no real CRO, bolt-on chat that hallucinates, no voice, machine-translated "bilingual" | KB-grounded domain-accurate copy, per-vertical themed design, real CRO, **grounded** chat + **AI voice receptionist**, native EN/ES + dialect |
| **Pro design tools** | Webflow, Framer | Beautiful layouts, strong motion, design control | DIY (you do the work), no content/ops, no bilingual/compliance, costs grow, no answering layer | Same craft level, **done-for-you**, plus content + ops + voice + compliance built in |
| **AI wireframe/components** | Relume | Great structure/sitemaps, component speed | Wireframes only — no real content, brand, SEO, or operations | We take structure to a finished, branded, **operating** front office |
| **Code-gen AI** | v0, Lovable, Bolt, Replit | Fast app scaffolds, flexible | Raw output, not brand/SEO/conversion-tuned, no local-business ops, no voice, maintenance burden | Conversion- and AEO-engineered, managed, with the receptionist/CRM wired in |
| **AI WordPress** | 10Web | AI generation + managed WP hosting, flexible plugin ecosystem | **WordPress + page-builder DOM bloat → weak mobile CWV**, security-patch/plugin-update treadmill, hosting lock-in, plugin sprawl, and *still* no voice/CRM/native-bilingual ops | **Static/edge delivery (no plugin rot, no patch treadmill)**, faster CWV, plus the AI front office + native bilingual + DFY ops 10Web has no answer for |

**The structural gap:** every generator stops at the **page**. None of them ship the thing a local
business actually needs — a system that gets found, converts, and **answers every call in two
languages, 24/7, without hallucinating.** That's the whole game, and it's our home field.

---

## 2. The non-negotiable quality bar (measurable)

Numbers are **launch targets**, not aspirations. Measure on a mid-tier mobile device / throttled 4G.

### 2.1 Performance (most generators quietly fail this on mobile)
- **Lighthouse:** Performance ≥ 95, Best-Practices ≥ 95, SEO 100, Accessibility ≥ 95 (mobile).
- **Core Web Vitals (field, p75):** **LCP < 1.5s** (elite < 1.2s), **CLS < 0.05**, **INP < 200ms**.
- **Weight budget:** initial HTML+CSS+JS < 200KB gzipped; hero image AVIF/WebP, responsive `srcset`,
  lazy-load below the fold; fonts `font-display: swap`, ≤ 2 families, subset + preload.
- **Delivery:** static/edge hosting, HTTP/2+, no render-blocking third-party junk. No jQuery-era bloat.

### 2.2 Design & craft (beat the "template look")
- **Design tokens:** a real system — color (the `C#` palette), type scale (modular, e.g. 1.2–1.25),
  4/8px spacing grid, radius, shadow, motion tokens. Not ad-hoc pixels.
- **Typography:** a deliberate `T#` heading/body pairing, optical sizes, ≤ 70-char line length,
  body ≥ 16px, line-height 1.5–1.65.
- **Layout:** intentional hierarchy, generous whitespace, consistent vertical rhythm, real grid —
  not a stack of identical full-width bands (the generator tell).
- **Imagery:** cohesive, on-brand, art-directed; no obvious stock-photo soup. Dark-mode variant where apt.

### 2.3 Motion (Framer's edge — we match it, tastefully)
- Purposeful micro-interactions: scroll-reveal, hover/focus states, sticky transitions, count-ups.
- 150–300ms easing, GPU-friendly (transform/opacity only), **respects `prefers-reduced-motion`**.
- Motion guides attention to CTAs; never decorative-only or janky.

### 2.4 Accessibility (most generators are AA in theory, not practice)
- **WCAG 2.2 AA**, verified: full keyboard nav + visible focus, semantic landmarks/headings, alt text,
  labelled forms, ARIA only where needed, contrast ≥ 4.5:1 (3:1 large), 44px touch targets,
  reduced-motion honored. Screen-reader smoke-tested.

### 2.5 SEO + AEO (the moat generators ignore)
- **Technical SEO:** clean semantic HTML, one H1, logical headings, descriptive titles/meta, canonical,
  sitemap.xml, robots.txt, OpenGraph/Twitter cards, fast indexable static pages.
- **Local SEO:** `LocalBusiness`/vertical schema (`Dentist`, `Attorney`, `Restaurant`…), NAP
  consistency, Google Business Profile alignment, service-area + per-location pages, embedded map/hours.
- **Structured data:** `FAQPage`, `Service`, `Review/AggregateRating`, `BreadcrumbList`, `Product`/`Menu`
  where relevant — valid against Rich Results.
- **AEO / answer-engine optimization (the 2026 differentiator):** content structured to be quoted by
  AI answer engines (Google AI Overviews, ChatGPT, Perplexity, Gemini) — clear Q&A blocks, entity
  clarity, concise factual answers, `FAQPage` schema, and an **`llms.txt`** + machine-readable summary
  so AI agents can read the business accurately. Generators do none of this.

### 2.5b Geographic reach — the Local → Regional → National ladder
**Default every build to a local-first foundation, then climb the ladder by business model + tier.**
Don't choose "specific markets only" (leaves compounding organic on the table) or "national for
everyone" (wastes spend on a single-location business). Match scope to how far the client actually
sells.

- **Local** *(default — ~80% of clients, single-location service businesses)*: Google Business
  Profile optimization, `LocalBusiness` + vertical schema, NAP consistency, service-area + city/
  neighborhood pages, review velocity, map-pack + "near me" / **"cerca de mí"** intent. Fastest
  payback (weeks); captures ready-to-call demand.
- **Regional** *(multi-location, metro-wide, or wide service-area businesses)*: per-city/per-location
  landing pages, county/metro keyword clusters, multiple GBP listings, regional content hubs, local
  link building. Fits home services covering a metro, dental/law groups, franchises.
- **National** *(geo-independent offerings)*: topic/authority content, programmatic category pages,
  national keywords, digital PR + backlinks, e-commerce SEO. Fits mail-order/specialty pharmacy,
  online courses, consulting, staffing, logistics, DTC retail, SaaS-like services.

**Do both, on two clocks:** local SEO + reviews + GBP compound in **weeks**; content + AEO authority
compound over **6–18 months**. Run local-first for immediate ROI and layer content/AEO for the
long-tail moat — organic that grows on its own over time. **AEO applies at every scope** (be the
answer AI engines give from "best X in [city]" up to "[category] question"). The near-uncontested
moat is **native Spanish-language organic** — almost no competitor ships genuine ES content, so
bilingual local + AEO captures demand rivals can't see.

| Business model | Recommended scope | Tier sweet-spot |
|---|---|---|
| Single-location service (solo dentist, plumber, restaurant, salon) | **Local** (+ AEO) | Gold–Platinum |
| Multi-location / wide service area (metro HVAC, dental/law group) | **Regional** (per-city pages) | Platinum–Iridium |
| Geo-independent (e-commerce, mail-order Rx, courses, consulting, staffing, logistics) | **National** (authority + programmatic) | Iridium |
| Franchise / white-label | **Regional per unit + National brand** | Rhodium |

**Tier mapping:** Gold = local foundation · Platinum = local + content + AEO · Iridium = regional/
multi-location + programmatic · Rhodium = national authority + digital PR + multi-site. Set the
client's scope at kickoff; never ship national tactics to a business that only serves one city, and
never cap a geo-independent business at a single map pin.

### 2.6 Conversion (CRO — generators ship pages, not pipelines)
- **Above the fold:** who/what/where + a primary CTA (call / book / quote) visible without scrolling.
- **Trust stack:** reviews/ratings, credentials, guarantees, real photos, license/insurance badges.
- **Frictionless action:** click-to-call, sticky mobile call/book bar, 1–2 field first step, multi-step
  forms, WhatsApp/SMS, exit-intent/offer where appropriate.
- **Speed-to-lead:** every lead routes to CRM and triggers follow-up **within minutes, not days** —
  the receptionist/automation answers when a generator's contact form just emails an inbox.
- **Measured:** conversion events instrumented from day one; A/B-ready (Platinum+).

### 2.7 Content & copy (no filler — this is where AI builders lose hardest)
- **Domain-accurate**, specific, benefit-led copy from the niche KB — real services, real intents,
  real FAQs. Zero lorem ipsum, zero generic "We are passionate about quality."
- Scannable: short paragraphs, descriptive subheads, bullets, clear CTAs per section.
- Voice matches the vertical register (`niche-atlas.md`); proofed, consistent, no AI tells.

### 2.8 Bilingual & dialect (generators "translate"; we localize)
- Native **EN + ES** (not machine-translated), instant toggle, dialect-aware register
  (`dialect-module.md`, `language-dialect-layer.md`), `hreflang`, localized CTAs/forms/schema.
- ES is first-class, not an afterthought — the receptionist and chat speak it natively too.

### 2.9 The AI front office (the unfair advantage no generator has)
- **24/7 bilingual AI voice receptionist** (`voice-runtime-layer.md`): sub-200ms turn-taking, barge-in,
  AMD-gated, natural prosody, **grounded in the same KB**, with human handoff and post-call CRM
  disposition.
- **Grounded chat** (KB/catalog-grounded, **no hallucination**, transfer-to-human).
- **One source of truth:** site copy, chat, and voice are compiled from one KB so they never contradict.
- **Automation:** booking → calendar, lead → CRM → follow-up, order → QuickBooks → fulfillment.

### 2.10 Security, privacy, compliance (regulated verticals generators can't touch)
- HTTPS/HSTS, form spam/bot protection, no secrets client-side, dependency hygiene.
- **Compliance hard-lines per vertical** (`compliance-patterns.md`): no legal/medical/financial advice,
  HIPAA-mindedness, no PHI/SSN over open channels, fair-housing, FTC/Funeral-Rule, etc. **Human-gated**
  for the Rhodium honesty line (attorney sign-off, native-dialect validation).

### 2.11 Analytics & the feedback loop
- Privacy-respecting analytics, call/lead tracking, conversion events, dashboard. Iridium+ adds
  heatmaps + A/B; Diamond adds proactive optimization. A generator hands you a site and walks away;
  Orbit measures and improves it.

---

## 3. Differentiators generators structurally cannot match

1. **One KB → website + chat + voice + automation.** Architectural, not a plugin. Competitors bolt
   these on from different vendors that drift out of sync.
2. **A receptionist that actually answers.** 24/7, bilingual, grounded, with handoff — the single
   biggest revenue lever for a local business, and no site builder ships it.
3. **Native bilingual + 13-region dialect**, not Google-Translate. Decisive for the Hispanic SMB market.
4. **Compliance + human-gated validation** for regulated verticals — generators explicitly disclaim this.
5. **Domain-grounded content** from a niche atlas — accurate, not filler.
6. **AEO/answer-engine optimization** so AI assistants recommend the business correctly.
7. **Done-for-you delivery + ongoing optimization** (service levels) — not "here's your editor, good luck."

---

## 4. Definition of Done — the launch gate (pass/fail)

A build ships only when **every Must-Pass clears** and the weighted score is **≥ 90/100**.

**Must-Pass (any failure blocks launch):**
- [ ] Mobile Lighthouse: Perf ≥ 95 · A11y ≥ 95 · SEO 100 · Best-Practices ≥ 95
- [ ] LCP < 1.5s · CLS < 0.05 · INP < 200ms (throttled mobile)
- [ ] WCAG 2.2 AA verified (keyboard + contrast + screen-reader smoke test)
- [ ] Primary CTA above the fold; click-to-call + sticky mobile bar working
- [ ] Valid structured data (LocalBusiness + FAQPage at minimum)
- [ ] Native EN/ES parity (no machine-translation tells); `hreflang` set
- [ ] Grounded chat answers from KB with **no hallucination** + human handoff
- [ ] (Iridium+) Voice receptionist answers, books, and writes a clean CRM disposition
- [ ] Compliance hard-lines for the vertical enforced; no advice/PII leakage
- [ ] Lead routes to CRM and fires follow-up within minutes

**Weighted scorecard (100 pts):** Performance 15 · Design/craft 15 · Conversion/CRO 15 ·
Content quality 12 · SEO+AEO 12 · AI front office 12 · Accessibility 8 · Bilingual/dialect 6 ·
Motion 3 · Security/compliance 2.

> **Beat test:** put the Orbit build next to the same business generated by Wix ADI, Squarespace
> Blueprint, Durable, and **10Web**. It must win on **first-impression craft, mobile speed, findability,
> conversion path, and — the knockout — that it answers the phone in two languages.** If it doesn't
> clearly win, it isn't done.

---

## 5. Tier mapping (the bar rises with the tier)

| Bar | Gold | Platinum | Iridium | Rhodium |
|---|:---:|:---:|:---:|:---:|
| Performance + A11y + technical SEO | ✅ | ✅ | ✅ | ✅ |
| Domain-accurate content + native EN/ES | ✅ | ✅ | ✅ | ✅ |
| Themed design system + motion + CRO + reviews/booking | — | ✅ | ✅ | ✅ |
| Local SEO + **AEO** + analytics + grounded chat | — | ✅ | ✅ | ✅ |
| **AI voice receptionist** + CRM/automation + portal | — | — | ✅ | ✅ |
| Bespoke design system + voice-clone + human-gated validation | — | — | — | ✅ |

Gold already beats a generic generator on speed, content accuracy, and bilingual. Platinum beats the
"pro design tool" output on craft **and** ships content + conversion. Iridium adds the front office no
generator has. Rhodium is category-leader, bespoke, human-validated.

---

## 6. How to use this

- Build the template (`template-library.md`) → apply the **World-Class Feature Stack** → then hold it
  against **this** bar before launch.
- It composes with: `website-catalog.md` (features/tiers), `voice-runtime-layer.md` (the receptionist),
  `dialect-module.md` / `language-dialect-layer.md` (bilingual), `compliance-patterns.md` (hard lines),
  and `tier-ladder.md` (what's gated where).
- **Rule:** never ship to clear a checkbox — ship to win the side-by-side. The bar exists so the answer
  to "is this better than what Wix/Framer/Durable would make?" is an obvious **yes**.

---

## 7. Delivery model — elite from the gate, continuation-tiered

**We never cut corners on craft.** The launch gate (§4) applies to **every build at every tier —
including the demo and Gold.** Quality is **not** the upsell. Build **tiers differ in *scope*** (pages,
e-commerce, voice receptionist, automation, portals — `tier-ladder.md`), **not in craft.** A Gold
one-pager and a Rhodium platform are both elite; one just does more.

**The differentiation and the recurring value is the monthly continuation — applied across *all*
components, not just the initial build.** A generator hands over a static site and leaves; Orbit keeps
every surface elite *and improving*, every month:

| Component | What "continue the level" means monthly |
|---|---|
| Website | CWV/perf upkeep, A11y, design refinements, new sections, A/B tests |
| Local SEO + GBP | posts, review velocity, citations, rank tracking (`local-seo-gbp.md`) |
| City pages + AEO | expand the curated grid, refresh answers + `llms.txt` (`local-landing-pages.md`, `aeo-guide.md`) |
| Voice receptionist + chat | prompt tuning, dialect re-validation, new intents (`voice-runtime-layer.md`) |
| Automation | new flows, integrations, follow-ups |
| Content | fresh, accurate, on-brand |

**Packaging:** the initial build is elite and **fairly priced** — win the demo, don't gouge. The
**service level** (`service-levels.md`: DIY → Hybrid → DFY → **Diamond**) sets **how much elite
continuation** the client gets each month. Retention and results come from continuing the level across
every component, every month — **not** from a one-time launch and **not** from gating build quality.

---

## 8. Review gating — two gates: a universal go-live gate + build review (risk × tier)

**Universal rule — every new deploy is human-approved before it goes live.** Regardless of tier,
vertical, or whether the build was scaffolded, **a person gives explicit go-live approval after the §4
launch gate passes.** Scaffolding automates *building*, never the *decision to publish.* Nothing reaches
a public URL or a client demo link without that sign-off. Pipeline: `scaffold/build → §4 self-check →
human go-live approval (always) → deploy`.

The **build-review gate** below maps the §7 scaffold rule to **risk** — it decides whether a human
reviews the *content during the build*, **not** whether a human approves the *deploy* (always yes).

- **Scaffold (automated build, no per-content reviewer):** **Gold builds (any vertical)** and
  **Platinum builds in Standard/Low-risk verticals.** The pipeline pre-seeds the plumbing, generates
  content, and self-checks against the §4 launch gate — then routes to the universal go-live gate.
- **Human-gate review (a person signs off before demo/publish):** **Platinum builds in High-risk
  verticals**, and **all Iridium and all Rhodium builds (every vertical).** The reviewer clears
  compliance hard-lines, claims, and — where applicable — the Rhodium honesty pillars (attorney
  sign-off, native-dialect validation, real-call learning).

**Risk classification** (criteria: regulated advice · PHI/PII · safety/emergency · vulnerable people ·
child safety · fair-housing/EEOC · grief/sensitive · financial exposure):
- **High-risk → gate at Platinum+:** Law · Accounting/Tax · Insurance · Financial/Wealth · Medical/
  Dental · Med Spa/Aesthetics · Behavioral Health · Mortgage/Lending · Pharmacy/Medical Supply · Home
  Health & Senior Care · Veterinary · Real Estate · Property Management · Security & Safety · Funeral &
  Memorial · Education & Childcare · Staffing & Recruiting.
- **Standard/Low-risk → scaffold at Gold + Platinum:** Home Services · Construction · Solar · Automotive ·
  Restaurants · Fine Dining/Events · Hospitality · Beauty/Hair · Fitness · Pet Services · Travel · Events
  & Entertainment · Photography · Marketing · IT/MSP · Consulting · Commercial Cleaning · Agriculture ·
  Retail/Florists · Industrial/Trades · Moving & Storage · Logistics.

| Tier | Standard/Low-risk vertical | High-risk vertical |
|---|:---:|:---:|
| **Gold** | Scaffold | Scaffold\* |
| **Platinum** | Scaffold | **Human-gate** |
| **Iridium** | **Human-gate** | **Human-gate** |
| **Rhodium** | **Human-gate** | **Human-gate** |

*(Build review per the matrix; the **go-live approval is universal** — every cell still requires human
sign-off before the deploy goes live.)*

**Always human-gated, regardless of tier or vertical** (these never auto-ship as net-new): any
**emergency/safety script** (gas/CO/flood/911/988/crisis), any **advice boundary** (legal/medical/
financial/tax), any **claim** (efficacy/outcome/rate/savings guarantee), the **"native-validated"
dialect** sign-off, and any custom **compliance hard-line** copy (`compliance-patterns.md`).

\*A Gold high-risk site **scaffolds** because it inherits **pre-validated** compliance/emergency modules
from the KB layer (already human-authored) — only **net-new** claims/scripts trigger the always-gated
review above. Scaffolding reuses validated content; it never generates fresh regulated copy unreviewed.
