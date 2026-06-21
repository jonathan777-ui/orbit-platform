# Orbit AI — AEO / llms.txt IMPLEMENTATION GUIDE

*How to actually win **AI answer-engine citations** — be the business that Google AI Overviews,
ChatGPT, Perplexity, Gemini, and Copilot **recommend by name.** AEO (Answer-Engine Optimization, aka
GEO — Generative Engine Optimization) is the 2026 differentiator generators ignore. This is the "how"
behind `quality-bar.md` §2.5.*

---

## SEO vs. AEO (why it's different)
Classic SEO earns a **ranked link** a human clicks. AEO earns a **citation inside a generated
answer** — the AI names you as the recommendation. The engines synthesize from across the web (your
site **+** GBP, reviews, directories, third-party mentions), so AEO is part on-site structure, part
off-site presence and entity authority.

## How answer engines pick sources
- **Entity clarity** — they must unambiguously know *who you are, what you do, where.*
- **Extractable answers** — concise, factual, self-contained statements they can lift.
- **Structure** — FAQ/Q&A blocks, headings phrased as questions, lists, comparison tables.
- **Corroboration** — consistent facts across your site, GBP, reviews, and directories.
- **E-E-A-T + freshness** — experience/expertise signals, authorship, recency, real reviews.

## On-site implementation
1. **Question-led content:** headings that match how people ask ("How much does X cost in [city]?"),
   followed by a **direct 1–3 sentence answer**, then detail. Don't bury the answer.
2. **FAQ blocks + `FAQPage` schema** on key pages (services, locations, pricing).
3. **Entity/structured data:** `Organization` + `LocalBusiness` (+ vertical subtype), `sameAs` to GBP
   and social/profiles, `Service`, `Product`/`Menu`, `Article` with author, `AggregateRating` (real).
4. **Definitions & comparisons:** clear "What is…/X vs. Y" sections and tables — highly liftable.
5. **Facts with specificity:** named services, areas, hours, credentials, numbers (engines prefer
   concrete, attributable claims over fluff).
6. **Freshness:** dates, updated content, active posts.

## `llms.txt` (the machine-readable summary for AI agents)
A proposed standard: a Markdown file at the site root that gives LLMs a clean, curated map of the
business so they read it accurately (HTML is noisy; `llms.txt` is the signal).
- **`/llms.txt`** — concise: who/what/where, key services, key URLs, contact, hours, languages.
- **`/llms-full.txt`** (optional) — expanded: full service descriptions, FAQs, policies.

```
# Acme Plumbing — San Antonio, TX
> Licensed 24/7 plumbing for San Antonio & surrounding areas. Bilingual (EN/ES).

## Services
- Emergency plumbing, water heaters, drain/sewer, repiping, leak detection
## Service area
- San Antonio, Alamo Heights, Stone Oak, Boerne, New Braunfels (ZIPs: 78209, 78258, …)
## Contact
- Call/text: (210) 555-0100 · Hours: 24/7 · Languages: English, Español
## Key pages
- /services/emergency-plumbing/  · /locations/san-antonio/  · /reviews/  · /es/
```
Keep it truthful and in sync with the site + GBP (same source of truth — the KB).

**Orbit emits this automatically.** `tools/gen_llms_txt.py` renders `/llms.txt` (+ `/llms-full.txt`)
from a small business manifest compiled from the KB, so **every Orbit build ships one** — and the docs
site itself emits one via `site/build.py`. Run: `python tools/gen_llms_txt.py business.json --out dist/`
(or `--sample` for a demo).

## Off-site (engines synthesize from the whole web)
- **Google Business Profile** complete + active (huge for local AI answers).
- **Reviews everywhere** (Google, vertical directories) — volume, rating, recency, responses.
- **Consistent NAP + citations** across directories (see `local-seo-gbp.md`).
- **Third-party mentions / digital PR** for national/authority topics.

## Bilingual AEO (the moat)
Answer-engine demand exists in Spanish too. Ship native ES answer blocks + ES `FAQPage` schema + an ES
`llms.txt` section. Near-zero competition for ES citations.

## Measurement
- Track **AI-referral traffic** (ChatGPT, Perplexity, Gemini, Google AI) in analytics.
- Monitor **brand/citation mentions** in AI answers for your money queries (manual or tooling).
- Watch GBP insights + review growth as leading indicators.

## Tier mapping
Gold: clean entity data + schema + FAQ. Platinum: full AEO content + `llms.txt` + GBP/reviews engine.
Iridium: per-service/per-city AEO + measurement. Rhodium: authority content + digital PR + ongoing
citation monitoring.

## Checklist
- [ ] `Organization` + `LocalBusiness` + `sameAs` valid
- [ ] `FAQPage` on services/locations/pricing
- [ ] Question-led headings with direct answers
- [ ] `/llms.txt` (+ `/llms-full.txt`) truthful and in sync
- [ ] GBP complete + reviews active + NAP consistent
- [ ] ES answer blocks + ES schema
- [ ] AI-referral + citation tracking live
