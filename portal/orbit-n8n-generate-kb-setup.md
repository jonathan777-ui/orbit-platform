# Orbit · Generate KB & Site — backend setup (n8n)

This is the live endpoint that powers **Generate build** in the Orbit front-end. It takes a
business + website URL, reads the site, drafts a first-pass **bilingual (EN/ES) knowledge base**
with an LLM, and returns it as JSON. The front-end turns that KB into the real site, chatbot,
and receptionist config.

## What was built
- **Workflow:** "Orbit · Generate KB & Site"  (n8n ID `YTl0jc2Iv4lwJuoy`)
- **Location:** your personal project — https://jonathan777-ui.app.n8n.cloud/workflow/YTl0jc2Iv4lwJuoy
- **Flow:** KB Request (webhook) → Normalize Input → Fetch Website → Draft KB (AI Agent +
  OpenAI model + structured JSON parser) → Shape Response → Return KB
- **CORS:** the webhook allows all origins (`*`) and the response sets
  `Access-Control-Allow-Origin: *`, so the Netlify site can call it from the browser.

## Endpoint
- **Production (use this):** `https://jonathan777-ui.app.n8n.cloud/webhook/alyxir-generate-kb`
- **Test (editor only):** `https://jonathan777-ui.app.n8n.cloud/webhook-test/alyxir-generate-kb`

The front-end constant is already set:
`var KB_ENDPOINT = "https://jonathan777-ui.app.n8n.cloud/webhook/alyxir-generate-kb";`

## Turn it on (2 minutes)
1. Open the workflow (link above).
2. Confirm the **OpenAI Model** node is using a credential (your "n8n free OpenAI API credits"
   should auto-select; if not, pick it).
3. Click **Active** (top-right) to publish. The production URL above goes live.
4. Done — Generate build on the deployed site will now pull real per-business copy.

## Test it
From a terminal:
```
curl -X POST https://jonathan777-ui.app.n8n.cloud/webhook/alyxir-generate-kb \
  -H "Content-Type: application/json" \
  -d '{"biz":"Summit Roofing","vert":"Home Services","niche":"Roofing & storm repair","url":"https://www.example.com"}'
```
You should get back `{ "ok": true, "source": "...", "biz": "...", "kb": { summary, summary_es,
tagline_en, tagline_es, services[], greeting_en, greeting_es, faqs[], compliance_flags[] } }`.

Or just open New Customer on the live site, enter a business + URL, and hit **⚡ Generate build** —
if the workflow is Active you'll see real copy; if not, it falls back to the scaffold automatically.

## Request / response contract
**POST** body: `{ biz, vert, niche, url, gbp }` (all strings; `url`/`gbp` optional)
**Returns:** `{ ok, source, biz, kb }` where `kb` matches what the site generator expects:
```
{
  "summary": "...", "summary_es": "...",
  "tagline_en": "...", "tagline_es": "...",
  "services": [{ "en": "...", "es": "..." }],
  "greeting_en": "...", "greeting_es": "...",
  "faqs": [{ "q": "...", "a": "...", "q_es": "...", "a_es": "..." }],
  "compliance_flags": ["..."]
}
```

## Use Claude instead of OpenAI (recommended for your bilingual tone)
The workflow ships on your existing OpenAI credits so it works today. To switch to Claude:
1. In n8n, add an **Anthropic** credential (your Anthropic API key).
2. In the workflow, delete the **OpenAI Model** subnode and add an **Anthropic Chat Model**
   subnode connected to the **Draft KB** agent; pick a Claude model (e.g. Sonnet).
3. Leave everything else as-is (the structured JSON parser and the rest of the flow are
   model-agnostic). Re-publish.

## Notes / limits
- **Website reading** is a best-effort server-side fetch of the page text. Static sites read
  well; heavily JS-rendered sites may return little — in that case the LLM infers from the
  industry + niche. For deeper scraping later, add a rendering/scrape step before Draft KB.
- This endpoint is **unauthenticated**. Before heavy public use, add a shared-secret header
  check (Header Auth on the webhook) and send that header from the front-end, or move the call
  behind your own API. Also consider rate-limiting.
- Cost: each Generate build is one LLM call (~1k tokens). Cheap, but it is a real call.
