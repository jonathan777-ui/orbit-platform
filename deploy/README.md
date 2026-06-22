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

## Wiring the Lead Desk CRM to n8n (optional)
The CRM is backed by Supabase, but you can also drive it from n8n:
- **Leads in:** an n8n Webhook/Schedule workflow can `insert` rows into your
  Supabase `leads` table (same table the CRM reads).
- **Leads out:** add a Supabase trigger / polling workflow in n8n to fire on new
  or stage-changed leads (notify Slack, send email, etc.).

Ask Claude Code (locally) to scaffold these workflows once n8n is up — it can
read the live node schemas via the n8n MCP server.

## Sharing workflows in git
Exported workflow JSON placed in `deploy/n8n/workflows/` is mounted into the
container at `/home/node/workflows` so you can version them with the repo.
