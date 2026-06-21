#!/usr/bin/env python3
"""Autonomous demo builder: data (clients/demos.json) -> branded, SEO/AEO demo
sites + per-shop SVG logo + hub + sitemap + robots. Edit the data, run this,
commit gh-pages. Falls back to built-in SHOPS if no demos.json is present."""
import re, json, os, sys

REPO = os.environ.get("REPO", "/home/user/orbit-platform")
TPL = os.environ.get("TPL", os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "demo-base.html"))
CHAT = "https://jonathan777-ui.app.n8n.cloud/webhook/orbit-demo-chat"
BASE = "https://jonathan777-ui.github.io/orbit-platform/"
# Reuse the library's per-site llms.txt renderer (one source of truth, AEO guide).
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "skills", "airlock-vertical-kb", "tools"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_llms_txt import render_llms, render_llms_full  # noqa: E402
from demo_content import edge as _edge, reviews_for as _reviews_for  # noqa: E402

raw = open(TPL, encoding="utf-8").read()
src = re.sub(r"const CONFIG = \{.*?\n\};", "const CONFIG = __CONFIG_JSON__;", raw, count=1, flags=re.S)
new_brand = '''function renderBrand(){
  var nm = CONFIG.name || "Studio";
  var parts = nm.split(" ");
  var last = parts.length > 1 ? parts.pop() : "";
  var head = parts.join(" ");
  var accent = last ? (" <span style='color:var(--accent)'>" + last + "</span>") : "";
  var wm = "<span style='font-family:var(--serif);font-weight:800;letter-spacing:.04em'>" + head + accent + "</span>";
  var html = CONFIG.logo ? ("<img src='" + CONFIG.logo + "' alt='" + nm + "' style='height:46px;width:auto;display:block'>") : wm;
  var h = document.getElementById("brand"); if (h) h.innerHTML = html;
  var f = document.getElementById("brandFoot"); if (f) f.innerHTML = html;
}'''
src = re.sub(r"function brandSVG\(\)\{.*?(?=\nrenderBrand\(\); renderNAP)", new_brand, src, count=1, flags=re.S)
old_body = "body:JSON.stringify({messages:history, lang:document.documentElement.lang,\n        page:location.pathname})"
new_body = "body:JSON.stringify({messages:history, lang:document.documentElement.lang,\n        page:location.pathname, business:{name:CONFIG.name, vertical:CONFIG.vertical, address:CONFIG.address, phone:CONFIG.phone, hours:CONFIG.hoursEn, instagram:CONFIG.instagram}})"
src = src.replace(old_body, new_body)

DAYW = {"Mo":"Monday","Tu":"Tuesday","We":"Wednesday","Th":"Thursday","Fr":"Friday","Sa":"Saturday","Su":"Sunday"}
FAQ = [
 ("How much does a tattoo cost?","It depends on size, placement and detail, so your artist gives you a real number at the consult. We set expectations up front — no surprises."),
 ("How old do I have to be?","You need to be 18 or older with a valid government photo ID — we check it on the day. For piercings and anyone younger, ask us about our policy."),
 ("Does it hurt?","Everyone experiences it differently and your artist keeps you comfortable. They walk you through what to expect at the appointment."),
 ("Is it clean? Do you use new needles?","Yes — the studio is licensed and follows strict sterilization standards, with single-use needles for every client."),
 ("How do I take care of it after?","Your artist gives you full aftercare instructions when you come in. If anything ever looks off while it heals, it is safest to see a doctor."),
]

def logo_svg(disp, p):
    mono = "".join(w[0] for w in disp.split()[:2]).upper()
    first, second = mono[0], (mono[1] if len(mono) > 1 else "")
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'
      f'<circle cx="100" cy="100" r="94" fill="{p["ink"]}" stroke="{p["accent"]}" stroke-width="6"/>'
      f'<circle cx="100" cy="100" r="80" fill="none" stroke="{p["accent2"]}" stroke-width="1.5" opacity="0.6"/>'
      f'<text x="100" y="121" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="62" fill="{p["fg"]}">{first}<tspan fill="{p["accent"]}">{second}</tspan></text>'
      f'<text x="100" y="152" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="{p["accent2"]}">SALEM · OR</text>'
      '</svg>')

data_path = os.path.join(REPO, "clients", "demos.json")
if os.path.exists(data_path):
    shops = json.load(open(data_path, encoding="utf-8"))
else:
    shops = json.load(open("/tmp/demos_seed.json", encoding="utf-8"))

hub_entries, sitemap = [], [BASE]
for s in shops:
    disp, slug = s["display"], s["slug"]
    canonical = BASE + slug + "/"
    addr = f'{s["street"]}, Salem, OR {s["zip"]}'
    svc = "custom tattoos, cover-ups" + (", piercing" if s["piercing"] else "")
    typ = "Tattoo & Piercing Studio" if s["piercing"] else "Tattoo Studio"
    title = f"{disp} — {typ} in Salem, OR | Bilingual EN/ES"
    edge = _edge(slug)
    desc = f"{disp} is a licensed {typ.lower()} in Salem, Oregon offering {svc}, and bilingual (English/Spanish) service. {s['street']}. Call {s['phone']}. Book a free consult."
    if edge[0]: desc = desc + " " + edge[0]   # per-site differentiator -> unique meta description
    lat, lng = s["geo"]
    # logo: keep an explicit one (e.g. PM), else generate a badge
    logo_rel = s.get("logo") or "logo.svg"
    d = os.path.join(REPO, slug); os.makedirs(d, exist_ok=True)
    if not s.get("logo"):
        open(os.path.join(d, "logo.svg"), "w", encoding="utf-8").write(logo_svg(disp, s["pal"]))
    ohs = [{"@type":"OpeningHoursSpecification","dayOfWeek":[DAYW[x] for x in days],"opens":o,"closes":c} for days,o,c in s["hours"]]
    lb = {"@context":"https://schema.org","@type":"TattooParlor","name":disp,"url":canonical,
      "telephone":s["phone"],"priceRange":"$$","areaServed":"Salem, OR","knowsLanguage":["en","es"],
      "image":canonical+logo_rel,
      "address":{"@type":"PostalAddress","streetAddress":s["street"],"addressLocality":"Salem","addressRegion":"OR","postalCode":s["zip"],"addressCountry":"US"},
      "geo":{"@type":"GeoCoordinates","latitude":lat,"longitude":lng},
      "openingHoursSpecification":ohs,"sameAs":[s["ig"]]}
    faq = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQ]}
    p = s["pal"]
    brandvars = (f'<style id="brandvars">:root{{--bg:{p["bg"]};--panel:{p["panel"]};--line:{p["line"]};'
                 f'--fg:{p["fg"]};--muted:{p["muted"]};--accent:{p["accent"]};--accent2:{p["accent2"]};--ink:{p["ink"]}}}</style>')
    seo = (
      f'<link rel="canonical" href="{canonical}">\n<meta name="robots" content="index,follow">\n'
      f'<link rel="alternate" hreflang="en" href="{canonical}">\n'
      f'<link rel="alternate" hreflang="es" href="{canonical}?lang=es">\n'
      f'<link rel="alternate" hreflang="x-default" href="{canonical}">\n'
      f'<meta name="geo.region" content="US-OR"><meta name="geo.placename" content="Salem, Oregon">\n'
      f'<meta name="geo.position" content="{lat};{lng}"><meta name="ICBM" content="{lat}, {lng}">\n'
      f'<meta property="og:type" content="business.business"><meta property="og:site_name" content="{disp}">\n'
      f'<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">\n'
      f'<meta property="og:url" content="{canonical}"><meta property="og:image" content="{canonical}{logo_rel}">\n'
      f'<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="es_ES">\n'
      f'<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}">\n'
      f'<script type="application/ld+json">{json.dumps(lb, ensure_ascii=False)}</script>\n'
      f'<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False)}</script>\n')
    cfg = {"name":disp,"logo":logo_rel,"vertical":("tattoo and piercing" if s["piercing"] else "tattoo"),
           "address":addr,"phone":s["phone"],"hoursEn":s["hoursEn"],"hoursEs":s["hoursEs"],
           "instagram":s["ig"],"facebook":"","bookingUrl":"","artists":[],"gallery":[],"demo":True,
           "reviews":_reviews_for("tattoo"),"chatEndpoint":CHAT}
    html = src.replace("__CONFIG_JSON__", json.dumps(cfg, ensure_ascii=False))
    html = html.replace("Permanent Marx Tattoo Studio", disp).replace("Permanent Marx", disp)
    if edge[0]:  # weave the per-site differentiator into the hero lede (EN + ES)
        html = html.replace("Book a free consult, in English or Spanish.</span>",
                            f"Book a free consult, in English or Spanish. {edge[0]}</span>", 1)
        html = html.replace("Agenda una consulta gratis, en inglés o español.</span>",
                            f"Agenda una consulta gratis, en inglés o español. {edge[1]}</span>", 1)
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, count=1, flags=re.S)
    html = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{desc}">', html, count=1)
    # Traceability: record the library template + C# palette this demo was built from.
    combo, tmpl = s.get("combo", ""), s.get("template", "")
    meta_lib = f'<meta name="x-orbit-template" content="{tmpl}"><meta name="x-orbit-palette" content="{combo}">\n' if combo else ""
    html = html.replace("</head>", brandvars + "\n" + meta_lib + seo + "</head>", 1)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(html)

    # Per-demo llms.txt / llms-full.txt so AI answer engines read it accurately.
    svcs = ["Custom tattoos", "Cover-ups", "Fine-line & blackwork", "Flash & walk-ins"]
    if s["piercing"]:
        svcs += ["Piercing", "Jewelry"]
    manifest = {
        "name": disp, "tagline": desc, "url": canonical, "location": "Salem, OR",
        "languages": ["English", "Español"], "phone": s["phone"], "hours": s["hoursEn"],
        "services": svcs, "service_areas": ["Salem", "Keizer", "West Salem", "Marion County"],
        "zips": [s["zip"]],
        "key_pages": [["/", "Home"], ["/#services", "Services"], ["/#book", "Book a consult"],
                      ["/#faq", "FAQ"]],
        "faqs": [list(q) for q in FAQ],
        "social": [x for x in [s.get("ig", "")] if x],
    }
    open(os.path.join(d, "llms.txt"), "w", encoding="utf-8").write(render_llms(manifest))
    open(os.path.join(d, "llms-full.txt"), "w", encoding="utf-8").write(render_llms_full(manifest))
    print("wrote", slug)
    hub_entries.append({"name":disp,"city":"Salem, OR","tag":s["tag"],"path":slug+"/","live":True})
    sitemap.append(canonical)

# hub
hub_path = os.path.join(REPO, "index.html")
hub = open(hub_path, encoding="utf-8").read()
lines = ",\n    ".join(json.dumps(e, ensure_ascii=False) for e in hub_entries)
hub = re.sub(r"const DEMOS = \[.*?\];", "const DEMOS = [\n    " + lines + "\n  ];", hub, count=1, flags=re.S)
open(hub_path, "w", encoding="utf-8").write(hub)

# sitemap + robots
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += "".join(f"  <url><loc>{u}</loc></url>\n" for u in sitemap) + "</urlset>\n"
open(os.path.join(REPO, "sitemap.xml"), "w", encoding="utf-8").write(sm)
open(os.path.join(REPO, "robots.txt"), "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
print("hub + sitemap + robots written for", len(hub_entries), "demos")
