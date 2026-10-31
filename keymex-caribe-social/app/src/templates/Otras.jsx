import { Slide, Photo, TopBar, Footer, footerH, Logo } from "./common.jsx";
import { Icon } from "../components/Icons.jsx";
import { splitScript, FORMATS } from "../lib/format.js";

/* ---------- 3 · Hook / estilo de vida ---------- */
export function Hook({ d, office, fmt = "feed" }) {
  const top = { feed: 230, story: 420, square: 190 }[fmt];
  return (
    <Slide kind="hook" fmt={fmt}>
      <Photo src={d.fotos?.[0]} pos={d.foto_pos} />
      <div className="shade" />
      <TopBar office={office} dark confotur={d.confotur} fmt={fmt} />
      <div className="q" style={{ top }}>
        <h1 style={fmt === "square" ? { fontSize: 74 } : undefined}>
          {splitScript(d.pregunta).map((p, i) => <span key={i} className={p.s ? "script" : ""}>{p.t}</span>)}
        </h1>
        {d.bajada ? <p>{d.bajada}</p> : null}
      </div>
      <div className="vals" style={{ bottom: footerH(fmt) + 60 }}>
        {(d.valores || []).slice(0, 3).map((v, i) => <div key={i}><Icon name={v.icon} /><span>{(v.label || "").toUpperCase()}</span></div>)}
      </div>
      <Footer office={office} agente={d.agente} fmt={fmt} />
    </Slide>
  );
}

/* ---------- 4 · Educativo / pasos ---------- */
export function Pasos({ d, office, fmt = "feed" }) {
  const steps = (d.pasos || []).filter((s) => s.texto).slice(0, 6);
  const n = steps.length;
  const shift = d.confotur ? (fmt === "square" ? 90 : 110) : 0; // el sello ocupa la esquina superior derecha
  const headTop = { feed: 170, story: 330, square: 150 }[fmt] + shift;
  const gridTop = { feed: 470, story: 720, square: 400 }[fmt] + shift;
  const stepW = n <= 3 ? 300 : n === 4 ? 420 : 300;
  const scale = fmt === "square" && n > 3 ? 0.78 : 1;
  return (
    <Slide kind="pasos" fmt={fmt}>
      <Photo src={d.fotos?.[0]} pos={d.foto_pos} />
      <div className="shade" />
      <TopBar office={office} confotur={d.confotur} fmt={fmt} />
      <div className="head" style={{ top: headTop }}>
        <h1 style={fmt === "square" ? { fontSize: 62 } : undefined}><b>{n} PASOS</b> {d.titulo || "para invertir en"}</h1>
        {d.zona ? <div className="ribbon">{d.zona}</div> : null}
      </div>
      <div className="grid" style={{ top: gridTop, display: "flex", flexWrap: "wrap", justifyContent: "center", transform: `scale(${scale})`, transformOrigin: "top center" }}>
        {steps.map((s, i) => (
          <div className="step" key={i} style={{ width: stepW }}>
            <div className="circ"><Icon name={s.icon} /><div className="num">{i + 1}</div></div>
            <p>{s.texto}</p>
          </div>
        ))}
      </div>
      {d.cierre ? <div className="cierre script" style={{ bottom: footerH(fmt) + 40 }}>{d.cierre}</div> : null}
      <Footer office={office} agente={d.agente} fmt={fmt} />
    </Slide>
  );
}

/* ---------- 5 · Prueba social ---------- */
const AREAS = {
  1: { cols: "1fr", rows: "1fr", areas: ['"a"'] },
  2: { cols: "1fr 1fr", rows: "1fr", areas: ['"a b"'] },
  3: { cols: "1fr 1fr", rows: "1.25fr 1fr", areas: ['"a a"', '"b c"'] },
  4: { cols: "1fr 1fr", rows: "1fr 1fr", areas: ['"a b"', '"c d"'] },
  5: { cols: "repeat(6, 1fr)", rows: "1fr 1fr", areas: ['"a a a b b b"', '"c c d d e e"'] },
};
export function Social({ d, office, fmt = "feed" }) {
  const { h } = FORMATS[fmt];
  const fotos = (d.fotos || []).filter(Boolean).slice(0, 5);
  const n = Math.max(1, fotos.length);
  const L = AREAS[n];
  const collageH = h - footerH(fmt) - 40 - (fmt === "story" ? 420 : 200);
  const top = fmt === "story" ? 160 : 40;
  return (
    <Slide kind="social" fmt={fmt}>
      <div className="collage" style={{ top, height: collageH, gridTemplateColumns: L.cols, gridTemplateRows: L.rows, gridTemplateAreas: L.areas.join(" ") }}>
        {(fotos.length ? fotos : [null]).map((f, i) => (
          <div key={i} style={{ gridArea: "abcde"[i] }}><Photo src={f} /></div>
        ))}
      </div>
      <div style={{ position: "absolute", top: top + 24, right: 64, zIndex: 3 }}>
        <Logo variant="blanco" height={44} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
      </div>
      <div className="sticker" style={{ top: top + collageH - 150 }}>
        <span className="script">{d.titulo_script || "Juntos"}</span>
        <b>{d.titulo_bold || "Celebramos"}</b>
        {d.pill ? <span className="pill">{d.pill}</span> : null}
      </div>
      {d.texto ? <div className="sub" style={{ top: top + collageH + 140 }}>{d.texto}</div> : null}
      <Footer office={office} agente={d.agente} fmt={fmt} />
    </Slide>
  );
}

/* ---------- 6 · Slide foto (2–10 del carrusel) ---------- */
export function FotoSlide({ src, caption, fmt = "feed", pos }) {
  return (
    <Slide kind="foto" fmt={fmt}>
      <Photo src={src} pos={pos} />
      <div className="shade" />
      <Logo variant="blanco" height={38} />
      {caption ? <div className="cap">{caption}</div> : null}
    </Slide>
  );
}

/* ---------- 8 · Portada de destacada ---------- */
export function Destacada({ icon = "pin", label = "" }) {
  return (
    <div className="kx dest" style={{ width: 1080, height: 1080 }}>
      <div className="ring" />
      <div className="in"><Icon name={icon} />{label ? <span>{label}</span> : null}</div>
    </div>
  );
}
