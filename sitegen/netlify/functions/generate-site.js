// netlify/functions/generate-site.js
//
// Netlify Function wrapper around the SiteGen pipeline, mirroring the existing
// portal/netlify/functions/claude.js style: CORS preflight handling, JSON body
// in / JSON out, and graceful behavior with NO API key (the deterministic
// offline engine runs server-side).
//
// Deploys on the repo's existing Netlify setup. ANTHROPIC_API_KEY, if set as a
// Netlify environment variable, is picked up automatically by generate.js via
// process.env. Zero npm dependencies — pure Node built-ins + the local src/.
//
// Request:  POST { description, vertical }
// Response: { site, html, engine, valid }

'use strict';

const { generateSite } = require('../../src/generate');
const { renderSite } = require('../../src/render');
const { validateSite } = require('../../src/validate');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async function handler(event) {
  // Preflight.
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  let input;
  try {
    input = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'invalid JSON body' }) };
  }

  const description = (input.description || '').trim();
  if (!description) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'description is required' }) };
  }

  try {
    const { site, meta } = await generateSite(description, { vertical: input.vertical });
    const result = validateSite(site);
    const html = renderSite(site);
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ site, html, engine: meta.engine, valid: result.valid, meta }),
    };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
