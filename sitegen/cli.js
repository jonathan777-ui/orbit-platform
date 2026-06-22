#!/usr/bin/env node
// cli.js — generate a site from the command line.
//
//   node cli.js "<business description>" [vertical]
//
// Writes out/site.json and out/index.html, prints a summary (vertical,
// sections, validation result, engine used). Set ANTHROPIC_API_KEY to use
// Claude; otherwise the deterministic offline engine runs.

'use strict';

const fs = require('fs');
const path = require('path');

const { generateSite } = require('./src/generate');
const { renderSite } = require('./src/render');
const { validateSite } = require('./src/validate');

async function main() {
  const args = process.argv.slice(2);
  const description = args[0];
  const vertical = args[1]; // optional

  if (!description) {
    console.error('Usage: node cli.js "<business description>" [vertical]');
    console.error('  vertical: home-services | law | med-spa | restaurant | generic');
    process.exit(1);
  }

  const outDir = path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });

  const { site, meta } = await generateSite(description, { vertical });
  const result = validateSite(site);
  const html = renderSite(site);

  const jsonPath = path.join(outDir, 'site.json');
  const htmlPath = path.join(outDir, 'index.html');
  fs.writeFileSync(jsonPath, JSON.stringify(site, null, 2));
  fs.writeFileSync(htmlPath, html);

  const sections = site.site.pages[0].content.map((b) => b.type);

  console.log('SiteGen — generation complete');
  console.log('  business     :', site.site.name);
  console.log('  vertical     :', site.site.vertical);
  console.log('  engine       :', meta.engine, meta.engine === 'offline' ? '(no API key / fallback)' : '(Claude)');
  console.log('  palette      :', site.site.theme.palette, '/', site.site.theme.heroStyle);
  console.log('  sections     :', sections.join(' > '));
  console.log('  validation   :', result.valid ? 'OK' : 'FAILED');
  if (!result.valid) result.errors.forEach((e) => console.log('     -', e));
  if (meta.notes.length) meta.notes.forEach((n) => console.log('  note         :', n));
  console.log('  wrote        :', path.relative(process.cwd(), jsonPath));
  console.log('  wrote        :', path.relative(process.cwd(), htmlPath));

  process.exitCode = result.valid ? 0 : 2;
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
