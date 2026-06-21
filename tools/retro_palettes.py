#!/usr/bin/env python3
"""Derive on-spec dark-template palettes from the library's Top-40 C# combos and
assign each existing demo a DISTINCT combo + named template. Emits the updated
seed files (demos_seed.json / verticals_biz.json) carrying combo/template/pal."""
import json

# --- Top-40 combos used here (Primary, Secondary, Accent, Surface, Text) -------
C = {
 "C1":  ("#0B1B2B","#1E2A3A","#C9A227","#FFFFFF","#10151C"),  # Midnight & Gold
 "C2":  ("#2C3640","#4A5A6A","#3B82C4","#F5F7FA","#1A2026"),  # Slate & Steel
 "C6":  ("#13335E","#2A5A9E","#4FA3E3","#FFFFFF","#10182A"),  # Royal Navy & Sky
 "C7":  ("#5A1E2B","#7C2E3D","#C9A66B","#FBF6EF","#2A1015"),  # Burgundy & Champagne
 "C8":  ("#0E6B4F","#1C8A67","#36C28E","#FCFDFB","#10231B"),  # Emerald & Ivory
 "C13": ("#B5532A","#D08A52","#6E7B3C","#FBF6EF","#2C1A12"),  # Terracotta & Olive (ES-first)
 "C14": ("#F2674E","#F79B86","#FFC65C","#FFFBF6","#3A1E16"),  # Sunset Coral & Cream (food/QSR)
 "C15": ("#E2620A","#F2873A","#2C3640","#FAFAF8","#20140A"),  # Safety Orange & Steel (trades/auto)
 "C25": ("#1A1A1D","#3A3A40","#C0A062","#FAFAFA","#16161A"),  # Filmnoir Mono (cinematic/creative)
 "C16": ("#C62828","#E04848","#22262B","#FFFFFF","#1A1D21"),  # Alert Red & Charcoal
 "C19": ("#B11226","#D62839","#1A1A1D","#FAFAFA","#16161A"),  # Crimson & Onyx
 "C20": ("#7B2FF2","#9B5BF5","#16F0C8","#0E0E12","#F2F0F8"),  # Electric Violet & Black (dark)
 "C24": ("#7A1F5A","#A8327E","#E0B24A","#FFFBF8","#2A0F20"),  # Festival Jewel
 "C26": ("#3B2E8C","#6C3FB5","#F0457E","#FFFFFF","#1A1530"),  # Studio Gradient
 "C27": ("#0E1A2B","#1E3A5F","#2FE6D6","#0E1117","#E6EDF5"),  # Cyber Slate & Neon (dark)
 "C31": ("#16181D","#2C3039","#D5202B","#FAFAFA","#14161A"),  # Sentinel Black & Safety Red
 "C36": ("#2B2F36","#4A515C","#F2B100","#FAFAF8","#1A1D21"),  # Industrial Steel & Hazard
 "C37": ("#4A2540","#6E3A5E","#D98BA6","#FCF8FA","#261020"),  # Aubergine & Rose
 "C40": ("#14304A","#285878","#C2965A","#FBFAF6","#101F2E"),  # Mariner Navy & Brass
}

def _h(x):  # "#rrggbb" -> (r,g,b)
    x=x.lstrip("#"); return tuple(int(x[i:i+2],16) for i in (0,2,4))
def _s(t): return "#%02x%02x%02x"%tuple(max(0,min(255,round(v))) for v in t)
def mix(a,b,t):  # t toward b
    A,B=_h(a),_h(b); return _s(tuple(A[i]+(B[i]-A[i])*t for i in range(3)))

BLACK="#000000"; WHITE="#ffffff"

def _lum(h):
    h=h.lstrip("#"); rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c:(c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4)
    r,g,b=[f(c) for c in rgb]; return 0.2126*r+0.7152*g+0.0722*b
def _contrast(a,b):
    L=sorted((_lum(a),_lum(b))); return (L[1]+0.05)/(L[0]+0.05)
def lift(color,bg,target=4.5):
    """Mix `color` toward white until it meets `target` contrast on `bg`."""
    out=color
    for _ in range(20):
        if _contrast(out,bg)>=target: break
        out=mix(out,WHITE,0.12)
    return out

def dark_palette(combo, accent_role="Accent", accent2_role="Secondary"):
    """Build an 8-var dark-template palette anchored on a C# combo.

    accent/accent2 come straight from the combo's on-spec roles. Surfaces use a
    consistent near-black ramp washed with the combo's hue (drawn from the most
    saturated role) so every demo keeps a comparable dark depth while carrying
    its combo's tint -- the on-spec dark-UI treatment for C20/C27 and the dark
    variant (Surface->Primary) for the light combos."""
    prim,sec,acc,_surf,_txt = combo
    roles={"Primary":prim,"Secondary":sec,"Accent":acc}
    accent=roles[accent_role]; accent2=roles[accent2_role]
    def shade(hue,value):
        """Recolor `hue` to a target max-channel brightness, preserving hue --
        yields a dark surface tinted by the brand's dominant color."""
        r,g,b=_h(hue); m=max(r,g,b) or 1; k=value/m
        return _s((r*k,g*k,b*k))
    hue = prim if max(_h(prim))>40 else accent   # dominant brand hue for surfaces
    bg=shade(hue,26)
    return {
      "bg":   bg,
      "panel":shade(hue,42),
      "line": shade(hue,74),
      "fg":   "#f1f3f8",
      "muted":mix("#aab2c2",shade(hue,90),0.30),
      "accent":accent,
      "accent2":lift(mix(accent2,WHITE,0.16),bg),  # links stay >=AA on the dark bg
      "ink":  shade(hue,15),
    }

# --- Per-demo assignment: distinct combo + named library template -------------
# (slug, combo, accent_role, accent2_role, template)
TATTOO = {
 "permanent-marx-tattoo":      ("C20","Primary","Accent",   "Inkwell"),
 "roots-deep-tattoo":          ("C24","Secondary","Accent", "Body Art"),
 "alchemy-tattoo-collective":  ("C27","Accent","Secondary", "Inkwell"),
 "my-living-canvas":           ("C26","Secondary","Accent", "Body Art"),
 "addictions-bodyart":         ("C19","Secondary","Accent", "Body Art"),
 "desire-ink-lab":             ("C37","Accent","Secondary", "Inkwell"),
 "dark-star-tattoo":           ("C25","Accent","Secondary", "Inkwell"),
}
VERTICALS = {
 # barbershops -> Fade
 "javis-fades":         ("C31","Accent","Secondary", "Fade"),
 "the-barbers":         ("C36","Accent","Secondary", "Fade"),
 "reds-barber-shop":    ("C16","Secondary","Primary", "Fade"),
 "johnnys-barbershop":  ("C40","Accent","Secondary", "Fade"),
 "faded-inc":           ("C2", "Accent","Secondary", "Fade"),
 # immigration -> Justitia / Habeas / Statute
 "michael-b-dye":            ("C1", "Accent","Secondary", "Justitia"),
 "terrence-green-law":       ("C8", "Accent","Secondary", "Justitia"),
 "hernandez-law-office":     ("C6", "Accent","Secondary", "Habeas"),
 "affordable-immigration":   ("C13","Secondary","Accent", "Statute"),
 "arellano-law-salem":       ("C7", "Accent","Secondary", "Counsel"),
 "elite-auto-service":       ("C15","Primary","Accent",    "Throttle"),
 "taqueria-los-panditas":    ("C14","Primary","Accent",    "Cocina"),
}

def apply(path, mapping):
    data=json.load(open(path,encoding="utf-8"))
    for row in data:
        combo,ar,a2r,tpl = mapping[row["slug"]]
        row["combo"]=combo
        row["template"]=tpl
        row["pal"]=dark_palette(C[combo],ar,a2r)
    json.dump(data,open(path,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
    print("updated",path,"->",", ".join(f'{r["slug"]}={r["combo"]}/{r["template"]}' for r in data))

if __name__=="__main__":
    import os
    clients=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","clients")
    apply(os.path.join(clients,"demos.json"),TATTOO)
    apply(os.path.join(clients,"verticals.json"),VERTICALS)
