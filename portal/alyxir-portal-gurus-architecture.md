# Alyxir Portal, Gurus & Change-Management Architecture

The single role-gated UI, the two Gurus, and the change-management flow — all reading the one shared KB, all gated by the Proving Ground. Companion to the Proving Ground (eval/QA) and the dialect-layer specs.

---

## 1. One UI, four role-gated entry points

| Role | Who | What they see |
|---|---|---|
| **New Customer** *(was "Customer")* | Prospect | Audit → tiered packages (Standard/Apex) → enroll. No client data. |
| **Client Portal** *(new)* | Active customer | Their products, audit requests, change requests via Architect Guru, priority add-on. |
| **Partner** | Reseller/agency | Their book of clients, certification status/tier, build tools, scorecards. |
| **Support** *(new third option)* | Orbit internal only | Compliance, the Proving Ground gates, certification review, change-log audit, override. Gated hard; never customer-visible. |

---

## 2. Two Gurus — distinct jobs, one KB

Both personas read the single shared KB; they face opposite directions.

- **Architect Guru** — *system-facing.* Lives in the Client/Partner portal. Handles **change requests to the account's own system** (website, chatbot, receptionist). Runs the pre-flight gate, routes approvals, never touches end-consumers. §4.
- **Sales Guru** — *customer-facing.* Lives inside the client's **chatbot and voice receptionist** (inbound). **Quotes the client's pricing and sells/upsells the client's products** to the client's end-consumers. *(Launch is inbound-only — a great alternative to dumping a caller into voicemail. Outbound/dialer is a fast-follow after launch; the same Sales Guru brain extends to it then.)* §5.

They share the KB so they never contradict each other, and both are evaluated by the Proving Ground.

---

## 3. Client Portal layout

Products shown as **three separate lines**, each independently viewable and editable through the Architect Guru (voice or text):

- **Website** — copy, structure, SEO/AIO config, offers shown.
- **Chatbot** — flows, quick-replies, Sales Guru offer catalog, tone.
- **AI Receptionist** — persona, routing, escalation, Sales Guru pricing/upsell behavior.

Plus: **Request an audit** (re-run the Digital Presence Audit on demand; cadence/priority by package), **Change requests** (Architect Guru), **Priority service** add-on (§6c), and a **Change log** (every request + its proposal + approval record).

---

## 4. Architect Guru — change-management flow

Customer speaks or types a change. The Guru drafts it, runs **pre-flight** (Proving Ground regression + compliance-impact scoring), and routes to one of four outcomes:

| Outcome | Trigger | Path |
|---|---|---|
| **On-screen approval** | Clean, in-scope, reversible | Authorized approver taps approve; **for accounts with the immediate-edit add-on, a clean + fully-compliant + non-system-breaking change applies instantly on approval.** Auto-logged; draws priority minutes. |
| **Refuse (always)** | Would **break the system** — regression, breaks another surface, schema conflict, degrades unified experience | Hard refuse, no override, no waiver. Guru offers a call to find a non-breaking route to the goal. |
| **Refuse (always)** | Crosses a **legal/regulatory/safety line** — TCPA, FL FTSA, deceptive-practice, vertical hard line, guaranteed-results/medical/legal claim | Hard refuse **even with a waiver** — not the customer's to sign away; exposure lands on the platform. |
| **Upsell + e-sign waiver** | **More aggressive but still legal** — firmer CTAs, harder close, more persistent upsell | Paid upsell + e-signed waiver shifting tone/aggressiveness liability to the customer; then applied within still-legal bounds. |
| **Change order + e-sign + call** | **Out of scope** — beyond KB/Specs, new build/integration, new cost | Request enters a **review queue handled in order received**; the team responds with a **deliverability scope + timeline within 24–48 hours**. Guru's proposal becomes an e-sign change order; follow-up call for implementation + cost. |

**Every request becomes a change record (the proposal).** In-scope → approved in-app and logged. Out-of-scope or aggressive → that same proposal converts to the e-sign document. One audit trail, every path. The waiver and the change order ride the **same e-sign rail** — one signing flow, two uses.

---

## 5. Sales Guru — quoting, selling, upselling (the client's offer)

The Sales Guru is what lets the chatbot and voice agent **actually transact** for the client, not just take messages.

**The pricing rule (read carefully — it is not a contradiction):**
- **Client's own products/services** → the Sales Guru **quotes and upsells**, from the client's **authorized price book** in their KB. This is the value prop.
- **Orbit's own packages (Standard/Apex)** → never auto-quoted; route to strategy call. (Different "whose offer" — see the Packages module.)

**How it sells safely:**
- **Authorized price book only.** Quotes come exclusively from the client's KB price book. Never invents a price. Anything not in the book → capture + route (callback / client's team), never a guess.
- **Schema-driven offers/upsells.** Upsells are dynamic offer injection from a controlled catalog (which add-on pairs with which primary request), not improvised — so the bot can't upsell something the client doesn't offer.
- **Firm vs estimate.** Price-book items are flagged firm vs "starting at / estimate" so regulated/variable verticals (e.g. automotive needing fitment, trades needing a site visit) quote with the right commitment level and disclaimer.
- **Upsell intensity ties to the aggressiveness framework (§4).** Default intensity = the safe band. "Push harder" = the upsell+waiver path. Illegal tactics = refuse.
- **Compliance bounds hold.** Vertical hard lines, no guarantees, TCPA/FTSA consent rules all still apply to anything the Sales Guru says.
- **Shared brain, all inbound surfaces.** Same Sales Guru persona/catalog across chatbot and voice receptionist (inbound) at launch — consistent quoting and closing on every inbound touch. Outbound is the post-launch extension of the same brain.

**Eval coverage (Proving Ground):** quotes only authorized prices, never fabricates, upsells within catalog + intensity bounds, applies firm/estimate correctly, escalates unpriced/out-of-scope, honors consent rules. A fabricated or unauthorized price is a **hard-gate compliance fail**.

---

## 6. Proposed defaults for your three open decisions

*(Marked PROPOSED — override any of these and I'll adjust the spec.)*

**a) In-scope / out-of-scope boundary (what the Architect Guru can self-serve)**
- *In-scope, on-screen (draws minutes):* copy/FAQ/hours edits, price-book value updates on existing items, GBP info, toggling existing features, persona tone within the default band, add/remove items in an existing list.
- *In-scope, tier-2 (pre-flight + authorized approval):* routing changes, escalation thresholds, adding a new product/offer to the catalog, any change to receptionist behavior.
- *Out-of-scope (change order):* new integrations, new languages/surfaces/verticals, custom workflows, anything not expressible in the KB template/specs.
- *Always refuse:* breaks system; crosses legal/regulatory/safety line.

**b) Approval chain per account type**
- *Direct client:* one or more named **Authorized Approvers** approve in-app; out-of-scope/waiver = that approver e-signs.
- *Partner-managed:* partner is operational approver for in-scope tier 1–2; **out-of-scope/paid/waiver requires both the partner and the end-client's authorized approver to e-sign** (the party who pays/bears liability acknowledges it). Configurable per account.
- *Support:* may assist/override, every action logged; cannot bypass the two hard-refuse buckets.

**c) Priority-service / minutes mechanics**
- Included Architect-Guru edit time by package (placeholders you set): e.g. **Standard 30 min/mo**, **Apex 90 min/mo + faster SLA**.
- **Priority add-on** ($X/mo or annual, annual discounted) raises SLA + adds minutes.
- *Draws down:* in-scope tier-1/2 edits by time. *Never draws down:* out-of-scope (always a separate change order).
- *Overage:* queue at standard SLA, or bill overage rate / prompt upgrade. *Reset:* monthly.

---

## 7. Ties to the rest of the system

- **Proving Ground:** the Architect Guru's pre-flight *is* the regression gate; the Sales Guru is a tested surface. No change ships, and no quote behavior goes live, without passing.
- **Single KB:** price book, offer catalog, persona, compliance all live in the one KB; both Gurus and all three surfaces read it.
- **Attio:** change log, approvals, e-sign records, priority-minutes ledger, per-account authorized approvers, partner certification/tier.

---

## 8. Data model (key additions)

- `change_request` — `id, account_id, requester, channel(voice/text), proposal, preflight_result, outcome(approve|refuse_break|refuse_legal|waiver_upsell|change_order), approver, esign_id?, minutes_charged`
- `authorized_approvers[]` per account (+ partner approver for managed accounts)
- `price_book[]` — `item, price, firm|estimate, disclaimer?, eligible_upsells[]`
- `priority_plan` — `included_minutes, used_minutes, sla, billing(monthly|annual)`
- `aggressiveness_level` — `default | elevated(waiver_id)`

---

## 9. Build phases

1. **Client Portal screen** — three product lines + Architect Guru change-request flow + the four-outcome tiered approval (in-app approval working; e-sign + pre-flight stubbed to the Proving Ground). *← next artifact.*
2. **Sales Guru layer** — price book + schema-driven offer/upsell catalog wired into chatbot/voice, with the firm/estimate and intensity controls.
3. **E-sign + change-order rail**, priority-minutes ledger, partner approval chains in Attio.
4. **Support console** — compliance + Proving Ground + certification + change-log audit in one internal view.

---

## 10. Design principles

- **Two Gurus never contradict** — shared KB is the guarantee.
- **The pricing line is absolute:** client's own offer = quotable/upsellable; Orbit's packages = strategy call.
- **No quote without an authorized price-book entry** — fabrication is a hard-gate fail.
- **Waivers shift liability between Orbit and customer; they never authorize consumer/regulator harm.**
- **Every change is a logged, approved record** — by an authorized person, every time.
- **Gate every change**, not just launch.
