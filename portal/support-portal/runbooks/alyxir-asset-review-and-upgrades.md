# Asset review — what improves the model, what we dropped, what's next

Reviewed the upload batch against what we're building (vertical KB + Attio company profile → near-perfect site + bilingual AI receptionist + chatbot, with a live consultant front-door and a Lead ID/Access Code CRM bridge).

## ✅ Folded in this pass (live in Merge Engine v6)
- **Revenue intelligence layer.** Each vertical now carries a `pain` + `angle` (from the Top‑30‑Niches doc and the xlsx `Primary Pain`/`Recommended Angle` columns). It shows in the KB panel, is written into the receptionist KB as an internal "§4a Revenue priority" (capture every lead, book fast, reactivate), and the consultant now speaks each niche's revenue reality (roofing = recover $8K–$25K lost estimates, med spa = fill empty slots, dental = reactivate old consults, etc.) — never quoting a price.
- **Per‑lead angle from the CRM.** When a record loads by Lead ID, the lead's own `Primary Pain` / `Recommended Angle` surface as a consultant interjection and prioritize capture/booking.

## ✅ High‑value, ready to fold next (sources confirmed in the uploads)
1. **40 pre‑built vertical/niche KBs** — `alyxir-studio/.../kb/verticals/*.md` are already written to the gold standard (base + niche overlays) across nearly all 25 verticals: home-services(+hvac), law(+immigration), medical-dental(+dental), real-estate(+seller-listing), solar(+residential), accounting-tax(+individual), insurance(+auto), mortgage(+preapproval), property-mgmt(+maintenance), behavioral-health(+therapy), veterinary, beauty(+hair), fitness(+gym), hospitality(+hotels), construction(+kitchen-bath), fine-dining(+private-events), automotive(+auto-repair). **This is the Wave‑2/3 content already done** — fold these into the engine's KB library to hit "25 deep + sub‑niche" without re-authoring.
2. **`netlify/functions/claude.js`** (from `airlock-deploy.zip`) — a key‑safe serverless proxy. This is how the **live consultant runs on a deployed Netlify site**: set `ANTHROPIC_API_KEY` in Netlify env, and point the engine's `callClaude()` at `/.netlify/functions/claude` as the fallback when the direct call is blocked. Closes the "live on deploy" gap.

## 🔧 Attio mapping — align to your real schema (update the Lead Lookup workflow)
Your live data already has the right shape. Align the Lead Lookup `Validate & Shape` mapping to these real field names and add three behaviors:
- Read: `Company`→biz, `City`/`State`, `Phone`, `Website`, `Niche`/`sub_niche`→vertical, `Primary Pain`→pain, `Recommended Angle`→angle, `Elite Score`/`Fit Score`, `Priority Bucket`/`Segment`, `Lead Type`/`Status`.
- **DNC suppression:** if `DNC` is checked (or stage in DNC/Bad Number/Disqualified), return `{ok:false,error:"suppressed"}` — never generate for a suppressed lead.
- **Lead ID already exists** in the solar data (`SOL‑002`…) — use it directly; reuse `Lead ID` as the human key, `record_id` as the machine key.
- **Batch ordering:** sort by `Elite/Fit Score` desc and `Priority Bucket` (Tier 1 first) so the 50–100 batch generates the best leads first.

## 🗃️ Batch fuel (ready to load/generate)
- `solar_elite_database_combined.xlsx` — 59 leads, already has `Lead ID`, City/State, Phone, Website, Primary Pain, Recommended Angle, Tier.
- `elite_roofer_war_room_starter_44.xlsx` — 44 roofer leads (Company, Metro, City/State, Fit Score, Owner, Website, Recommended Angle).
These are the first batches for the batch‑generator (audit + site per record).

## ⏸️ Set aside (doesn't improve the generator)
- Master Rate Card, Partner Pitch Deck, agreements, strategy/operating docx → business ops & packaging. Useful for sales, but pricing stays **off** public surfaces per our rule.
- `100AccessCodes.zip` → it's the alyxir‑studio app build, not a code list; the "100 codes" are the 1001–1100 team attribution codes already baked into studio. Nothing new to add.
- The Revenue‑Infrastructure outbound/reactivation playbook (dialer, rep task queue, scripts) → real and valuable, but it's the **outbound** track. Our launch is inbound‑first; this is the documented fast‑follow that shares the same Attio records.

## Recommended next build order
1. **Fold the 40 studio KBs into the engine** → 25 deep verticals + sub‑niches (the big one).
2. **Update the Lead Lookup workflow** to the real field names + DNC + pain/angle + Elite ordering.
3. **Batch generator** (sibling n8n workflow) → pull Tier‑1 leads, loop → audit + site per record.
4. **Wire the Netlify Claude proxy** so the consultant is live on deploy.
