# Orbit AI — BUILD PIPELINE & DEFINITION-OF-READY

*The single ordered path every Orbit build follows — from a pasted URL to a live, elite front office and
its monthly continuation. It ties together `template-library.md`, `quality-bar.md`, `website-audit.md`,
the growth playbooks, the build tools, and the two gates in `quality-bar.md` §8. Anyone on the team runs
it the same way, so every demo is provably elite before it ships.*

---

## The pipeline (in order)

| # | Step | Mode | Ref / tool | Output |
|---|---|---|---|---|
| 0 | **Intake & audit** — capture business facts; if they have a site (or a competitor does), audit it | human + tool | `website-audit.md`, `tools/audit_batch.py` | audit scorecard + recommended tier/template |
| 1 | **Scope** — set **build tier** (scope), **service level** (continuation), and **risk class** | human | `tier-ladder.md`, `service-levels.md`, `quality-bar.md` §8 | signed scope |
| 2 | **Compile KB** — one source of truth for copy + chat + voice | auto | `compiler-workflow.md`, `tools/compile_agent.py` | KB + business manifest |
| 3 | **Select template** — Vertical → Niche → Tier → Template → Palette `C#` (+ Type `T#`) | auto/human | `template-library.md` | design blueprint |
| 4 | **Scaffold/build** — assemble pages + World-Class Feature Stack; **pre-seed the plumbing**: `llms.txt`, location routes + Areas-We-Serve hub, schema templates | scaffold (Gold + low-risk Platinum) / else human review | `tools/gen_llms_txt.py`, `local-landing-pages.md` | built site shell |
| 5 | **Fill content** — domain-accurate copy, native EN/ES, city pages **on-demand with real local data** (no thin stubs) | on-demand; high-risk = human review | `aeo-guide.md`, `dialect-module.md` | finished content |
| 6 | **Front office** — compile voice receptionist + grounded chat + CRM/automation routing | Iridium+; human-gate | `voice-runtime-layer.md` | `system_prompt.txt`, routing, manifest |
| 7 | **§4 launch-gate self-check** — score perf/CWV, A11y, SEO+AEO, CRO, content, front office, etc. | auto + human | `quality-bar.md` §4 | scorecard (must ≥ 90 + all Must-Pass) |
| 8 | **Build-review gate** — per §8 risk × tier matrix; always-gated modules (safety/advice/claims/dialect) reviewed | human where required | `quality-bar.md` §8, `compliance-patterns.md` | review sign-off |
| 9 | **Human go-live approval** — **UNIVERSAL**: a person approves every new deploy before publish | human, always | `quality-bar.md` §8 | recorded go-live approval |
| 10 | **Deploy** — publish via the gated workflow (manual run = the gate) | gated | `.github/workflows/pages.yml` pattern | live site + `/llms.txt` |
| 11 | **Continuation** — monthly elite work across **all** components, by service level | recurring | `quality-bar.md` §7 | ongoing results |

---

## Definition of Ready (DoR) — before a build starts
- [ ] Business facts captured (name, location, services, hours, contact, languages)
- [ ] Vertical + niche identified (`niche-atlas.md`); **risk class** set (`quality-bar.md` §8)
- [ ] Build tier (scope) + service level (continuation) agreed
- [ ] Brand assets + chosen palette `C#` / type `T#`
- [ ] **Real local data** in hand for any city pages (projects, reviews, neighborhoods) — or no city pages yet
- [ ] Compliance hard-lines for the vertical loaded (`compliance-patterns.md`)
- [ ] KB compiled (copy + chat + voice from one source)

## Definition of Done (DoD) — before go-live
- [ ] §4 **Must-Pass all green** + weighted score **≥ 90/100**
- [ ] CWV: LCP < 1.5s · CLS < 0.05 · INP < 200ms (throttled mobile)
- [ ] Native EN/ES parity + `hreflang`; grounded chat answers with **no hallucination**
- [ ] (Iridium+) voice receptionist answers, books, writes a clean CRM disposition
- [ ] `/llms.txt` present + valid structured data (LocalBusiness + FAQPage min.)
- [ ] Analytics + lead→CRM + speed-to-lead wired
- [ ] **Build-review gate** signed where §8 requires it; compliance/safety/claims modules reviewed
- [ ] **Human go-live approval recorded** (universal) — then, and only then, deploy

---

## The two gates (recap — `quality-bar.md` §8)
1. **Build-review gate (risk × tier):** scaffold (auto) for Gold + low-risk Platinum; human content
   review for high-risk Platinum and **all** Iridium/Rhodium; safety/advice/claims/dialect modules are
   always reviewed.
2. **Universal go-live gate:** **every** new deploy — scaffolded or not — gets explicit human go-live
   approval after the §4 gate, before it publishes. Scaffolding automates *building*, never the
   *decision to publish*.

## Continuation (recap — `quality-bar.md` §7)
The initial build is elite and fairly priced; the recurring value is continuing the level **across all
components every month** (website, local SEO/GBP, city pages/AEO, voice/chat, automation, content),
packaged by service level (DIY → Hybrid → DFY → Diamond). Quality is never the upsell — **scope** and
**continuation** are.

> One line: **audit → scope → compile KB → template → scaffold/build → fill → front office → §4 gate →
> build-review gate → human go-live → deploy → continue.** Elite at every step, human-approved before
> live, improved every month.
