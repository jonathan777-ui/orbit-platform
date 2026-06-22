# Alyxir Studio — Setup Guide for Ace

This is a single static folder. It runs fully as a demo with **no backend** (the chatbot,
receptionist, storefront, audit, and pricing all work offline). Your job is to connect the
**11 live data sources** so the demo becomes the real product. Each one matches a numbered
**SETUP block** that appears inline on the site — open the Netlify URL, scroll top to bottom,
and clear them in order (click "Mark resolved" as you go; the header counter ticks down).

---

## 0. Deploy
- **Drag & drop:** Netlify → Add new site → Deploy manually → drag the `alyxir-studio` folder
  (or the `.zip`) onto the drop zone.
- **CLI:** `cd alyxir-studio && netlify deploy --dir=. --prod`
- No build step. `netlify.toml` is already included.

## Demo access PINs (replace in step 9)
- 1099 Setter: **2468**  ·  Reseller: **1357**  ·  White Label: **9999**
- Customer role needs no PIN.

---

## The 11 connection points

**1 · Live profile enrichment** — `app.js → pair()`
Currently the company name/favicon are derived from the pasted link. Replace with a call to your
n8n flow: `POST {N8N_ENRICH_URL}` with `{url}` → return `{company, logo, hours, services,
languages, hasStore}` and hydrate the profile card. (This is the Stage-1/Stage-2 scrape →
Claude enrichment → Attio pipeline.)

**2 · Knowledge-base source** — `kb-data.js`
The app ships a distilled KB snapshot (20 verticals). Point it at the live KB store so edits flow
without a redeploy: replace the `window.ALYXIR_KB` bootstrap with a fetch from your KB service /
Attio "KB" object (object 13). Keep the same shape (`verticals[].{positioning,voice,compliance,
complianceEs,hero,faqs,quickReplies,niche}`).

**3 · Website publish + domain**
The Website preview is in-page only. Wire the site generator to actually publish (your existing
site builder) and attach the business domain/subdomain.

**4 · Live AI responses** — backend proxy → Anthropic API
The chat/voice use a built-in KB responder so the demo always answers. For live Claude responses,
stand up a small backend proxy (do **not** expose API keys in the browser) and point the
`liveRespond()` fetch at `{YOUR_PROXY}/messages`. The preview's **Live mode** panel (under the tabs) lets you paste a key to test real Claude responses + browser TTS/STT before the proxy exists. Model string is set to `claude-sonnet-4-6`;
confirm the current model with your Anthropic account.

**5 · Calendar / booking** — Google Calendar / Attio
Booking replies are scripted. Connect Google Calendar (or Attio) for real availability + writes,
so "book me in" creates an actual event and confirmation.

**6 · Product data for the agent** — catalog API → agent
When the business has a store, feed the live catalog so the product assistant quotes real items,
stock, and order status (instead of the generic product reply).

**7 · Telephony (voice receptionist)** — Telnyx + Deepgram
The receptionist is text-simulated. Connect Telnyx (number provisioning, call routing, AMD) +
Deepgram (real-time transcription) + the WebRTC softphone. 10DLC / STIR-SHAKEN registration goes
here too.

**8 · Storefront, checkout & shipping** — Shopify/Woo + Stripe
If the business has no store, the app generates a 25–33 product demo (TrackDog pattern, sample
data). To make it real, connect the storefront platform + Stripe for payments + live
inventory/shipping rates. The on-screen disclaimer already states this is demo data.

**9 · Real partner authentication** — `app.js → PINS`
Partner roles (Setter/Reseller/White Label) use **client-side demo PINs** — fine for a demo, not
secure. Replace with real auth (magic link / SSO / your portal login). Customers stay open-access.
This is the screen partners can show their clients to demonstrate gated access.

**10 · Pricing, comp & activation** — constants at top of `app.js`
Pre-filled, confirm with finance:
- Tiers (monthly): Presence **$297** · Engage **$597** · Scale **$997**
- Billing cadences: monthly · quarterly −10% · annual prepaid −25% · annual contract −15%
- Activation (non-refundable): **$149**
- Setter comp: **$75/activation + 10% recurring** (`SETTER_SETUP_COMP`, `SETTER_RECURRING_PCT`)
- Reseller: **25% of revenue for life; half (12.5%) residual if inactive** (`RESELLER_REV_SHARE`, `RESELLER_RESIDUAL_LEFT`)
- White Label: **1.6× markup**, select agents post-trial (`WHITE_MARKUP`)

**11 · Provisioning webhook** — Enroll → n8n
On enrollment the app POSTs the full JSON payload (role, company, plan, billing, ecommerce,
languages, discovery, ROI estimate) to your n8n provisioning endpoint.
**Drop your URL into one place:** `app.js` line ~11 → `const PROVISIONING_WEBHOOK="";`
Paste the URL between the quotes and it auto-fills the Enroll form for every visitor. (The form
field still overrides it if someone types a different one.) Use the n8n **test** URL
(`/webhook-test/...`) while building; swap to the **production** URL (`/webhook/...`, workflow
active) at launch.

---

## Test checklist
- [ ] Pick each role; partner PINs gate correctly, customer enters free.
- [ ] Pair a normal URL and a store URL (e.g. `*.myshopify.com`) — store is detected on the latter.
- [ ] Chatbot **and** receptionist reply instantly in EN and ES (type Spanish → Spanish reply).
- [ ] Try: price question (no quote), "emergency" (911/988), "do you have this in stock".
- [ ] Storefront tab shows a generated catalog + ROI when no store.
- [ ] Enroll step shows the Ops audit, leak calculator, impact/ROI, role comp, guarantee.
- [ ] Toggle EN/ES anywhere — no English left in Spanish mode.
- [ ] Submit enrollment with a test webhook and confirm the payload.

Ping Jonathan once 1–4, 7, and 11 are live — that's the minimum for a real demo call.
