#!/usr/bin/env python3
"""Generate `/llms.txt` (and optional `/llms-full.txt`) for an Orbit-built site.

Every Orbit build should emit an `llms.txt` so AI answer engines (Google AI
Overviews, ChatGPT, Perplexity, Gemini, Copilot) read the business accurately
instead of guessing from noisy HTML. See `references/aeo-guide.md`.

Input is a small JSON "business manifest" (compiled from the same KB that
powers the site copy, chat, and voice receptionist — one source of truth).

Usage:
    python gen_llms_txt.py business.json --out dist/      # writes dist/llms.txt (+ llms-full.txt)
    python gen_llms_txt.py --sample                       # writes ./llms.txt + ./llms-full.txt demo

Manifest schema (all keys optional except name; unknown keys ignored):
    {
      "name": "Acme Plumbing",
      "tagline": "Licensed 24/7 plumbing for San Antonio & nearby. Bilingual (EN/ES).",
      "url": "https://acmeplumbing.com",
      "location": "San Antonio, TX",
      "languages": ["English", "Español"],
      "phone": "(210) 555-0100",
      "hours": "24/7",
      "services": ["Emergency plumbing", "Water heaters", "Drain & sewer", "Repiping"],
      "service_areas": ["San Antonio", "Alamo Heights", "Stone Oak", "Boerne"],
      "zips": ["78209", "78258", "78130"],
      "key_pages": [["/services/emergency-plumbing/", "Emergency plumbing"],
                    ["/locations/san-antonio/", "San Antonio"], ["/reviews/", "Reviews"]],
      "faqs": [["Do you offer 24/7 service?", "Yes — emergency plumbing, day or night."]],
      "social": ["https://g.page/acme", "https://facebook.com/acme"]
    }
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

SAMPLE = {
    "name": "Acme Plumbing",
    "tagline": "Licensed 24/7 plumbing for San Antonio & surrounding areas. Bilingual (EN/ES).",
    "url": "https://acmeplumbing.example",
    "location": "San Antonio, TX",
    "languages": ["English", "Español"],
    "phone": "(210) 555-0100",
    "hours": "24/7",
    "services": ["Emergency plumbing", "Water heaters", "Drain & sewer cleaning",
                 "Repiping", "Leak detection"],
    "service_areas": ["San Antonio", "Alamo Heights", "Stone Oak", "Boerne", "New Braunfels"],
    "zips": ["78209", "78258", "78130"],
    "key_pages": [["/services/emergency-plumbing/", "Emergency plumbing"],
                  ["/locations/san-antonio/", "San Antonio"],
                  ["/reviews/", "Reviews"], ["/es/", "Español"]],
    "faqs": [["Do you offer 24/7 emergency service?",
              "Yes. We answer and dispatch day or night, in English and Spanish."],
             ["What areas do you serve?",
              "San Antonio and surrounding communities — see the service-area list."]],
    "social": ["https://g.page/acme-plumbing", "https://facebook.com/acmeplumbing"],
}


def _u(business: dict, path: str) -> str:
    base = (business.get("url") or "").rstrip("/")
    return f"{base}{path}" if base else path


def render_llms(b: dict) -> str:
    """Concise machine-readable summary for AI agents."""
    name = b.get("name", "Business")
    loc = b.get("location", "")
    head = f"# {name}" + (f" — {loc}" if loc else "")
    out = [head]
    if b.get("tagline"):
        out.append(f"> {b['tagline']}")
    out.append("")

    if b.get("services"):
        out.append("## Services")
        out += [f"- {s}" for s in b["services"]]
        out.append("")

    areas = b.get("service_areas") or []
    zips = b.get("zips") or []
    if areas or zips:
        out.append("## Service area")
        line = ", ".join(areas) if areas else ""
        if zips:
            line += (" " if line else "") + f"(ZIPs: {', '.join(zips)})"
        out.append(f"- {line}")
        out.append("")

    contact = []
    if b.get("phone"):
        contact.append(f"Call/text: {b['phone']}")
    if b.get("hours"):
        contact.append(f"Hours: {b['hours']}")
    if b.get("languages"):
        contact.append(f"Languages: {', '.join(b['languages'])}")
    if contact:
        out += ["## Contact", "- " + " · ".join(contact), ""]

    if b.get("key_pages"):
        out.append("## Key pages")
        for entry in b["key_pages"]:
            path, label = (entry + ["", ""])[:2] if isinstance(entry, list) else (entry, "")
            out.append(f"- {_u(b, path)}: {label}".rstrip(": "))
        out.append("")

    more = []
    if b.get("url"):
        more.append(f"- About: {b['url']}")
        more.append(f"- Full: {_u(b, '/llms-full.txt')}")
    for s in b.get("social", []):
        more.append(f"- {s}")
    if more:
        out += ["## More", *more, ""]

    return "\n".join(out).rstrip() + "\n"


def render_llms_full(b: dict) -> str:
    """Expanded version: full services + FAQs for deeper context."""
    out = [render_llms(b).rstrip(), ""]
    if b.get("faqs"):
        out.append("## FAQ")
        for entry in b["faqs"]:
            q, a = (list(entry) + ["", ""])[:2]
            out.append(f"### {q}")
            out.append(a)
            out.append("")
    return "\n".join(out).rstrip() + "\n"


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    flags = {a for a in argv if a.startswith("--")}
    out_dir = Path(".")
    if "--out" in argv:
        i = argv.index("--out")
        if i + 1 < len(argv):
            out_dir = Path(argv[i + 1])
            args = [a for a in args if a != str(out_dir)]

    if "--sample" in flags or not args:
        business = SAMPLE
    else:
        business = json.loads(Path(args[0]).read_text(encoding="utf-8"))

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "llms.txt").write_text(render_llms(business), encoding="utf-8")
    (out_dir / "llms-full.txt").write_text(render_llms_full(business), encoding="utf-8")
    print(f"Wrote {out_dir/'llms.txt'} and {out_dir/'llms-full.txt'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
