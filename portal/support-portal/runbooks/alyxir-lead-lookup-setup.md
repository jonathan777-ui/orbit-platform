# Alyxir · Lead Lookup — go-live setup (Attio → Merge Engine)

The bridge that makes **the Attio company record the KB**. The rep gives the customer a **Lead ID + Access Code**; the engine pulls the full business profile from Attio and builds the site + receptionist + chatbot. No manual typing.

## What was built
- **n8n workflow:** `Alyxir · Lead Lookup (Attio → profile)` — ID `XoIQbgNoc0c0jU6D` (personal project)
- **Endpoint (prod):** `POST https://jonathan777-ui.app.n8n.cloud/webhook/alyxir-lead-lookup`  (test path: `/webhook-test/alyxir-lead-lookup`)
- **Flow:** Lead Webhook → Attio Query (companies, by `lead_id`) → Validate & Shape (checks `access_code`, maps Attio → profile) → Return Profile (JSON, CORS `*`)
- **Contract:**
  - in: `{ "leadId": "ORB-10428", "accessCode": "A1B2" }`
  - out (match): `{ "ok": true, "vertical": "auto", "niche": "...", "profile": { biz, city, state, addr, phone, hours, lang, services[] } }`
  - out (no match / bad code): `{ "ok": false, "error": "lead_not_found" | "bad_access_code" }`
- **Engine:** the Merge Engine's "Load from CRM" bar (in the consultant) already POSTs here and auto-builds on `ok:true`.

## To turn it on (Ace — one-time)
1. **Attio API key →  n8n credential.** Attio → Settings → Developers → create an API key (record **read** scope). In n8n, create a **Bearer Auth** credential named **`Attio API`** with that token, and attach it to the **Attio Query** node. *(The node is pre-wired to use a credential by that name; it was skipped on auto-assign because the key is yours.)*
2. **Add these custom attributes to the Attio `companies` object** (the rep fills them on the intake call — the standard enrichment already gives name/description/location/categories):
   - `lead_id` — text, **unique** (the human key the rep hands out)
   - `access_code` — text (the gate)
   - `hours` — text
   - `phone` — text *(or rely on the standard `phone_numbers` attribute; the workflow reads both)*
   - `sub_niche` — text or select (drives the vertical/niche pick)
   - `services` — text (comma- or newline-separated)
   - `preferred_language` — select: `en` / `es` / `bilingual`
3. **Stamp a test record** (e.g. Track Dog Racing) with a `lead_id` + `access_code` + the fields above.
4. **Activate** the workflow.
5. **Test:**
   ```
   curl -X POST https://jonathan777-ui.app.n8n.cloud/webhook/alyxir-lead-lookup \
     -H "Content-Type: application/json" \
     -d '{"leadId":"ORB-10428","accessCode":"A1B2"}'
   ```
   Expect `{"ok":true,"profile":{...}}`. Then in the engine, enter the same Lead ID + code → it builds from the record.

## Notes / honest status
- Built + **validated**, but not executed by me (n8n run/publish needs your in-app approval, and the Attio key is yours) — the first curl confirms the live path. If `vertical` comes back wrong, tune the keyword map in the **Validate & Shape** node or set `sub_niche` explicitly.
- `record_id` (UUID) is the machine key; `lead_id` is the human key for reps/customers.
- **Batch (50–100):** same Attio query without the `lead_id` filter (paginate `limit`/`offset`), loop each record through the same mapping → generate audit + site per record. Wire as a second workflow when you're ready.
- Security: this is a light gate (Lead ID + code). For real auth, add a shared-secret header on the webhook and rate-limit.
