// themes.js — vertical theme catalog.
//
// SiteGen follows the Alyxir "vertical-theme-driven" thesis: each business
// vertical maps to a distinct, opinionated visual identity (palette + type
// pairing + hero treatment). These tokens are the concrete values the schema's
// `theme.palette` / `theme.heroStyle` enums refer to, and the renderer turns
// them into CSS custom properties + Google Fonts links.
//
// Palettes were drawn to match the documented vertical specs: industrial
// cyan/amber for home services, gold/navy for law, rose/champagne for med-spa,
// rust/wheat for restaurants. Fonts are real Google Fonts pairings.

'use strict';

// Palette token sets. Each provides the variables the renderer interpolates
// into :root { ... }. Colors are chosen for AA contrast on their surfaces.
const PALETTES = {
  'cyan-amber': {
    bg: '#0f1419',
    surface: '#161d26',
    text: '#e8edf2',
    muted: '#9fb0c0',
    primary: '#22d3ee', // cyan
    accent: '#f59e0b', // amber
    onPrimary: '#06141a',
    onAccent: '#1a1205',
    border: '#2a3744',
  },
  'gold-navy': {
    bg: '#0c1830',
    surface: '#13213f',
    text: '#eef2f8',
    muted: '#b6c2d6',
    primary: '#c8a64b', // gold
    accent: '#1e3a5f', // navy accent
    onPrimary: '#1a1505',
    onAccent: '#ffffff',
    border: '#26395c',
  },
  'rose-champagne': {
    bg: '#fbf6f3',
    surface: '#ffffff',
    text: '#3a2c2c',
    muted: '#8a7575',
    primary: '#c8849a', // rose
    accent: '#e6d2b5', // champagne
    onPrimary: '#ffffff',
    onAccent: '#4a3a28',
    border: '#ecdcd6',
  },
  'rust-wheat': {
    bg: '#1c1410',
    surface: '#26190f',
    text: '#f3e9dd',
    muted: '#c2ab94',
    primary: '#b4502c', // rust
    accent: '#d8b169', // wheat
    onPrimary: '#fff6ef',
    onAccent: '#2a1c0e',
    border: '#3a2a1c',
  },
  'slate-emerald': {
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#e2e8f0',
    muted: '#94a3b8',
    primary: '#10b981', // emerald
    accent: '#38bdf8', // sky
    onPrimary: '#04221a',
    onAccent: '#04202c',
    border: '#334155',
  },
};

// Vertical -> theme token mapping. fontHeading/fontBody are Google Font family
// names; the renderer builds the <link> + CSS font-family stacks from them.
const VERTICAL_THEMES = {
  'home-services': {
    palette: 'cyan-amber',
    fontHeading: 'Anton',
    fontBody: 'Archivo',
    heroStyle: 'industrial',
  },
  law: {
    palette: 'gold-navy',
    fontHeading: 'Libre Baskerville',
    fontBody: 'Source Sans 3',
    heroStyle: 'elegant',
  },
  'med-spa': {
    palette: 'rose-champagne',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Jost',
    heroStyle: 'luxe',
  },
  restaurant: {
    palette: 'rust-wheat',
    fontHeading: 'Playfair Display',
    fontBody: 'Lato',
    heroStyle: 'editorial',
  },
  generic: {
    palette: 'slate-emerald',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter',
    heroStyle: 'minimal',
  },
};

// Fallback font stacks so output renders sensibly even if Google Fonts is
// blocked (offline-first principle).
const HEADING_FALLBACK = "'Helvetica Neue', Arial, sans-serif";
const BODY_FALLBACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Return the theme tokens for a vertical (falls back to generic). */
function themeForVertical(vertical) {
  return VERTICAL_THEMES[vertical] || VERTICAL_THEMES.generic;
}

/** Resolve a palette token-set by name (falls back to slate-emerald). */
function paletteTokens(name) {
  return PALETTES[name] || PALETTES['slate-emerald'];
}

/** Build a Google Fonts stylesheet URL for the heading + body families. */
function googleFontsUrl(fontHeading, fontBody) {
  const fam = (name, weights) =>
    'family=' + encodeURIComponent(name).replace(/%20/g, '+') + ':wght@' + weights;
  const families = [fam(fontHeading, '400;700;900'), fam(fontBody, '400;600')];
  return 'https://fonts.googleapis.com/css2?' + families.join('&') + '&display=swap';
}

/** CSS font-family stack with a graceful offline fallback. */
function headingStack(fontHeading) {
  return `'${fontHeading}', ${HEADING_FALLBACK}`;
}
function bodyStack(fontBody) {
  return `'${fontBody}', ${BODY_FALLBACK}`;
}

module.exports = {
  PALETTES,
  VERTICAL_THEMES,
  themeForVertical,
  paletteTokens,
  googleFontsUrl,
  headingStack,
  bodyStack,
};
