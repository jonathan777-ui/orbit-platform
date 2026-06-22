# Orbit AI — Rate Card 3 (Support / Internal)
### Fulfillment cost → Retail → Wholesale → White-label / Reseller
*Confidential. Not customer-facing. All figures are current planning defaults — every lever is editable in the Solutions Calculator.*

---

## 1. Fulfillment cost (COGS) — what it actually costs us to deliver

Marginal cost is near-zero, which is the whole thesis. Per-unit, all-in (provider + telephony + LLM):

| Unit | Fulfillment cost | Notes |
|---|---|---|
| AI voice receptionist | **~$0.10 / min** | Deepgram STT + Claude (Haiku/Sonnet) + ElevenLabs Flash + Telnyx. ~$0.05/min on the Qwen3 voice. |
| AI SMS response | **~$0.02 / msg** | 10DLC A2P segment + LLM. |
| Chatbot / web-widget conversation | **~$0.01 / conv** | LLM only; hosting negligible. |
| Phone number / location | **~$1 / mo** | Telnyx number. |
| Platform base / account | **~$18–60 / mo** | Hosting, n8n, Attio seat share, KB upkeep — scales by tier. |

The cache-first Help KB and unified KB mean most repeat work costs $0, so real COGS trends *below* these figures at scale.

---

## 2. Retail packages (customer-facing)

| Package | Retail / mo | Included | Typical COGS | Gross margin |
|---|---|---|---|---|
| **Presence** | **$297** | Site · chatbot · web-widget receptionist · bilingual KB · 1,500 chats | ~$18 | **~94%** |
| **Engage** | **$597** | + AI voice receptionist (500 min) · AI SMS (300) · call summaries · 1 number | ~$94 | **~84%** |
| **Scale** | **$997** | + 1,500 min · 1,000 SMS · multi-location · priority · DFY allowance · 3 numbers | ~$170 | **~83%** |
| **Concierge (Complete DFY)** | **$2,497+** | We run everything — setup, tuning, changes, optimization | ~$300 | **~88%** |

**Overage (retail):** voice **$0.18/min**, SMS **$0.05/msg** above the included allowance. Overage is priced ~1.8–2.5× cost, so heavy usage *raises* margin, never erodes it.

---

## 3. Wholesale (high-volume accounts & aggregators)

Aggregators and high-volume buyers purchase at a fraction of retail by account-count band:

| Accounts | Price (of retail) | Discount | Example (Engage $597) |
|---|---|---|---|
| 1–9 | 60% | 40% off | $358 |
| 10–49 | 50% | 50% off | $299 |
| 50–99 | 42% | 58% off | $251 |
| 100+ | 35% | 65% off | $209 |

Even at the deepest 100+ band, Engage's ~$94 COGS leaves **~$115/account/mo margin** — and the aggregator carries the sales + support load. A 200-account aggregator on Engage = **~$42k/mo** to Orbit at **~55% margin**, hands-off.

---

## 4. White-label

Partner rebrands the platform as their own and sets their own retail.

- **Platform license:** $499 / mo
- **Per active account:** $39 / mo
- **Usage:** at fulfillment cost **+20%**

The partner keeps 100% of their markup above that. This converts agencies into resellers of *our* infrastructure under their brand — they stop building, we power it.

---

## 5. Reseller / 1099

- **Reseller:** buys at the wholesale band, sells at retail, keeps the spread (40% of retail at entry band → e.g. **$239/mo recurring** per Engage account).
- **1099 setter (Jonathan's structure):** 40–50% commission on personal sales + growth strategy; no inventory risk.

---

## 6. Why this takes the industry by surprise

The legacy agency model sells **human hours** — retainers of $2,000–$5,000/mo with high, fixed marginal cost, capped by headcount, slow to deliver. Orbit sells **infrastructure** with marginal cost measured in pennies per minute:

- We can price **below** an agency retainer and still run **80–90% gross margins**.
- We deliver in days (Merge Engine), not months.
- We scale to aggregators and white-label without adding headcount.
- The SMB gets an always-on bilingual receptionist + chatbot + site for less than a part-time front-desk hire.

That's the wedge: same outcome the agency promises, a fraction of the price, near-infinite scale — which is exactly why the agency-partner model looks outdated the moment this launches.

---

*Pricing levers (package retail, included allowances, unit costs, overage, wholesale bands, white-label terms) are all editable in `orbit-solutions-calculator.html` (partner/support view). Verify provider rates before quoting; LLM/STT/TTS pricing moves fast.*
