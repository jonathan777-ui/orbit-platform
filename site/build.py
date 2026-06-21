#!/usr/bin/env python3
"""Build a static documentation site for the airlock-vertical-kb skill.

Reads the markdown under skills/airlock-vertical-kb/ and renders a small,
self-contained multi-page HTML site into site/_site/ (no external assets).
"""
from __future__ import annotations

import html
import re
import shutil
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = ROOT / "skills" / "airlock-vertical-kb"
OUT = Path(__file__).resolve().parent / "_site"

MD = markdown.Markdown(extensions=["fenced_code", "tables", "toc", "sane_lists"])


def render_md(path: Path) -> tuple[str, str]:
    """Return (title, html_body) for a markdown file."""
    text = path.read_text(encoding="utf-8")
    # Strip a leading YAML front-matter block if present.
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            nl = text.find("\n", end + 1)
            text = text[nl + 1 :] if nl != -1 else ""
    MD.reset()
    body = MD.convert(text)
    # Title = first markdown H1, else the file stem.
    m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    title = m.group(1).strip() if m else path.stem.replace("-", " ").title()
    return title, body


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — Airlock Vertical KB</title>
<style>
:root {{ --bg:#0f1117; --panel:#161a23; --line:#262c39; --fg:#e6e9ef; --muted:#9aa4b8;
        --accent:#7aa2ff; --code:#11141b; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--fg);
       font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }}
a {{ color:var(--accent); text-decoration:none; }}
a:hover {{ text-decoration:underline; }}
.layout {{ display:flex; min-height:100vh; }}
nav {{ width:280px; flex:none; background:var(--panel); border-right:1px solid var(--line);
       padding:24px 18px; position:sticky; top:0; align-self:flex-start; height:100vh; overflow:auto; }}
nav h2 {{ font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted);
          margin:22px 0 8px; }}
nav .brand {{ font-size:16px; font-weight:700; margin:0 0 4px; color:var(--fg); }}
nav .tag {{ color:var(--muted); font-size:12px; margin-bottom:8px; }}
nav ul {{ list-style:none; margin:0; padding:0; }}
nav li {{ margin:2px 0; }}
nav a {{ display:block; padding:5px 8px; border-radius:6px; color:var(--fg); font-size:14px; }}
nav a:hover {{ background:#1d2330; text-decoration:none; }}
nav a.active {{ background:#23314f; color:#fff; }}
main {{ flex:1; min-width:0; padding:40px clamp(20px,5vw,72px); max-width:920px; }}
main h1 {{ margin-top:0; }}
h1,h2,h3 {{ line-height:1.25; }}
h2 {{ border-bottom:1px solid var(--line); padding-bottom:6px; margin-top:2em; }}
code {{ background:var(--code); padding:.15em .4em; border-radius:4px; font-size:.88em; }}
pre {{ background:var(--code); padding:16px; border-radius:10px; overflow:auto;
       border:1px solid var(--line); }}
pre code {{ background:none; padding:0; }}
table {{ border-collapse:collapse; width:100%; margin:1em 0; font-size:.94em; }}
th,td {{ border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }}
th {{ background:#1b2230; }}
blockquote {{ border-left:3px solid var(--accent); margin:1em 0; padding:.2em 1em; color:var(--muted); }}
hr {{ border:none; border-top:1px solid var(--line); margin:2em 0; }}
.footer {{ color:var(--muted); font-size:13px; margin-top:48px; border-top:1px solid var(--line);
           padding-top:16px; }}
@media (max-width:760px) {{ .layout{{flex-direction:column}} nav{{width:auto;height:auto;position:static}} }}
</style>
</head>
<body>
<div class="layout">
<nav>
  <p class="brand">Airlock Vertical KB</p>
  <p class="tag">v2 · Elemental · skill docs</p>
  {navhtml}
</nav>
<main>
{body}
<div class="footer">Static docs for the <code>airlock-vertical-kb</code> Claude Code skill ·
generated from <code>skills/airlock-vertical-kb/</code>.</div>
</main>
</div>
</body>
</html>
"""


def slug(path: Path) -> str:
    rel = path.relative_to(SKILL_DIR).with_suffix("")
    return str(rel).replace("/", "__") + ".html"


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # Collect pages: SKILL.md first, then UPGRADE-NOTES, then references (sorted).
    pages: list[tuple[Path, str, str]] = []  # (path, out_name, title)
    order: list[Path] = []
    if (SKILL_DIR / "SKILL.md").exists():
        order.append(SKILL_DIR / "SKILL.md")
    if (SKILL_DIR / "UPGRADE-NOTES.md").exists():
        order.append(SKILL_DIR / "UPGRADE-NOTES.md")
    order += sorted((SKILL_DIR / "references").rglob("*.md"))

    metas = []
    for p in order:
        title, _ = render_md(p)
        out_name = "index.html" if p.name == "SKILL.md" else slug(p)
        metas.append((p, out_name, title))

    # Build sidebar nav (grouped).
    def nav_for(active: str) -> str:
        def link(out_name: str, title: str) -> str:
            cls = ' class="active"' if out_name == active else ""
            return f'<li><a href="{out_name}"{cls}>{html.escape(title)}</a></li>'

        top = [m for m in metas if m[0].parent == SKILL_DIR]
        refs = [m for m in metas if (SKILL_DIR / "references") in m[0].parents
                and m[0].parent == SKILL_DIR / "references"]
        verts = [m for m in metas if m[0].parent == SKILL_DIR / "references" / "verticals"]
        parts = ["<ul>"]
        parts += [link(o, t) for _, o, t in top]
        parts.append("</ul>")
        if refs:
            parts.append("<h2>References</h2><ul>")
            parts += [link(o, t) for _, o, t in refs]
            parts.append("</ul>")
        if verts:
            parts.append("<h2>Verticals</h2><ul>")
            parts += [link(o, t) for _, o, t in verts]
            parts.append("</ul>")
        return "\n".join(parts)

    for p, out_name, title in metas:
        _, body = render_md(p)
        page = PAGE.format(title=html.escape(title), navhtml=nav_for(out_name), body=body)
        (OUT / out_name).write_text(page, encoding="utf-8")

    # Emit an llms.txt for AI answer engines (every Orbit build ships one; see
    # references/aeo-guide.md + tools/gen_llms_txt.py for the client-site generator).
    write_llms_txt(metas)

    # Disable Jekyll processing on Pages.
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Built {len(metas)} pages into {OUT}")


def write_llms_txt(metas: list[tuple[Path, str, str]]) -> None:
    """Write a machine-readable /llms.txt summary of the docs site."""
    base = "https://jonathan777-ui.github.io/orbit-platform"
    lines = [
        "# Airlock Vertical KB — Orbit Platform (docs)",
        "> Documentation for the airlock-vertical-kb Claude Code skill: generates bilingual",
        "> (EN/ES) knowledge bases, voice/chat agents, and websites for 40 business verticals.",
        "",
        "## Pages",
    ]
    for _, out_name, title in metas:
        path = "/" if out_name == "index.html" else f"/{out_name}"
        lines.append(f"- {base}{path}: {title}")
    lines += [
        "",
        "## About",
        "- Source: https://github.com/jonathan777-ui/orbit-platform",
        "- Languages: English, Español",
        "",
    ]
    (OUT / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    build()
