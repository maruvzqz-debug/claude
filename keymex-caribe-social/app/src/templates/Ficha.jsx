import { Slide, Photo, TopBar, Footer, footerH } from "./common.jsx";
import { Icon, AMENIDADES } from "../components/Icons.jsx";
import { fmtMoney, fmtNum, splitAcento } from "../lib/format.js";

export function dimsOf(d) {
  const out = [];
  if (fmtNum(d.m2_solar)) out.push({ v: fmtNum(d.m2_solar), u: "m²", l: "de solar" });
  if (fmtNum(d.m2_construccion)) out.push({ v: fmtNum(d.m2_construccion), u: "m²", l: "construcción" });
  if (fmtNum(d.habitaciones)) out.push({ v: fmtNum(d.habitaciones), l: "habitaciones" });
  if (fmtNum(d.banos)) out.push({ v: fmtNum(d.banos), l: "baños" });
  return out.slice(0, 4);
}

export default function Ficha({ d, office, fmt = "feed" }) {
  const dark = d.variante === "oscura";
  const H = { feed: 1350, story: 1920, square: 1080 }[fmt];
  const headTop = { feed: 168, story: 370, square: 150 }[fmt];
  const bottom = footerH(fmt) + 36;
  const dims = dimsOf(d);
  const amen = (d.amenidades || []).filter((a) => AMENIDADES[a]).slice(0, 5);
  const precio = fmtMoney(d.precio, d.moneda);
  return (
    <Slide kind="ficha" fmt={fmt} extra={dark ? "oscura" : "clara"}>
      <Photo src={d.fotos?.[0]} pos={d.foto_pos} />
      {dark ? <div className="shade-dark" /> : <><div className="shade-light" /><div className="shade-low" /></>}
      <TopBar office={office} dark={dark} confotur={d.confotur} fmt={fmt} />
      <div className="head" style={{ top: headTop }}>
        <h1 style={fmt === "square" ? { fontSize: 76 } : undefined}>
          {splitAcento(d.titulo, d.palabra_acento).map((p, i) => <span key={i} className={p.a ? "acento" : ""}>{p.t}</span>)}
        </h1>
        <div className="loc"><Icon name="pin" />{[d.proyecto, d.zona, d.ciudad].filter(Boolean).join(" · ")}</div>
        {d.bajada && fmt !== "square" ? <p className="bajada">{d.bajada}</p> : null}
      </div>
      {d.frase_script && fmt !== "square" ? (
        <div className="frase script" style={{ top: Math.round(H * (fmt === "story" ? 0.47 : 0.46)) }}>{d.frase_script}</div>
      ) : null}
      <div className="bottom" style={{ bottom }}>
        {dims.length ? (
          <div className="card dims">
            {dims.map((x, i) => <div key={i}><b>{x.v}{x.u ? <sup> {x.u}</sup> : null}</b><span>{x.l}</span></div>)}
          </div>
        ) : null}
        <div className="row2">
          {amen.length && fmt !== "square" ? (
            <div className="card amen">
              {amen.map((a) => <div key={a}><Icon name={a} /><span>{AMENIDADES[a]}</span></div>)}
            </div>
          ) : <div style={{ flex: 1 }} />}
          <div className="price">
            <small>{d.operacion === "alquiler" ? "Precio de alquiler" : "Precio de venta"}</small>
            <b>{d.precio_desde ? <span style={{ fontSize: 22, fontWeight: 700, display: "block", marginBottom: 4 }}>DESDE</span> : null}{precio || "Consultar"}</b>
            {d.precio_nota ? <em>{d.precio_nota}</em> : null}
          </div>
        </div>
      </div>
      <Footer office={office} agente={d.agente} fmt={fmt} />
    </Slide>
  );
}
