import { Slide, Photo, TopBar, Footer, footerH } from "./common.jsx";
import { Icon } from "../components/Icons.jsx";
import { fmtMoney, fmtNum, periodoDe } from "../lib/format.js";
import { FORMATS } from "../lib/format.js";

export function centroid(pts) {
  if (!pts.length) return [0.5, 0.5];
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-9) return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  return [cx / (3 * a), cy / (3 * a)];
}

// Pasa un punto (0–1) marcado sobre el recorte "cover" de un formato al recorte de otro, sobre la misma foto.
export function convertPoint([x, y], from, to, iw, ih) {
  const s1 = Math.max(from.w / iw, from.h / ih), vw1 = from.w / s1, vh1 = from.h / s1;
  const ix = (iw - vw1) / 2 + x * vw1, iy = (ih - vh1) / 2 + y * vh1;
  const s2 = Math.max(to.w / iw, to.h / ih), vw2 = to.w / s2, vh2 = to.h / s2;
  return [(ix - (iw - vw2) / 2) / vw2, (iy - (ih - vh2) / 2) / vh2];
}

export default function Lote({ d, office, fmt = "feed", animate = false }) {
  const { w, h } = FORMATS[fmt];
  const L = d.lote || {};
  let pts = (L.poligono || []).filter((p) => Array.isArray(p) && p.length === 2);
  // El polígono se marca en un formato (base); en los demás se reubica sobre la misma foto
  const base = L.base || { fmt: "feed" };
  if (base.iw && base.fmt !== fmt) pts = pts.map((p) => convertPoint(p, FORMATS[base.fmt], FORMATS[fmt], base.iw, base.ih));
  const headTop = { feed: 168, story: 370, square: 150 }[fmt];
  const c = centroid(pts);
  const precio = fmtMoney(d.precio, d.moneda);
  const m2 = fmtNum(d.m2_solar);
  const info = [
    L.uso && { ic: "casa", v: L.uso, l: "Uso permitido" },
    fmtNum(L.niveles) && { ic: "niveles", v: `${fmtNum(L.niveles)} niveles`, l: "Altura" },
    fmtNum(d.habitaciones) && { ic: "cama", v: `${fmtNum(d.habitaciones)} dormitorios`, l: "Hasta" },
    m2 && { ic: "terreno", v: `${m2} m²`, l: "Superficie" },
  ].filter(Boolean).slice(0, 3);
  return (
    <Slide kind="lote" fmt={fmt}>
      <Photo src={d.fotos?.[0]} pos={d.foto_pos} />
      <div className="shade" />
      {pts.length >= 3 ? (
        <svg className="poly" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
          <polygon
            points={pts.map(([x, y]) => `${x * w},${y * h}`).join(" ")}
            fill="rgba(173,29,40,.4)" stroke="#fff" strokeWidth="5" strokeLinejoin="round"
            style={animate ? { strokeDasharray: 6000, strokeDashoffset: 6000, animation: "kxdraw 1.6s ease forwards" } : undefined}
          />
        </svg>
      ) : null}
      {pts.length >= 2 && (L.medidas || []).map((m, i) => {
        if (!m || i >= pts.length) return null;
        const a = pts[i], b = pts[(i + 1) % pts.length];
        // etiqueta en el punto medio, desplazada hacia afuera del centroide
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const dx = mx - c[0], dy = my - c[1], len = Math.hypot(dx * w, dy * h) || 1;
        let ang = Math.atan2((b[1] - a[1]) * h, (b[0] - a[0]) * w) * 180 / Math.PI;
        if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        const off = Math.abs(ang) > 45 ? 30 : 40;
        const ox = (dx * w) / len * off, oy = (dy * h) / len * off;
        return <div key={i} className="medida" style={{ left: Math.max(70, Math.min(w - 70, mx * w + ox)), top: my * h + oy, transform: `translate(-50%,-50%) rotate(${ang}deg)` }}>{m}</div>;
      })}
      {pts.length >= 3 && m2 ? <div className="m2pill" style={{ left: c[0] * w, top: c[1] * h }}>{m2} m²</div> : null}
      <TopBar office={office} dark confotur={d.confotur} fmt={fmt} />
      <div className="head" style={{ top: headTop }}>
        <div className="res">{L.etiqueta_superior || "RESIDENCIAL"}</div>
        <h1>{d.proyecto || d.titulo}</h1>
        <div className="ribbon">{d.operacion === "venta" || !d.operacion ? "TERRENO EN VENTA" : "TERRENO EN ALQUILER"}</div>
      </div>
      <div className="pill-price" style={{ top: headTop + (d.confotur ? 250 : 40) }}>
        <small>{d.precio_desde ? "Desde" : "Precio"}</small><b>{precio || "Consultar"}{precio && periodoDe(d) ? <span style={{ fontSize: 22 }}> / {periodoDe(d)}</span> : null}</b>
      </div>
      {info.length ? (
        <div className="info" style={{ bottom: footerH(fmt) + 36 }}>
          {info.map((x, i) => <div key={i}><Icon name={x.ic} /><div><b>{x.v}</b><span>{x.l}</span></div></div>)}
        </div>
      ) : null}
      <Footer office={office} agente={d.agente} fmt={fmt} />
    </Slide>
  );
}
