# Permanent Marx Tattoo Studio — Website + Chatbot

A self-contained bilingual (EN/ES) website with an embedded AI chat widget for
Permanent Marx Tattoo Studio. Built on the `airlock-vertical-kb` **Tattoo Shops**
knowledge base (voice, FAQs, and compliance hard-lines).

## Files
- `index.html` — the full site (one file, no build step, no external assets). Mobile-first,
  EN/ES toggle, services, artists, FAQ, booking, and a chat widget bottom-right.

## Before launch — fill in the real business details
The page ships with **placeholders** for facts we could not verify (the Facebook page
is login-gated). Open `index.html`, find the `CONFIG` object near the bottom `<script>`,
and fill in:

| Field | What to put |
|---|---|
| `address` | Street address (enables the "Visit us" block) |
| `phone` | Phone in display form, e.g. `+1 (555) 123-4567` (powers click-to-call) |
| `hoursEn` / `hoursEs` | Opening hours in each language |
| `instagram` / `facebook` | Social links (Facebook prefilled to the page you sent) |
| `bookingUrl` | Online booking / deposit link. If blank, the "Book" buttons open the chat |
| `artists` | Array of `{ name, styles }` for the team grid |

Nothing is fabricated — blank fields show a tasteful "coming soon" until you fill them.

## The chatbot
The widget POSTs `{ messages, lang, page }` to the n8n brain and renders `{ reply }`.

- **Endpoint:** `https://jonathan777-ui.app.n8n.cloud/webhook/permanent-marx-chat`
- **Workflow:** *Orbit Chat — Permanent Marx (Groq)* (`06rP39Ov2e5qSZQ7`) — **active**.
  Webhook → Build Request (system prompt) → Groq `llama-3.3-70b` → Respond. CORS open (`*`).
- **Grounding:** the system prompt encodes the Tattoo Shops KB compliance — 18+/photo-ID,
  no medical/aftercare advice, no price/pain/heal/removal guarantees, no service while
  intoxicated, client-privacy, and "never invent prices/address/hours/artists." It is
  bilingual and mirrors Spanglish.

To change the bot's knowledge or tone, edit the **Build Request** node's system prompt
in that workflow (same pattern as *Orbit Chat — TrackDog*).

## Deploy
Any static host works — it's a single file:
- **Netlify / Surge / GitHub Pages:** publish this folder (or just `index.html`).
- Local preview: open `index.html` in a browser, or `python3 -m http.server` in this folder.

The chat works cross-origin from any of these because the webhook allows all origins.
