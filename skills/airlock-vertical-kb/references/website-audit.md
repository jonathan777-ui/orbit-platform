# Orbit AI — WEBSITE AUDIT (Paste-a-URL)

*Paste any live website URL — the client's current site **or a competitor's** — and Orbit grades it
against `quality-bar.md` (The Beat-the-Generators Standard), returning a scored teardown and a
prioritized upgrade path. It's a **lead magnet, a pre-sale scoping tool, a competitor teardown, and
a post-launch re-check** in one. It's the productized "Presence Audit" in `website-catalog.md`.*

---

## When to use it
- **Lead magnet / pre-sale:** "Paste your site, get a free scorecard" → instant value → scoped upsell.
- **Competitor teardown:** audit the market leader's site to show the gap Orbit closes.
- **Scoping:** the findings map directly to a recommended tier + template + palette.
- **Re-audit:** prove the lift after an Orbit build (before/after scorecard).

## Inputs
- **Required:** the URL.
- **Optional (sharpens the audit):** business name, vertical/niche (→ `niche-atlas.md`), target cities,
  languages served, Google Business Profile link, the competitor URL(s) to benchmark against.

## What it scores (mirrors `quality-bar.md`, same weights)
Run real signals, not guesses:

| Dimension | What we check | Signal source |
|---|---|---|
| **Performance / CWV** | LCP, CLS, INP, weight, mobile score | Lighthouse / PageSpeed, throttled mobile |
| **Design & craft** | template-look vs. real system, hierarchy, imagery | rendered screenshot review |
| **Accessibility** | WCAG 2.2 AA: contrast, alt, labels, keyboard, focus | axe-style scan + manual spot check |
| **Technical + Local SEO** | titles/meta, headings, schema, sitemap, **GBP/NAP**, city pages | HTML + schema + GBP lookup |
| **AEO** | FAQ/answer blocks, entity clarity, `llms.txt`, AI-citability | content structure scan |
| **Conversion / CRO** | above-fold CTA, click-to-call, trust stack, form friction | rendered review |
| **Content** | domain accuracy vs. **filler/AI-tells**, freshness | copy read against niche |
| **Bilingual** | native EN/ES vs. none/machine-translated, `hreflang` | language + hreflang check |
| **Trust / reputation** | reviews, ratings, credentials, recency | on-page + GBP/reviews |
| **The front-office gap** | is there chat? does it hallucinate? **any voice/after-hours answering?** | interaction probe |
| **Security / compliance** | HTTPS/HSTS, vertical hard-lines, PII exposure | headers + content |

## Output — the Audit Scorecard
1. **Headline score / 100** (same weighting as the launch gate) + per-dimension grade (A–F or Pass/Gap).
2. **Top findings** — the 5–8 things most hurting them, plain-language, with the business impact.
3. **Quick wins** (days) vs. **strategic fixes** (the rebuild) — separated so the path is obvious.
4. **The two moats they're almost certainly missing:** **no AI front office** (24/7 bilingual voice +
   grounded chat) and **no native Spanish / AEO** — quantify the demand they're leaving on the table.
5. **Recommended Orbit move:** tier + template (`template-library.md`) + palette `C#` + type `T#`,
   and the **projected after-score**.

> **Framing:** the audit never just lists problems — it ends on the Orbit build that fixes them and the
> before→after score. A competitor audit ends on "here's what it takes to beat them."

## How to run it (workflow)
1. Fetch the URL (public pages only) + render a mobile screenshot.
2. Run Lighthouse/CWV (throttled mobile); pull schema, titles, headings, sitemap, `hreflang`.
3. Look up GBP / NAP consistency; detect city/location pages.
4. Probe for chat/voice presence; test the chat for grounding/hallucination if present.
5. Detect language coverage + translation quality; flag AEO structure (FAQ/schema/`llms.txt`).
6. Score each dimension, assemble the scorecard, map findings → recommended tier/template.

## Batch / competitor-comparison mode
Paste **several URLs** (the client + competitors) and get one **comparison grid** — scorecard, ranking,
per-dimension leaders, the client's biggest gaps, and the recommended Orbit move. Run
`tools/audit_batch.py` with a JSON of per-site scores (gathered as above); it renders a markdown report
weighted by the `quality-bar.md` launch gate.
```
python tools/audit_batch.py audits.json --out comparison.md   # → hand the .md to the right conversation
python tools/audit_batch.py --sample                          # demo report
```
Input: `{ "query", "date", "sites": [ {"label","url","client":bool,"scores":{dim:0-100},"findings":[…]} ] }`.
Same dimensions/weights as the launch gate; missing scores show as "—".

## Guardrails (honesty + ethics)
- **Public pages only** — never bypass logins, paywalls, or scrape gated content.
- Competitor audits are fair game (public info), but **be accurate** — never fabricate metrics or
  invent findings. If a signal can't be measured, say "not measured," don't guess.
- No defamatory framing of competitors — state observable facts and the gap, not insults.
- Respect the same compliance hard-lines (`compliance-patterns.md`) in anything we publish.

## Output template (fill in)
```
WEBSITE AUDIT — <url>   ·   <date>   ·   vertical: <niche>
OVERALL: <score>/100   (Perf <> · Design <> · CRO <> · SEO+AEO <> · Front office <> · A11y <> · Bilingual <> · …)

TOP FINDINGS
1. <finding> — impact: <why it costs them>
…
QUICK WINS:        <list>
STRATEGIC FIXES:   <list>
MISSING MOATS:     AI front office: <yes/no> · Native ES + AEO: <yes/no>
RECOMMENDED:       <tier> · template "<name>" · palette C## · type T##  →  projected <after-score>/100
```
