#!/usr/bin/env python3
"""Competitor-audit BATCH mode: several audited sites -> one comparison grid.

Paste/collect audits for N sites (the client + competitors), and this renders a
single markdown comparison report — scorecard grid, ranking, per-dimension
leaders, the client's biggest gaps, and the recommended Orbit move. Hand the
output file to the right conversation.

It grades against the launch-gate dimensions/weights in `references/quality-bar.md`
and pairs with `references/website-audit.md` (which defines how to gather each
site's per-dimension scores).

Usage:
    python audit_batch.py audits.json --out comparison.md
    python audit_batch.py --sample                  # writes ./audit-comparison.md demo

Input JSON schema:
    {
      "query": "best plumber in San Antonio",         # the side-by-side context
      "date": "2026-06-21",
      "sites": [
        {"label": "Acme (you)", "url": "https://acme.example", "client": true,
         "scores": {"Performance": 58, "Design & craft": 64, ...},   # 0-100 per dimension
         "findings": ["No mobile sticky call bar", "No Spanish version"]},
        {"label": "Competitor A", "url": "https://comp-a.example",
         "scores": {...}, "findings": [...]}
      ]
    }
Missing dimension scores are treated as 0 and shown as "—".
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Same weights as the quality-bar launch-gate scorecard (sum = 100).
WEIGHTS = {
    "Performance": 15,
    "Design & craft": 15,
    "Conversion / CRO": 15,
    "Content": 12,
    "SEO + AEO": 12,
    "AI front office": 12,
    "Accessibility": 8,
    "Bilingual / dialect": 6,
    "Motion": 3,
    "Security / compliance": 2,
}
DIMS = list(WEIGHTS)

SAMPLE = {
    "query": "best plumber in San Antonio",
    "date": "2026-06-21",
    "sites": [
        {"label": "Acme (you)", "url": "https://acme.example", "client": True,
         "scores": {"Performance": 55, "Design & craft": 62, "Conversion / CRO": 48,
                    "Content": 60, "SEO + AEO": 35, "AI front office": 0,
                    "Accessibility": 70, "Bilingual / dialect": 0, "Motion": 50,
                    "Security / compliance": 80},
         "findings": ["No Spanish version", "No chat or after-hours answering",
                      "Weak local schema / no city pages", "Slow LCP on mobile"]},
        {"label": "Competitor A (Wix)", "url": "https://comp-a.example",
         "scores": {"Performance": 48, "Design & craft": 70, "Conversion / CRO": 55,
                    "Content": 58, "SEO + AEO": 40, "AI front office": 20,
                    "Accessibility": 65, "Bilingual / dialect": 0, "Motion": 60,
                    "Security / compliance": 75},
         "findings": ["Generic template look", "Bolt-on chat, no voice"]},
        {"label": "Competitor B (market leader)", "url": "https://comp-b.example",
         "scores": {"Performance": 72, "Design & craft": 80, "Conversion / CRO": 68,
                    "Content": 75, "SEO + AEO": 62, "AI front office": 30,
                    "Accessibility": 78, "Bilingual / dialect": 20, "Motion": 65,
                    "Security / compliance": 85},
         "findings": ["Strong reviews + local SEO", "No native Spanish, no voice receptionist"]},
    ],
}


def overall(scores: dict) -> float:
    return round(sum((scores.get(d, 0) or 0) * w for d, w in WEIGHTS.items()) / 100.0, 1)


def _cell(v) -> str:
    return "—" if v in (None, "") else str(v)


def render_report(data: dict) -> str:
    sites = data.get("sites", [])
    for s in sites:
        s["_overall"] = overall(s.get("scores", {}))
    ranked = sorted(sites, key=lambda s: s["_overall"], reverse=True)

    out = [f"# Website Audit — Comparison Grid"]
    meta = []
    if data.get("query"):
        meta.append(f"**Query:** {data['query']}")
    if data.get("date"):
        meta.append(f"**Date:** {data['date']}")
    meta.append("Graded against `quality-bar.md` (The Beat-the-Generators Standard).")
    out += ["", "  ·  ".join(meta), ""]

    # Scorecard grid.
    header = "| Site | " + " | ".join(DIMS) + " | **Overall** |"
    sep = "|---|" + "|".join([":---:"] * len(DIMS)) + "|:---:|"
    out += [header, sep]
    for s in sites:
        sc = s.get("scores", {})
        row = [s.get("label", s.get("url", "?"))]
        row += [_cell(sc.get(d)) for d in DIMS]
        star = " 🏆" if s is ranked[0] else ""
        row.append(f"**{s['_overall']}**{star}")
        out.append("| " + " | ".join(row) + " |")
    out.append("")

    # Ranking.
    out.append("## Ranking")
    for i, s in enumerate(ranked, 1):
        tag = " *(you)*" if s.get("client") else ""
        out.append(f"{i}. **{s.get('label')}** — {s['_overall']}/100{tag}")
    out.append("")

    # Per-dimension leaders.
    out.append("## Per-dimension leader")
    out.append("| Dimension | Leader | Score |")
    out.append("|---|---|:---:|")
    for d in DIMS:
        best = max(sites, key=lambda s: s.get("scores", {}).get(d, 0) or 0)
        out.append(f"| {d} | {best.get('label')} | {best.get('scores', {}).get(d, 0)} |")
    out.append("")

    # Client gap analysis.
    client = next((s for s in sites if s.get("client")), None)
    if client:
        top = ranked[0]
        out.append(f"## Where **{client.get('label')}** loses (gap to leader)")
        gaps = []
        for d in DIMS:
            cs = client.get("scores", {}).get(d, 0) or 0
            bs = top.get("scores", {}).get(d, 0) or 0
            if bs - cs > 0:
                gaps.append((bs - cs, d, cs, bs))
        for gap, d, cs, bs in sorted(gaps, reverse=True)[:6]:
            out.append(f"- **{d}**: {cs} vs {bs} (−{gap})")
        if client.get("findings"):
            out += ["", "**Findings:**"] + [f"- {f}" for f in client["findings"]]
        out.append("")

        # Recommended Orbit move (heuristic by overall score).
        ov = client["_overall"]
        tier = ("Rhodium" if ov >= 80 else "Iridium" if ov >= 60
                else "Platinum" if ov >= 40 else "Platinum (full rebuild)")
        out += [
            "## Recommended Orbit move",
            f"- **Tier:** {tier} — rebuild to clear the `quality-bar.md` launch gate (≥90/100).",
            "- **Instant moats** none of the above ship: **native EN/ES** + **AEO/llms.txt** + the "
            "**24/7 bilingual AI voice receptionist + grounded chat**.",
            "- Pick the template/palette/type from `template-library.md` for the vertical; project "
            "the after-score ≥ 90.",
            "",
        ]

    out.append("> Generated by `tools/audit_batch.py`. Per-site scores are gathered per "
               "`website-audit.md`. Public pages only; no fabricated metrics.")
    return "\n".join(out) + "\n"


def main(argv: list[str]) -> int:
    out_path = Path("audit-comparison.md")
    if "--out" in argv:
        i = argv.index("--out")
        if i + 1 < len(argv):
            out_path = Path(argv[i + 1])
    files = [a for a in argv if not a.startswith("--") and a != str(out_path)]

    if "--sample" in argv or not files:
        data = SAMPLE
    else:
        data = json.loads(Path(files[0]).read_text(encoding="utf-8"))

    out_path.write_text(render_report(data), encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
