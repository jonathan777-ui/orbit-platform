# SiteGen — Schema-Driven AI Website Generator (MVP)

A runnable MVP of an AI website generator for non-technical SMBs, built on the
**Alyxir** architecture thesis and the research in
[`../docs/website-generator/`](../docs/website-generator/).

## The core idea

> **The LLM emits a VALIDATED JSON site-schema — a tree of typed components —
> never raw HTML or code. That one schema is the single source of truth for both
> generation and static rendering.**

This is the decisive design choice. Because the model only ever produces JSON
that conforms to [`schema/site.schema.json`](schema/site.schema.json), we can:

- **validate** every generation against a strict schema (typed props, enums,
  `additionalProperties:false`) and reject/repair bad output;
- **render** deterministically — the same schema feeds the static HTML renderer,
  the dev server, and the Netlify function;
- **edit** structurally later (a visual editor manipulates the tree, not markup);
- **export** clean static HTML with no lock-in (the #1 SMB complaint).

It also follows the repo's offline-first pattern: **it works fully offline with
NO API key** via a deterministic fallback engine, and optionally calls Claude
when `ANTHROPIC_API_KEY` is set.

## Architecture

```
businessDescription + {vertical, locale}
        │
        ▼
   generate.js ──► [API key?] ──► Claude (claude-opus-4-8) ──► JSON
        │              │                                        │
        │              │              validate.js ◄─────────────┘
        │              │                   │
        │              │            valid? ─yes─► return
        │              │                   │
        │              │                  no ──► ONE repair pass (re-ask Claude
        │              │                          with the errors)
        │              ▼
        └────► deterministic offline engine (always valid) ──► validate.js
                                                                   │
                        site schema (single source of truth) ◄─────┘
                                   │
                   ┌───────────────┼────────────────┐
                   ▼               ▼                 ▼
              render.js        server.js      netlify/functions/
            (static HTML)    (dev + /api)      generate-site.js
```

- **`generate.js`** — the pipeline. `generateSite(desc, {vertical, locale, apiKey})`
  **always returns a valid schema**. Online: prompt Claude (Anthropic Messages
  API, model `claude-opus-4-8`, `anthropic-version: 2023-06-01`) for schema-conformant
  JSON; parse; validate; one repair pass on failure. Offline (no key, or any
  API/parse/validation failure): a deterministic engine synthesizes a real
  multi-section homepage (Hero, Features, Services, Testimonials, PricingTable,
  ContactForm, Footer) from the description + vertical, inferring the vertical
  from keywords when not given.
- **`validate.js`** — a hand-written, **zero-dependency** JSON-Schema-style
  validator (types, `required`, `enum`, `const`, `additionalProperties:false`,
  `minLength`/`minItems`, `$ref`/`definitions`, and `oneOf` as a discriminated
  union on `type`). Returns `{ valid, errors[] }` with path-prefixed messages.
- **`components.js`** — the component catalog: per block type, its prop defaults
  and a `renderToHtml(props, theme)` returning semantic, accessible HTML.
- **`themes.js`** — vertical → theme tokens (palette, Google-Font pairing, hero
  style), drawn from the documented vertical specs.
- **`render.js`** — `renderSite(site)` → a complete static HTML document
  (doctype, head/meta/title, Google Fonts, theme CSS variables, composed blocks).
  Shared by CLI, server, and Netlify function.

### Themes (verticals)

| Vertical        | Palette          | Type pairing                       | Hero       |
|-----------------|------------------|------------------------------------|------------|
| `home-services` | cyan / amber     | Anton + Archivo                    | industrial |
| `law`           | gold / navy      | Libre Baskerville + Source Sans 3  | elegant    |
| `med-spa`       | rose / champagne | Cormorant Garamond + Jost          | luxe       |
| `restaurant`    | rust / wheat     | Playfair Display + Lato            | editorial  |
| `generic`       | slate / emerald  | Space Grotesk + Inter              | minimal    |

## Requirements

- **Node 18+** (uses global `fetch`). Tested on Node 22.
- **Zero npm dependencies.** No `npm install`, no build step — pure Node
  built-ins. The validator is implemented from scratch for this reason.

## Run it

```bash
# Generate from the CLI (writes out/site.json and out/index.html)
node cli.js "Austin HVAC company, 24/7 emergency repair, family owned" home-services
node cli.js "Sterling & Associates personal injury law firm"            # vertical auto-detected

# Dev server + demo UI at http://localhost:3000
node server.js
#   GET  /              -> public/index.html (textarea + vertical + Generate + Download)
#   POST /api/generate  -> { site, html, engine, valid }   body: { description, vertical }

# Use Claude instead of the offline engine
ANTHROPIC_API_KEY=sk-ant-... node cli.js "..." restaurant
```

`package.json` scripts: `npm start` (server), `npm run gen -- "..." [vertical]`.

## Examples

[`examples/`](examples/) contains two committed outputs generated by the CLI
(offline engine):

- [`examples/hvac-company/`](examples/hvac-company/) — `site.json` + `index.html`
- [`examples/law-firm/`](examples/law-firm/) — `site.json` + `index.html`

Open either `index.html` in a browser to see the rendered site.

## How it maps to the phased roadmap

| Phase | This MVP delivers | Stubbed for later |
|---|---|---|
| **1. Schema + generation** | ✅ JSON site-schema, validator, validate+repair, offline + Claude engines | — |
| **2. Rendering / export** | ✅ static HTML renderer (clean export, no lock-in) | image generation, multi-page routing (schema already holds `pages[]`; renderer emits page 0) |
| **3. Visual editor** | ✅ editor *entry point* (demo UI: generate → iframe preview → download) | **Puck visual editor** (structural drag/drop over the schema tree) |
| **4. Hosting** | — | **multi-tenant hosting + SSL** (Cloudflare/edge), per-site subdomains, the Netlify function is the deploy seam |

### Explicitly stubbed (later phases)

- **Puck visual editor** — the demo UI is the entry point; full structural editing
  of the component tree is a later phase.
- **Multi-tenant hosting / SSL** — provisioning, custom domains, certificates.
- **Image generation** — hero/section imagery; currently typographic + color.
- **Multi-page output** — the schema models `pages[]`; the renderer ships the
  homepage (page 0). Per-page routing is a small follow-up.

## File map

```
sitegen/
  schema/site.schema.json        JSON Schema — the contract
  src/
    components.js                component catalog + renderToHtml
    themes.js                    vertical → theme tokens, Google Fonts
    validate.js                  zero-dep schema validator
    generate.js                  pipeline: Claude + offline + validate/repair
    render.js                    schema → static HTML (shared)
  cli.js                         node cli.js "<desc>" [vertical]
  server.js                      zero-dep http server + /api/generate
  netlify/functions/generate-site.js   Netlify deploy wrapper (CORS, no-key-OK)
  public/index.html              demo UI (editor entry point)
  examples/                      committed CLI outputs (hvac, law)
  package.json                   no dependencies; start / gen scripts
```
