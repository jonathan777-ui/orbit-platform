// generate.js — the generation pipeline.
//
// generateSite(businessDescription, { vertical, locale, apiKey }) ALWAYS
// returns a valid site schema, plus metadata about how it was produced.
//
// Flow:
//   1. If an Anthropic API key is available, ask Claude (model claude-opus-4-8)
//      to emit JSON conforming to site.schema.json. Parse it.
//   2. Validate the result. On any failure (no key, network error, bad JSON,
//      schema-invalid) we fall through to the deterministic offline engine.
//   3. If the model output is invalid, run ONE repair pass (re-ask Claude with
//      the validation errors when online; otherwise deterministically clamp).
//      If still invalid, synthesize deterministically.
//
// The deterministic engine is the offline-first heart: no key, no network, a
// real multi-section homepage derived from the business description + vertical.

'use strict';

const fs = require('fs');
const path = require('path');

const { validateSite } = require('./validate');
const themes = require('./themes');

const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'site.schema.json');
const MODEL = 'claude-opus-4-8';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// ---------------------------------------------------------------------------
// Vertical inference from free-text description.
// ---------------------------------------------------------------------------
const VERTICAL_KEYWORDS = {
  'home-services': [
    'hvac', 'plumb', 'electric', 'roof', 'heating', 'cooling', 'furnace', 'ac ',
    'air condition', 'repair', 'contractor', 'handyman', 'landscap', 'cleaning',
    'pest', 'garage', 'remodel', 'emergency',
  ],
  law: ['law', 'attorney', 'lawyer', 'legal', 'firm', 'litigation', 'counsel', 'paralegal', 'injury'],
  'med-spa': ['spa', 'med spa', 'medspa', 'aesthet', 'botox', 'facial', 'skincare', 'wellness', 'cosmetic', 'derma', 'beauty'],
  restaurant: ['restaurant', 'cafe', 'café', 'bistro', 'eatery', 'dining', 'kitchen', 'menu', 'cuisine', 'bar ', 'grill', 'bakery', 'coffee'],
};

function inferVertical(description) {
  const d = ' ' + String(description || '').toLowerCase() + ' ';
  let best = 'generic';
  let bestScore = 0;
  for (const [vertical, words] of Object.entries(VERTICAL_KEYWORDS)) {
    let score = 0;
    for (const w of words) if (d.includes(w)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = vertical;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Lightweight derivations from the description (used by the offline engine).
// ---------------------------------------------------------------------------
function titleCase(s) {
  return String(s).replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}

// Guess a plausible business name: take the first clause before a comma, drop
// trailing descriptors, title-case it. Falls back to a vertical-based name.
function deriveName(description, vertical) {
  const first = String(description || '').split(/[,.;]/)[0].trim();
  if (first && first.length <= 48) return titleCase(first);
  const fallbacks = {
    'home-services': 'Summit Home Services',
    law: 'Sterling Law Group',
    'med-spa': 'Lumière Med Spa',
    restaurant: 'The Copper Table',
    generic: 'Bright Studio',
  };
  return fallbacks[vertical] || fallbacks.generic;
}

// Extract a short "sells" phrase for headlines.
function deriveTagline(description, vertical) {
  const taglines = {
    'home-services': 'Fast, reliable service when you need it most',
    law: 'Experienced counsel you can trust',
    'med-spa': 'Look refreshed. Feel renewed.',
    restaurant: 'Seasonal plates, warm hospitality',
    generic: 'Quality work, done right',
  };
  return taglines[vertical] || taglines.generic;
}

// ---------------------------------------------------------------------------
// Deterministic offline engine.
// ---------------------------------------------------------------------------
function buildOfflineSite(description, opts) {
  const vertical = opts.vertical || inferVertical(description);
  const locale = opts.locale || 'en';
  const theme = themes.themeForVertical(vertical);
  const name = deriveName(description, vertical);
  const tagline = deriveTagline(description, vertical);
  const desc = String(description || '').trim() || `${name} — ${tagline}.`;

  // Vertical-specific service catalogs and feature copy.
  const PACKS = {
    'home-services': {
      heroCta: 'Request Service',
      services: [
        { name: 'Emergency Repairs', description: '24/7 response for urgent breakdowns — we are there when you need us.', price: 'Free estimate' },
        { name: 'Installation', description: 'Expert installation of new systems, done to code and built to last.', price: 'From $99' },
        { name: 'Maintenance Plans', description: 'Seasonal tune-ups that prevent failures and extend equipment life.', price: '$19/mo' },
      ],
      features: [
        { icon: '⚡', title: '24/7 Emergency Service', body: 'Real technicians on call around the clock, every day of the year.' },
        { icon: '🛠️', title: 'Licensed & Insured', body: 'Fully certified crews who treat your home with respect.' },
        { icon: '👨‍👩‍👧', title: 'Family Owned', body: 'Local, trusted, and accountable to the community we serve.' },
      ],
      tiers: [
        { name: 'Single Visit', price: '$89', period: '/visit', features: ['Diagnostic inspection', 'Upfront pricing', 'Same-day where available'] },
        { name: 'Comfort Plan', price: '$19', period: '/mo', features: ['2 seasonal tune-ups', 'Priority scheduling', '15% off repairs'], highlighted: true },
        { name: 'Total Care', price: '$39', period: '/mo', features: ['Everything in Comfort', 'Parts & labor coverage', 'No overtime fees'] },
      ],
    },
    law: {
      heroCta: 'Schedule a Consultation',
      services: [
        { name: 'Personal Injury', description: 'Aggressive representation to recover what you are owed after an accident.' },
        { name: 'Business & Contracts', description: 'Clear, enforceable agreements and counsel for growing companies.' },
        { name: 'Estate Planning', description: 'Protect your family and legacy with airtight wills and trusts.' },
      ],
      features: [
        { icon: '⚖️', title: 'Decades of Experience', body: 'Seasoned attorneys with a track record of favorable outcomes.' },
        { icon: '🤝', title: 'Personal Attention', body: 'You work directly with your attorney — not a call center.' },
        { icon: '💬', title: 'Free Consultation', body: 'Understand your options before you commit, at no charge.' },
      ],
      tiers: [
        { name: 'Consultation', price: 'Free', features: ['Case evaluation', 'Clear next steps', 'No obligation'] },
        { name: 'Contingency', price: '0%', period: ' upfront', features: ['No fee unless we win', 'Full case management', 'Direct attorney access'], highlighted: true },
        { name: 'Flat Fee', price: 'Quoted', features: ['Transparent pricing', 'Defined scope', 'Document drafting'] },
      ],
    },
    'med-spa': {
      heroCta: 'Book a Treatment',
      services: [
        { name: 'Injectables', description: 'Natural-looking results from board-certified providers.', price: 'From $12/unit' },
        { name: 'Medical Facials', description: 'Customized treatments for radiant, healthy skin.', price: 'From $120' },
        { name: 'Laser & Skin', description: 'Advanced therapies for tone, texture, and resurfacing.', price: 'Consult' },
      ],
      features: [
        { icon: '✨', title: 'Board-Certified Care', body: 'Every treatment overseen by licensed medical professionals.' },
        { icon: '🌿', title: 'Bespoke Plans', body: 'Personalized regimens tailored to your goals and skin.' },
        { icon: '💎', title: 'Serene Setting', body: 'A calm, luxurious environment designed for your comfort.' },
      ],
      tiers: [
        { name: 'Glow', price: '$120', period: '/session', features: ['Signature facial', 'Skin analysis', 'Aftercare kit'] },
        { name: 'Membership', price: '$199', period: '/mo', features: ['Monthly treatment', '20% off add-ons', 'Priority booking'], highlighted: true },
        { name: 'Transform', price: '$899', period: ' package', features: ['Series of 6', 'Provider consults', 'Maintenance plan'] },
      ],
    },
    restaurant: {
      heroCta: 'Reserve a Table',
      services: [
        { name: 'Dinner Service', description: 'Seasonal plates crafted from local, market-fresh ingredients.' },
        { name: 'Private Events', description: 'Intimate dinners and celebrations in our reserved dining room.' },
        { name: 'Catering', description: 'Bring our kitchen to your table for any occasion.' },
      ],
      features: [
        { icon: '🍽️', title: 'Seasonal Menu', body: 'A rotating menu that follows the harvest, never the trend.' },
        { icon: '🥂', title: 'Curated Wine List', body: 'Thoughtful pairings selected by our in-house sommelier.' },
        { icon: '🔥', title: 'Open Kitchen', body: 'Watch our team craft each dish from the chef’s counter.' },
      ],
      tiers: [
        { name: 'À la Carte', price: 'Varies', features: ['Full menu', 'Daily specials', 'Walk-ins welcome'] },
        { name: "Chef's Tasting", price: '$85', period: '/guest', features: ['5 courses', 'Seasonal selection', 'Optional pairings'], highlighted: true },
        { name: 'Private Dining', price: 'Quoted', features: ['Reserved room', 'Custom menu', 'Dedicated server'] },
      ],
    },
    generic: {
      heroCta: 'Get Started',
      services: [
        { name: 'Consulting', description: 'Expert guidance tailored to your goals.' },
        { name: 'Implementation', description: 'We build and ship, end to end.' },
        { name: 'Support', description: 'Ongoing help so things keep running smoothly.' },
      ],
      features: [
        { icon: '🚀', title: 'Fast Turnaround', body: 'Momentum from day one.' },
        { icon: '🎯', title: 'Focused Results', body: 'We measure what matters and deliver it.' },
        { icon: '🤝', title: 'Real Partnership', body: 'A team that is invested in your success.' },
      ],
      tiers: [
        { name: 'Starter', price: '$0', features: ['Core features', 'Email support'] },
        { name: 'Pro', price: '$49', period: '/mo', features: ['Everything in Starter', 'Priority support'], highlighted: true },
        { name: 'Enterprise', price: 'Custom', features: ['Dedicated team', 'SLA'] },
      ],
    },
  };
  const pack = PACKS[vertical] || PACKS.generic;

  const heroVariant = theme.heroStyle === 'editorial' || theme.heroStyle === 'industrial' ? 'banner' : 'centered';

  return {
    schemaVersion: '1.0',
    site: {
      name,
      vertical,
      locale,
      theme: {
        palette: theme.palette,
        fontHeading: theme.fontHeading,
        fontBody: theme.fontBody,
        heroStyle: theme.heroStyle,
      },
      nav: {
        logoText: name,
        links: [
          { label: 'Services', href: '#services' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Reviews', href: '#testimonials' },
          { label: 'Contact', href: '#contact' },
        ],
      },
      pages: [
        {
          path: '/',
          title: `${name} — ${tagline}`,
          meta: { description: desc.slice(0, 155) },
          content: [
            {
              type: 'Hero',
              variant: heroVariant,
              headline: name,
              subhead: tagline,
              ctaLabel: pack.heroCta,
              ctaHref: '#contact',
            },
            { type: 'Features', variant: 'grid', heading: 'Why Choose Us', items: pack.features },
            { type: 'Services', variant: 'cards', heading: 'What We Offer', items: pack.services },
            { type: 'Testimonials', heading: 'What Clients Say', items: buildTestimonials(vertical) },
            { type: 'PricingTable', heading: 'Plans & Pricing', tiers: pack.tiers },
            {
              type: 'ContactForm',
              heading: 'Get in Touch',
              subhead: 'Tell us what you need and we will be in touch shortly.',
              submitLabel: 'Send Message',
              fields: [
                { name: 'name', label: 'Name', kind: 'text', required: true },
                { name: 'email', label: 'Email', kind: 'email', required: true },
                { name: 'phone', label: 'Phone', kind: 'tel', required: false },
                { name: 'message', label: 'How can we help?', kind: 'textarea', required: true },
              ],
            },
            {
              type: 'Footer',
              businessName: name,
              tagline,
              phone: '(555) 010-0199',
              email: 'hello@example.com',
              address: 'Serving your local area',
            },
          ],
        },
      ],
    },
  };
}

function buildTestimonials(vertical) {
  const sets = {
    'home-services': [
      { quote: 'They showed up within the hour and had our heat back on by dinner. Lifesavers.', author: 'Dana R.', role: 'Homeowner' },
      { quote: 'Honest pricing and no upsell. The only company we call now.', author: 'Marcus T.', role: 'Homeowner' },
    ],
    law: [
      { quote: 'They fought for me and got far more than I expected. Truly grateful.', author: 'Elena V.', role: 'Client' },
      { quote: 'Professional, responsive, and clear at every step of the case.', author: 'James P.', role: 'Client' },
    ],
    'med-spa': [
      { quote: 'I left glowing — literally. The most relaxing experience I have had.', author: 'Priya S.', role: 'Member' },
      { quote: 'Natural results and genuine care. I recommend them to everyone.', author: 'Olivia M.', role: 'Client' },
    ],
    restaurant: [
      { quote: 'Every course was a surprise. The best meal we have had all year.', author: 'Tom & Rachel', role: 'Regulars' },
      { quote: 'Warm service, incredible wine, unforgettable food.', author: 'Sofia L.', role: 'Diner' },
    ],
    generic: [
      { quote: 'They delivered exactly what we needed, on time and on budget.', author: 'Alex K.', role: 'Customer' },
      { quote: 'A genuine partner — responsive, sharp, and easy to work with.', author: 'Jordan B.', role: 'Customer' },
    ],
  };
  return sets[vertical] || sets.generic;
}

// ---------------------------------------------------------------------------
// Claude (Anthropic Messages API) — zero-dependency raw HTTP via global fetch.
// ---------------------------------------------------------------------------
function buildPrompt(description, vertical, locale, schema, repairErrors) {
  const allowedVerticals = schema.properties.site.properties.vertical.enum;
  let prompt =
    `You are a website-schema generator. Output ONLY a single JSON object that ` +
    `conforms to the provided JSON Schema. Do NOT output HTML, markdown, code ` +
    `fences, or any prose — only raw JSON.\n\n` +
    `Business description: "${description}"\n` +
    `Target vertical: ${vertical} (one of: ${allowedVerticals.join(', ')})\n` +
    `Locale: ${locale}\n\n` +
    `Build a complete single-page homepage with these blocks in order: Hero, ` +
    `Features, Services, Testimonials, PricingTable, ContactForm, Footer. ` +
    `Write realistic, specific marketing copy derived from the description. ` +
    `Choose theme tokens appropriate to the vertical.\n\n` +
    `JSON Schema:\n${JSON.stringify(schema)}\n`;
  if (repairErrors && repairErrors.length) {
    prompt +=
      `\nYour previous output FAILED validation with these errors. Fix ALL of ` +
      `them and output corrected JSON only:\n- ${repairErrors.join('\n- ')}\n`;
  }
  return prompt;
}

// Returns a parsed JS object or throws.
async function callClaude(apiKey, prompt) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const block = (data.content || []).find((b) => b.type === 'text');
  const text = block ? block.text : '';
  return parseLooseJson(text);
}

// Models sometimes wrap JSON in prose or code fences despite instructions;
// extract the outermost JSON object before parsing.
function parseLooseJson(text) {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in model output');
  }
  return JSON.parse(t.slice(start, end + 1));
}

// ---------------------------------------------------------------------------
// Public API.
// ---------------------------------------------------------------------------
async function generateSite(businessDescription, options) {
  const opts = options || {};
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const vertical = opts.vertical || inferVertical(businessDescription);
  const locale = opts.locale || 'en';
  const apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY || null;

  const meta = {
    engine: 'offline',
    vertical,
    repaired: false,
    notes: [],
  };

  // 1. Online path: ask Claude, then validate (+ one repair pass).
  if (apiKey) {
    try {
      const prompt = buildPrompt(businessDescription, vertical, locale, schema, null);
      let candidate = await callClaude(apiKey, prompt);
      let result = validateSite(candidate);

      if (!result.valid) {
        // One repair pass: re-ask Claude with the errors.
        meta.notes.push('online output invalid; attempting repair');
        const repairPrompt = buildPrompt(businessDescription, vertical, locale, schema, result.errors);
        try {
          candidate = await callClaude(apiKey, repairPrompt);
          result = validateSite(candidate);
          meta.repaired = true;
        } catch (e) {
          meta.notes.push('repair call failed: ' + e.message);
        }
      }

      if (result.valid) {
        meta.engine = 'online';
        // Trust the model's chosen vertical if present.
        meta.vertical = (candidate.site && candidate.site.vertical) || vertical;
        return { site: candidate, meta };
      }
      meta.notes.push('online output still invalid after repair; falling back to offline engine');
    } catch (e) {
      meta.notes.push('online generation failed: ' + e.message + '; using offline engine');
    }
  } else {
    meta.notes.push('no ANTHROPIC_API_KEY; using offline engine');
  }

  // 2/3. Offline deterministic engine — always valid.
  let site = buildOfflineSite(businessDescription, { vertical, locale });
  let result = validateSite(site);
  if (!result.valid) {
    // Should never happen, but the contract is "always return valid": one
    // deterministic repair attempt by regenerating with the generic vertical.
    meta.notes.push('offline output invalid (unexpected); regenerating as generic');
    site = buildOfflineSite(businessDescription, { vertical: 'generic', locale });
    result = validateSite(site);
    meta.repaired = true;
  }
  meta.engine = apiKey ? meta.engine === 'online' ? 'online' : 'offline' : 'offline';
  meta.vertical = site.site.vertical;
  if (!result.valid) {
    // Last resort — surface errors but still return the object.
    meta.notes.push('CRITICAL: offline output failed validation: ' + result.errors.join('; '));
  }
  return { site, meta };
}

module.exports = {
  generateSite,
  inferVertical,
  buildOfflineSite,
  MODEL,
};
