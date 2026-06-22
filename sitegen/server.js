// server.js — a tiny zero-dependency HTTP server.
//
//   node server.js   (PORT env optional, default 3000)
//
// Serves:
//   GET  /                 -> public/index.html (the demo editor entry point)
//   POST /api/generate     -> { site, html, engine }   body: { description, vertical }
//
// Uses only Node built-ins (http, fs). The generation/render pipeline is shared
// with the CLI and Netlify function.

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const { generateSite } = require('./src/generate');
const { renderSite } = require('./src/render');
const { validateSite } = require('./src/validate');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'content-type': 'application/json' }, headers || {}));
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) {
        // 1MB guard
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS (so the demo / other origins can call the API).
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Static: home page.
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    try {
      const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
      send(res, 200, html, { 'content-type': 'text/html; charset=utf-8' });
    } catch (e) {
      send(res, 500, { error: 'could not read public/index.html' });
    }
    return;
  }

  // API: generate.
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    try {
      const raw = await readBody(req);
      const input = raw ? JSON.parse(raw) : {};
      const description = (input.description || '').trim();
      if (!description) {
        send(res, 400, { error: 'description is required' });
        return;
      }
      const { site, meta } = await generateSite(description, { vertical: input.vertical });
      const result = validateSite(site);
      const html = renderSite(site);
      send(res, 200, { site, html, engine: meta.engine, valid: result.valid, meta });
    } catch (e) {
      send(res, 500, { error: String(e.message || e) });
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`SiteGen server listening on http://localhost:${PORT}`);
  console.log(`  GET  /              demo UI`);
  console.log(`  POST /api/generate  { description, vertical }`);
});

module.exports = server;
