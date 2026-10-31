// Utilidades compartidas por las plantillas (post y reel)
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Usa el logo oficial si el generador lo encontró en assets/, si no un wordmark tipográfico provisorio.
function logoHTML(variant) {
  const d = window.__DATA__ || {};
  const file = d.__logos && d.__logos[variant];
  if (file) return `<span class="logo ${variant}"><img src="${file}" alt="KEYMEX"></span>`;
  return `<span class="logo ${variant}"><span class="wm">KEYMEX</span><span class="sub">LE CENTRE IMMOBILIER</span></span>`;
}

const ICONS = {
  bed: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 38V12M4 30h40v8M44 30v-6a6 6 0 0 0-6-6H22v12"/><circle cx="13" cy="22" r="4"/></svg>`,
  bath: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 24h40v6a10 10 0 0 1-10 10H14A10 10 0 0 1 4 30z"/><path d="M10 24V10a4 4 0 0 1 8 0M14 40l-2 4M34 40l2 4"/></svg>`,
  area: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="36" height="36"/><path d="M6 18h8M6 30h8M18 6v8M30 6v8"/></svg>`,
  land: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 40l12-18 8 10 6-8 14 16z"/><circle cx="34" cy="12" r="4"/></svg>`,
  car: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 32v6h6v-6M34 32v6h6v-6M6 32V22l5-10h26l5 10v10z"/><path d="M6 22h36"/><circle cx="14" cy="27" r="1.5"/><circle cx="34" cy="27" r="1.5"/></svg>`,
  floor: `<svg viewBox="0 0 48 48" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 42h36M10 42V8h28v34M18 16h4M26 16h4M18 26h4M26 26h4"/></svg>`,
};

function fmtNum(n) {
  if (n == null || n === "") return null;
  return String(n);
}

function specCells(d) {
  const out = [];
  if (fmtNum(d.habitaciones)) out.push({ icon: "bed", num: d.habitaciones, lbl: "Habitaciones" });
  if (fmtNum(d.banos)) out.push({ icon: "bath", num: d.banos, lbl: "Baños" });
  if (fmtNum(d.m2_construidos)) out.push({ icon: "area", num: `${d.m2_construidos}<sup>m²</sup>`, lbl: "Construidos" });
  if (fmtNum(d.m2_terreno)) out.push({ icon: "land", num: `${d.m2_terreno}<sup>m²</sup>`, lbl: "Terreno" });
  if (fmtNum(d.parqueos)) out.push({ icon: "car", num: d.parqueos, lbl: "Parqueos" });
  if (fmtNum(d.piso)) out.push({ icon: "floor", num: d.piso, lbl: "Piso" });
  return out;
}

function specsLine(d) {
  const p = [];
  if (d.habitaciones) p.push(`${d.habitaciones} hab`);
  if (d.banos) p.push(`${d.banos} baños`);
  if (d.m2_construidos) p.push(`${d.m2_construidos} m²`);
  return p.join(" · ");
}
