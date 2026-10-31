// Escenas de Reel 1080×1920 (capas transparentes sobre video/foto).
// Cada escena recibe p ∈ [0,1] = progreso de su animación de entrada; el generador
// renderiza fotogramas con p creciente y luego congela el último.
import { Logo, Confotur } from "./common.jsx";
import { Icon, AMENIDADES } from "../components/Icons.jsx";
import { fmtMoney, fmtNum, splitAcento, splitScript, SAFE, precioTexto, precioRotulo } from "../lib/format.js";
import { dimsOf } from "./Ficha.jsx";
import { centroid } from "./Lote.jsx";

const W = 1080, H = 1920;
const SV = SAFE.vertical;
const SAFE_BOTTOM = SV.bottom; // caption, usuario, audio (IG Reels + TikTok)
const L0 = SV.left + 4, R0 = SV.right + 10; // márgenes de texto
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
// entrada escalonada: elemento i arranca en i*step
const enter = (p, i = 0, step = 0.12, dur = 0.5) => {
  const e = ease((p - i * step) / dur);
  return { opacity: e, transform: `translateY(${(1 - e) * 46}px)` };
};

function Chrome({ d, dark = true }) {
  return (
    <>
      <div style={{ position: "absolute", inset: "0 0 auto 0", height: 420, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: L0, top: SV.top + 10 }}><Logo variant={dark ? "blanco" : "rojo"} height={52} /></div>
      <div style={{ position: "absolute", right: R0, top: SV.top }}><Confotur show={d.confotur} size={130} /></div>
    </>
  );
}

const Shade = ({ h = 1100 }) => <div style={{ position: "absolute", inset: "auto 0 0 0", height: h, background: "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,0))" }} />;

function Gancho({ d, p }) {
  const texto = d.hook_reel || d.titulo || "";
  const parts = /\*/.test(texto) ? splitScript(texto).map((x) => ({ t: x.t, s: x.s })) : splitAcento(texto, d.palabra_acento).map((x) => ({ t: x.t, a: x.a }));
  const tag = d.tipo === "lote" ? (d.operacion === "alquiler" ? "Terreno en alquiler" : "Terreno en venta") : (d.etiqueta || (d.operacion === "temporal" ? "Alquiler temporal" : d.operacion === "alquiler" ? "En alquiler" : "En venta"));
  return (
    <>
      <Chrome d={d} /><Shade h={1300} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 30, color: "#fff" }}>
        <div style={{ ...enter(p, 0), display: "inline-block", background: "var(--kx-red)", font: "800 28px var(--font-head)", letterSpacing: ".2em", textTransform: "uppercase", padding: "14px 26px" }}>{tag}</div>
        <h1 style={{ ...enter(p, 1), font: "900 108px/1.0 var(--font-head)", letterSpacing: "-0.015em", marginTop: 34, textShadow: "0 4px 30px rgba(0,0,0,.35)" }}>
          {parts.map((x, i) => <span key={i} className={x.s ? "script" : ""} style={x.a || x.s ? { color: "var(--kx-gold)", fontSize: x.s ? "1.12em" : undefined, fontWeight: x.s ? 400 : undefined } : undefined}>{x.t}</span>)}
        </h1>
        <div style={{ ...enter(p, 2), display: "flex", alignItems: "center", gap: 12, marginTop: 30, font: "600 34px var(--font-body)" }}>
          <Icon name="pin" style={{ width: 40, height: 40, color: "var(--kx-gold)", strokeWidth: 2.6 }} />
          {[d.proyecto, d.zona].filter(Boolean).join(" · ")}
        </div>
      </div>
    </>
  );
}

function Medidas({ d, p }) {
  const dims = dimsOf(d);
  return (
    <>
      <Chrome d={d} /><Shade h={900} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 20 }}>
        <div style={{ ...enter(p, 0), color: "#fff", font: "800 26px var(--font-head)", letterSpacing: ".26em", marginBottom: 18, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>LA PROPIEDAD</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {dims.map((x, i) => (
            <div key={i} style={{ ...enter(p, i + 1, 0.1), background: "var(--kx-cream)", borderRadius: 24, padding: "28px 30px", boxShadow: "0 12px 30px rgba(0,0,0,.25)" }}>
              <b style={{ display: "block", font: "900 66px/1 var(--font-head)", color: "var(--kx-ink)", whiteSpace: "nowrap" }}>{x.v}{x.u ? <sup style={{ fontSize: 30 }}> {x.u}</sup> : null}</b>
              <span style={{ display: "block", marginTop: 10, font: "700 20px var(--font-head)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--kx-red)" }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Amenidades({ d, p }) {
  const am = (d.amenidades || []).filter((a) => AMENIDADES[a]).slice(0, 6);
  const extra = (d.destacados || []).slice(0, 3);
  return (
    <>
      <Chrome d={d} /><Shade h={1000} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 20 }}>
        <div style={{ ...enter(p, 0), color: "#fff", font: "800 26px var(--font-head)", letterSpacing: ".26em", marginBottom: 18, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>AMENIDADES</div>
        <div style={{ ...enter(p, 1), background: "var(--kx-cream)", borderRadius: 24, padding: "30px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px 10px", boxShadow: "0 12px 30px rgba(0,0,0,.25)" }}>
          {am.map((a, i) => (
            <div key={a} style={{ ...enter(p, i + 2, 0.08, 0.35), display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--kx-red)" }}>
              <Icon name={a} style={{ width: 70, height: 70 }} />
              <span style={{ font: "700 20px var(--font-head)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--kx-ink)", textAlign: "center" }}>{AMENIDADES[a]}</span>
            </div>
          ))}
        </div>
        {extra.map((x, i) => (
          <div key={x} style={{ ...enter(p, am.length + 2 + i, 0.08, 0.35), marginTop: 12, display: "flex", alignItems: "center", gap: 14, color: "#fff", font: "600 32px var(--font-body)", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
            <Icon name="check" style={{ width: 38, height: 38, color: "var(--kx-gold)" }} />{x}
          </div>
        ))}
      </div>
    </>
  );
}

function Frase({ d, p }) {
  return (
    <>
      <Chrome d={d} /><Shade h={900} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 50, color: "#fff" }}>
        <div style={{ ...enter(p, 0), width: 90, height: 6, background: "var(--kx-gold)", marginBottom: 36 }} />
        <div className="script" style={{ ...enter(p, 1), fontSize: 104, lineHeight: 1.05, textShadow: "0 4px 26px rgba(0,0,0,.45)" }}>{d.frase_script}</div>
      </div>
    </>
  );
}

function Precio({ d, p }) {
  const precio = precioTexto(d) || "Consultar";
  const linea = [d.tipo && d.tipo[0].toUpperCase() + d.tipo.slice(1), fmtNum(d.habitaciones) && `${fmtNum(d.habitaciones)} hab`, fmtNum(d.m2_construccion || d.m2_solar) && `${fmtNum(d.m2_construccion || d.m2_solar)} m²`].filter(Boolean).join(" · ");
  return (
    <>
      <Chrome d={d} /><Shade h={1000} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 30 }}>
        <div style={{ ...enter(p, 0), display: "inline-block", background: "var(--kx-red)", color: "#fff", borderRadius: 26, padding: "32px 40px", borderBottom: "6px solid var(--kx-gold)", boxShadow: "0 14px 34px rgba(0,0,0,.3)" }}>
          <small style={{ display: "block", font: "700 22px var(--font-head)", letterSpacing: ".24em", textTransform: "uppercase" }}>{precioRotulo(d)}</small>
          <b style={{ display: "block", font: "900 104px/1 var(--font-head)", marginTop: 10, whiteSpace: "nowrap" }}>{precio}</b>
        </div>
        <div style={{ ...enter(p, 1), color: "#fff", font: "500 34px var(--font-body)", marginTop: 26 }}>{linea}</div>
        {d.plan_pagos?.[0]?.etapa ? <div style={{ ...enter(p, 2), color: "var(--kx-gold)", font: "700 30px var(--font-head)", marginTop: 12 }}>{d.plan_pagos[0].etapa}: {d.plan_pagos[0].valor}</div> : null}
      </div>
    </>
  );
}

// Lote con drone: el polígono se dibuja, luego medidas y m²
function Revelado({ d, p }) {
  const L = d.lote || {};
  const pts = (L.poligono_reel || L.poligono || []).filter((x) => Array.isArray(x) && x.length === 2);
  const c = centroid(pts);
  const m2 = fmtNum(d.m2_solar);
  const xs = pts.map((q) => q[0] * W), polyW = xs.length ? Math.max(...xs) - Math.min(...xs) : W;
  const pillFont = Math.round(Math.max(24, Math.min(46, (polyW * 0.78 - 50) / (((m2 || "") + " m²").length * 0.64))));
  const draw = ease(p / 0.45), fill = ease((p - 0.4) / 0.25), labels = ease((p - 0.55) / 0.25), pill = ease((p - 0.7) / 0.25);
  let per = 0;
  const px = pts.map(([x, y]) => [x * W, y * H]);
  for (let i = 0; i < px.length; i++) { const a = px[i], b = px[(i + 1) % px.length]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  return (
    <>
      <Chrome d={d} />
      <div style={{ position: "absolute", left: L0, right: R0 + 150, top: SV.top + 110, color: "#fff", ...enter(p, 0, 0, 0.3) }}>
        <div style={{ font: "700 26px var(--font-head)", letterSpacing: ".4em" }}>{L.etiqueta_superior || "RESIDENCIAL"}</div>
        <div style={{ font: "900 82px/1 var(--font-head)", marginTop: 8, textShadow: "0 3px 20px rgba(0,0,0,.4)" }}>{d.proyecto || d.titulo}</div>
      </div>
      {px.length >= 3 ? (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <polygon points={px.map((q) => q.join(",")).join(" ")} fill={`rgba(173,29,40,${0.42 * fill})`} stroke="#fff" strokeWidth="6" strokeLinejoin="round"
            strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
          {px.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={10 * labels} fill="#fff" />)}
        </svg>
      ) : null}
      {pts.length >= 2 && (L.medidas || []).map((m, i) => {
        if (!m || i >= pts.length) return null;
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const dx = (mx - c[0]) * W, dy = (my - c[1]) * H, len = Math.hypot(dx, dy) || 1;
        // lados verticales: etiqueta girada a lo largo del lado (como en un plano), pegada por fuera
        let ang = Math.atan2((b[1] - a[1]) * H, (b[0] - a[0]) * W) * 180 / Math.PI;
        if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        const off = Math.abs(ang) > 45 ? 34 : 50;
        const hw = Math.abs(ang) > 45 ? 24 : 80; // medio ancho de la etiqueta (girada o no)
        const lx = Math.max(SV.left + hw, Math.min(W - SV.right - hw, mx * W + dx / len * off)), ly = Math.max(SV.top + 20, Math.min(H - SV.bottom - 20, my * H + dy / len * off));
        return <div key={i} style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%,-50%) rotate(${ang}deg)`, opacity: labels, color: "#fff", font: "800 28px var(--font-head)", background: "rgba(30,30,30,.72)", padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>{m}</div>;
      })}
      {pts.length >= 3 && m2 ? (
        <div style={{ position: "absolute", left: c[0] * W, top: c[1] * H, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pill})`, opacity: pill, background: "var(--kx-gold)", color: "var(--kx-ink)", font: `900 ${pillFont}px var(--font-head)`, padding: `${Math.round(pillFont * 0.3)}px ${Math.round(pillFont * 0.6)}px`, borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>{m2} m²</div>
      ) : null}
    </>
  );
}

function InfoLote({ d, p }) {
  const L = d.lote || {};
  const info = [
    L.uso && { ic: "casa", v: L.uso, l: "Uso permitido" },
    fmtNum(L.niveles) && { ic: "niveles", v: `${fmtNum(L.niveles)} niveles`, l: "Altura máxima" },
    fmtNum(d.habitaciones) && { ic: "cama", v: `${fmtNum(d.habitaciones)} dormitorios`, l: "Hasta" },
    fmtNum(d.m2_solar) && { ic: "terreno", v: `${fmtNum(d.m2_solar)} m²`, l: "Superficie" },
  ].filter(Boolean);
  return (
    <>
      <Chrome d={d} /><Shade h={1000} />
      <div style={{ position: "absolute", left: L0, right: R0, bottom: SAFE_BOTTOM + 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {info.map((x, i) => (
          <div key={i} style={{ ...enter(p, i, 0.12), display: "flex", alignItems: "center", gap: 24, background: "var(--kx-cream)", borderRadius: 24, padding: "24px 30px", color: "var(--kx-red)", boxShadow: "0 12px 30px rgba(0,0,0,.25)" }}>
            <Icon name={x.ic} style={{ width: 64, height: 64, flex: "none" }} />
            <div><b style={{ display: "block", font: "800 44px/1.05 var(--font-head)", color: "var(--kx-ink)" }}>{x.v}</b>
              <span style={{ display: "block", font: "700 19px var(--font-head)", letterSpacing: ".18em", textTransform: "uppercase", color: "#6b6259", marginTop: 6 }}>{x.l}</span></div>
          </div>
        ))}
      </div>
    </>
  );
}

function Cierre({ d, office, p }) {
  const a = d.agente || {};
  const sur = d.segmento === "sur";
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--kx-red-dark)", color: "#fff" }}>
      <div style={{ position: "absolute", left: L0 + 26, right: R0, top: SV.top, bottom: SAFE_BOTTOM + 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={enter(p, 0)}><Logo variant="blanco" height={110} /></div>
        {office?.tagline ? <div style={{ ...enter(p, 1), font: "700 24px var(--font-head)", letterSpacing: ".3em", color: "var(--kx-gold)", marginTop: 26 }}>{office.tagline}</div> : null}
        <div style={{ ...enter(p, 2), width: "100%", height: 4, background: "var(--kx-gold)", margin: "70px 0 60px" }} />
        <h2 style={{ ...enter(p, 3), font: "900 96px/1.02 var(--font-head)" }}>{d.cta_titulo || (sur ? "Coordiná tu visita" : "Agenda tu visita")}</h2>
        <div style={{ ...enter(p, 4), font: "500 38px var(--font-body)", marginTop: 22, opacity: 0.92 }}>{d.cta_reel || (sur ? "Escribinos por WhatsApp" : "Escríbenos por WhatsApp")}</div>
        <div style={{ ...enter(p, 5), marginTop: 60, display: "flex", flexDirection: "column", gap: 16 }}>
          {a.nombre ? <b style={{ font: "800 46px var(--font-head)" }}>{a.nombre}</b> : null}
          {a.whatsapp ? <div style={{ display: "flex", alignItems: "center", gap: 16, font: "600 44px var(--font-body)" }}><Icon name="whatsapp" style={{ width: 50, height: 50, color: "var(--kx-gold)" }} />{a.whatsapp}</div> : null}
          {office?.instagram ? <div style={{ display: "flex", alignItems: "center", gap: 16, font: "500 36px var(--font-body)" }}><Icon name="instagram" style={{ width: 44, height: 44, color: "var(--kx-gold)" }} />{office.instagram}</div> : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: L0 + 26, right: R0, bottom: SAFE_BOTTOM + 10, display: "flex", justifyContent: "space-between", alignItems: "center", ...enter(p, 6) }}>
        <span style={{ font: "600 22px var(--font-head)", letterSpacing: ".24em", color: "var(--kx-gold)" }}>{office?.lat || ""}</span>
        <Confotur show={d.confotur} size={150} />
      </div>
    </div>
  );
}

export const REEL_SCENES = { gancho: Gancho, medidas: Medidas, amenidades: Amenidades, frase: Frase, precio: Precio, revelado: Revelado, infolote: InfoLote, cierre: Cierre };

export default function ReelScene({ scene, d, office, p = 1 }) {
  const C = REEL_SCENES[scene];
  return <div className="kx reel" style={{ width: W, height: H, background: "transparent" }}>{C ? <C d={d} office={office} p={p} /> : null}</div>;
}
