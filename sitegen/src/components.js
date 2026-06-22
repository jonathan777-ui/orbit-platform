// components.js — the component catalog.
//
// For each block type in the schema we expose:
//   - defaults: prop defaults applied before render (keeps render pure)
//   - renderToHtml(props, theme): returns a semantic, accessible HTML string
//
// Rendering is the second half of the "schema is the single source of truth"
// thesis: the validated schema tree is walked and each node becomes HTML here.
// Styling is driven entirely by CSS custom properties defined by the renderer
// (see render.js), so components stay theme-agnostic.

'use strict';

// Minimal HTML escaper — all schema-derived strings pass through this.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function renderHero(props) {
  const variant = props.variant || 'centered';
  const cta =
    props.ctaLabel && props.ctaHref
      ? `<a class="btn btn-primary" href="${esc(props.ctaHref)}">${esc(props.ctaLabel)}</a>`
      : '';
  return `
  <section class="hero hero-${esc(variant)}" aria-label="Hero">
    <div class="container">
      <h1 class="hero-headline">${esc(props.headline)}</h1>
      <p class="hero-subhead">${esc(props.subhead)}</p>
      ${cta}
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------
function renderFeatures(props) {
  const variant = props.variant || 'grid';
  const items = (props.items || [])
    .map(
      (it) => `
        <div class="feature">
          ${it.icon ? `<div class="feature-icon" aria-hidden="true">${esc(it.icon)}</div>` : ''}
          <h3 class="feature-title">${esc(it.title)}</h3>
          <p class="feature-body">${esc(it.body)}</p>
        </div>`
    )
    .join('');
  return `
  <section class="features features-${esc(variant)}" aria-label="Features">
    <div class="container">
      <h2 class="section-heading">${esc(props.heading)}</h2>
      <div class="feature-list">${items}</div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
function renderServices(props) {
  const variant = props.variant || 'cards';
  const items = (props.items || [])
    .map(
      (it) => `
        <article class="service">
          <h3 class="service-name">${esc(it.name)}</h3>
          <p class="service-desc">${esc(it.description)}</p>
          ${it.price ? `<p class="service-price">${esc(it.price)}</p>` : ''}
        </article>`
    )
    .join('');
  return `
  <section class="services services-${esc(variant)}" aria-label="Services">
    <div class="container">
      <h2 class="section-heading">${esc(props.heading)}</h2>
      <div class="service-list">${items}</div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// PricingTable
// ---------------------------------------------------------------------------
function renderPricingTable(props) {
  const tiers = (props.tiers || [])
    .map((t) => {
      const feats = (t.features || []).map((f) => `<li>${esc(f)}</li>`).join('');
      const period = t.period ? `<span class="tier-period">${esc(t.period)}</span>` : '';
      return `
        <div class="tier${t.highlighted ? ' tier-highlighted' : ''}">
          <h3 class="tier-name">${esc(t.name)}</h3>
          <p class="tier-price">${esc(t.price)}${period}</p>
          <ul class="tier-features">${feats}</ul>
        </div>`;
    })
    .join('');
  return `
  <section class="pricing" aria-label="Pricing">
    <div class="container">
      <h2 class="section-heading">${esc(props.heading)}</h2>
      <div class="tier-list">${tiers}</div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
function renderTestimonials(props) {
  const items = (props.items || [])
    .map(
      (it) => `
        <figure class="testimonial">
          <blockquote class="testimonial-quote">${esc(it.quote)}</blockquote>
          <figcaption class="testimonial-author">
            ${esc(it.author)}${it.role ? `<span class="testimonial-role">${esc(it.role)}</span>` : ''}
          </figcaption>
        </figure>`
    )
    .join('');
  return `
  <section class="testimonials" aria-label="Testimonials">
    <div class="container">
      <h2 class="section-heading">${esc(props.heading)}</h2>
      <div class="testimonial-list">${items}</div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// ContactForm
// ---------------------------------------------------------------------------
function renderContactForm(props) {
  const fields = (props.fields && props.fields.length ? props.fields : DEFAULT_CONTACT_FIELDS)
    .map((f) => {
      const id = 'cf-' + esc(f.name);
      const req = f.required ? ' required' : '';
      const control =
        f.kind === 'textarea'
          ? `<textarea id="${id}" name="${esc(f.name)}" rows="4"${req}></textarea>`
          : `<input id="${id}" name="${esc(f.name)}" type="${esc(f.kind)}"${req}>`;
      return `
        <div class="form-row">
          <label for="${id}">${esc(f.label)}</label>
          ${control}
        </div>`;
    })
    .join('');
  return `
  <section class="contact" aria-label="Contact">
    <div class="container">
      <h2 class="section-heading">${esc(props.heading)}</h2>
      ${props.subhead ? `<p class="contact-subhead">${esc(props.subhead)}</p>` : ''}
      <form class="contact-form" method="post" action="#" novalidate>
        ${fields}
        <button class="btn btn-primary" type="submit">${esc(props.submitLabel || 'Send')}</button>
      </form>
    </div>
  </section>`;
}

const DEFAULT_CONTACT_FIELDS = [
  { name: 'name', label: 'Name', kind: 'text', required: true },
  { name: 'email', label: 'Email', kind: 'email', required: true },
  { name: 'phone', label: 'Phone', kind: 'tel', required: false },
  { name: 'message', label: 'How can we help?', kind: 'textarea', required: true },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function renderFooter(props) {
  const contact = [
    props.phone ? `<a href="tel:${esc(props.phone)}">${esc(props.phone)}</a>` : '',
    props.email ? `<a href="mailto:${esc(props.email)}">${esc(props.email)}</a>` : '',
    props.address ? `<span>${esc(props.address)}</span>` : '',
  ]
    .filter(Boolean)
    .join('<span class="dot" aria-hidden="true">&middot;</span>');
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer" aria-label="Footer">
    <div class="container">
      <p class="footer-brand">${esc(props.businessName)}</p>
      ${props.tagline ? `<p class="footer-tagline">${esc(props.tagline)}</p>` : ''}
      ${contact ? `<p class="footer-contact">${contact}</p>` : ''}
      <p class="footer-legal">&copy; ${year} ${esc(props.businessName)}. All rights reserved.</p>
    </div>
  </footer>`;
}

// Catalog: block type -> { defaults, renderToHtml }. `theme` is accepted by
// every renderer for forward-compatibility even where unused today.
const CATALOG = {
  Hero: { defaults: { variant: 'centered' }, renderToHtml: (p) => renderHero(p) },
  Features: { defaults: { variant: 'grid' }, renderToHtml: (p) => renderFeatures(p) },
  Services: { defaults: { variant: 'cards' }, renderToHtml: (p) => renderServices(p) },
  PricingTable: { defaults: {}, renderToHtml: (p) => renderPricingTable(p) },
  Testimonials: { defaults: {}, renderToHtml: (p) => renderTestimonials(p) },
  ContactForm: { defaults: { submitLabel: 'Send' }, renderToHtml: (p) => renderContactForm(p) },
  Footer: { defaults: {}, renderToHtml: (p) => renderFooter(p) },
};

/** Render a single block to HTML, applying its prop defaults first. */
function renderBlock(block, theme) {
  const entry = CATALOG[block.type];
  if (!entry) return `<!-- unknown block type: ${esc(block.type)} -->`;
  const props = Object.assign({}, entry.defaults, block);
  return entry.renderToHtml(props, theme);
}

module.exports = { CATALOG, renderBlock, esc, DEFAULT_CONTACT_FIELDS };
