#!/usr/bin/env python3
"""
Airlock PLATINUM — Agent Compiler
=================================
Turns elite written content into a deployable voice agent.

  gold base (kb/gold/<vertical>.md)
    + niche overlay (kb/platinum/overlays/<vertical>/<niche>.md, with YAML front-matter)
    + universal voice layer (kb/platinum/VOICE-RUNTIME-LAYER.md)
  ->  build/agents/<vertical>__<niche>/
        system_prompt.txt      (loaded by the Telnyx turn function)
        attio_field_map.json   (CRM write-back mapping)
        n8n_routing.json       (handoff / escalation / recycling routing)
        agent.manifest.json    (provenance + checks)

Overlay front-matter contract (between leading '---' fences):
---
vertical: homeservices
niche: HVAC
voice:
  say_as: ["HVAC=H-V-A-C", "SEER=seer"]
  pronunciations: ["Trane=trayn"]
  pace: efficient
intake_fields:
  - system_type            # furnace | AC | heat-pump | mini-split
  - issue_description
  - property_type
compliance_add:
  - "No binding repair quote by voice; diagnostic/estimate visit only."
  - "Gas smell / CO alarm -> leave now + call 911/gas utility (emergency override)."
pricing_authorized:
  - "Diagnostic/service-call fee may be quoted if set in business profile; repairs are estimate-only."
handoff_add:
  - "Active gas leak / CO -> emergency branch immediately."
faqs:
  - q: "Do you charge for an estimate?"
    a: "Share the service-call/diagnostic fee if set; full repair price comes after the tech sees it."
---
(free-text niche guidance below the fence is appended as supplemental context)

No external deps; standard library only.
"""

import json, re, sys, hashlib, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent          # .../kb/platinum
KB   = ROOT.parent                              # .../kb
GOLD = KB / "gold"
VOICE_LAYER = ROOT / "VOICE-RUNTIME-LAYER.md"
OVERLAYS = ROOT / "overlays"
OUT = ROOT / "build" / "agents"

# --- front-matter parser for the overlay contract (scalars, inline JSON lists,
#     block lists of strings, block lists of q/a maps, and one-level maps like `voice`) ---
def _scalar(v):
    v = v.strip()
    if v.startswith("[") and v.endswith("]"):
        try:
            return json.loads(v)
        except Exception:
            pass
    return v.strip().strip('"')

def parse_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    raw, body = m.group(1), m.group(2)
    lines = [ln for ln in raw.splitlines() if ln.strip() and not ln.strip().startswith("#")]
    data = {}
    i = 0
    while i < len(lines):
        ln = lines[i]
        if len(ln) - len(ln.lstrip()) != 0:   # only top-level keys start a block
            i += 1
            continue
        s = ln.strip()
        if ":" not in s:
            i += 1
            continue
        key, after = s.split(":", 1)
        key = key.strip()
        after = after.strip()
        if after:                              # inline scalar or JSON list
            data[key] = _scalar(after)
            i += 1
            continue
        # block follows: gather indented child lines
        i += 1
        children = []
        while i < len(lines) and (len(lines[i]) - len(lines[i].lstrip())) > 0:
            children.append(lines[i])
            i += 1
        if not children:
            data[key] = []
            continue
        if children[0].strip().startswith("- "):   # a list
            items, j = [], 0
            while j < len(children):
                c = children[j].strip()
                if c.startswith("- "):
                    item = c[2:].strip()
                    if ":" in item and not item.startswith(('"', "[")):  # map item (q/a)
                        k0, v0 = item.split(":", 1)
                        d = {k0.strip(): _scalar(v0)}
                        # absorb deeper continuation lines (e.g. the `a:` of a faq)
                        base_indent = len(children[j]) - len(children[j].lstrip())
                        j += 1
                        while j < len(children) and not children[j].strip().startswith("- ") \
                                and (len(children[j]) - len(children[j].lstrip())) > base_indent:
                            cc = children[j].strip()
                            if ":" in cc:
                                k1, v1 = cc.split(":", 1)
                                d[k1.strip()] = _scalar(v1)
                            j += 1
                        items.append(d)
                    else:
                        items.append(_scalar(item))
                        j += 1
                else:
                    j += 1
            data[key] = items
        else:                                        # a one-level map (e.g. voice:)
            mp = {}
            for c in children:
                cs = c.strip()
                if ":" in cs:
                    k0, v0 = cs.split(":", 1)
                    mp[k0.strip()] = _scalar(v0)
            data[key] = mp
    return data, body

def read(p):
    return Path(p).read_text(encoding="utf-8")

def section(md, header_prefix):
    """Extract a '## N. Title' section body from a gold base."""
    pat = re.compile(r"^## " + re.escape(header_prefix) + r".*?$(.*?)(?=^## |\Z)", re.S | re.M)
    m = pat.search(md)
    return m.group(1).strip() if m else ""

def compile_agent(vertical, niche_file):
    base_path = GOLD / f"{vertical}.md"
    if not base_path.exists():
        raise SystemExit(f"gold base not found: {base_path}")
    base = read(base_path)
    overlay_raw = read(niche_file)
    fm, body = parse_frontmatter(overlay_raw)
    niche = fm.get("niche", Path(niche_file).stem)
    voice = read(VOICE_LAYER)

    # ---- assemble system_prompt (ordered per VOICE-RUNTIME §E.1) ----
    parts = []
    parts.append(f"# AGENT: {vertical} / {niche}\n")
    parts.append("## IDENTITY & PERSONA\n" + section(base, "1.") + "\n\n" + section(base, "2."))
    parts.append("## LANGUAGE & DIALECT\n" + section(base, "3."))
    # compliance FIRST among behavioral rules, marked non-overridable
    comp = section(base, "5.")
    comp_add = fm.get("compliance_add", [])
    if comp_add:
        comp += "\n\n### NICHE COMPLIANCE TIGHTENING (adds to, never loosens, the above)\n" + \
                "\n".join(f"- {c}" for c in comp_add)
    parts.append("## COMPLIANCE — NON-OVERRIDABLE HARD LINES\n" + comp)
    parts.append("## INTENT MAP & INTAKE\n" + section(base, "4.") + "\n\n" + section(base, "6."))
    nf = fm.get("intake_fields", [])
    if nf:
        parts.append("### NICHE INTAKE FIELDS\n" + "\n".join(f"- {f}" for f in nf))
    pa = fm.get("pricing_authorized", [])
    if pa:
        parts.append("### AUTHORIZED PRICING/TURNAROUND LANGUAGE\n" + "\n".join(f"- {p}" for p in pa))
    # voice layer (universal §A-D)
    parts.append("## VOICE & TURN-TAKING RULES (universal)\n" +
                 "\n".join(section(voice, x) for x in ["A.", "B.", "C.", "D."]))
    vblock = fm.get("voice", {})
    if vblock:
        parts.append("### NICHE VOICE TUNING\n" + json.dumps(vblock, ensure_ascii=False, indent=2))
    parts.append("## HANDOFF TRIGGERS\n" + section(base, "11.") +
                 ("\n" + "\n".join(f"- {h}" for h in fm.get("handoff_add", [])) if fm.get("handoff_add") else ""))
    # niche FAQs as guidance
    faqs = fm.get("faqs", [])
    if faqs:
        faqtext = "\n".join(f"Q: {f.get('q','')}\nA: {f.get('a','')}" for f in faqs if isinstance(f, dict))
        parts.append("## NICHE FAQ GUIDANCE (do not read verbatim)\n" + faqtext)
    if body.strip():
        parts.append("## SUPPLEMENTAL NICHE GUIDANCE\n" + body.strip())
    system_prompt = "\n\n".join(p for p in parts if p and p.strip())

    # ---- attio_field_map (from base §9 schema) ----
    sch = section(base, "9.")
    fields = re.findall(r"^\s*([a-z][\w.]+)\s+", sch, re.M)
    field_map = {}
    for f in fields:
        obj = "people" if f.startswith("contact.") else "deals"
        field_map[f] = {"attio_object": obj, "attio_attribute": f.split(".", 1)[-1]}
    # always-on guards
    field_map["_guards"] = {
        "never_store_from_voice": ["ssn", "card", "account_number", "phi", "security_code"],
        "disposition_drives": "recycling_matrix",
    }

    # ---- n8n_routing ----
    routing = {
        "emergency_or_crisis": {
            "match": ["urgency=EMERGENCY", "crisis.signal", "active-threat",
                      "red_flags!=none", "need.type=AT-NEED", "need.type=CRISIS"],
            "action": "immediate_live_transfer_or_oncall + flag_human_now",
            "never": "queue_behind_scheduling",
        },
        "booked": {"action": "calendar_create + confirm_in_caller_language"},
        "callback_or_language_mismatch": {"action": "callback_queue", "tag": "preferred_language"},
        "superstar_or_closed": {"action": "midnight_pacific_qc_batch"},
        "disposition_recycling": {
            "no_answer": "6 lifetime / 2 per day", "busy": "4 attempts",
            "gatekeeper": "8 attempts / 3-5 day nurture", "opt_out": "HARD STOP",
            "waves": "4-wave 90-120 day recycling",
        },
    }

    # ---- write ----
    slug = f"{vertical}__{re.sub(r'[^a-z0-9]+','-',niche.lower())}"
    d = OUT / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "system_prompt.txt").write_text(system_prompt, encoding="utf-8")
    (d / "attio_field_map.json").write_text(json.dumps(field_map, indent=2, ensure_ascii=False), encoding="utf-8")
    (d / "n8n_routing.json").write_text(json.dumps(routing, indent=2, ensure_ascii=False), encoding="utf-8")
    manifest = {
        "vertical": vertical, "niche": niche, "slug": slug,
        "sources": {"base": str(base_path.name), "overlay": str(Path(niche_file).name),
                    "voice_layer": VOICE_LAYER.name},
        "compiled_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "system_prompt_chars": len(system_prompt),
        "system_prompt_sha256": hashlib.sha256(system_prompt.encode()).hexdigest()[:16],
        "attio_fields": len(field_map) - 1,
        "checks": {
            "compliance_section_present": bool(comp.strip()),
            "voice_layer_present": bool(voice.strip()),
            "emergency_routing_present": "emergency_or_crisis" in routing,
        },
    }
    (d / "agent.manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest

def main(argv):
    if len(argv) >= 3:
        targets = [(argv[1], OVERLAYS / argv[1] / f"{argv[2]}.md")]
    else:
        # compile every overlay present
        targets = []
        for vdir in sorted(OVERLAYS.glob("*")):
            if vdir.is_dir():
                for ov in sorted(vdir.glob("*.md")):
                    targets.append((vdir.name, ov))
    if not targets:
        print("no overlays found to compile yet."); return
    results = [compile_agent(v, f) for v, f in targets]
    print(f"compiled {len(results)} agent(s):")
    for r in results:
        ok = all(r["checks"].values())
        print(f"  {'OK ' if ok else 'WARN'} {r['slug']}  "
              f"({r['system_prompt_chars']} chars, {r['attio_fields']} fields)")

if __name__ == "__main__":
    main(sys.argv)
