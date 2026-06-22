# Alyxir — Build & Launch Handoff (for Ace)

The single source of current decisions for go-live. Where this conflicts with an earlier component doc, **this wins** (the deltas are called out below). Launch scope is **inbound only**.

---

## 1. Locked launch decisions

1. **Inbound only at launch.** The voice receptionist + chatbot handle *inbound* — a far better outcome than a caller hitting the sales team's voicemail. **Outbound / dialer is a fast-follow after launch** (same Sales Guru brain extends to it then). Do not build outbound now.
2. **Single shared KB** powers all three surfaces (voice receptionist · chatbot · website copy), paired with the customer's business info + website + GBP to produce the Alyxir output.
3. **Two Gurus, one KB:** **Architect Guru** (system-facing, in-portal change management) and **Sales Guru** (customer-facing, quotes the *client's* pricing and upsells the *client's* products on inbound).
4. **Pricing model (changed):** platform pricing **is published and may be stated** by the surfaces (standard starting + monthly per package). The lever is the **honesty call within 24 hours** — the human team optimizes settings and offers a **slightly better starting + monthly rate**, and upsells **priority support** and the **immediate-edit Architect Guru** on that call. Surfaces never improvise a custom/discount number; only the team sets the better rate on the call.
5. **Architect Guru change rules (locked decision tree):**
   - Clean + in-scope + fully compliant + **non-system-breaking** → **applies instantly on approval** for accounts with the immediate-edit add-on; otherwise on-screen approval.
   - **Breaks the system → refuse, every time.** No override, no waiver.
   - **Crosses a legal/regulatory/safety line → refuse, every time, even with a waiver** (TCPA, FL FTSA, deceptive practices, vertical hard lines, guaranteed-results/medical/legal claims).
   - **More aggressive but still legal → paid upsell + e-sign waiver**, then apply within legal bounds.
   - **Out of scope / new feature →** enters a **review queue handled in order received**; team responds with **scope + deliverability timeline within 24–48 hours**; converts to an e-sign change order.
6. **All changes are approved by an authorized person, logged as a change record.** Waivers and change orders ride the same e-sign rail.
7. **Quality is gated by the Proving Ground** — pre-launch gate + regression gate on every change + continuous monitoring. Same bar for direct and partner (indirect) fulfillment; partner certification tiers are driven by eval scores.

---

## 2. Backend stack (see `alyxir-backend-stack-vendors.md`)

Everything on **Telnyx Voice AI**, attached to the phone number:
- **LLM:** Anthropic Claude Sonnet (latest on Telnyx).
- **STT:** Deepgram Nova-3 multilingual (Telnyx-hosted).
- **TTS:** ElevenLabs Flash v2.5 (BYO key) for bilingual/Spanish dialect quality — the differentiator; Telnyx-native Ultra/NaturalHD as value fallback.
- **Builder:** Telnyx AI Assistant Builder (versioning + canary = the regression gate).

---

## 3. What only Ace can provision (blocks go-live)

- **Telnyx:** account + billing, phone number(s), Voice AI Assistant config, **10DLC/A2P** registration, **STIR/SHAKEN**. Providing Telnyx API keys at hour zero accelerates deployment 24–48h.
- **API keys into the Assistant Builder:** Anthropic (if not Telnyx-hosted Claude), **ElevenLabs**.
- **Attio:** workspace + Pro, the schema objects, change-log / approvals / priority-minutes ledger / authorized-approver fields / partner certification fields.
- **n8n:** orchestration (self-hosted on Oracle Always Free for the no-execution-limit path).
- **e-sign:** DocuSign/e-sign account for change orders + waivers.
- **Claude as a system user:** work email registration where required.
- **Compliance data:** TCPA/FTSA consent capture wired before any number goes live.

---

## 4. Build order

1. **Telnyx Voice AI Assistant** stood up on a test number with the recommended stack; barge-in/turn-taking tuned. Chatbot (text) on the same Claude model + KB.
2. **Load one vertical KB** (single source) + its **price book** + **Packages module** + **dialect layer v2**. Pick the pilot vertical (suggest the existing TrackDog/automotive or a roofing build).
3. **Proving Ground Phase 1** (text core) — scenario bank for the pilot vertical + scoring harness; run the **pre-launch gate**. Nothing goes live until it passes (zero hard-gate fails).
4. **Client Portal screen** — three product lines + Architect Guru change-request flow + tiered approval (instant-apply for clean/compliant; e-sign + pre-flight stubbed to the Proving Ground).
5. **Go live** on the pilot, monitor (continuous eval), then template for direct + partner rollout.

---

## 5. File manifest (the package)

| File | What it is |
|---|---|
| **`alyxir-build-launch-handoff.md`** | This doc — current decisions, provisioning, build order. Start here. |
| **`alyxir-backend-stack-vendors.md`** | Recommended LLM/STT/TTS + voice models, all on Telnyx. Product-KB artifact. |
| **`alyxir-portal-gurus-architecture.md`** | Role-gated UI, Architect + Sales Guru, change-management decision tree, proposed defaults. |
| **`alyxir-proving-ground-eval-qa-map.md`** | Eval/QA + certification engine; gates direct + indirect fulfillment. |
| **`alyxir-language-dialect-layer-v2.md`** | Bilingual engine: dominance tier, lead-clean-Spanish rule, regional variety mirroring. |
| **`alyxir-kb-packages-module.md`** | Standard/Apex packages for the shared KB (now v2 pricing: published rate + 24h honesty call). |
| **`orbit-website-audit.html`** | The Digital Presence Audit tool — prospecting wedge, Standard/Apex tiers, live AIO check. |

---

## 6. Open items for Jonathan to set before/at build

- **Price book values** (the published starting + monthly per package; the better honesty-call rate band).
- **Included priority minutes** per package (placeholder: Standard 30 / Apex 90 min/mo) + the priority/immediate-edit add-on price.
- **Scope boundary** final sign-off (what the Architect Guru self-serves vs. change-order) — proposed defaults in the portal spec §6a.
- **Approval chain** for partner-managed accounts — proposed default in portal spec §6b.
- **Pilot vertical** to build and gate first.

---

## 7. Hold-the-line principles (do not let these erode under pressure)

- Inbound only until outbound is deliberately built and gated.
- Client's own offer is quotable/upsellable; Orbit's package pricing = published rate + honesty call, never an improvised custom number.
- Breaks-system and crosses-a-legal-line are **always refuse** — waivers shift liability between us and the customer, never authorize consumer/regulator harm.
- Gate every change, not just launch. A one-time fine-tune is not quality; the regression gate is.
