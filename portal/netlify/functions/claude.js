// Optional live LLM for the chatbot/receptionist. Generation + offline answers work WITHOUT this.
// Set ANTHROPIC_API_KEY in Netlify env to enable live answers. MODEL is optional.
exports.handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "{}" };
  try {
    const { system, messages } = JSON.parse(event.body || "{}");
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { statusCode: 200, headers: cors, body: JSON.stringify({ text: null, note: "no key — using offline engine" }) };
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.MODEL || "claude-haiku-4-5-20251001", max_tokens: 400, system: system || "", messages: messages || [] })
    });
    const d = await r.json();
    let text = ""; (d.content || []).forEach(b => { if (b.type === "text") text += b.text; });
    return { statusCode: 200, headers: cors, body: JSON.stringify({ text: text || null }) };
  } catch (e) {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ text: null, error: String(e) }) };
  }
};
