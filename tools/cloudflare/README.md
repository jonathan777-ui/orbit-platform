# Orbit demo brain — Cloudflare Worker (Groq chat + Deepgram Aura-2 TTS)

One free Worker that gives the demos a real conversational brain and a natural
voice without n8n. Keys live only in Cloudflare's encrypted secret store.

- `POST /chat` `{ system, messages:[{role,content}] }` → `{ reply }` (Groq)
- `POST /tts` `{ text, model }` → `audio/mpeg` (Deepgram Aura-2)

## Deploy (Wrangler — ~3 min)
```bash
npm i -g wrangler
wrangler login
cd tools/cloudflare
wrangler secret put GROQ_API_KEY        # paste your Groq key when prompted
wrangler secret put DEEPGRAM_API_KEY    # paste your Deepgram key when prompted
wrangler deploy
```
Deploy prints a URL like `https://orbit-demo-brain.<your-subdomain>.workers.dev`.

## Deploy (Dashboard — no CLI)
1. Cloudflare dashboard → **Workers & Pages → Create → Worker**.
2. Replace the code with `worker.js`, **Deploy**.
3. Worker → **Settings → Variables and Secrets**:
   - Add **secret** `GROQ_API_KEY` = your Groq key
   - Add **secret** `DEEPGRAM_API_KEY` = your Deepgram key
   - (optional) Add **var** `GROQ_MODEL`, `ALLOWED_ORIGIN`
4. Copy the Worker URL.

## Then
Send me the Worker URL. I wire the demos to it
(`chatEndpoint = <url>/chat`, `ttsEndpoint = <url>/tts`, `useLLM = true`),
redeploy all 19, and the chat becomes the Groq brain (keyless stays as the
fallback) with natural Aura-2 voice.

Notes:
- Change the model anytime via the `GROQ_MODEL` var (e.g. a smaller/faster Groq model).
- Lock access by setting `ALLOWED_ORIGIN` to `https://jonathan777-ui.github.io`.
- Rotating keys = update the two secrets and redeploy the Worker; nothing in the
  public site or repo ever holds a key.
