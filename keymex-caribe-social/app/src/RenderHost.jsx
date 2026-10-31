// Modo render para el generador de reels (Node + Playwright): sin interfaz, solo la pieza a tamaño real.
// El generador define window.__KX_RENDER__ = true y luego llama window.__kxSet(props) por fotograma.
import { useState } from "react";
import { flushSync } from "react-dom";
import ReelScene from "./templates/Reel.jsx";
import Ficha from "./templates/Ficha.jsx";
import Lote from "./templates/Lote.jsx";
import { FotoSlide } from "./templates/Otras.jsx";
import { captionPropiedad } from "./lib/caption.js";

window.__kxCaption = (d, office) => captionPropiedad(d, office);

export default function RenderHost() {
  const [props, setProps] = useState(null);
  window.__kxSet = (next) => {
    if (next?.office?.chantal && !document.getElementById("kx-chantal")) {
      const st = document.createElement("style"); st.id = "kx-chantal";
      st.textContent = `@font-face{font-family:"CHANTAL";src:url(${next.office.chantal});}`;
      document.head.appendChild(st);
    }
    flushSync(() => setProps(next));
  };
  if (!props) return null;
  const { kind, d, office, fmt = "story", scene, p } = props;
  return (
    <div id="kx-render" style={{ display: "inline-block" }}>
      <style>{"html,body{background:transparent!important;margin:0}"}</style>
      {kind === "reel" ? <ReelScene scene={scene} d={d} office={office} p={p} /> : kind === "foto" ? <FotoSlide src={props.src} fmt={fmt} /> : kind === "lote" ? <Lote d={d} office={office} fmt={fmt} /> : <Ficha d={d} office={office} fmt={fmt} />}
    </div>
  );
}
