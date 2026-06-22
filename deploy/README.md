# Local stack — n8n + Lead Desk CRM

One `docker compose` brings up:

| Service     | URL                     | What it is                                  |
|-------------|-------------------------|---------------------------------------------|
| **n8n**     | http://localhost:5678   | Automation engine + MCP Server Trigger      |
| **Lead Desk** | http://localhost:8080 | The single-file HTML CRM (`lead-desk.html`) |

## Prerequisites
- Docker Desktop (or Docker Engine + the Compose plugin).

## Run it
```bash
cd deploy
cp .env.example .env        # edit if you like; defaults work for localhost
docker compose up -d
docker compose logs -f n8n  # watch startup; Ctrl-C to stop tailing
```

First time, open http://localhost:5678 and create the owner account.

Stop with `docker compose down`. Add `-v` to also delete n8n's data volume.

## The `curl http://localhost:5678/mcp-server/http` you tried
That failed with `curl: (7)` simply because nothing was listening on the port —
n8n wasn't running. Once `docker compose up -d` is healthy:

```bash
curl -i http://localhost:5678/healthz      # → 200 OK once n8n is ready
```

n8n does **not** expose a generic `/mcp-server/http` endpoint. MCP endpoints are
**per-workflow**, created by the **MCP Server Trigger** node:

1. In the n8n editor, create a workflow and add an **MCP Server Trigger** node.
2. It gives you a path like `/mcp/<your-path>`; the full URL becomes
   `http://localhost:5678/mcp/<your-path>` (this is the URL you point an MCP client at).
3. Activate the workflow, then hit that exact URL — not `/mcp-server/http`.

## Where your data lives (100% local)
n8n stores everything in **`deploy/n8n/data/`** on your hard drive (bind-mounted
to `/home/node/.n8n` in the container) — workflows, credentials, execution
history. You can back it up, move it, or delete it directly. It's git-ignored so
secrets never get committed. Nothing is sent to any cloud.

## Wiring the Lead Desk CRM ↔ n8n
Two ready-to-import workflows live in `n8n/workflows/`:

### 1. Outbound: CRM events → automations (`lead-events.json`)
The CRM POSTs an event to n8n whenever a lead is **created**, **updated**, or its
**stage changes**. To enable:
1. Import `lead-events.json` (n8n → Workflows → Import from File) and **activate** it.
2. Copy its **Production webhook URL** — it'll be
   `http://localhost:5678/webhook/lead-events`.
3. In the Lead Desk CRM, open **⚙ Connect** and paste that into **n8n webhook URL**.

Now editing a lead or dragging it across the pipeline fires the workflow. The
payload is `{ event, lead, sent_at }` where `event` is one of
`lead.created` / `lead.updated` / `lead.stage_changed`. The `stage = "Won"`
branch already posts a **Slack alert** — in the **Slack: Won alert** node, paste
your Slack **Incoming Webhook URL** (Slack → Apps → Incoming Webhooks → Add to a
channel) in place of the placeholder. The other branch is a No-Op to extend
(`lead.stage_changed` events also include `lead.previous_stage`).

### 2. Inbound: external sources → Supabase (`lead-intake.json`)
Lets a web form, voice agent, or anything else create a lead that lands in the
**same Supabase table the CRM reads**. To enable:
1. Import `lead-intake.json` and edit the **Insert into Supabase** node: replace
   `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_ANON_KEY` with your
   project URL and anon key (matching what you put in the CRM's Connect panel).
2. **Activate** it, then POST a lead:
   ```bash
   curl -X POST http://localhost:5678/webhook/lead-intake \
     -H "Content-Type: application/json" \
     -d '{"name":"Jane Doe","company":"Acme","email":"jane@acme.com","stage":"New","value":5000,"source":"Website"}'
   ```
   It appears in the CRM after a refresh (↻).

> The webhook nodes set CORS `allowedOrigins: "*"` so the browser-based CRM can
> POST to them locally. Tighten that for any non-local exposure.

These are starter workflows — import and verify them in your local n8n. With the
n8n MCP server running, a local Claude Code session can refine/validate them and
add real notification nodes.
