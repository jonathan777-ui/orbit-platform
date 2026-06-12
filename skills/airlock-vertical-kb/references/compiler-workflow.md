# Compiler Workflow — `tools/compile_agent.py`
*Turns the layered KB into deployable per-niche agents. This is the Platinum build step.*

## What it does
For each niche overlay it merges **gold base (vertical) + platinum overlay (niche) + voice runtime layer** and emits, per niche:
- `system_prompt.txt` — the full agent prompt (persona → dialect rules → safety → scripts → niche FAQs/intake).
- `attio_field_map.json` — intake fields mapped to the CRM schema.
- `n8n_routing.json` — disposition → route keys (`emergency_or_crisis`, `booked`, `callback_or_language_mismatch`, `superstar_or_closed`, `disposition_recycling`).

## Run it
```bash
python3 tools/compile_agent.py            # compiles every overlay it finds
# outputs land under build/agents/<vertical>__<niche>/
```

## Overlay front-matter contract
Each niche overlay (`overlays/<vertical>/<niche>.md`) starts with YAML, then `---`, then the prose body:
```yaml
vertical: <id>
niche: <id>
voice: { pace: <warm|brisk|measured>, say_as: [<term>, ...] }
intake_fields: [<field>, ...]
compliance_add: [<extra hard line>, ...]   # may TIGHTEN, never loosen
pricing_authorized: [<fee language the business approved>, ...]
handoff_add: [<niche-specific handoff trigger>, ...]
faqs: [{ q: "...", a: "..." }, ...]
---
<niche overlay body: voice tuning, what-to-bring, urgency rules>
```

## Rules
- Overlays **tighten** compliance only. The compiler refuses to let an overlay weaken a base hard line.
- Compiled slugs use a double underscore: `<vertical>__<niche>`.
- After compiling, run the Iridium red-line harness (`iridium/eval/run_redlines.py` in the full KB) — it must exit 0 before an agent ships.
- Dialect packs (`dialect-module.md`) and the chosen service level (`service-levels.md`) are selected at this step and rendered into the prompt + `voice.say_as`.

## Where it sits in the pipeline
`gold + overlay + voice → compile → system_prompt/attio_map/n8n_routing → red-line harness → live injection → rhodium human-gate`
