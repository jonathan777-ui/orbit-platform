import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, ReferenceLine } from "recharts";

/* =========================================================================
   ORBIT AI — Airlock Unit Economics & Build-vs-Buy Calculator
   All numbers are editable estimates. Defaults reflect 2026 API/voice pricing.
   ========================================================================= */

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Familjen+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');`;

const C = {
  bg: "#04060f", panel: "rgba(255,255,255,0.03)", panel2: "rgba(255,255,255,0.06)",
  border: "rgba(150,170,235,0.16)", text: "#eaeeff", muted: "#8b96c6", faint: "#5b648c",
  cyan: "#3ce9ff", violet: "#9d6bff", green: "#3cff9d", red: "#ff6f86", amber: "#ffcf8a",
};
const money = (n) => "$" + (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());

function Field({ label, value, set, min, max, step, prefix, suffix, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>{label}</label>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: C.text, fontSize: 14 }}>{prefix}{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.cyan, cursor: "pointer" }} />
      {hint && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export default function App() {
  // volume + recurring
  const [clients, setClients] = useState(10);
  const [recMin, setRecMin] = useState(250);
  const [voicePerMin, setVoicePerMin] = useState(0.08);
  const [chatConvos, setChatConvos] = useState(80);
  const [hosting, setHosting] = useState(1.5);
  const [premium, setPremium] = useState(0.75);
  const [price, setPrice] = useState(297);
  // build route + build-vs-buy
  const [route, setRoute] = useState("inhouse"); // inhouse | flint
  const [buildInfer, setBuildInfer] = useState(0.25);
  const [flintMonthly, setFlintMonthly] = useState(120);
  const [flintPages, setFlintPages] = useState(30);
  const [flintOverage, setFlintOverage] = useState(4);
  const [devCost, setDevCost] = useState(6000);
  // floor / spread / 50-50 split
  const [platformFee, setPlatformFee] = useState(40);
  const [mgmtFee, setMgmtFee] = useState(25);
  const [setterPct, setSetterPct] = useState(40);     // % of Orbit's half paid to setters
  const [maxScaleDisc, setMaxScaleDisc] = useState(35); // max true-cost reduction at 10k clients
  const chatPerConvo = 0.003;

  const m = useMemo(() => {
    const voice = recMin * voicePerMin;
    const chat = chatConvos * chatPerConvo;
    const recurring = voice + chat + hosting + premium;          // per client / month
    const buildOnce = buildInfer + 0.01;                          // per site (audit ~ $0.01)
    const amortBuild = buildOnce / 12;                            // spread over 12 mo
    const costPerClient = recurring + amortBuild;
    const marginPerClient = price - costPerClient;
    const marginPct = price > 0 ? (marginPerClient / price) * 100 : 0;

    const breakdown = [
      { name: "Voice min", v: +voice.toFixed(2) },
      { name: "Chatbot", v: +chat.toFixed(2) },
      { name: "Hosting", v: +hosting.toFixed(2) },
      { name: "Premium AI", v: +premium.toFixed(2) },
      { name: "Site (amort)", v: +amortBuild.toFixed(2) },
    ];

    // Build vs Buy: site-generation PLATFORM only, cumulative over 24 months
    const sites = clients; // one new site per new client / month
    const rows = [];
    let crossover = null;
    for (let mo = 0; mo <= 24; mo++) {
      const flintOver = Math.max(0, sites - flintPages) * flintOverage;
      const rent = (flintMonthly + flintOver) * mo;
      const build = devCost + buildInfer * sites * mo;
      rows.push({ mo, Rent: Math.round(rent), Build: Math.round(build) });
      if (crossover === null && build <= rent && mo > 0) crossover = mo;
    }
    return { voice, recurring, costPerClient, marginPerClient, marginPct, breakdown, rows, crossover, sites,
      monthlyRevenue: price * clients, monthlyCost: costPerClient * clients, monthlyProfit: (price - costPerClient) * clients };
  }, [clients, recMin, voicePerMin, chatConvos, hosting, premium, price, buildInfer, flintMonthly, flintPages, flintOverage, devCost]);

  // FLOOR / SPREAD / SPLIT
  const f = useMemo(() => {
    const trueCost = m.costPerClient;
    const floor = trueCost + platformFee + mgmtFee;     // sacred: cost + platform + management
    const spread = Math.max(0, price - floor);          // commissionable pool
    const half = spread / 2;                            // 50/50
    const setterPay = half * (setterPct / 100);
    const orbitNet = half - setterPay;                  // Sales Co. net after paying setters
    const orbitTotal = platformFee + mgmtFee + orbitNet; // platform+mgmt margin live in floor too
    // per-deal waterfall (sums to retail)
    const waterfall = [
      { name: "True cost", v: +trueCost.toFixed(2), c: C.faint },
      { name: "Platform", v: +platformFee.toFixed(2), c: C.violet },
      { name: "Mgmt", v: +mgmtFee.toFixed(2), c: C.violet },
      { name: "Partner 50%", v: +half.toFixed(2), c: C.amber },
      { name: "Setters", v: +setterPay.toFixed(2), c: C.red },
      { name: "Orbit net", v: +orbitNet.toFixed(2), c: C.green },
    ];
    // floor decay across volume bands (true cost drops with scale; platform+mgmt fixed)
    const bands = [10, 100, 1000, 10000].map((n) => {
      const t = (Math.log10(n) - 1) / (4 - 1);                 // 0 at 10 → 1 at 10k
      const disc = (maxScaleDisc / 100) * Math.min(1, Math.max(0, t));
      const tc = trueCost * (1 - disc);
      return { name: n.toLocaleString(), Floor: +(tc + platformFee + mgmtFee).toFixed(0), disc: Math.round(disc * 100) };
    });
    return { trueCost, floor, spread, half, setterPay, orbitNet, orbitTotal, waterfall, bands,
      floorAtScale: bands[3].Floor, marginPctAtPrice: price > 0 ? (orbitTotal / price) * 100 : 0 };
  }, [m.costPerClient, platformFee, mgmtFee, price, setterPct, maxScaleDisc]);

  const card = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 };
  const stat = (label, val, color) => (
    <div style={{ ...card, flex: 1, minWidth: 150 }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: color || C.text }}>{val}</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Familjen Grotesk',sans-serif", padding: 24, minHeight: "100%" }}>
      <style>{FONT}</style>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", color: C.cyan }}>Orbit AI · Airlock</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 34, margin: "8px 0 4px" }}>Unit Economics & Build-vs-Buy</h1>
        <p style={{ color: C.muted, margin: "0 0 22px", fontSize: 15 }}>Drag the assumptions. Everything recalculates live. All figures are editable estimates.</p>

        {/* top stats */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
          {stat("Cost / client / mo", money(m.costPerClient), C.amber)}
          {stat("Margin / client / mo", money(m.marginPerClient), m.marginPerClient > 0 ? C.green : C.red)}
          {stat("Gross margin", m.marginPct.toFixed(0) + "%", m.marginPct > 0 ? C.green : C.red)}
          {stat("Monthly profit", money(m.monthlyProfit), m.monthlyProfit > 0 ? C.green : C.red)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,1fr) minmax(320px,1.4fr)", gap: 18 }}>
          {/* inputs */}
          <div style={card}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Assumptions</div>
            <Field label="Clients onboarded / mo" value={clients} set={setClients} min={1} max={200} step={1} />
            <Field label="Receptionist minutes / client / mo" value={recMin} set={setRecMin} min={0} max={2000} step={10} hint="The dominant cost — voice infra (Telnyx + Deepgram + model)." />
            <Field label="Voice cost / minute" value={voicePerMin} set={setVoicePerMin} min={0.02} max={0.25} step={0.005} prefix="$" />
            <Field label="Chatbot convos / client / mo" value={chatConvos} set={setChatConvos} min={0} max={1000} step={10} hint={`~$${chatPerConvo}/convo on DeepSeek`} />
            <Field label="Hosting / client / mo" value={hosting} set={setHosting} min={0} max={10} step={0.5} prefix="$" hint="Cloudflare Pages free + domain amortized" />
            <Field label="Premium AI upkeep / client / mo" value={premium} set={setPremium} min={0} max={10} step={0.25} prefix="$" hint="Occasional Claude calls (polish, QC)" />
            <Field label="Price you charge / client / mo" value={price} set={setPrice} min={49} max={1500} step={10} prefix="$" />
          </div>

          {/* cost breakdown */}
          <div style={card}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Where the cost actually goes</div>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 12px" }}>Per client, per month. Notice generation is rounding error — voice minutes dominate.</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={m.breakdown} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0b0f1f", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text }} formatter={(v) => money(v)} />
                <Bar dataKey="v" fill={C.cyan} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginTop: 10, fontSize: 13, color: C.text }}>
              At these inputs, <b style={{ color: C.cyan }}>{((m.voice / m.costPerClient) * 100).toFixed(0)}%</b> of your cost is receptionist voice minutes.
              Site generation + audit is <b style={{ color: C.cyan }}>{money(m.breakdown[4].v)}</b>/mo. Takeaway: meter the receptionist by minutes, give the website away nearly free.
            </div>
          </div>
        </div>

        {/* build vs buy */}
        <div style={{ ...card, marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>Build your own Flint twin vs. rent Flint</div>
              <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>Cumulative site-generation platform cost over 24 months at {m.sites} sites/mo.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {m.crossover ? (
                <><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: C.green }}>Month {m.crossover}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>in-house pays off</div></>
              ) : (
                <><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: C.amber }}>Rent wins</div>
                  <div style={{ fontSize: 12, color: C.muted }}>through 24 months at this volume</div></>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginTop: 14, alignItems: "start" }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={m.rows} margin={{ top: 6, right: 14, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="mo" tick={{ fill: C.muted, fontSize: 11 }} label={{ value: "months", position: "insideBottom", offset: -2, fill: C.faint, fontSize: 11 }} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip contentStyle={{ background: "#0b0f1f", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text }} formatter={(v) => money(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {m.crossover && <ReferenceLine x={m.crossover} stroke={C.green} strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="Rent" stroke={C.violet} strokeWidth={2.5} dot={false} name="Rent Flint" />
                <Line type="monotone" dataKey="Build" stroke={C.cyan} strokeWidth={2.5} dot={false} name="Build in-house" />
              </LineChart>
            </ResponsiveContainer>

            <div>
              <Field label="In-house dev (one-time)" value={devCost} set={setDevCost} min={0} max={30000} step={500} prefix="$" hint="You're ~70% there — generator already built; this is brand-extraction + publish." />
              <Field label="In-house cost / site" value={buildInfer} set={setBuildInfer} min={0.05} max={2} step={0.05} prefix="$" hint="DeepSeek draft + Claude polish inference" />
              <Field label="Flint subscription / mo" value={flintMonthly} set={setFlintMonthly} min={0} max={1000} step={10} prefix="$" />
              <Field label="Flint pages included / mo" value={flintPages} set={setFlintPages} min={1} max={300} step={1} hint="Confirm this on Flint's pricing page" />
              <Field label="Flint overage / page" value={flintOverage} set={setFlintOverage} min={0} max={20} step={0.5} prefix="$" />
            </div>
          </div>

          <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginTop: 6, fontSize: 13, color: C.text }}>
            {m.crossover
              ? <>At {m.sites} new sites/mo, building your twin beats renting Flint after <b style={{ color: C.green }}>{m.crossover} months</b>. Below that, rent and ship revenue now; build in parallel.</>
              : <>At {m.sites} new sites/mo, <b style={{ color: C.amber }}>renting Flint is cheaper for 2+ years</b> — your volume doesn't justify the in-house build yet. Rent now; revisit when you scale sites/mo or your dev cost drops.</>}
            {" "}The lever is volume: push the clients/mo and dev-cost sliders to find your real crossover.
          </div>
        </div>

        {/* floor / spread / split */}
        <div style={{ ...card, marginTop: 18 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>Floor, spread &amp; the 50/50 split</div>
          <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 14px" }}>
            The floor (true cost + platform + management) is sacred. Only the spread above it splits 50/50 — setters paid from Orbit's half.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1fr) minmax(300px,1.3fr)", gap: 18 }}>
            {/* inputs + per-deal waterfall */}
            <div>
              <Field label="Platform fee / client / mo" value={platformFee} set={setPlatformFee} min={0} max={150} step={1} prefix="$" hint="Margin — lives inside the floor" />
              <Field label="Management fee / client / mo" value={mgmtFee} set={setMgmtFee} min={0} max={150} step={1} prefix="$" hint="Margin — lives inside the floor" />
              <Field label="Setter payout (% of Orbit's half)" value={setterPct} set={setSetterPct} min={0} max={100} step={5} suffix="%" />
              <Field label="Max cost reduction at 10k clients" value={maxScaleDisc} set={setMaxScaleDisc} min={0} max={70} step={5} suffix="%" hint="How far true cost falls with scale" />
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <div style={{ flex: 1, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>Floor</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: C.violet }}>{money(f.floor)}</div>
                </div>
                <div style={{ flex: 1, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>Spread</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: C.amber }}>{money(f.spread)}</div>
                </div>
              </div>
            </div>

            {/* waterfall */}
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Per-deal waterfall at retail {money(price)} — sums to the price the client pays</div>
              {f.waterfall.map((w) => (
                <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <div style={{ width: 84, fontSize: 12, color: C.muted, textAlign: "right" }}>{w.name}</div>
                  <div style={{ flex: 1, background: C.panel2, borderRadius: 6, height: 22, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (w.v / price) * 100)}%`, height: "100%", background: w.c, borderRadius: 6 }} />
                  </div>
                  <div style={{ width: 64, fontFamily: "'Space Mono',monospace", fontSize: 12, color: C.text, textAlign: "right" }}>{money(w.v)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.muted }}>
                <span>Partner keeps <b style={{ color: C.amber }}>{money(f.half)}</b></span>
                <span>Orbit total <b style={{ color: C.green }}>{money(f.orbitTotal)}</b> ({f.marginPctAtPrice.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* floor by volume */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Floor falls as volume lowers true cost — your price ceiling drops, platform + management margin stays intact</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={f.bands} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} label={{ value: "clients on network", position: "insideBottom", offset: -2, fill: C.faint, fontSize: 11 }} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={(v) => "$" + v} />
                <Tooltip contentStyle={{ background: "#0b0f1f", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text }} formatter={(v, n, p) => [money(v) + ` (−${p.payload.disc}% cost)`, "Floor"]} />
                <ReferenceLine y={price} stroke={C.amber} strokeDasharray="4 4" label={{ value: `retail ${money(price)}`, fill: C.amber, fontSize: 10, position: "insideTopRight" }} />
                <Bar dataKey="Floor" fill={C.violet} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginTop: 6, fontSize: 13, color: C.text }}>
            At scale your floor drops from <b style={{ color: C.violet }}>{money(f.floor)}</b> to <b style={{ color: C.violet }}>{money(f.floorAtScale)}</b> (10k clients).
            That's how low you could price and still fund platform + management — a wall a fresh competitor can't get under. The spread above it is the only thing that ever splits.
          </div>
        </div>

        <p style={{ color: C.faint, fontSize: 12, marginTop: 16, textAlign: "center" }}>
          Estimates only — confirm voice rates (Telnyx/Deepgram), Flint quotas, and your dev cost. Build-vs-buy isolates the generation platform; voice, hosting, and CRM are the same on both sides.
        </p>
      </div>
    </div>
  );
}
