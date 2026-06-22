// render.js — turn a validated site schema into a complete static HTML doc.
//
// This is the shared renderer used by the CLI, the dev server, and the Netlify
// function. It consumes ONLY the schema (the single source of truth): theme
// tokens become CSS custom properties, and each content block is rendered via
// the component catalog.

'use strict';

const { renderBlock, esc } = require('./components');
const themes = require('./themes');

// Static stylesheet. All vertical/theme variation flows through the CSS
// variables set per-site in renderThemeVars(); this sheet only references them.
const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.6;font-size:17px}
h1,h2,h3{font-family:var(--font-heading);line-height:1.1;margin:0 0 .4em}
a{color:var(--primary)}
.container{max-width:1080px;margin:0 auto;padding:0 24px}
section{padding:72px 0;border-bottom:1px solid var(--border)}
.section-heading{font-size:2rem;margin-bottom:1.2em;text-align:center}
.btn{display:inline-block;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:8px;border:none;cursor:pointer;font-size:1rem}
.btn-primary{background:var(--primary);color:var(--on-primary)}
.btn-primary:hover{filter:brightness(1.08)}
/* Site nav */
.site-nav{position:sticky;top:0;z-index:10;background:var(--surface);border-bottom:1px solid var(--border)}
.site-nav .container{display:flex;align-items:center;justify-content:space-between;padding-top:16px;padding-bottom:16px}
.nav-logo{font-family:var(--font-heading);font-weight:700;font-size:1.25rem;color:var(--text);text-decoration:none;letter-spacing:.02em}
.nav-links{display:flex;gap:24px;flex-wrap:wrap}
.nav-links a{color:var(--muted);text-decoration:none;font-weight:600;font-size:.95rem}
.nav-links a:hover{color:var(--primary)}
/* Hero */
.hero{padding:120px 0;background:linear-gradient(135deg,var(--surface),var(--bg))}
.hero-centered{text-align:center}
.hero-banner{text-align:left}
.hero-headline{font-size:clamp(2.4rem,6vw,4.2rem);color:var(--text)}
.hero-subhead{font-size:1.25rem;color:var(--muted);max-width:640px;margin:0 auto 2em}
.hero-banner .hero-subhead{margin-left:0}
/* Features */
.feature-list{display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.features-list .feature-list{grid-template-columns:1fr;max-width:720px;margin:0 auto}
.feature{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px}
.feature-icon{font-size:1.8rem;margin-bottom:.4em}
.feature-title{font-size:1.2rem;color:var(--text)}
.feature-body{color:var(--muted);margin:0}
/* Services */
.service-list{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.services-rows .service-list{grid-template-columns:1fr}
.service{background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:10px;padding:24px}
.service-name{font-size:1.25rem;color:var(--text)}
.service-desc{color:var(--muted)}
.service-price{font-weight:700;color:var(--accent);margin:0}
/* Pricing */
.tier-list{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.tier{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center}
.tier-highlighted{border-color:var(--primary);box-shadow:0 0 0 2px var(--primary)}
.tier-name{font-size:1.3rem;color:var(--text)}
.tier-price{font-size:2.2rem;font-weight:800;color:var(--primary);margin:.2em 0 .8em}
.tier-period{font-size:1rem;color:var(--muted);font-weight:400}
.tier-features{list-style:none;padding:0;margin:0;color:var(--muted);text-align:left}
.tier-features li{padding:8px 0;border-top:1px solid var(--border)}
/* Testimonials */
.testimonial-list{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.testimonial{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;margin:0}
.testimonial-quote{margin:0 0 1em;font-style:italic;color:var(--text)}
.testimonial-author{font-weight:700;color:var(--accent)}
.testimonial-role{display:block;font-weight:400;color:var(--muted);font-size:.9rem}
/* Contact */
.contact-subhead{text-align:center;color:var(--muted);margin-bottom:2em}
.contact-form{max-width:560px;margin:0 auto;display:grid;gap:18px}
.form-row{display:grid;gap:6px}
.form-row label{font-weight:600;color:var(--text)}
.form-row input,.form-row textarea{padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font:inherit}
/* Footer */
.site-footer{padding:48px 0;text-align:center;background:var(--surface);border-bottom:none}
.footer-brand{font-family:var(--font-heading);font-size:1.4rem;color:var(--text);margin:0}
.footer-tagline{color:var(--muted);margin:.3em 0 1em}
.footer-contact a{color:var(--primary);text-decoration:none}
.footer-contact .dot{margin:0 10px;color:var(--muted)}
.footer-legal{color:var(--muted);font-size:.85rem;margin-top:1.4em}
`;

// Build the :root { --bg: ...; } block from the resolved palette + fonts.
function renderThemeVars(theme) {
  const p = themes.paletteTokens(theme.palette);
  const vars = {
    '--bg': p.bg,
    '--surface': p.surface,
    '--text': p.text,
    '--muted': p.muted,
    '--primary': p.primary,
    '--accent': p.accent,
    '--on-primary': p.onPrimary,
    '--on-accent': p.onAccent,
    '--border': p.border,
    '--font-heading': themes.headingStack(theme.fontHeading),
    '--font-body': themes.bodyStack(theme.fontBody),
  };
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join('');
  return `:root{${body}}`;
}

// Sticky top navigation derived from site.nav.
function renderNav(nav) {
  const links = (nav.links || [])
    .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
    .join('');
  return `
  <nav class="site-nav" aria-label="Primary">
    <div class="container">
      <a class="nav-logo" href="#">${esc(nav.logoText)}</a>
      <div class="nav-links">${links}</div>
    </div>
  </nav>`;
}

/**
 * Render a validated site schema to a complete HTML document string.
 * Renders the first page (the homepage MVP); multi-page routing is a later
 * phase but the schema already carries every page.
 */
function renderSite(site) {
  const s = site.site;
  const theme = s.theme;
  const page = s.pages[0];

  const fontsUrl = themes.googleFontsUrl(theme.fontHeading, theme.fontBody);
  const body = page.content.map((block) => renderBlock(block, theme)).join('\n');

  return `<!DOCTYPE html>
<html lang="${esc(s.locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.meta.description)}">
  <meta name="generator" content="SiteGen (Orbit) — schema-driven">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${esc(fontsUrl)}">
  <style>${renderThemeVars(theme)}${BASE_CSS}</style>
</head>
<body data-vertical="${esc(s.vertical)}" data-hero="${esc(theme.heroStyle)}">
${renderNav(s.nav)}
<main>
${body}
</main>
</body>
</html>`;
}

module.exports = { renderSite, renderThemeVars, BASE_CSS };
