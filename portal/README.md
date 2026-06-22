# Orbit4 — Netlify package

Drag this whole folder into Netlify (or connect the repo). Static hub + two serverless functions.

## Functions
- `/.netlify/functions/claude`  — live AI for the chatbot/receptionist (optional).
- `/.netlify/functions/enrich`  — finds a business online (website, logo, brand color, services)
   from just a name when no website is given; falls back to Company + Hours if nothing is found.

## Environment variables (Netlify → Site settings → Environment)
- `ANTHROPIC_API_KEY`  — enables live AI answers AND online business discovery. Without it, the hub
  still generates from the built-in knowledge base and uses Company + Hours only (no web lookup).
- `MODEL`        — optional, default `claude-haiku-4-5-20251001`.
- `ENRICH_MODEL` — optional, model used for web-search discovery (default = MODEL).

Discovery uses Claude's web_search tool (billed per search) and returns AI-found data — the hub
shows a "confirm branding before go-live" banner so a human verifies the logo/details.
