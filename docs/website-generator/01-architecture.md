# AI Website Generator — Technical Architecture Plan

A non-WordPress, AI-powered website builder for non-technical small businesses and
solopreneurs. Competitor to 10Web / Durable / Wix. The thesis: **the LLM never writes code or
HTML — it emits a validated JSON component tree**, which is the single source of truth for both
AI generation and a visual no-code editor, rendered static-first and hosted multi-tenant on
Cloudflare.

> Implementation models: generation on `claude-opus-4-8`; cheaper/high-volume edits and
> alt-text on `claude-sonnet-4-6`. Both support Anthropic structured outputs
> (`output_config.format = {type: "json_schema", schema: ...}` and `messages.parse()`).
> A runnable, dependency-free MVP of the core loop lives in [`../../sitegen/`](../../sitegen/).

---

## 1. System architecture overview

```
                                  ┌──────────────────────────────────────────┐
   Business owner                 │            CONTROL PLANE (app)             │
   "I run a yoga studio    ─────► │  Next.js app on Cloudflare Pages/Workers   │
    in Austin..."                 │  Auth · Dashboard · Editor (Puck) · Billing│
                                  └───────┬───────────────────────────┬────────┘
                                          │ (1) generate request       │ (6) publish
                                          ▼                            ▼
   ┌──────────────────────────────────────────────┐        ┌────────────────────────┐
   │           GENERATION SERVICE (Worker)          │        │   PUBLISH PIPELINE      │
   │  prompt build → Claude (constrained decode)    │        │  (Cloudflare Queue +    │
   │  → JSON site schema → JSON-Schema validate     │        │   build Worker/CI)      │
   │  → autofix/repair pass → persist               │        │  schema → Astro SSG →   │
   └───────┬──────────────────────┬─────────────────┘        │  static assets          │
           │ Anthropic API        │                          └────────┬───────────────┘
           ▼                      ▼                                    ▼
   ┌────────────┐         ┌─────────────────┐              ┌────────────────────────────┐
   │ claude-     │         │  DATA STORE     │              │  TENANT EDGE (per site)      │
   │ opus-4-8    │         │  Postgres (Neon)│◄────schema───│  Cloudflare Pages project +  │
   │ structured  │         │  + R2 (assets)  │   read       │  Workers + R2 + KV routing   │
   │ outputs     │         │  + KV (routing) │              │  custom domain + auto SSL    │
   └────────────┘         └─────────────────┘              └────────────────────────────┘
                                                                       ▲
                                                              end visitor traffic
```

**Data flow (happy path):**
1. User submits a business description (or onboarding Q&A) in the dashboard.
2. Generation Service builds a prompt and calls Claude with a constrained-output JSON Schema.
3. Response is JSON-Schema-validated; a repair pass fixes any residual issues.
4. The validated **site schema** is persisted (Postgres) with images resolved to R2 URLs.
5. The user edits visually in the Puck editor; edits write the same schema shape back.
6. On publish, a build Worker renders the schema to a static Astro site and deploys it to that
   tenant's edge target; routing/SSL update automatically.

The invariant: **one JSON schema** flows through generation, editing, and rendering. No stage
ever produces or consumes free-form code.

## 2. Core data model — the site schema

A versioned tree of typed, pre-built components. Props are constrained (enums, bounded arrays)
so both the LLM and the editor stay inside a known surface area. This is what makes constrained
decoding tractable: the JSON Schema is small, closed (`additionalProperties: false`), and
component-specific.

```json
{
  "schemaVersion": "1.0",
  "site": {
    "id": "site_8fk2",
    "name": "Lotus Yoga Austin",
    "theme": { "palette": "warm-sand", "font": { "heading": "Fraunces", "body": "Inter" }, "radius": "md", "mode": "light" },
    "nav": { "logoText": "Lotus Yoga", "links": [ { "label": "Classes", "to": "#classes" }, { "label": "Pricing", "to": "#pricing" } ] },
    "pages": [
      {
        "path": "/",
        "title": "Lotus Yoga — Vinyasa & Restorative in East Austin",
        "meta": { "description": "Small-group yoga classes in East Austin." },
        "content": [
          { "type": "Hero", "props": { "headline": "Find your flow in East Austin", "subhead": "Small-group vinyasa, restorative, and beginner classes.", "cta": { "label": "Book a class", "to": "#pricing" }, "image": { "assetId": "img_hero_01", "alt": "Studio interior" }, "layout": "image-right" } },
          { "type": "Features", "props": { "heading": "Why Lotus", "columns": 3, "items": [ { "icon": "leaf", "title": "Small groups", "body": "Max 12 students." }, { "icon": "clock", "title": "Flexible times", "body": "Morning & evening." } ] } },
          { "type": "PricingTable", "props": { "heading": "Membership", "plans": [ { "name": "Drop-in", "price": "$22", "period": "class", "features": ["1 class"], "highlight": false }, { "name": "Monthly", "price": "$129", "period": "mo", "features": ["Unlimited", "Guest pass"], "highlight": true } ] } },
          { "type": "ContactForm", "props": { "heading": "Get in touch", "fields": ["name", "email", "message"], "submitLabel": "Send", "deliverTo": "owner@lotusyoga.com" } }
        ]
      }
    ]
  }
}
```

**Modeling rules that keep the surface closed and safe:**
- Each block is `{ "type": <ComponentName>, "props": <typed object> }`. The full schema is a
  discriminated union over `type` (JSON Schema `oneOf` + a `const` discriminator) — consumed by
  both the constrained decoder and Puck.
- All prop objects set `additionalProperties: false` and list `required`. Enumerable choices
  (`layout`, `palette`, `icon`, `columns`) are `enum`s — the model can't invent a value the
  renderer can't handle.
- Arrays are length-bounded in application validation (e.g. `items` ≤ 8); structured outputs do
  not enforce array-length keywords (see §3).
- Images are **never inline base64 or model-supplied URLs** — only an `assetId` referencing an
  R2 object the platform owns. This is the single most important safety constraint.
- The schema is the DB row's `jsonb` column plus a `schemaVersion` for migrations. Editor and
  renderer share one generated TypeScript type derived from the JSON Schema (`json-schema-to-ts`).

## 3. AI generation pipeline

```
business description
        │
        ▼
[1] intake normalize ──► [2] prompt assembly ──► [3] Claude w/ constrained decode
   (industry, tone,        (system: component       (output_config.format =
    must-have sections)     catalog + rules;          json_schema, strict)
                            cached prefix)                  │
                                                            ▼
                                            [4] JSON-Schema validation (Ajv)
                                                            │
                                          valid ◄───────────┴──────────► invalid
                                            │                                │
                                            ▼                                ▼
                                    [5] semantic autofix              [6] repair pass
                                    (bounds, dedupe,                  (re-prompt Claude with
                                     asset placeholders)               validation errors; 1 retry,
                                            │                          then deterministic template)
                                            ▼                                │
                                    [7] image resolution ──► persist ◄───────┘
```

**Prompt design.** A stable, cached system prompt carries (a) the full component catalog with
prop semantics and copywriting guidance, (b) hard rules ("use only `assetId` placeholders for
images", "max 8 feature items", "every page needs a Hero and a ContactForm"). Because this
prefix is identical across generations, mark it with `cache_control: {type: "ephemeral"}` — the
catalog is large and cache reads cost ~0.1× input. The volatile per-request part (the business
description, requested page count) goes last, after the breakpoint.

**Constrained decoding + validation + repair.** Use Anthropic structured outputs rather than a
separate constrained-decoding library (first-party; avoids running your own grammar enforcer):

```python
resp = client.messages.parse(           # validates against the schema for us
    model="claude-opus-4-8",
    max_tokens=16000,
    system=[{"type": "text", "text": CATALOG_PROMPT, "cache_control": {"type": "ephemeral"}}],
    output_config={"format": {"type": "json_schema", "schema": SITE_SCHEMA}},
    messages=[{"role": "user", "content": business_description}],
)
site = resp.parsed_output            # already shape-valid JSON
```

Structured outputs guarantee the *shape* (types, enums, required, `additionalProperties:false`)
— the model literally cannot emit a different key or out-of-enum value. They do **not** enforce:
array-length / string-length / numeric ranges, cross-field invariants ("a `highlight:true` plan
must exist"), or semantic quality. So a second layer runs:
- **[4] Ajv validation** against the *full* schema including constraints structured outputs
  ignore (also validates hand-edited or migrated documents).
- **[5] Semantic autofix** — deterministic, no LLM: clamp arrays, dedupe nav anchors, ensure
  required sections exist (inject a default `ContactForm`), replace unresolved image refs with a
  placeholder `assetId`.
- **[6] Repair pass** — only if validation still fails: re-call Claude with the Ajv error list,
  one retry; then fall back to a deterministic industry template populated with the model's
  text. **The user always gets a working site.**

**Model routing.** Default generation on `claude-opus-4-8` (best structure + copy). Cheap,
high-volume ops — single-section regeneration, "rewrite this headline," alt-text — route to
`claude-sonnet-4-6`.

**Image handling.** The model emits `assetId` placeholders only. A parallel pipeline resolves
each: (a) match to a curated/stock library keyed by the section's semantic tags, or (b) generate
via an image model, then store in R2 and write back the real `assetId`. Alt text via
`claude-sonnet-4-6`. This decouples slow image work from fast schema generation — the site is
usable with placeholders immediately and images backfill.

## 4. Visual editor (Puck)

[Puck](https://github.com/measuredco/puck) is MIT-licensed: config-in, JSON-data-out — exactly
our schema shape. That's why we chose it: **no translation layer** between AI output and editor.
- **Config = component catalog.** Each schema component maps to a Puck `config.components[Type]`
  entry: a `fields` definition (drives the auto-generated editing UI) and a `render` function
  (the same React component used at build time). The `fields` are generated from the JSON Schema
  so the editor's editable surface and the AI's output surface can't diverge.
- **AI output → editor.** The generated schema is passed directly as Puck's `data` prop. Because
  the schema *is* Puck's data format, there's no import step — open the editor and the AI draft
  is already laid out and editable.
- **Constrained editing.** Puck only lets users pick the same enums and component types the AI
  uses, so a user can't create an invalid document through the UI.
- **Image picker** is a custom Puck field browsing the tenant's R2 assets, writing back an
  `assetId` — never a raw URL.
- **Persistence.** Puck's `onChange`/`onPublish` returns updated JSON; debounce-autosave drafts
  to `sites.draft_schema jsonb`, snapshot a version row on explicit save. Publishing copies
  `draft_schema → published_schema` and enqueues a build. Versioned rows give one-click rollback.

## 5. Rendering & publishing pipeline

**Static-first** for SEO, speed, and near-zero serving cost. Use **Astro** with static export:
zero JS by default, islands-hydrate only interactive components (ContactForm, carousels), clean
semantic HTML.

```
publish click → enqueue { siteId, version } → Cloudflare Queue
   Build Worker (or containerized CI runner):
     1. fetch published_schema from Postgres
     2. resolve assetIds → R2 public URLs
     3. feed schema to Astro renderer (SAME components as the editor)
     4. astro build → static HTML/CSS/JS + hashed assets
     5. deploy bundle to the tenant's edge target
     6. update KV routing (domain → deployment), purge cache
     7. mark version live; notify user
```
- Renderer maps each `{type, props}` node to its component — so **editor preview === published
  output**.
- **Dynamic needs** (form submissions, booking, simple commerce) are handled by a small set of
  shared platform Workers, not per-site SSR. The static site POSTs to a platform endpoint keyed
  by `siteId`. Only sites that genuinely need request-time logic get SSR/ISR.
- Builds are incremental where possible; a 1–5 page SMB site builds in seconds.

## 6. Multi-tenancy: isolation, domains, SSL

**Isolation.** Every row keyed by `tenant_id`/`site_id` (Postgres RLS as defense-in-depth); R2
assets namespaced by `tenant_id/`. Each published site is an independent static bundle with no
shared runtime — a malformed site can't affect a neighbor.

**Subdomains.** Every site gets `<slug>.ourplatform.app` immediately via a wildcard DNS record
+ wildcard SSL cert (DNS-01 via Let's Encrypt, or Cloudflare's managed wildcard). A KV map
(`hostname → deploymentId`) routes any subdomain to the right bundle.

**Custom domains** (paid tier). User points their domain at us (CNAME). Provision a per-domain
cert via **Cloudflare for SaaS / Custom Hostnames**, which handles per-tenant issuance + renewal
automatically — avoiding the operational pain of running your own ACME fleet.

**Watch items:**
- **~100 custom domains per Pages project ceiling.** Do *not* attach customer domains to Pages
  projects directly — use **Cloudflare for SaaS Custom Hostnames** (built for thousands of
  tenant domains) routed through a Worker; shard across projects if needed.
- **Let's Encrypt rate limits.** Prefer Cloudflare-managed certs; for any self-managed ACME,
  queue issuance, back off on `429`, SAN-batch, stagger renewals, monitor the weekly budget.

## 7. Hosting / infra & cost rationale (why Cloudflare)

- **No egress fees.** R2 has zero egress; Workers/Pages bandwidth is included. For thousands of
  low-traffic marketing sites, bandwidth is the dominant variable cost elsewhere — this is the
  cost moat.
- **Edge-static is nearly free to serve.** SMB sites are read-heavy/write-rare — a perfect fit.
  Real compute is paid only at generation (Claude tokens) and build time, both amortized.
- **Integrated SaaS primitives** — Cloudflare for SaaS (custom hostnames + SSL), KV (routing),
  R2 (assets), Queues (build jobs), Workers (the few dynamic endpoints) — one platform, fewer
  moving parts for a small team.
- **Cost model:** dominant cost is **AI generation tokens** (one-time per site + occasional
  regens), then build minutes, then near-zero serving. Makes a low monthly subscription viable.

## 8. Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| Control-plane app | **Next.js** on Cloudflare Pages/Workers (`@cloudflare/next-on-pages`) | One framework for dashboard + API; same edge. |
| Visual editor | **Puck** (MIT) | Config-in / JSON-out matches our schema exactly. |
| Site renderer | **Astro** static export | Zero-JS-by-default, islands, best SEO/perf for marketing sites. |
| Schema/validation | **JSON Schema + Ajv**, types via **`json-schema-to-ts`** | One schema drives AI constraints, editor fields, validation, TS types. |
| AI generation | **Anthropic API** — `claude-opus-4-8` (gen), `claude-sonnet-4-6` (edits/alt-text), structured outputs | First-party constrained decoding. |
| Database | **Postgres (Neon)** | `jsonb` schema storage, version rows, tenant rows; RLS. |
| Asset storage | **Cloudflare R2** | Zero egress; per-tenant namespacing. |
| Queue / jobs | **Cloudflare Queues** | Decouple publish/build + image resolution from the request path. |
| Routing / config | **Cloudflare KV** | `hostname → deployment` at the edge. |
| Domains / SSL | **Cloudflare for SaaS Custom Hostnames** | Per-tenant cert issuance + renewal handled for us. |
| Auth / billing | **Clerk/Auth.js + Stripe** | Standard, fast for a small team. |

## 9. Phased build roadmap

**Phase 1 — MVP (prove the loop).** Site schema v1 with ~6–7 core components (Hero, Features,
Services, PricingTable, Testimonials, ContactForm, Footer). Generation pipeline: prompt +
structured outputs + validation + autofix + one repair retry; offline deterministic fallback.
Stock-library images + placeholders (no image gen yet). Static renderer. Publish to
**subdomain only** with wildcard SSL. Stripe subscription gate. *Goal: business description →
editable, published one-page site in under a minute.* **← the [`sitegen/`](../../sitegen/) MVP
implements the generate→validate→render core of this phase, offline-first.**

**Phase 2 — Beta (make it real).** Multi-page sites; nav generation; per-section regeneration
via Sonnet. Custom domains via Cloudflare for SaaS + automated SSL. Puck visual editor wired to
the schema; draft autosave + version history/rollback. Image generation + alt text; asset
manager. Form submissions (platform Worker) + email delivery; basic analytics; SEO meta editing.

**Phase 3 — Scale (harden & expand).** Domain-pooling/provisioning service handling the
per-project ceiling and Let's Encrypt rate limits (queue/backoff/sharding). Incremental builds +
caching. ISR/SSR Workers for the minority needing dynamic content (booking, simple commerce).
Schema migrations; component-library expansion; A/B layout variants; teams/multi-user;
observability (generation success rate, repair rate, build latency, cert budget).

## 10. Key risks & mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Invalid/low-quality AI output | Structured outputs guarantee shape; Ajv + autofix guarantee bounds; repair retry then deterministic template fallback — user always gets a working site. Track repair rate. |
| 2 | Hallucinated/broken/hotlinked images | Model emits `assetId` only; platform owns all asset resolution into R2. No model-supplied URLs reach the renderer. |
| 3 | Custom-domain ceiling (~100/Pages project) | Cloudflare for SaaS Custom Hostnames (built for many tenant domains), not direct Pages attachments; pool/shard. |
| 4 | Let's Encrypt rate limits | Prefer Cloudflare-managed certs; queue + back off self-managed ACME; SAN-batch; stagger renewals; monitor budget. |
| 5 | AI cost eroding margin | Cache the catalog system prompt (~0.1× reads); route edits to Sonnet; meter regenerations on lower tiers. |
| 6 | Editor/AI schema drift | Single JSON Schema is the source of truth for both Puck `fields` and AI `output_config`; generated TS types fail the build if they diverge. |
| 7 | Tenant isolation breach | `tenant_id` on every row + Postgres RLS; R2 prefix namespacing; static bundles have no shared runtime; central API authorizes by `siteId`. |
| 8 | Model/API changes or outages | All Claude calls go through one Generation Service abstraction; swapping models is a config change. Queue + retry on `429`/`5xx`. Generation is async — an outage degrades to "draft pending," not data loss. |
| 9 | Vendor lock-in to Cloudflare | Schema, Astro static output, and Puck are portable; only routing/SSL/hosting glue is Cloudflare-specific. Static output can deploy anywhere. |
| 10 | Build pipeline bottleneck at scale | Builds are queued + incremental; static sites build in seconds; heavy builds offload to containerized runners; per-tenant builds scale horizontally. |

---

**Bottom line:** the architecture's leverage comes from one decision repeated everywhere — the
LLM produces *validated structured data, never code* — which lets the same schema power
constrained generation, a safe visual editor, and cheap static rendering, hosted on the one
platform (Cloudflare) whose zero-egress economics make thousands of low-traffic tenant sites
profitable.

> Confidence: architecture patterns are well-established; specific pricing/limits (Cloudflare
> per-project domain ceiling, Let's Encrypt rate limits, Vercel custom-cert tiering) change
> frequently — confirm against current vendor docs before committing. v0-pipeline details are
> from Vercel's own engineering posts.
