# Alyxir KB — Folder Index

Loose Markdown files for ingestion into Alyxir. Nothing zipped.

## Top level
- `Alyxir-KB-COMPLETE.md` — everything in one file (single-document import)
- `00-generator-guide.md` — how a KB is generated; the standard every file meets
- `01-language-dialect-layer.md` — bilingual EN+ES + Spanish dialect engine (shared)
- `02-kb-template.md` — the 14-section structure every KB follows
- `03-compliance-patterns.md` — cross-vertical compliance & safety rules
- `04-niche-atlas.md` — map of all 20 verticals and ~100 niches

## /verticals  (20 base layers + 20 primary overlays)
Base = full agent for the whole vertical. Overlay (`vertical__niche.md`) stacks on its base.

| Vertical | Base | Primary overlay |
|---|---|---|
| accounting-tax | verticals/accounting-tax.md | verticals/accounting-tax__individual-tax-prep.md |
| aesthetics-medspa | verticals/aesthetics-medspa.md | verticals/aesthetics-medspa__injectables.md |
| automotive | verticals/automotive.md | verticals/automotive__auto-repair.md |
| beauty-personal-care | verticals/beauty-personal-care.md | verticals/beauty-personal-care__hair-salon.md |
| behavioral-health | verticals/behavioral-health.md | verticals/behavioral-health__individual-therapy.md |
| construction-remodeling | verticals/construction-remodeling.md | verticals/construction-remodeling__kitchen-bath.md |
| financial-advisory | verticals/financial-advisory.md | verticals/financial-advisory__retirement-planning.md |
| fine-dining-events | verticals/fine-dining-events.md | verticals/fine-dining-events__private-events.md |
| fitness-wellness | verticals/fitness-wellness.md | verticals/fitness-wellness__gym.md |
| home-services | verticals/home-services.md | verticals/home-services__hvac.md |
| hospitality-lodging | verticals/hospitality-lodging.md | verticals/hospitality-lodging__hotels.md |
| insurance | verticals/insurance.md | verticals/insurance__auto.md |
| law-firms | verticals/law-firms.md | verticals/law-firms__immigration.md |
| medical-dental | verticals/medical-dental.md | verticals/medical-dental__dental.md |
| mortgage-lending | verticals/mortgage-lending.md | verticals/mortgage-lending__purchase-preapproval.md |
| property-management | verticals/property-management.md | verticals/property-management__maintenance.md |
| real-estate | verticals/real-estate.md | verticals/real-estate__seller-listing.md |
| restaurants | verticals/restaurants.md | verticals/restaurants__full-service.md |
| solar-home-energy | verticals/solar-home-energy.md | verticals/solar-home-energy__residential-solar.md |
| veterinary | verticals/veterinary.md | verticals/veterinary__general-vet.md |

Note: business-specific values (hours, prices, license #s, menus, service areas) are marked "from config" and filled in per client at deployment.