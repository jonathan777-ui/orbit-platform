#!/usr/bin/env python3
import re, json, os, sys
REPO=os.environ.get("REPO","/home/user/orbit-platform"); TPL=os.environ.get("TPL", os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "demo-base.html"))
CHAT="https://jonathan777-ui.app.n8n.cloud/webhook/orbit-demo-chat"
BASE="https://jonathan777-ui.github.io/orbit-platform/"
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "skills", "airlock-vertical-kb", "tools"))
from gen_llms_txt import render_llms, render_llms_full  # noqa: E402
raw=open(TPL,encoding="utf-8").read()

def sec(html,a,b,new):
    return re.sub(re.escape(a)+r".*?(?="+re.escape(b)+")", a+"\n"+new+"\n", html, count=1, flags=re.S)

def hero_html(p,nm):
    tr="".join(f'<span data-en>{e}</span><span data-es>{s}</span>' for e,s in p["trust"])
    return (f'<div class="hero"><div class="wrap">'
      f'<h1><span data-en>{p["h1_en"]}</span><span data-es>{p["h1_es"]}</span></h1>'
      f'<p class="lede"><span data-en>{p["lede_en"].replace("{name}",nm)}</span><span data-es>{p["lede_es"].replace("{name}",nm)}</span></p>'
      f'<div class="cta-row"><a class="btn" href="#book" data-en>{p["cta_en"]}</a><a class="btn" href="#book" data-es>{p["cta_es"]}</a>'
      f'<a class="btn ghost" href="#services" data-en>{p["cta2_en"]}</a><a class="btn ghost" href="#services" data-es>{p["cta2_es"]}</a></div>'
      f'<div class="trust">{tr}</div></div></div>')

def services_html(p):
    cards="".join(f'<div class="card"><span class="tag">{c[0]}</span><h3 data-en>{c[1]}</h3><h3 data-es>{c[2]}</h3><p data-en>{c[3]}</p><p data-es>{c[4]}</p></div>' for c in p["services"])
    return (f'<section id="services"><div class="wrap"><h2 class="sec" data-en>{p["svc_en"]}</h2><h2 class="sec" data-es>{p["svc_es"]}</h2>'
      f'<p class="sub" data-en>{p["svcsub_en"]}</p><p class="sub" data-es>{p["svcsub_es"]}</p><div class="grid cards">{cards}</div></div></section>')

def team_html(p):
    return (f'<section id="artists"><div class="wrap"><h2 class="sec" data-en>{p["team_en"]}</h2><h2 class="sec" data-es>{p["team_es"]}</h2>'
      f'<p class="sub" data-en>{p["teamsub_en"]}</p><p class="sub" data-es>{p["teamsub_es"]}</p><div class="grid cards" id="artistGrid"></div></div></section>')

def book_html(p):
    items="".join(f'<li data-en>{e}</li><li data-es>{s}</li>' for e,s in p["bring"])
    return (f'<section id="book"><div class="wrap twocol"><div><h2 class="sec" data-en>{p["book_en"]}</h2><h2 class="sec" data-es>{p["book_es"]}</h2>'
      f'<p class="sub" data-en>{p["booksub_en"]}</p><p class="sub" data-es>{p["booksub_es"]}</p>'
      f'<p style="margin:0 0 18px"><a class="btn" id="bookCta" href="#" target="_blank" rel="noopener" data-en>{p["bcta_en"]}</a><a class="btn" id="bookCtaEs" href="#" target="_blank" rel="noopener" data-es>{p["bcta_es"]}</a></p>'
      f'<div class="note"><strong data-en>{p["brh_en"]}</strong><strong data-es>{p["brh_es"]}</strong><ul style="margin:8px 0 0;padding-left:18px">{items}</ul></div></div>'
      f'<div><div class="card"><h3 data-en>Visit us</h3><h3 data-es>Vis&iacute;tanos</h3><p id="nap" style="line-height:1.9"></p></div></div></div></section>')

def faq_html(p):
    d="".join(f'<details><summary data-en>{q[0]}</summary><summary data-es>{q[2]}</summary><p data-en>{q[1]}</p><p data-es>{q[3]}</p></details>' for q in p["faqs"])
    return f'<section id="faq"><div class="wrap"><h2 class="sec">FAQ</h2><div class="faq">{d}</div></div></section>'

GAL='<section id="gallery"><div class="wrap gallery"><h2 class="sec" data-en>Our work</h2><h2 class="sec" data-es>Nuestro trabajo</h2><p class="sub" data-en>A sample of the work &mdash; demo images only.</p><p class="sub" data-es>Una muestra del trabajo &mdash; solo im&aacute;genes de demostraci&oacute;n.</p><div id="galleryWrap"></div></div></section>'

PACKS={
"barbershop":dict(
 h1_en="Sharp cuts. Clean lines. Walk in or book ahead.",h1_es="Cortes precisos. L&iacute;neas limpias. Llega o reserva.",
 lede_en="{name} &mdash; Salem's barbershop for fades, classic cuts, beard work and hot-towel shaves. Book in seconds, in English or Spanish.",
 lede_es="{name} &mdash; la barber&iacute;a de Salem para fades, cortes cl&aacute;sicos, barba y afeitado con toalla caliente. Reserva en segundos, en ingl&eacute;s o espa&ntilde;ol.",
 cta_en="Book a cut",cta_es="Reserva tu corte",cta2_en="See services",cta2_es="Ver servicios",
 trust=[("Skilled barbers","Barberos expertos"),("Walk-ins &amp; appointments","Con y sin cita"),("Beard &amp; line-ups","Barba y perfilado"),("Bilingual","Biling&uuml;e")],
 svc_en="What we do",svc_es="Lo que hacemos",svcsub_en="Tell us the look &mdash; we'll dial it in.",svcsub_es="Dinos el estilo &mdash; lo afinamos.",
 services=[("Cuts","Haircuts &amp; Fades","Cortes y Fades","Skin fades, tapers, scissor cuts and classic styles, dialed to you.","Skin fades, tapers, a tijera y cl&aacute;sicos, a tu medida."),
   ("Beard","Beard &amp; Line-up","Barba y Perfilado","Beard shaping, trims and crisp line-ups.","Dise&ntilde;o de barba, recortes y perfilado limpio."),
   ("Shave","Hot-Towel Shave","Afeitado con Toalla","Classic straight-razor shave with a hot towel.","Afeitado cl&aacute;sico a navaja con toalla caliente."),
   ("Kids","Kids' Cuts","Cortes para Ni&ntilde;os","Patient, quick cuts for the little ones.","Cortes r&aacute;pidos y con paciencia para los peque&ntilde;os."),
   ("Design","Designs &amp; Details","Dise&ntilde;os y Detalles","Hair designs, parts and custom detailing.","Dise&ntilde;os, l&iacute;neas y detalles personalizados."),
   ("New?","New here?","&iquest;Primera vez?","Tell us your style or bring a photo &mdash; we'll match it.","Dinos tu estilo o trae una foto &mdash; lo igualamos.")],
 team_en="Our barbers",team_es="Nuestros barberos",teamsub_en="A skilled chair for every style.",teamsub_es="Una silla experta para cada estilo.",
 nav_en="Barbers",nav_es="Barberos",gallery=True,
 book_en="Book a cut",book_es="Reserva tu corte",booksub_en="Walk in during open hours, or book ahead to skip the wait.",booksub_es="Llega en horario, o reserva para no esperar.",
 bcta_en="Book now",bcta_es="Reservar",brh_en="Good to know:",brh_es="Bueno saber:",
 bring=[("Walk-ins welcome &mdash; or book ahead to skip the wait.","Con o sin cita &mdash; reserva para no esperar."),("Bring a reference photo for the cut you want.","Trae una foto de referencia del corte."),("Kids and groups welcome.","Ni&ntilde;os y grupos bienvenidos.")],
 faqs=[("How much is a haircut?","Pricing depends on the service &mdash; your barber confirms it before the cut, with shop rates posted in-store.","&iquest;Cu&aacute;nto cuesta un corte?","El precio depende del servicio &mdash; tu barbero lo confirma antes de empezar, con las tarifas a la vista."),
   ("Do you take walk-ins?","Yes &mdash; walk in during open hours, or book ahead to skip the wait.","&iquest;Atienden sin cita?","S&iacute; &mdash; llega en horario, o reserva para no esperar."),
   ("Do you do beard trims and shaves?","We do &mdash; beard shaping, line-ups and hot-towel straight-razor shaves.","&iquest;Hacen barba y afeitado?","S&iacute; &mdash; dise&ntilde;o de barba, perfilado y afeitado a navaja con toalla caliente."),
   ("Do you cut kids' hair?","Absolutely &mdash; we keep it quick and patient for the little ones.","&iquest;Cortan a ni&ntilde;os?","Claro &mdash; r&aacute;pido y con paciencia para los peque&ntilde;os."),
   ("Can I request a specific barber?","Yes &mdash; tell us who, or book directly with your barber.","&iquest;Puedo pedir un barbero?","S&iacute; &mdash; dinos cu&aacute;l, o reserva directo con tu barbero.")],
 chips_en=[["Book a cut","I'd like to book a haircut."],["Walk-ins?","Do you take walk-ins right now?"],["Beard trim","Do you do beard trims and line-ups?"],["Prices","How much is a haircut and beard trim?"]],
 chips_es=[["Reservar corte","Quiero reservar un corte."],["Sin cita","¿Atienden sin cita ahora?"],["Barba","¿Hacen arreglo de barba y perfilado?"],["Precios","¿Cuánto cuesta corte y barba?"]],
 greet_en="Hey! Welcome to {name}. Want a cut, a beard trim, or to book a time?",greet_es="¡Hola! Bienvenido a {name}. ¿Un corte, arreglo de barba, o reservar?",
 foot_en="Haircuts · Fades · Beard &amp; line-ups · Hot-towel shaves · Kids' cuts",
 foot_es="Cortes · Fades · Barba y perfilado · Afeitado con toalla · Cortes para niños",
 schema="HairSalon"),
"immigration":dict(
 h1_en="Serious immigration matters deserve serious attention.",h1_es="Los asuntos de inmigraci&oacute;n serios merecen atenci&oacute;n seria.",
 lede_en="{name} &mdash; bilingual immigration counsel in Salem. Green cards, citizenship, work permits, family petitions and removal defense. Free, confidential consultation &mdash; in English or Spanish.",
 lede_es="{name} &mdash; abogac&iacute;a de inmigraci&oacute;n biling&uuml;e en Salem. Green cards, ciudadan&iacute;a, permisos de trabajo, peticiones familiares y defensa de deportaci&oacute;n. Consulta gratis y confidencial &mdash; en ingl&eacute;s o espa&ntilde;ol.",
 cta_en="Free consultation",cta_es="Consulta gratis",cta2_en="How we help",cta2_es="C&oacute;mo ayudamos",
 trust=[("Bilingual team","Equipo biling&uuml;e"),("Confidential","Confidencial"),("Free consultation","Consulta gratis"),("Serving all of Oregon","Servimos todo Oreg&oacute;n")],
 svc_en="How we help",svc_es="C&oacute;mo ayudamos",svcsub_en="Tell us your situation &mdash; we'll explain your options at the consultation.",svcsub_es="Cu&eacute;ntanos tu situaci&oacute;n &mdash; te explicamos tus opciones en la consulta.",
 services=[("Family","Family &amp; Green Cards","Familia y Green Cards","Family petitions, adjustment of status, green card renewals.","Peticiones familiares, ajuste de estatus, renovaci&oacute;n de green card."),
   ("Citizenship","Citizenship &amp; Naturalization","Ciudadan&iacute;a y Naturalizaci&oacute;n","Naturalization applications and interview prep.","Solicitudes de naturalizaci&oacute;n y preparaci&oacute;n para la entrevista."),
   ("Work","Work Permits &amp; Visas","Permisos de Trabajo y Visas","Employment authorization and visa petitions.","Autorizaci&oacute;n de empleo y peticiones de visa."),
   ("Defense","Removal / Deportation Defense","Defensa de Deportaci&oacute;n","Defense in immigration court and detention cases.","Defensa en corte de inmigraci&oacute;n y casos de detenci&oacute;n."),
   ("Asylum","Asylum &amp; Humanitarian","Asilo y Humanitario","Asylum, U-visa, VAWA and humanitarian relief.","Asilo, visa U, VAWA y alivio humanitario."),
   ("DACA","DACA &amp; Renewals","DACA y Renovaciones","DACA applications and renewals.","Solicitudes y renovaciones de DACA.")],
 team_en="Our attorneys",team_es="Nuestros abogados",teamsub_en="Experienced, bilingual immigration counsel.",teamsub_es="Abogados de inmigraci&oacute;n con experiencia, biling&uuml;es.",
 nav_en="Attorneys",nav_es="Abogados",gallery=False,
 book_en="Book a free consultation",book_es="Agenda una consulta gratis",booksub_en="The consultation is free and confidential. Tell us your situation and we'll set a time.",booksub_es="La consulta es gratis y confidencial. Cu&eacute;ntanos tu situaci&oacute;n y agendamos.",
 bcta_en="Request consult",bcta_es="Pedir consulta",brh_en="What to bring:",brh_es="Qu&eacute; traer:",
 bring=[("Any immigration documents or notices you have &mdash; bring them all.","Cualquier documento o aviso de inmigraci&oacute;n que tengas &mdash; tr&aacute;elos todos."),("Government photo ID and any case or A-numbers.","Identificaci&oacute;n con foto y cualquier n&uacute;mero de caso o A-number."),("Names and dates for the family members involved.","Nombres y fechas de los familiares involucrados.")],
 faqs=[("How much does a consultation cost?","The consultation is free. The attorney explains any fees clearly before you decide &mdash; no surprises.","&iquest;Cu&aacute;nto cuesta la consulta?","La consulta es gratis. El abogado explica los honorarios con claridad antes de decidir &mdash; sin sorpresas."),
   ("Do you speak Spanish?","Yes &mdash; our team is fully bilingual and your consultation can be entirely in Spanish.","&iquest;Hablan espa&ntilde;ol?","S&iacute; &mdash; el equipo es completamente biling&uuml;e y tu consulta puede ser en espa&ntilde;ol."),
   ("Is what I share confidential?","Yes. What you share is kept confidential, and the attorney is bound by strict confidentiality.","&iquest;Es confidencial lo que comparto?","S&iacute;. Lo que compartes se mantiene confidencial, y el abogado est&aacute; obligado a estricta confidencialidad."),
   ("Does my immigration status affect talking to you?","No &mdash; speaking with us is confidential, and we never treat your status as a barrier to getting help.","&iquest;Mi estatus afecta hablar con ustedes?","No &mdash; hablar con nosotros es confidencial, y nunca tratamos tu estatus como una barrera para ayudarte."),
   ("Someone was detained by ICE &mdash; what do I do?","Call us right away with the person's full name, A-number if known, and the facility. If it is an emergency, call 911.","Detuvieron a alguien por ICE &mdash; &iquest;qu&eacute; hago?","Ll&aacute;manos de inmediato con el nombre completo, el A-number si lo sabes, y el centro. Si es una emergencia, llama al 911.")],
 chips_en=[["Free consult","I'd like a free consultation."],["Green card","Can you help with a green card or family petition?"],["Citizenship","I want to apply for citizenship."],["ICE detention","A family member was detained by ICE."]],
 chips_es=[["Consulta gratis","Quiero una consulta gratis."],["Green card","¿Pueden ayudar con green card o petición familiar?"],["Ciudadanía","Quiero solicitar la ciudadanía."],["Detención ICE","Detuvieron a un familiar por ICE."]],
 greet_en="Hello, and welcome to {name}. I can help you set up a free, confidential consultation — in English or Spanish. What's going on?",
 greet_es="Hola, bienvenido a {name}. Puedo ayudarle a agendar una consulta gratis y confidencial — en inglés o español. ¿En qué le ayudo?",
 foot_en="Family &amp; green cards · Citizenship · Work permits · Removal defense · Asylum · DACA",
 foot_es="Familia y green cards · Ciudadanía · Permisos de trabajo · Defensa de deportación · Asilo · DACA",
 schema="Attorney"),
}

DAYW={"Mo":"Monday","Tu":"Tuesday","We":"Wednesday","Th":"Thursday","Fr":"Friday","Sa":"Saturday","Su":"Sunday"}

def build(b):
    p=PACKS[b["vertical_pack"]]; nm=b["display"]; slug=b["slug"]; canonical=BASE+slug+"/"
    html=raw
    html=re.sub(r"const CONFIG = \{.*?\n\};","const CONFIG = __CFG__;",html,count=1,flags=re.S)
    nb=('function renderBrand(){var nm=CONFIG.name||"Studio";var pp=nm.split(" ");var last=pp.length>1?pp.pop():"";'
        'var head=pp.join(" ");var ac=last?(" <span style=\'color:var(--accent)\'>"+last+"</span>"):"";'
        'var wm="<span style=\'font-family:var(--serif);font-weight:800;letter-spacing:.04em\'>"+head+ac+"</span>";'
        'var h2=CONFIG.logo?("<img src=\'"+CONFIG.logo+"\' alt=\'"+nm+"\' style=\'height:46px;width:auto;display:block\'>"):wm;'
        'var h=document.getElementById("brand");if(h)h.innerHTML=h2;var f=document.getElementById("brandFoot");if(f)f.innerHTML=h2;}')
    html=re.sub(r"function brandSVG\(\)\{.*?(?=\nrenderBrand\(\); renderNAP)",nb,html,count=1,flags=re.S)
    html=html.replace("body:JSON.stringify({messages:history, lang:document.documentElement.lang,\n        page:location.pathname})",
        "body:JSON.stringify({messages:history, lang:document.documentElement.lang,\n        page:location.pathname, business:{name:CONFIG.name, vertical:CONFIG.vertical, address:CONFIG.address, phone:CONFIG.phone, hours:CONFIG.hoursEn, instagram:CONFIG.instagram}})")
    html=html.replace("function renderGallery(){\n  const wrap=document.getElementById('galleryWrap');",
                      "function renderGallery(){\n  const wrap=document.getElementById('galleryWrap'); if(!wrap){return;}")
    html=sec(html,"<!-- HERO -->","<!-- SERVICES -->",hero_html(p,nm))
    html=sec(html,"<!-- SERVICES -->","<!-- ARTISTS -->",services_html(p))
    html=sec(html,"<!-- ARTISTS -->","<!-- GALLERY -->",team_html(p))
    html=sec(html,"<!-- GALLERY -->","<!-- BOOK -->",(GAL if p["gallery"] else ""))
    html=sec(html,"<!-- BOOK -->","<!-- FAQ -->",book_html(p))
    html=sec(html,"<!-- FAQ -->","<footer",faq_html(p))
    html=html.replace("data-en>Artists</a>",f'data-en>{p["nav_en"]}</a>').replace("data-es>Artistas</a>",f'data-es>{p["nav_es"]}</a>')
    if not p["gallery"]:
        html=html.replace('<a class="link" href="#gallery" data-en>Gallery</a><a class="link" href="#gallery" data-es>Galería</a>\n    ','')
    chips=("const CHIPS = { en:"+json.dumps(p["chips_en"],ensure_ascii=False)+",\n  es:"+json.dumps(p["chips_es"],ensure_ascii=False)+" };")
    html=re.sub(r"const CHIPS = \{.*?\n\};",lambda m: chips,html,count=1,flags=re.S)
    greet=("bubble(es\n      ? "+json.dumps(p["greet_es"].replace("{name}",nm),ensure_ascii=False)+"\n      : "+json.dumps(p["greet_en"].replace("{name}",nm),ensure_ascii=False)+",'bot');")
    html=re.sub(r"bubble\(es\n      \? '.*?'\n      : '.*?','bot'\);",lambda m: greet,html,count=1,flags=re.S)
    html=html.replace("Permanent Marx Tattoo Studio",nm).replace("Permanent Marx",nm)
    html=html.replace('<p class="pill" data-en>Custom tattoos · Cover-ups · Piercing · Permanent makeup · Removal</p>', f'<p class="pill" data-en>{p["foot_en"]}</p>')
    html=html.replace('<p class="pill" data-es>Tatuajes personalizados · Cover-ups · Piercing · Maquillaje permanente · Eliminación</p>', f'<p class="pill" data-es>{p["foot_es"]}</p>')
    html=html.replace("SAMPLE TATTOO IMAGE","SAMPLE — DEMO")
    typ={"barbershop":"Barbershop","immigration":"Immigration Law Firm"}[b["vertical_pack"]]
    title=f"{nm} — {typ} in Salem, OR | Bilingual EN/ES"
    if b["vertical_pack"]=="barbershop":
        desc=f"{nm} is a barbershop in Salem, Oregon for fades, classic cuts, beard trims and hot-towel shaves. Bilingual (English/Spanish). {b['street']}."+(f" Call {b['phone']}." if b['phone'] else "")
    else:
        desc=f"{nm} — bilingual immigration attorney in Salem, Oregon. Green cards, citizenship, work permits, family petitions and deportation defense. Free, confidential consultation."+(f" {b['street']}." if b['street'] else "")+(f" Call {b['phone']}." if b['phone'] else "")
    lat,lng=b["geo"]; logo_rel=b.get("logo") or "logo.svg"
    d=os.path.join(REPO,slug); os.makedirs(d,exist_ok=True)
    if not b.get("logo"):
        pp=b["pal"];mono="".join(w[0] for w in nm.split()[:2]).upper();f1=mono[0];f2=mono[1] if len(mono)>1 else ""
        lg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'
          f'<circle cx="100" cy="100" r="94" fill="{pp["ink"]}" stroke="{pp["accent"]}" stroke-width="6"/>'
          f'<circle cx="100" cy="100" r="80" fill="none" stroke="{pp["accent2"]}" stroke-width="1.5" opacity="0.6"/>'
          f'<text x="100" y="121" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="62" fill="{pp["fg"]}">{f1}<tspan fill="{pp["accent"]}">{f2}</tspan></text>'
          f'<text x="100" y="152" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="{pp["accent2"]}">SALEM &middot; OR</text></svg>')
        open(os.path.join(d,"logo.svg"),"w",encoding="utf-8").write(lg)
    sameAs=[x for x in [b.get("ig",""),b.get("site","")] if x]
    addr_obj={"@type":"PostalAddress","addressLocality":"Salem","addressRegion":"OR","postalCode":b["zip"],"addressCountry":"US"}
    if b["street"]: addr_obj["streetAddress"]=b["street"]
    lb={"@context":"https://schema.org","@type":p["schema"],"name":nm,"url":canonical,"priceRange":"$$",
        "areaServed":"Salem, OR","knowsLanguage":["en","es"],"image":canonical+logo_rel,"address":addr_obj,
        "geo":{"@type":"GeoCoordinates","latitude":lat,"longitude":lng}}
    if b["phone"]: lb["telephone"]=b["phone"]
    if sameAs: lb["sameAs"]=sameAs
    if b.get("hours"): lb["openingHoursSpecification"]=[{"@type":"OpeningHoursSpecification","dayOfWeek":[DAYW[x] for x in dd],"opens":o,"closes":c} for dd,o,c in b["hours"]]
    faqjson={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q[0],"acceptedAnswer":{"@type":"Answer","text":q[1]}} for q in p["faqs"]]}
    pp=b["pal"]
    bv=(f'<style id="brandvars">:root{{--bg:{pp["bg"]};--panel:{pp["panel"]};--line:{pp["line"]};--fg:{pp["fg"]};--muted:{pp["muted"]};--accent:{pp["accent"]};--accent2:{pp["accent2"]};--ink:{pp["ink"]}}}</style>')
    seo=(f'<link rel="canonical" href="{canonical}"><meta name="robots" content="index,follow">'
      f'<meta name="geo.region" content="US-OR"><meta name="geo.placename" content="Salem, Oregon"><meta name="geo.position" content="{lat};{lng}"><meta name="ICBM" content="{lat}, {lng}">'
      f'<meta property="og:type" content="business.business"><meta property="og:site_name" content="{nm}"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">'
      f'<meta property="og:url" content="{canonical}"><meta property="og:image" content="{canonical}{logo_rel}"><meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="es_ES">'
      f'<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}">'
      f'<script type="application/ld+json">{json.dumps(lb,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(faqjson,ensure_ascii=False)}</script>')
    addr_disp=(f'{b["street"]}, Salem, OR {b["zip"]}' if b["street"] else "Salem, OR (by appointment)")
    cfg={"name":nm,"logo":logo_rel,"vertical":b["vertical_pack"],"address":addr_disp,"phone":b["phone"],
         "hoursEn":b["hoursEn"],"hoursEs":b["hoursEs"],"instagram":b.get("ig",""),"facebook":"","bookingUrl":"",
         "artists":[],"gallery":[],"demo":p["gallery"],"chatEndpoint":CHAT}
    html=html.replace("__CFG__",json.dumps(cfg,ensure_ascii=False))
    html=re.sub(r"<title>.*?</title>",f"<title>{title}</title>",html,count=1,flags=re.S)
    html=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{desc}">',html,count=1)
    combo,tmpl=b.get("combo",""),b.get("template","")
    meta_lib=f'<meta name="x-orbit-template" content="{tmpl}"><meta name="x-orbit-palette" content="{combo}">' if combo else ""
    html=html.replace("</head>",bv+meta_lib+seo+"</head>",1)
    open(os.path.join(d,"index.html"),"w",encoding="utf-8").write(html)
    # Per-demo llms.txt / llms-full.txt for AI answer engines.
    manifest={"name":nm,"tagline":desc,"url":canonical,"location":"Salem, OR",
      "languages":["English","Español"],"phone":b["phone"],
      "hours":b["hoursEn"],"services":[c[1].replace("&amp;","&") for c in p["services"] if "?" not in c[1]],
      "service_areas":["Salem","Keizer","West Salem","Marion County"],"zips":[b["zip"]],
      "key_pages":[["/","Home"],["/#services",p["svc_en"]],["/#book",p["book_en"]],["/#faq","FAQ"]],
      "faqs":[[q[0],q[1]] for q in p["faqs"]],
      "social":[x for x in [b.get("ig",""),b.get("site","")] if x]}
    open(os.path.join(d,"llms.txt"),"w",encoding="utf-8").write(render_llms(manifest))
    open(os.path.join(d,"llms-full.txt"),"w",encoding="utf-8").write(render_llms_full(manifest))
    return {"name":nm,"city":"Salem, OR","tag":b["tag"],"path":slug+"/","live":True}, canonical

BIZ=json.load(open(os.environ.get("VERTICALS", os.path.join(REPO,"clients","verticals.json")),encoding="utf-8"))
new=[build(b) for b in BIZ]
existing=json.load(open(os.path.join(REPO,"clients","demos.json"),encoding="utf-8"))
tatt=[{"name":s["display"],"city":"Salem, OR","tag":s["tag"],"path":s["slug"]+"/","live":True} for s in existing]
entries=tatt+[n[0] for n in new]
hub_path=os.path.join(REPO,"index.html");hub=open(hub_path,encoding="utf-8").read()
lines=",\n    ".join(json.dumps(e,ensure_ascii=False) for e in entries)
hub=re.sub(r"const DEMOS = \[.*?\];","const DEMOS = [\n    "+lines+"\n  ];",hub,count=1,flags=re.S)
open(hub_path,"w",encoding="utf-8").write(hub)
sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+f"  <url><loc>{BASE}</loc></url>\n"
for s in existing: sm+=f"  <url><loc>{BASE}{s['slug']}/</loc></url>\n"
for _,c in new: sm+=f"  <url><loc>{c}</loc></url>\n"
sm+="</urlset>\n"
open(os.path.join(REPO,"sitemap.xml"),"w",encoding="utf-8").write(sm)
print("built",len(new),"new demos; hub+sitemap now",len(entries))
