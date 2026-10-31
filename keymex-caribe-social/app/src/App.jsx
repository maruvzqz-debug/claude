import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Ficha from "./templates/Ficha.jsx";
import Lote from "./templates/Lote.jsx";
import { Hook, Pasos, Social, FotoSlide, Destacada } from "./templates/Otras.jsx";
import { BRAND } from "./templates/common.jsx";
import { Icon, AMENIDADES, ICON_NAMES } from "./components/Icons.jsx";
import { FORMATS, SAFE, slugify } from "./lib/format.js";
import { captionPropiedad, captionGenerica, SEGMENTOS } from "./lib/caption.js";
import { validate, checkContrast } from "./lib/validate.js";
import { nodeToPng, dataUrlToBytes, zipAndDownload } from "./lib/exporter.js";
import { parseCSV, sampleCSV } from "./lib/csv.js";
import { saveFile } from "./lib/save.js";
import { DEFAULTS, OFFICE_DEFAULT } from "./data.js";

/* ---------------- almacenamiento local (comodidad, nunca crítico) ---------------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

const TABS = [
  ["propiedad", "Ficha / Lote"], ["hook", "Hook"], ["pasos", "Educativo"], ["social", "Prueba social"],
  ["destacadas", "Destacadas"], ["masiva", "Carga masiva"], ["oficina", "Oficina y marca"],
];

/* ---------------- campos ---------------- */
function F({ label, value, onChange, type = "text", placeholder, area, ...rest }) {
  const id = "f-" + label.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
  return (
    <label className="f" htmlFor={id}>{label}
      {area
        ? <textarea id={id} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...rest} />
        : <input id={id} type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...rest} />}
    </label>
  );
}
function Sel({ label, value, onChange, options }) {
  const id = "s-" + label.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
  return (
    <label className="f" htmlFor={id}>{label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </label>
  );
}
function Seg({ value, onChange, options }) {
  return <div className="seg">{Object.entries(options).map(([k, v]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>{v}</button>)}</div>;
}

/* ---------------- fotos ---------------- */
function Photos({ fotos, setFotos, max = 10, hint }) {
  const inp = useRef();
  const add = (files) => {
    const nuevos = [...files].filter((f) => f.type.startsWith("image/")).map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setFotos([...fotos, ...nuevos].slice(0, max));
  };
  const move = (i, d) => { const a = [...fotos]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setFotos(a); };
  return (
    <div className="group">
      <div className="drop" onClick={() => inp.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
        Arrastra fotos aquí o haz clic para elegir ({fotos.length}/{max})
        <input ref={inp} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </div>
      {hint ? <p className="hint">{hint}</p> : null}
      {fotos.length ? (
        <div className="photos">
          {fotos.map((f, i) => (
            <div className="ph-item" key={f.url} style={{ backgroundImage: `url("${f.url}")` }}>
              {i === 0 ? <span>PORTADA</span> : null}
              <div className="ctl">
                <button type="button" title="Mover antes" onClick={() => move(i, -1)}>◀</button>
                <button type="button" title="Quitar" onClick={() => setFotos(fotos.filter((_, j) => j !== i))}>✕</button>
                <button type="button" title="Mover después" onClick={() => move(i, 1)}>▶</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- guía de zonas seguras (solo vista previa, nunca se exporta) ---------------- */
function SafeGuides({ fmt }) {
  const { w, h } = FORMATS[fmt];
  const tint = "rgba(173,29,40,.28)", line = { stroke: "#fff", strokeWidth: 3, strokeDasharray: "14 10", fill: "none" };
  const txt = { fill: "#fff", fontSize: 30, fontFamily: "Montserrat, sans-serif", fontWeight: 700, paintOrder: "stroke", stroke: "rgba(0,0,0,.6)", strokeWidth: 6 };
  if (fmt === "story") {
    const v = SAFE.vertical;
    return (
      <svg className="guides" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <rect x="0" y="0" width={w} height={v.top} fill={tint} />
        <rect x="0" y={h - v.bottom} width={w} height={v.bottom} fill={tint} />
        <rect x={w - v.right} y={v.top} width={v.right} height={h - v.top - v.bottom} fill={tint} />
        <rect x="0" y={v.top} width={v.left} height={h - v.top - v.bottom} fill={tint} />
        <rect x={v.left} y={v.top} width={w - v.left - v.right} height={h - v.top - v.bottom} style={line} />
        <text x="24" y={v.top - 24} style={txt}>Barra superior IG / TikTok</text>
        <text x="24" y={h - v.bottom + 50} style={txt}>Usuario · caption · audio</text>
        <text x={w - 24} y={v.top + 60} textAnchor="end" style={txt}>Botones</text>
      </svg>
    );
  }
  if (fmt === "feed") {
    const s = SAFE.feed.side;
    return (
      <svg className="guides" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <rect x="0" y="0" width={s} height={h} fill={tint} /><rect x={w - s} y="0" width={s} height={h} fill={tint} />
        <line x1={s} y1="0" x2={s} y2={h} style={line} /><line x1={w - s} y1="0" x2={w - s} y2={h} style={line} />
        <text x={s + 14} y={h / 2} style={txt}>Recorte grilla 3:4</text>
      </svg>
    );
  }
  return null;
}

/* ---------------- slide escalado ---------------- */
function Scaled({ fmt, width = 300, children, onPoint, nodeRef, guides }) {
  const { w, h } = FORMATS[fmt];
  const k = width / w;
  return (
    <div className="scaler" style={{ width, height: h * k }}>
      <div className="inner" style={{ transform: `scale(${k})`, width: w, height: h }} ref={nodeRef}>{children}</div>
      {guides ? <SafeGuides fmt={fmt} /> : null}
      {onPoint ? <div className="clicklayer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onPoint([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]); }} /> : null}
    </div>
  );
}

/* ---------------- slides por tipo de pieza ---------------- */
function slidesFor(kind, d, office, fmt) {
  const fotos = d.fotos || [];
  if (kind === "propiedad") {
    const Portada = d.tipo === "lote" ? Lote : Ficha;
    const s = [{ name: "01-portada", el: <Portada d={d} office={office} fmt={fmt} /> }];
    fotos.slice(1, 10).forEach((src, i) => s.push({ name: `${String(i + 2).padStart(2, "0")}-foto`, el: <FotoSlide src={src} fmt={fmt} /> }));
    return s;
  }
  if (kind === "hook") return [{ name: "01-hook", el: <Hook d={d} office={office} fmt={fmt} /> }];
  if (kind === "pasos") return [{ name: "01-pasos", el: <Pasos d={d} office={office} fmt={fmt} /> }];
  if (kind === "social") return [{ name: "01-prueba-social", el: <Social d={d} office={office} fmt={fmt} /> }];
  return [];
}
function storyFor(kind, d, office) {
  const s = slidesFor(kind, d, office, "story");
  return s.length ? { name: "story-" + s[0].name.slice(3), el: s[0].el } : null;
}
function captionFor(kind, d, office) {
  return kind === "propiedad" ? captionPropiedad(d, office) : captionGenerica(kind, d, office);
}
function nameFor(kind, d) {
  return slugify([kind === "propiedad" ? d.tipo : kind, d.proyecto || d.zona || d.titulo || d.pregunta].filter(Boolean).join(" "));
}

/* ====================================================================== */
export default function App() {
  const [tab, setTab] = useState(() => LS.get("kx.tab", "propiedad"));
  const [office, setOffice] = useState(() => ({ ...OFFICE_DEFAULT, ...LS.get("kx.office", {}) }));
  const [docs, setDocs] = useState(() => {
    const saved = LS.get("kx.docs", {});
    const out = {};
    for (const k of Object.keys(DEFAULTS)) out[k] = { ...DEFAULTS[k], ...(saved[k] || {}), fotos: [] };
    return out;
  });
  // El agente NO se guarda: se pide en cada pieza (puede ser para otro agente).
  const [agente, setAgente] = useState({ nombre: "", whatsapp: "", email: "" });
  const [fmt, setFmt] = useState("feed");
  const [guides, setGuides] = useState(() => LS.get("kx.guides", true));
  useEffect(() => LS.set("kx.guides", guides), [guides]);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => LS.set("kx.tab", tab), [tab]);
  useEffect(() => LS.set("kx.office", office), [office]);
  useEffect(() => {
    const strip = {};
    for (const [k, v] of Object.entries(docs)) { const { fotos, ...rest } = v; strip[k] = rest; }
    LS.set("kx.docs", strip);
  }, [docs]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  // CHANTAL cargada por el usuario → @font-face con data URI (así también entra en el PNG exportado)
  useEffect(() => {
    let el = document.getElementById("kx-chantal");
    if (!office.chantal) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("style"); el.id = "kx-chantal"; document.head.appendChild(el); }
    el.textContent = `@font-face{font-family:"CHANTAL";src:url(${office.chantal});}`;
  }, [office.chantal]);

  const kind = tab;
  const isPiece = ["propiedad", "hook", "pasos", "social"].includes(kind);
  const raw = docs[kind] || {};
  const d = useMemo(() => ({ ...raw, agente, fotos: (raw.fotos || []).map((f) => f.url) }), [raw, agente]);
  const set = (patch) => setDocs((all) => ({ ...all, [kind]: { ...all[kind], ...patch } }));
  const setIn = (key, patch) => set({ [key]: { ...(raw[key] || {}), ...patch } });

  const { errors, warnings } = isPiece ? validate(kind, d) : { errors: [], warnings: [] };
  const [contrast, setContrast] = useState([]);
  useEffect(() => {
    let alive = true;
    const tpl = kind === "propiedad" ? (d.tipo === "lote" ? "lote" : "ficha") : kind;
    checkContrast(tpl, d.variante, fmt, d.fotos[0]).then((w) => alive && setContrast(w));
    return () => { alive = false; };
  }, [kind, d.tipo, d.variante, fmt, d.fotos[0]]);

  const [capOverride, setCapOverride] = useState({});
  const autoCaption = isPiece ? captionFor(kind, d, office) : "";
  const caption = capOverride[kind] ?? autoCaption;

  const [editPoly, setEditPoly] = useState(false);
  const refs = useRef({});
  const storyRef = useRef();

  const slides = isPiece ? slidesFor(kind, d, office, fmt) : [];
  const story = isPiece ? storyFor(kind, d, office) : null;

  async function exportZip() {
    if (errors.length) { setToast("Completa lo que falta antes de exportar."); return; }
    setBusy(true);
    try {
      const base = nameFor(kind, d);
      const files = [];
      for (const s of slides) files.push([`${base}/${s.name}-${FORMATS[fmt].w}x${FORMATS[fmt].h}.png`, dataUrlToBytes(await nodeToPng(refs.current[s.name]))]);
      if (story && storyRef.current) files.push([`${base}/${story.name}-1080x1920.png`, dataUrlToBytes(await nodeToPng(storyRef.current))]);
      files.push([`${base}/caption.txt`, caption]);
      // datos.json: lo que necesita el generador de reels (node generate.mjs) para hacer el reel de esta pieza
      if (kind === "propiedad") {
        const { fotos, ...rest } = raw;
        files.push([`${base}/datos.json`, JSON.stringify({ ...rest, agente, fotos: (raw.fotos || []).map((f) => "fotos/" + f.name) }, null, 2)]);
      }
      await zipAndDownload(files, `${base}.zip`, saveFile);
      setToast(`Exportado: ${files.length - 1} imágenes + caption`);
    } catch (e) { console.error(e); setToast("No se pudo exportar: " + e.message); }
    setBusy(false);
  }

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); setToast("Caption copiada"); }
    catch { document.getElementById("caption-ta")?.select(); setToast("Selecciona y copia con Ctrl/Cmd + C"); }
  }

  return (
    <>
      <header className="app-head">
        <div className="brand"><img src={BRAND.logoRojo} alt="KEYMEX Caribe" /><small>Studio</small></div>
        <nav className="tabs" role="tablist">
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </nav>
      </header>

      {isPiece ? (
        <main className="work">
          <section className="panel form">
            <div className="group">
              <h3>Agente de esta pieza</h3>
              <div className="row">
                <F label="Nombre del agente" value={agente.nombre} onChange={(v) => setAgente({ ...agente, nombre: v })} />
                <F label="WhatsApp" value={agente.whatsapp} placeholder="+1 809 000 0000" onChange={(v) => setAgente({ ...agente, whatsapp: v })} />
              </div>
              <F label="Email del agente (opcional)" value={agente.email} onChange={(v) => setAgente({ ...agente, email: v })} />
            </div>
            {kind === "propiedad" && <PropiedadForm d={raw} set={set} setIn={setIn} editPoly={editPoly} setEditPoly={setEditPoly} />}
            {kind === "hook" && <HookForm d={raw} set={set} />}
            {kind === "pasos" && <PasosForm d={raw} set={set} />}
            {kind === "social" && <SocialForm d={raw} set={set} />}
            <div className="group">
              <h3>Fotos</h3>
              <Photos fotos={raw.fotos || []} setFotos={(f) => set({ fotos: f })}
                max={kind === "social" ? 5 : kind === "propiedad" ? 10 : 1}
                hint={kind === "propiedad" ? "La 1ª es la portada; las demás salen como slides limpias con el logo." : kind === "social" ? "De 3 a 5 fotos para el collage." : "Foto de fondo."} />
              {kind !== "social" ? <Sel label="Encuadre de la portada" value={raw.foto_pos || "center"} onChange={(v) => set({ foto_pos: v })} options={{ center: "Centro", top: "Arriba", bottom: "Abajo", left: "Izquierda", right: "Derecha" }} /> : null}
            </div>
          </section>

          <section className="stage">
            <div className="panel stage-bar">
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Seg value={fmt} onChange={setFmt} options={{ feed: "Feed 4:5", story: "Story / Reel 9:16", square: "1:1" }} />
                <label className="chk" htmlFor="chk-guides"><input id="chk-guides" type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Zonas seguras IG + TikTok</label>
              </div>
              <button className="btn primary" type="button" disabled={busy || errors.length > 0} onClick={exportZip}>
                {busy ? "Exportando…" : `Exportar ZIP (${slides.length + (story ? 1 : 0)} PNG + caption)`}
              </button>
            </div>
            <div className="panel status" aria-live="polite">
              {errors.map((e) => <div className="e" key={e}>{e}</div>)}
              {[...warnings, ...contrast].map((w) => <div className="w" key={w}>{w}</div>)}
              {!errors.length && !warnings.length && !contrast.length ? <div className="ok">Lista para exportar: logo, contacto y @keymexamerica incluidos.</div> : null}
            </div>
            {editPoly && kind === "propiedad" ? <p className="hint">Haz clic sobre la portada para marcar los vértices del lote, en orden.</p> : null}
            <div className="strip">
              {slides.map((s, i) => (
                <div className="thumb" key={s.name}>
                  <div className="lbl">{s.name.replace(/^\d+-/, `${i + 1} · `)}</div>
                  <Scaled fmt={fmt} guides={guides} width={i === 0 ? 340 : 220} nodeRef={(n) => (refs.current[s.name] = n?.firstChild)}
                    onPoint={i === 0 && editPoly && kind === "propiedad" ? (p) => setIn("lote", { poligono: [...(raw.lote?.poligono || []), p.map((x) => +x.toFixed(4))] }) : null}>
                    {s.el}
                  </Scaled>
                </div>
              ))}
              {story && fmt !== "story" ? (
                <div className="thumb">
                  <div className="lbl">Story 9:16</div>
                  <Scaled fmt="story" guides={guides} width={190} nodeRef={(n) => (storyRef.current = n?.firstChild)}>{story.el}</Scaled>
                </div>
              ) : null}
            </div>
            {story && fmt === "story" ? <div className="offscreen"><div ref={(n) => (storyRef.current = n?.firstChild)}>{story.el}</div></div> : null}
            <div className="panel caption-box group">
              <div className="stage-bar">
                <h3 style={{ margin: 0, font: "700 11px var(--f-head)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)" }}>Caption</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {capOverride[kind] != null ? <button className="btn sm" type="button" onClick={() => setCapOverride({ ...capOverride, [kind]: undefined })}>Regenerar</button> : null}
                  <button className="btn sm" type="button" onClick={copyCaption}>Copiar</button>
                </div>
              </div>
              <textarea id="caption-ta" value={caption} onChange={(e) => setCapOverride({ ...capOverride, [kind]: e.target.value })} />
            </div>
          </section>
        </main>
      ) : null}

      {kind === "destacadas" && <DestacadasTab d={docs.destacadas} set={(p) => setDocs((a) => ({ ...a, destacadas: { ...a.destacadas, ...p } }))} setToast={setToast} />}
      {kind === "masiva" && <BulkTab office={office} setToast={setToast} />}
      {kind === "oficina" && <OficinaTab office={office} setOffice={setOffice} setToast={setToast} />}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </>
  );
}

/* ---------------- formularios ---------------- */
function Comunes({ d, set }) {
  return (
    <div className="row">
      <Sel label="Segmento (tono del copy)" value={d.segmento || "inversor"} onChange={(v) => set({ segmento: v })} options={SEGMENTOS} />
      <label className="chk" style={{ alignSelf: "end", paddingBottom: 8 }}><input type="checkbox" checked={!!d.confotur} onChange={(e) => set({ confotur: e.target.checked })} /> Sello CONFOTUR</label>
    </div>
  );
}

function PropiedadForm({ d, set, setIn, editPoly, setEditPoly }) {
  const L = d.lote || {};
  const pts = L.poligono || [];
  const toggleAm = (a) => set({ amenidades: (d.amenidades || []).includes(a) ? d.amenidades.filter((x) => x !== a) : [...(d.amenidades || []), a] });
  return (
    <>
      <div className="group">
        <h3>Propiedad</h3>
        <div className="row">
          <Sel label="Tipo" value={d.tipo} onChange={(v) => set({ tipo: v })} options={{ villa: "Villa", apartamento: "Apartamento", casa: "Casa", adosado: "Adosado", penthouse: "Penthouse", lote: "Lote / terreno" }} />
          <Sel label="Operación" value={d.operacion || "venta"} onChange={(v) => set({ operacion: v })} options={{ venta: "Venta", alquiler: "Alquiler" }} />
          {d.tipo !== "lote" ? <Sel label="Variante" value={d.variante || "clara"} onChange={(v) => set({ variante: v })} options={{ clara: "Clara", oscura: "Oscura" }} /> : null}
        </div>
        <Comunes d={d} set={set} />
        {d.tipo !== "lote" ? (
          <div className="row">
            <F label="Título" value={d.titulo} onChange={(v) => set({ titulo: v })} />
            <F label="Palabra acento (dorado)" value={d.palabra_acento} onChange={(v) => set({ palabra_acento: v })} />
          </div>
        ) : null}
        <div className="row">
          <F label="Proyecto" value={d.proyecto} onChange={(v) => set({ proyecto: v })} />
          <F label="Zona" value={d.zona} onChange={(v) => set({ zona: v })} />
          <F label="Ciudad" value={d.ciudad} onChange={(v) => set({ ciudad: v })} />
        </div>
        {d.tipo !== "lote" ? (
          <>
            <F label="Bajada (1–2 líneas)" value={d.bajada} onChange={(v) => set({ bajada: v })} area rows={2} />
            <F label="Frase en script" value={d.frase_script} onChange={(v) => set({ frase_script: v })} />
          </>
        ) : null}
      </div>
      <div className="group">
        <h3>Precio y medidas</h3>
        <div className="row">
          <Sel label="Moneda" value={d.moneda || "USD"} onChange={(v) => set({ moneda: v })} options={{ USD: "US$", "RD$": "RD$" }} />
          <F label="Precio" value={d.precio} onChange={(v) => set({ precio: v })} inputMode="numeric" />
          <label className="chk" style={{ alignSelf: "end", paddingBottom: 8 }}><input type="checkbox" checked={!!d.precio_desde} onChange={(e) => set({ precio_desde: e.target.checked })} /> “Desde”</label>
        </div>
        <div className="row">
          <F label="m² solar" value={d.m2_solar} onChange={(v) => set({ m2_solar: v })} />
          {d.tipo !== "lote" ? <F label="m² construcción" value={d.m2_construccion} onChange={(v) => set({ m2_construccion: v })} /> : null}
          <F label={d.tipo === "lote" ? "Dormitorios máx." : "Habitaciones"} value={d.habitaciones} onChange={(v) => set({ habitaciones: v })} />
          {d.tipo !== "lote" ? <F label="Baños" value={d.banos} onChange={(v) => set({ banos: v })} /> : null}
        </div>
      </div>
      {d.tipo === "lote" ? (
        <div className="group">
          <h3>Lote con drone</h3>
          <div className="row">
            <F label="Etiqueta superior" value={L.etiqueta_superior} placeholder="RESIDENCIAL" onChange={(v) => setIn("lote", { etiqueta_superior: v })} />
            <F label="Uso permitido" value={L.uso} onChange={(v) => setIn("lote", { uso: v })} />
            <F label="Niveles" value={L.niveles} onChange={(v) => setIn("lote", { niveles: v })} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`btn ${editPoly ? "primary" : ""}`} type="button" onClick={() => setEditPoly(!editPoly)}>{editPoly ? "Terminar polígono" : "Marcar polígono en la foto"}</button>
            <button className="btn" type="button" onClick={() => setIn("lote", { poligono: pts.slice(0, -1) })} disabled={!pts.length}>Deshacer punto</button>
            <button className="btn" type="button" onClick={() => setIn("lote", { poligono: [], medidas: [] })} disabled={!pts.length}>Limpiar</button>
          </div>
          {pts.length >= 2 ? (
            <div className="row">
              {pts.map((_, i) => (
                <F key={i} label={`Lado ${i + 1}–${(i + 1) % pts.length + 1}`} value={(L.medidas || [])[i] || ""} placeholder="15.08 m"
                  onChange={(v) => { const m = [...(L.medidas || [])]; m[i] = v; setIn("lote", { medidas: m }); }} />
              ))}
            </div>
          ) : <p className="hint">{pts.length} punto(s) marcados. Necesitas 3 o más.</p>}
        </div>
      ) : (
        <div className="group">
          <h3>Amenidades (máx. 5 en la portada)</h3>
          <div className="chips">
            {Object.entries(AMENIDADES).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={(d.amenidades || []).includes(k)} onClick={() => toggleAm(k)}><Icon name={k} className="" />{l}</button>
            ))}
          </div>
        </div>
      )}
      <div className="group">
        <h3>Para la caption</h3>
        <F label="Descripción (2–3 líneas)" value={d.descripcion} onChange={(v) => set({ descripcion: v })} area rows={3} />
        <F label="Características extra (una por línea)" value={(d.caracteristicas || []).join("\n")} onChange={(v) => set({ caracteristicas: v.split("\n").filter(Boolean) })} area rows={2} />
        <F label="Terminaciones (una por línea)" value={(d.terminaciones || []).join("\n")} onChange={(v) => set({ terminaciones: v.split("\n").filter(Boolean) })} area rows={2} />
        <F label="Plan de pagos (Etapa: valor, una por línea)" value={(d.plan_pagos || []).map((p) => `${p.etapa}: ${p.valor}`).join("\n")}
          onChange={(v) => set({ plan_pagos: v.split("\n").filter(Boolean).map((l) => { const [e, ...r] = l.split(":"); return { etapa: e.trim(), valor: r.join(":").trim() }; }) })} area rows={2} />
        <F label="Frase de cierre" value={d.cierre_caption} onChange={(v) => set({ cierre_caption: v })} />
      </div>
    </>
  );
}

function IconPick({ value, onChange, label }) {
  return <Sel label={label} value={value} onChange={onChange} options={Object.fromEntries(ICON_NAMES.map((n) => [n, n.replace(/_/g, " ")]))} />;
}

function HookForm({ d, set }) {
  const vals = d.valores || [];
  return (
    <div className="group">
      <h3>Hook / estilo de vida</h3>
      <Comunes d={d} set={set} />
      <F label="Pregunta (marca con *asteriscos* la parte en script)" value={d.pregunta} onChange={(v) => set({ pregunta: v })} area rows={2} />
      <F label="Bajada (mayúsculas)" value={d.bajada} onChange={(v) => set({ bajada: v })} />
      {[0, 1, 2].map((i) => (
        <div className="row" key={i}>
          <F label={`Valor ${i + 1}`} value={vals[i]?.label} onChange={(v) => { const a = [...vals]; a[i] = { ...a[i], label: v }; set({ valores: a }); }} />
          <IconPick label="Ícono" value={vals[i]?.icon || "mar"} onChange={(v) => { const a = [...vals]; a[i] = { ...a[i], icon: v }; set({ valores: a }); }} />
        </div>
      ))}
      <F label="Texto extra para la caption" value={d.texto_caption} onChange={(v) => set({ texto_caption: v })} area rows={3} />
    </div>
  );
}

function PasosForm({ d, set }) {
  const pasos = d.pasos || [];
  const upd = (i, p) => { const a = [...pasos]; a[i] = { ...a[i], ...p }; set({ pasos: a }); };
  return (
    <div className="group">
      <h3>Educativo / pasos</h3>
      <Comunes d={d} set={set} />
      <div className="row">
        <F label="Título tras “N PASOS”" value={d.titulo} onChange={(v) => set({ titulo: v })} />
        <F label="Cinta (zona)" value={d.zona} onChange={(v) => set({ zona: v })} />
      </div>
      {pasos.map((p, i) => (
        <div className="row" key={i}>
          <F label={`Paso ${i + 1}`} value={p.texto} onChange={(v) => upd(i, { texto: v })} />
          <IconPick label="Ícono" value={p.icon || "check"} onChange={(v) => upd(i, { icon: v })} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" type="button" disabled={pasos.length >= 6} onClick={() => set({ pasos: [...pasos, { texto: "", icon: "check" }] })}>+ Paso</button>
        <button className="btn" type="button" disabled={pasos.length <= 3} onClick={() => set({ pasos: pasos.slice(0, -1) })}>− Paso</button>
      </div>
      <F label="Cierre en script" value={d.cierre} onChange={(v) => set({ cierre: v })} />
    </div>
  );
}

function SocialForm({ d, set }) {
  return (
    <div className="group">
      <h3>Prueba social</h3>
      <Comunes d={d} set={set} />
      <div className="row">
        <F label="Palabra en script" value={d.titulo_script} onChange={(v) => set({ titulo_script: v })} />
        <F label="Palabra en bold" value={d.titulo_bold} onChange={(v) => set({ titulo_bold: v })} />
      </div>
      <Sel label="Etiqueta" value={d.pill || ""} onChange={(v) => set({ pill: v })} options={{ "PROPERTY SOLD": "PROPERTY SOLD", "CLIENTE FELIZ": "CLIENTE FELIZ", "ENTREGA DE LLAVES": "ENTREGA DE LLAVES", "": "Sin etiqueta" }} />
      <F label="Texto (opcional, debajo del collage)" value={d.texto} onChange={(v) => set({ texto: v })} area rows={2} />
    </div>
  );
}

/* ---------------- destacadas ---------------- */
function DestacadasTab({ d, set, setToast }) {
  const items = d.items || [];
  const refs = useRef([]);
  const [busy, setBusy] = useState(false);
  const upd = (i, p) => { const a = [...items]; a[i] = { ...a[i], ...p }; set({ items: a }); };
  async function exp() {
    setBusy(true);
    try {
      const files = [];
      for (let i = 0; i < items.length; i++) files.push([`destacadas/${String(i + 1).padStart(2, "0")}-${slugify(items[i].label)}.png`, dataUrlToBytes(await nodeToPng(refs.current[i]))]);
      await zipAndDownload(files, "destacadas-keymex-caribe.zip", saveFile);
      setToast(`Exportadas ${files.length} portadas`);
    } catch (e) { setToast("No se pudo exportar: " + e.message); }
    setBusy(false);
  }
  return (
    <main className="work">
      <section className="panel form">
        <div className="group">
          <h3>Portadas de destacadas</h3>
          <p className="hint">Círculo rojo, aro crema e ícono blanco. Se exportan a 1080×1080; Instagram las recorta en círculo.</p>
          {items.map((it, i) => (
            <div className="row" key={i}>
              <F label={`Destacada ${i + 1}`} value={it.label} onChange={(v) => upd(i, { label: v })} />
              <IconPick label="Ícono" value={it.icon} onChange={(v) => upd(i, { icon: v })} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" type="button" onClick={() => set({ items: [...items, { label: "Nueva", icon: "pin" }] })}>+ Destacada</button>
            <button className="btn" type="button" disabled={!items.length} onClick={() => set({ items: items.slice(0, -1) })}>− Quitar última</button>
          </div>
        </div>
      </section>
      <section className="stage">
        <div className="panel stage-bar"><span className="hint">{items.length} portadas</span><button className="btn primary" type="button" disabled={busy || !items.length} onClick={exp}>{busy ? "Exportando…" : "Exportar ZIP"}</button></div>
        <div className="strip" style={{ flexWrap: "wrap" }}>
          {items.map((it, i) => (
            <div className="thumb" key={i}>
              <div style={{ borderRadius: "50%", overflow: "hidden", width: 150, height: 150 }}>
                <Scaled fmt="square" width={150} nodeRef={(n) => (refs.current[i] = n?.firstChild)}><Destacada icon={it.icon} label={it.label} /></Scaled>
              </div>
              <div className="lbl" style={{ textAlign: "center" }}>{it.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------- carga masiva ---------------- */
function BulkTab({ office, setToast }) {
  const [rows, setRows] = useState([]);
  const [files, setFiles] = useState({});
  const [prog, setProg] = useState("");
  const csvIn = useRef(), imgIn = useRef();
  const loadCSV = async (f) => { const { rows, errors } = parseCSV(await f.text()); setRows(rows); setToast(`${rows.length} filas leídas${errors.length ? ` · ${errors.length} con errores de formato` : ""}`); };
  const loadImgs = (list) => { const m = { ...files }; [...list].forEach((f) => (m[f.name.toLowerCase()] = URL.createObjectURL(f))); setFiles(m); };
  const full = rows.map((r) => {
    const fotos = r.fotosNombres.map((n) => files[n.toLowerCase()]).filter(Boolean);
    const d = { ...r, fotos };
    const v = validate("propiedad", d);
    const faltan = r.fotosNombres.filter((n) => !files[n.toLowerCase()]);
    if (faltan.length) v.warnings.push(`Faltan fotos: ${faltan.join(", ")}`);
    return { d, v };
  });
  async function run() {
    const host = document.createElement("div"); host.className = "offscreen"; document.body.appendChild(host);
    const root = createRoot(host);
    const out = [];
    try {
      for (let i = 0; i < full.length; i++) {
        const { d, v } = full[i];
        if (v.errors.length) continue;
        const base = `${String(i + 1).padStart(2, "0")}-${nameFor("propiedad", d)}`;
        const list = [...slidesFor("propiedad", d, office, "feed"), storyFor("propiedad", d, office)];
        for (const s of list) {
          setProg(`Fila ${i + 1}/${full.length} · ${s.name}`);
          flushSync(() => root.render(s.el));
          await new Promise((r) => requestAnimationFrame(() => r()));
          const png = await nodeToPng(host.firstChild);
          out.push([`${base}/${s.name}${s.name.startsWith("story") ? "-1080x1920" : "-1080x1350"}.png`, dataUrlToBytes(png)]);
        }
        out.push([`${base}/caption.txt`, captionPropiedad(d, office)]);
      }
      setProg("Comprimiendo…");
      await zipAndDownload(out, "keymex-caribe-lote.zip", saveFile);
      setToast(`Listo: ${out.length} archivos`);
    } catch (e) { setToast("Error: " + e.message); }
    root.unmount(); host.remove(); setProg("");
  }
  const okCount = full.filter((x) => !x.v.errors.length).length;
  return (
    <main className="work">
      <section className="panel form">
        <div className="group">
          <h3>1 · Planilla CSV</h3>
          <p className="hint">Una fila = un carrusel. Listas separadas con “|”. En la columna fotos van los nombres de archivo.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={() => csvIn.current.click()}>Cargar CSV</button>
            <button className="btn" type="button" onClick={async () => { await saveFile(new Blob([sampleCSV()], { type: "text/csv" }), "plantilla-keymex.csv"); }}>Descargar plantilla</button>
            <input ref={csvIn} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files[0] && loadCSV(e.target.files[0])} />
          </div>
        </div>
        <div className="group">
          <h3>2 · Fotos de todas las filas</h3>
          <div className="drop" onClick={() => imgIn.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); loadImgs(e.dataTransfer.files); }}>
            Arrastra todas las fotos juntas ({Object.keys(files).length} cargadas)
            <input ref={imgIn} type="file" accept="image/*" multiple hidden onChange={(e) => loadImgs(e.target.files)} />
          </div>
        </div>
        <div className="group">
          <h3>3 · Generar</h3>
          <button className="btn primary" type="button" disabled={!okCount || !!prog} onClick={run}>{prog || `Generar ZIP (${okCount} carruseles)`}</button>
        </div>
      </section>
      <section className="panel">
        {rows.length ? (
          <div className="tbl-wrap">
            <table className="bulk">
              <thead><tr><th>#</th><th>Propiedad</th><th>Precio</th><th>Agente</th><th>Estado</th></tr></thead>
              <tbody>
                {full.map(({ d, v }, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td>{d.titulo || d.proyecto}<br /><span className="hint">{d.zona}</span></td>
                    <td>{d.moneda} {d.precio}</td><td>{d.agente.nombre}<br /><span className="hint">{d.agente.whatsapp}</span></td>
                    <td className="status">{v.errors.map((e) => <div className="e" key={e}>{e}</div>)}{v.warnings.map((w) => <div className="w" key={w}>{w}</div>)}{!v.errors.length && !v.warnings.length ? <div className="ok">OK</div> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">Carga un CSV para ver las filas. Usa “Descargar plantilla” para ver las columnas: tipo, titulo, palabra_acento, proyecto, zona, precio, moneda, m2_solar, amenidades, fotos, agente_nombre, agente_whatsapp…</p>}
      </section>
    </main>
  );
}

/* ---------------- oficina ---------------- */
function OficinaTab({ office, setOffice, setToast }) {
  const fontIn = useRef();
  const upd = (p) => setOffice({ ...office, ...p });
  const loadFont = (f) => {
    const r = new FileReader();
    r.onload = () => { upd({ chantal: r.result, chantalName: f.name }); setToast("CHANTAL cargada"); };
    r.readAsDataURL(f);
  };
  return (
    <main className="work">
      <section className="panel form">
        <div className="group">
          <h3>Datos fijos de la oficina</h3>
          <p className="hint">Se guardan en este navegador. El WhatsApp no va acá: se pide en cada pieza.</p>
          <F label="Nombre de la oficina" value={office.nombre} onChange={(v) => upd({ nombre: v })} />
          <F label="Tagline (barra superior)" value={office.tagline} onChange={(v) => upd({ tagline: v })} />
          <div className="row">
            <F label="Instagram" value={office.instagram} onChange={(v) => upd({ instagram: v })} />
            <F label="Web" value={office.web} onChange={(v) => upd({ web: v })} />
          </div>
          <div className="row">
            <F label="Email general" value={office.email} onChange={(v) => upd({ email: v })} />
            <F label="Firma geográfica (footer)" value={office.lat} onChange={(v) => upd({ lat: v })} />
          </div>
        </div>
        <div className="group">
          <h3>Fuente CHANTAL</h3>
          <p className="hint">{office.chantal ? `Cargada: ${office.chantalName}` : "No cargada. Mientras tanto, las frases en script usan una fuente provisoria."}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" type="button" onClick={() => fontIn.current.click()}>Cargar archivo .otf / .ttf / .woff2</button>
            {office.chantal ? <button className="btn" type="button" onClick={() => upd({ chantal: "", chantalName: "" })}>Quitar</button> : null}
            <input ref={fontIn} type="file" accept=".otf,.ttf,.woff,.woff2" hidden onChange={(e) => e.target.files[0] && loadFont(e.target.files[0])} />
          </div>
        </div>
      </section>
      <section className="panel group">
        <h3>Reglas de marca aplicadas</h3>
        <p className="hint">Logo KEYMEX Caribe oficial en todas las piezas · Rojo #AD1D28 + dorado como acento de 1 palabra · Montserrat (títulos) y Poppins (texto) · contacto del agente en el footer · @keymexamerica en cada caption · sello CONFOTUR solo si la propiedad está clasificada. Todo pasa por aprobación de Marketing KEYMEX América antes de publicar.</p>
      </section>
    </main>
  );
}
