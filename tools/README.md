# Orbit demo-build tooling

Generates the bilingual (EN/ES) demo sites hosted on the `gh-pages` branch
(`https://jonathan777-ui.github.io/orbit-platform/`). Each demo ships a branded
single-file site + chat widget, SEO/AEO metadata (schema.org JSON-LD, OG,
sitemap, robots) and its own `/llms.txt` + `/llms-full.txt`.

## Files
- `templates/demo-base.html` — the single-file site template (CONFIG block, EN/ES
  toggle, chat widget, comment-anchored sections `<!-- HERO -->` … `<!-- FAQ -->`).
- `clients/demos.json` — tattoo-vertical demo seed (NAP + `combo`/`template`/`pal`).
- `clients/verticals.json` — barbershop + immigration demo seed.
- `retro_palettes.py` — derives the on-spec **dark-template** palette for each demo
  from the library's Top-40 `C#` combinations (see
  `skills/airlock-vertical-kb/references/template-library.md`) and assigns each
  demo a **distinct** combo + named template. Writes back into the seed files.
- `gen_demos.py` — builds the tattoo demos (reads `clients/demos.json`).
- `build_verticals.py` — builds barbershop + immigration demos (reads
  `clients/verticals.json`), then rebuilds the hub `index.html`, `sitemap.xml`
  and `robots.txt` covering all demos.

## Palette assignment (one combo per site, Accent ≤10%)
Each demo uses a different on-spec `C#` palette, dark-adapted (surfaces shaded from
the combo's dominant hue; links lifted to WCAG-AA on the dark background):

| Vertical | Demos → combo / template |
|---|---|
| Tattoo | C20 Inkwell · C24 Body Art · C27 Inkwell · C26 Body Art · C19 Body Art · C37 Inkwell |
| Barbershop | C31 · C36 · C16 · C40 · C2 — all **Fade** |
| Immigration | C1 Justitia · C8 Justitia · C6 Habeas · C13 Statute (ES-first) · C7 Counsel |

## Rebuild
```bash
# (optional) re-derive palettes into the seed files
python tools/retro_palettes.py

# build into a target dir (defaults to repo root; gh-pages worktree in practice)
REPO=/path/to/gh-pages-worktree python tools/gen_demos.py
REPO=/path/to/gh-pages-worktree python tools/build_verticals.py
```
Env overrides: `REPO` (output root), `TPL` (template), `VERTICALS` (verticals seed).
The build is deterministic — same seeds in, same sites out.
