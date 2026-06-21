# Orbit AI — LOCAL LANDING PAGE SYSTEM

*How Orbit generates per-city landing pages that **win local organic without tripping Google's
doorway / scaled-content penalties.** Per-city pages work — but only if each is genuinely unique and
locally proven. This is the build-out of the **Regional** rung in `quality-bar.md` §2.5b.*

---

## The decisions (defaults — configurable per client)
- **Cities/neighborhoods, NOT ZIP codes.** People search "[service] in [city]" / "near me," not by
  ZIP. Standalone ZIP-code pages are thin **doorway pages** Google penalizes. ZIPs live in
  `areaServed` schema + body copy, never their own URLs. Add named **neighborhoods/districts** for
  dense metros.
- **Start with ~5 priority cities** — where the client actually wants business — each a substantive,
  unique page.
- **Generate 2–3 per batch.** Small batches keep pages unique, let you watch indexing/quality, and
  avoid the thin-content hit from mass-generating a grid overnight.
- **Curated grid, not the full matrix.** Priority cities × the client's **money services** — not
  every-city × every-service. Expand the grid as the site earns authority.
- **"Areas We Serve" hub** links all city pages (clean internal-linking silo).

## The uniqueness bar (anti-doorway — non-negotiable)
A city page is not "[city]" swapped into a template. Each must carry **real local signal — at least
4–5 of:**
- local projects/jobs done there (photos, addresses-to-neighborhood)
- reviews/testimonials **from that area**
- the local team / who serves it
- neighborhoods, landmarks, ZIP list served (in copy + `areaServed`)
- local specifics: pricing/permitting/regulations/climate/seasonality nuances
- directions, parking, response-time/coverage for that area
- a **city-specific FAQ** + embedded map
- a unique intro + unique body (not boilerplate with a token swap)

If you can't write a genuinely useful page for a city, **don't publish one** for it yet.

## URL & silo structure
Pick one pattern and keep it consistent:
- `/locations/<city>/` (city hub listing services) **+** `/services/<service>/` hubs, **or**
- `/<service>/<city>/` (service-in-city) under each service silo.

**Linking silo:** Service hub ↔ City hub ↔ Service-in-City page ↔ **Areas-We-Serve** hub. Breadcrumbs
on every page. Each city page links to 2–3 nearby city pages (contextual, not a footer dump).

## Schema (per city page)
`LocalBusiness` (or vertical subtype) with `areaServed` (cities **+ ZIPs**), `geo`/`GeoCoordinates`,
`Service`, `FAQPage` for the local FAQ, `BreadcrumbList`, `AggregateRating` where real. Validate
against Rich Results.

## Bilingual per city (the moat)
Generate a native **Spanish** version per city (`/es/...`), `hreflang` paired, localized "cerca de mí
en [ciudad]" intent, ES local FAQ. Almost no competitor ships genuine ES city pages — uncontested
demand.

## AEO per city
Target "best <service> in <city>" answers: a concise factual answer block, `FAQPage` schema, entity
clarity (business = provider of <service> in <city>). See `aeo-guide.md`.

## Generation workflow (2–3 at a time)
1. **Inputs:** priority city list, money services, and the **local data** per city (projects, reviews,
   neighborhoods, team, ZIPs, nuances). No real local data → gather it before generating.
2. **Assemble** each page from the chosen template (`template-library.md`) with unique local content.
3. **QA** against the uniqueness bar **and** `quality-bar.md` launch gate (perf, schema, CWV).
4. **Publish the batch**, submit to Search Console, watch indexing + ranking.
5. **Iterate**, then generate the next 2–3. Expand the grid only as authority grows.

## Tier mapping
| | Local pages |
|---|---|
| **Gold** | single location page + Areas-We-Serve hub |
| **Platinum** | a handful of priority **city pages** (curated), bilingual |
| **Iridium** | regional grid (city × money-service) with programmatic-but-unique generation + schema |
| **Rhodium** | multi-market / multi-site, white-label per-location, national authority layer |

## Scaffold vs. on-demand (pre-seeding a fresh build)
**Pre-seed the *system*, fill the *content* on demand — never publish thin stubs.**
- **Pre-seed automatically (safe, do it):** `/llms.txt` (generated from real manifest data via
  `tools/gen_llms_txt.py`), the location URL structure + **Areas-We-Serve hub**, the city-page
  component, and schema templates. The plumbing is ready out of the gate.
- **Fill on demand (do NOT auto-stub):** a city page is generated and **published only when it has
  real local data** (projects, reviews, neighborhoods) and clears the uniqueness bar above.
  Auto-publishing empty "[city]" stubs is the doorway-penalty corner we refuse to cut.
- **For demos:** ship **2–3 fully-built** city pages (real or realistic local proof) so the demo shows
  the local system working — elite, never placeholder.

> **Gating:** scaffolding applies to Gold + low-risk Platinum (`quality-bar.md` §8); high-risk Platinum
> and all Iridium/Rhodium get human content review. **Every** new deploy — scaffolded or not — passes the
> **universal human go-live gate** before it publishes.

## Anti-patterns (these get you penalized)
- ZIP-code doorway pages · every-city×every-service thin grids · duplicate/boilerplate "[city]" swaps ·
  fake locations or reviews · NAP that doesn't match reality (NAP must be **true** everywhere) ·
  mass-publishing hundreds of pages at once. Quality and truthfulness beat volume, every time.
