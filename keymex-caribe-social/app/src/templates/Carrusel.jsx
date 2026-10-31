// Slides del carrusel por guion (1080×1350). Cada slide lleva logo, contador y,
// salvo la última, la invitación a deslizar. La portada lleva el footer de contacto.
import { Slide, Photo, TopBar, Footer, Logo, Confotur } from "./common.jsx";
import { Icon } from "../components/Icons.jsx";
import { splitScript } from "../lib/format.js";

const Rich = ({ t }) => splitScript(t).map((p, i) => <span key={i} className={p.s ? "script acento" : ""}>{p.t}</span>);

function Chrome({ i, n, dark, sur, hideLogo, hideCount }) {
  return (
    <>
      {!hideLogo ? <div className="c-logo"><Logo variant={dark ? "blanco" : "rojo"} height={40} /></div> : null}
      {hideCount ? null : <div className={`c-count ${dark ? "on-dark" : ""}`}>{String(i + 1).padStart(2, "0")}<span> / {String(n).padStart(2, "0")}</span></div>}
      {i < n - 1 ? <div className={`c-swipe ${dark ? "on-dark" : ""}`}>{sur ? "Deslizá" : "Desliza"}<Icon name="flecha" /></div> : null}
    </>
  );
}

export default function CarruselSlide({ s, i, n, d, office, fotos = [], pasoN = 0 }) {
  const sur = d.segmento === "sur";
  const foto = s.foto ? fotos[s.foto - 1] : null;
  const a = d.agente || {};

  if (s.tipo === "PORTADA") {
    const hasPh = !!(foto || fotos[0]);
    return (
      <Slide kind="car portada" extra={hasPh ? "" : "nofoto"}>
        {hasPh ? <><Photo src={foto || fotos[0]} /><div className="c-shade" /></> : null}
        <TopBar office={office} dark confotur={d.confotur} />
        <div className="c-portada">
          <h1><Rich t={s.valor} /></h1>
          {s.bajada ? <p>{s.bajada}</p> : null}
        </div>
        <Chrome i={i} n={n} dark sur={sur} hideLogo hideCount />
        <Footer office={office} agente={a} />
      </Slide>
    );
  }
  if (s.tipo === "PASO") return (
    <Slide kind="car paso">
      <div className="c-bignum">{pasoN}</div>
      <div className="c-body">
        <div className="c-circ"><Icon name={s.icono || "check"} /><b>{pasoN}</b></div>
        <div className="c-kicker">Paso {pasoN}</div>
        <h2><Rich t={s.valor} /></h2>
        {s.texto ? <p>{s.texto}</p> : null}
      </div>
      <Chrome i={i} n={n} sur={sur} />
    </Slide>
  );
  if (s.tipo === "DATO") {
    const len = s.valor.replace(/\*/g, "").length;
    return (
      <Slide kind="car dato">
        <div className="c-body">
          <div className="c-rule" />
          <div className="c-num" style={{ fontSize: Math.max(110, Math.min(230, Math.round(1500 / Math.max(len, 1)))) }}><Rich t={s.valor} /></div>
          {s.texto ? <p>{s.texto}</p> : null}
        </div>
        <Chrome i={i} n={n} dark sur={sur} />
      </Slide>
    );
  }
  if (s.tipo === "LISTA") return (
    <Slide kind="car lista">
      <div className="c-body">
        <h2><Rich t={s.valor} /></h2>
        <ul>{s.items.map((x, k) => <li key={k}><Icon name="check" /><span>{x}</span></li>)}</ul>
      </div>
      <Chrome i={i} n={n} sur={sur} />
    </Slide>
  );
  if (s.tipo === "TEXTO") return (
    <Slide kind="car texto" extra={foto ? "confoto" : ""}>
      {foto ? <div className="c-top-photo"><Photo src={foto} /></div> : null}
      <div className="c-body">
        <h2><Rich t={s.valor} /></h2>
        {s.texto ? <p>{s.texto}</p> : null}
      </div>
      <Chrome i={i} n={n} dark={!!foto && false} sur={sur} />
    </Slide>
  );
  if (s.tipo === "FOTO") return (
    <Slide kind="car fotoc">
      <Photo src={foto} />
      <div className="c-shade-top" />
      {s.leyenda ? <div className="c-leyenda">{s.leyenda}</div> : null}
      <Chrome i={i} n={n} dark sur={sur} />
    </Slide>
  );
  if (s.tipo === "FRASE") return (
    <Slide kind="car frase" extra={foto ? "" : "nofoto"}>
      {foto ? <><Photo src={foto} /><div className="c-dim" /></> : null}
      <div className="c-body">
        <div className="c-rule" />
        <div className="script c-quote"><Rich t={s.valor} /></div>
        {s.texto ? <p>{s.texto}</p> : null}
      </div>
      <Chrome i={i} n={n} dark sur={sur} />
    </Slide>
  );
  // CIERRE
  const cta = s.valor || (d.operacion === "temporal" ? (sur ? "Reservá tus fechas" : "Reserva tus fechas") : sur ? "Coordiná tu visita" : "Agenda tu visita");
  const txt = s.texto || (sur ? "Escribinos por WhatsApp y te respondemos hoy." : "Escríbenos por WhatsApp y te respondemos hoy.");
  return (
    <Slide kind="car cierre">
      <div className="c-body">
        <Logo variant="blanco" height={86} />
        {office?.tagline ? <div className="c-tag">{office.tagline}</div> : null}
        <div className="c-rule" />
        <h2><Rich t={cta} /></h2>
        <p>{txt}</p>
        <div className="c-contact">
          {a.nombre ? <b>{a.nombre}</b> : null}
          {a.whatsapp ? <div><Icon name="whatsapp" />{a.whatsapp}</div> : null}
          {a.email ? <div><Icon name="email" />{a.email}</div> : null}
          {office?.instagram ? <div><Icon name="instagram" />{office.instagram}</div> : null}
        </div>
      </div>
      <div className="c-foot">
        <span>{office?.lat || ""}</span>
        <Confotur show={d.confotur} size={120} />
      </div>
      <Chrome i={i} n={n} dark sur={sur} hideLogo />
    </Slide>
  );
}
