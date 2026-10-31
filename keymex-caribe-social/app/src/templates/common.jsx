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
  const story = fmt === "story";
  const mail = agente.email || (!office.web ? office.email : "");
  return (
    // En 9:16 la barra flota justo encima de la zona inferior que tapan Instagram y TikTok
    <div className="footer" style={story ? { bottom: SAFE.vertical.bottom, left: SAFE.vertical.left - 20, right: SAFE.vertical.right - 20, borderRadius: 18, border: "none", boxShadow: "inset 0 4px 0 var(--kx-gold), 0 10px 30px rgba(0,0,0,.3)", padding: "0 26px", gap: 18 } : undefined}>
      <Logo variant="blanco" height={story ? 34 : 40} />
      <div className="agent">
        {agente.nombre ? <b>{agente.nombre}</b> : null}
        <div className="row">
          {agente.whatsapp ? <div className="it fix"><Icon name="whatsapp" /><span>{agente.whatsapp}</span></div> : null}
          {mail ? <div className="it grow"><Icon name="email" /><span>{mail}</span></div> : null}
        </div>
      </div>
      <div className="office">
        {office.instagram ? <div className="it"><Icon name="instagram" /><span>{office.instagram}</span></div> : null}
        {office.web ? <div className="it"><Icon name="web" /><span>{office.web}</span></div> : null}
        {office.lat && !(story && office.web) ? <div className="lat">{office.lat}</div> : null}
      </div>
    </div>
  );
}

// Altura útil sobre el footer, según formato
export function footerH(fmt) { return fmt === "story" ? SAFE.vertical.bottom + 112 : 112; }
