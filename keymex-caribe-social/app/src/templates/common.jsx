import logoRojo from "../assets/brand/logo-keymex-rojo.png";
import logoBlanco from "../assets/brand/logo-keymex-blanco.png";
import selloConfotur from "../assets/brand/sello-confotur.png";
import { Icon } from "../components/Icons.jsx";
import { FORMATS, SAFE } from "../lib/format.js";

export const BRAND = { logoRojo, logoBlanco, selloConfotur };

export function Slide({ kind, fmt = "feed", extra = "", children }) {
  const { w, h } = FORMATS[fmt];
  return (
    <div className={`kx ${kind} fmt-${fmt} ${extra}`} style={{ width: w, height: h }}>
      {children}
    </div>
  );
}

export function Photo({ src, pos, style }) {
  if (!src) return <div className="ph ph-empty" style={style}>FOTO</div>;
  return <div className="ph" style={{ backgroundImage: `url("${src}")`, backgroundPosition: pos || "center", ...style }} />;
}

export function Logo({ variant = "rojo", height = 58, style }) {
  return <img className="logo" src={variant === "blanco" ? logoBlanco : logoRojo} alt="KEYMEX Caribe" style={{ height, ...style }} />;
}

export function Confotur({ show, size = 150, style }) {
  if (!show) return null;
  return <img className="confotur" src={selloConfotur} alt="Proyecto clasificado CONFOTUR" style={{ width: size, height: size, ...style }} />;
}

export function TopBar({ office, dark, confotur, logoHeight = 58, fmt }) {
  const top = fmt === "story" ? SAFE.vertical.top + 10 : 56;
  return (
    <div className="top" style={{ top }}>
      <Logo variant={dark ? "blanco" : "rojo"} height={logoHeight} />
      <div className="right">
        {office?.tagline ? <div className={`tagline ${dark ? "on-dark" : ""}`}>{office.tagline}</div> : null}
        <Confotur show={confotur} size={fmt === "square" ? 120 : 150} />
      </div>
    </div>
  );
}

// Footer: contacto siempre visible (agente + oficina) + filete dorado + firma LAT 18°N
export function Footer({ office = {}, agente = {}, fmt }) {
  const items = [];
  if (agente.whatsapp) items.push(["whatsapp", agente.whatsapp]);
  if (office.web) items.push(["web", office.web]);
  else if (agente.email || office.email) items.push(["email", agente.email || office.email]);
  if (office.instagram) items.push(["instagram", office.instagram]);
  const story = fmt === "story";
  return (
    // En 9:16 la barra flota justo encima de la zona inferior que tapan Instagram y TikTok
    <div className="footer" style={story ? { bottom: SAFE.vertical.bottom, left: SAFE.vertical.left - 20, right: SAFE.vertical.right - 20, borderRadius: 18, border: "none", boxShadow: "inset 0 4px 0 var(--kx-gold), 0 10px 30px rgba(0,0,0,.3)", padding: "0 30px", gap: 18 } : undefined}>
      <Logo variant="blanco" height={40} />
      <div className="items">
        {items.map(([ic, txt]) => (
          <div className="it" key={ic}><Icon name={ic} />{txt}</div>
        ))}
      </div>
      {office.lat ? <div className="lat">{office.lat}</div> : null}
    </div>
  );
}

// Altura útil sobre el footer, según formato
export function footerH(fmt) { return fmt === "story" ? SAFE.vertical.bottom + 112 : 112; }
