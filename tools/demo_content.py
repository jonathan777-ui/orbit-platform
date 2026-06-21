#!/usr/bin/env python3
"""Authored, grounded content for the demo builds — the part Orbit (not the
template) owns. Two pieces:

- EDGE: a one-line, per-business differentiator (EN/ES) grounded in the real
  address/hours/services already in the seed data — no invented facts. Injected
  into the hero, the meta description (kills duplicate-description SEO), and the
  llms.txt tagline so no two same-vertical sites read identically.
- REVIEWS: authored bilingual social-proof, per vertical, clearly labelled as
  demo samples. Shown on-page only (NOT emitted as AggregateRating schema —
  fake review markup is a search-penalty / integrity risk for demos).
"""

# Per-slug differentiator (grounded in real NAP/hours already in the seed).
EDGE = {
    # tattoo
    "permanent-marx-tattoo": ("West Salem studio on Edgewater — late weekday hours, with custom work and piercing by appointment.",
        "Estudio en West Salem (Edgewater) — horario nocturno entre semana, con trabajo personalizado y piercing con cita."),
    "roots-deep-tattoo": ("A Southeast Salem studio focused on custom, meaningful pieces — consult first, then ink.",
        "Un estudio en el sureste de Salem enfocado en piezas personalizadas y con significado — primero la consulta."),
    "alchemy-tattoo-collective": ("A downtown collective on Liberty St — midday walk-ins welcome, plus piercing.",
        "Un colectivo en el centro (Liberty St) — sin cita al mediodía, y piercing."),
    "my-living-canvas": ("A downtown studio on Liberty St with evening appointments.",
        "Un estudio en el centro (Liberty St) con citas por la tarde."),
    "addictions-bodyart": ("A downtown shop open six days a week — tattoo and piercing, walk-ins welcome.",
        "Una tienda en el centro abierta seis días por semana — tatuaje y piercing, sin cita."),
    "desire-ink-lab": ("A South Commercial studio with weekday daytime appointments.",
        "Un estudio en South Commercial con citas de día entre semana."),
    # barbershops
    "javis-fades": ("A downtown chair on State St, open seven days — fades and beard work, walk in or book.",
        "Una silla en el centro (State St), abierta siete días — fades y barba, con o sin cita."),
    "the-barbers": ("A Lancaster Drive barbershop taking walk-ins and appointments.",
        "Una barbería en Lancaster Drive con y sin cita."),
    "reds-barber-shop": ("A Market Street shop for classic cuts and line-ups — walk-ins welcome.",
        "Una barbería en Market Street para cortes clásicos y perfilado — sin cita."),
    "johnnys-barbershop": ("Downtown on State Street — fades, line-ups and hot-towel shaves.",
        "En el centro (State Street) — fades, perfilado y afeitado con toalla caliente."),
    "faded-inc": ("A West Salem barbershop on Orchard Heights — skin fades and beard detailing.",
        "Una barbería en West Salem (Orchard Heights) — skin fades y arreglo de barba."),
    # immigration
    "michael-b-dye": ("Downtown Salem immigration counsel on State St — free, confidential consultation.",
        "Abogacía de inmigración en el centro de Salem (State St) — consulta gratis y confidencial."),
    "terrence-green-law": ("A Broadway Street office offering bilingual immigration help across Oregon.",
        "Una oficina en Broadway Street con ayuda de inmigración bilingüe en todo Oregón."),
    "hernandez-law-office": ("A Portland Road office with a bilingual team for urgent ICE and detention matters.",
        "Una oficina en Portland Road con equipo bilingüe para casos urgentes de ICE y detención."),
    "affordable-immigration": ("Spanish-first, affordable immigration services on Portland Rd — fees explained up front.",
        "Servicios de inmigración accesibles y en español en Portland Rd — honorarios claros desde el inicio."),
    "arellano-law-salem": ("A bilingual immigration firm serving Salem by appointment — free consultation.",
        "Una firma de inmigración bilingüe que atiende Salem con cita — consulta gratis."),
}

_WHO = "Sample · demo"

# Authored bilingual reviews per vertical (on-page social proof, demo-labelled).
REVIEWS = {
    "tattoo": [
        {"stars": 5, "en": "Took my rough idea and turned it into something I love. Clean shop, zero attitude.",
         "es": "Tomaron mi idea y la convirtieron en algo que amo. Estudio limpio y buen trato.", "who": _WHO},
        {"stars": 5, "en": "They explained aftercare clearly and checked in after. Felt cared for.",
         "es": "Me explicaron el cuidado y me dieron seguimiento. Me sentí bien atendido.", "who": _WHO},
        {"stars": 5, "en": "Booked in English, asked questions in Spanish — easy the whole way.",
         "es": "Reservé en inglés y pregunté en español — fácil de principio a fin.", "who": _WHO},
    ],
    "barbershop": [
        {"stars": 5, "en": "Best fade I've had in Salem. In and out, looked sharp.",
         "es": "El mejor fade que me han hecho en Salem. Rápido y quedó muy bien.", "who": _WHO},
        {"stars": 5, "en": "Walked in on a Saturday, short wait, great line-up and beard trim.",
         "es": "Llegué sin cita un sábado, poca espera, excelente perfilado y barba.", "who": _WHO},
        {"stars": 5, "en": "They speak Spanish and English — my whole family comes here now.",
         "es": "Hablan español e inglés — ahora viene toda mi familia.", "who": _WHO},
    ],
    "immigration": [
        {"stars": 5, "en": "Explained my options clearly and never made me feel rushed. The free consult was real.",
         "es": "Explicaron mis opciones con claridad y sin prisa. La consulta gratis fue real.", "who": _WHO},
        {"stars": 5, "en": "Bilingual from the first call — my parents finally understood the process.",
         "es": "Bilingüe desde la primera llamada — mis papás por fin entendieron el proceso.", "who": _WHO},
        {"stars": 5, "en": "Honest about fees and timelines up front. Highly recommend.",
         "es": "Honestos con los costos y los tiempos desde el inicio. Muy recomendado.", "who": _WHO},
    ],
}


def edge(slug):
    return EDGE.get(slug, ("", ""))


def reviews_for(vertical):
    return REVIEWS.get(vertical, [])
