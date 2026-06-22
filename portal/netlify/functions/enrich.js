// Orbit enrichment — finds a business's website, logo, brand color, description & services
// from just a name (+ optional city/state). Uses Anthropic web_search server-side when
// ANTHROPIC_API_KEY is set; ALWAYS degrades gracefully to {found:false} so the hub falls
// back to Company name + Hours of Operation. Logo/brand discovery from the homepage needs
// no key (it just reads public <meta>/<link> tags), with a Google-favicon fallback.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

function hostOf(u) {
  if (!u) return "";
  try { return new URL(/^https?:\/\//.test(u) ? u : "https://" + u).hostname.replace(/^www\./, ""); }
  catch (e) { return ""; }
}
function normalize(u) {
  if (!u) return "";
  return /^https?:\/\//.test(u) ? u : "https://" + u;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "{}" };
  const ok = (obj) => ({ statusCode: 200, headers: CORS, body: JSON.stringify(obj) });

  try {
    const { name, city, state, url, hours } = JSON.parse(event.body || "{}");
    if (!name) return ok({ found: false, reason: "no business name" });

    let website = (url || "").trim();
    let facts = {};
    const key = process.env.ANTHROPIC_API_KEY;

    // 1) Web search for the official site + public facts (only when a key is configured).
    if (key) {
      try {
        const sys = "You are a precise local-business researcher. Use web search to find the OFFICIAL website and public details for the business named. Prefer the business's own domain over directories (Yelp, Facebook, MapQuest). If you cannot confidently find the official site, leave official_website empty. Reply with ONLY strict minified JSON — no prose, no markdown, no code fences.";
        const loc = [city, state].filter(Boolean).join(", ");
        const q = "Business: " + name + (loc ? " (" + loc + ")" : "") + "."
          + (website ? " Possible site: " + website + "." : "")
          + ' Return JSON exactly: {"official_website":"","one_line_description":"","services":[],"hours":"","brand_color_hex":""}.'
          + " services = up to 6 short service names. brand_color_hex = primary brand color as #RRGGBB if visible, else empty.";
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({
            model: process.env.ENRICH_MODEL || "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: sys,
            messages: [{ role: "user", content: q }],
            tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }]
          })
        });
        const d = await r.json();
        let text = ""; (d.content || []).forEach(b => { if (b.type === "text") text += b.text; });
        const m = text.match(/\{[\s\S]*\}/);
        if (m) { try { facts = JSON.parse(m[0]); } catch (e) {} }
        if (!website && facts.official_website) website = facts.official_website.trim();
      } catch (e) { /* swallow — fall through to no-key path */ }
    }

    // 2) Derive logo + accent + description from the homepage (no key required).
    let logo = "", accent = (facts.brand_color_hex || "").trim();
    let desc = (facts.one_line_description || "").trim();
    let services = Array.isArray(facts.services) ? facts.services.filter(Boolean).slice(0, 6) : [];
    const domain = hostOf(website);

    if (domain) {
      try {
        const resp = await fetch(normalize(website), {
          headers: { "user-agent": "Mozilla/5.0 (compatible; OrbitBot/1.0)" },
          redirect: "follow"
        });
        const html = (await resp.text()).slice(0, 400000);
        const pick = (re) => { const x = html.match(re); return x ? x[1].trim() : ""; };
        const abs = (u) => {
          if (!u) return "";
          if (/^https?:\/\//.test(u)) return u;
          if (u.indexOf("//") === 0) return "https:" + u;
          if (u.charAt(0) === "/") return "https://" + domain + u;
          return "https://" + domain + "/" + u;
        };
        const apple = pick(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
          || pick(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*apple-touch-icon/i);
        const ogimg = pick(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
          || pick(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        const iconL = pick(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
        const themeC = pick(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
        if (!desc) desc = pick(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (!accent && themeC) {
          const c = themeC.charAt(0) === "#" ? themeC : "#" + themeC;
          if (/^#[0-9a-f]{3,8}$/i.test(c)) accent = c;
        }
        logo = abs(apple) || abs(ogimg) || abs(iconL);
      } catch (e) { /* page fetch failed — use favicon fallback below */ }
      if (!logo) logo = "https://www.google.com/s2/favicons?sz=128&domain=" + domain;
    }

    const found = !!(website || logo || desc || services.length);
    return ok({
      found: found,
      website: website || "",
      domain: domain || "",
      logo: logo || "",
      accent: accent || "",
      description: desc || "",
      services: services,
      hours: (facts.hours || hours || ""),
      verify: true,
      note: key ? undefined : "no ANTHROPIC_API_KEY — web search skipped; set it in Netlify env to enable site/branding discovery"
    });
  } catch (e) {
    return ok({ found: false, error: String(e) });
  }
};
