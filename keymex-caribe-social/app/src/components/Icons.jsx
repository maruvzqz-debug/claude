// Íconos de línea propios (viewBox 48×48). Heredan color por currentColor.
const P = {
  // Amenidades
  piscina: <><path d="M6 34c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2"/><path d="M6 41c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2"/><path d="M16 30V10a4 4 0 0 1 8 0M30 30V10a4 4 0 0 1 8 0M16 17h14M16 24h14"/></>,
  terraza: <><path d="M6 18L24 8l18 10z"/><path d="M24 18v22M14 40h20M10 30h28"/></>,
  marquesina: <><path d="M4 18L24 8l20 10"/><path d="M10 40v-8l3-6h22l3 6v8z"/><path d="M10 32h28"/><circle cx="16" cy="36" r="1.5"/><circle cx="32" cy="36" r="1.5"/></>,
  jardin: <><path d="M24 42V24"/><path d="M24 26c-8 0-12-6-12-14 8 0 12 6 12 14zM24 30c6 0 10-4 10-11-6 0-10 4-10 11z"/><path d="M12 42h24"/></>,
  gimnasio: <><path d="M14 24h20M6 18v12M10 14v20M38 14v20M42 18v12"/></>,
  seguridad: <><path d="M24 4l16 6v12c0 10-7 17-16 22C15 39 8 32 8 22V10z"/><path d="M17 24l5 5 9-10"/></>,
  playa: <><path d="M6 40c4-3 8-3 12 0s8 3 12 0 8-3 12 0"/><path d="M26 34L18 10"/><path d="M8 16c4-7 14-9 20-4z"/></>,
  golf: <><path d="M18 42V6l16 7-16 7"/><ellipse cx="22" cy="42" rx="14" ry="3"/></>,
  bbq: <><path d="M8 18h32a16 16 0 0 1-32 0z"/><path d="M16 32l-4 10M32 32l4 10M24 34v8"/><path d="M18 12c0-3 3-3 3-6M26 12c0-3 3-3 3-6"/></>,
  ascensor: <><rect x="10" y="4" width="28" height="40" rx="2"/><path d="M24 4v40M16 18l3-4 3 4M26 30l3 4 3-4"/></>,
  aire: <><rect x="4" y="10" width="40" height="16" rx="3"/><path d="M10 20h28M12 32c0 3 3 3 3 6M24 32v8M36 32c0 3-3 3-3 6"/></>,
  vista_mar: <><path d="M4 30c5-4 10-4 15 0s10 4 15 0 7-3 10-2"/><path d="M4 38c5-4 10-4 15 0s10 4 15 0 7-3 10-2"/><circle cx="34" cy="14" r="6"/></>,
  area_social: <><circle cx="16" cy="14" r="5"/><circle cx="32" cy="14" r="5"/><path d="M6 36c0-7 5-12 10-12s10 5 10 12M22 36c0-7 5-12 10-12s10 5 10 12"/></>,
  parqueo: <><rect x="8" y="6" width="32" height="36" rx="4"/><path d="M19 34V14h7a6 6 0 0 1 0 12h-7"/></>,
  jacuzzi: <><path d="M4 26h40v6a10 10 0 0 1-10 10H14A10 10 0 0 1 4 32z"/><path d="M16 20c-2-3 2-5 0-8M24 20c-2-3 2-5 0-8M32 20c-2-3 2-5 0-8"/></>,
  amueblado: <><path d="M8 24v-8a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v8"/><path d="M4 24h40v10H4zM8 34v6M40 34v6"/></>,
  // Datos
  cama: <><path d="M4 38V12M4 30h40v8M44 30v-6a6 6 0 0 0-6-6H22v12"/><circle cx="13" cy="22" r="4"/></>,
  bano: <><path d="M4 24h40v6a10 10 0 0 1-10 10H14A10 10 0 0 1 4 30z"/><path d="M10 24V10a4 4 0 0 1 8 0M14 40l-2 4M34 40l2 4"/></>,
  area: <><rect x="6" y="6" width="36" height="36"/><path d="M6 18h8M6 30h8M18 6v8M30 6v8"/></>,
  terreno: <><path d="M4 40l12-18 8 10 6-8 14 16z"/><circle cx="34" cy="12" r="4"/></>,
  casa: <><path d="M6 22L24 8l18 14"/><path d="M10 19v23h28V19M20 42V30h8v12"/></>,
  niveles: <><path d="M24 6L4 16l20 10 20-10z"/><path d="M4 24l20 10 20-10M4 32l20 10 20-10"/></>,
  // Valores / hooks
  mar: <><path d="M4 22c5-4 10-4 15 0s10 4 15 0 7-3 10-2"/><path d="M4 30c5-4 10-4 15 0s10 4 15 0 7-3 10-2"/><path d="M4 38c5-4 10-4 15 0s10 4 15 0 7-3 10-2"/></>,
  naturaleza: <><path d="M24 44V20"/><path d="M24 22c0-8 6-16 16-16 0 10-6 16-16 16zM24 30C24 22 18 16 8 16c0 8 6 14 16 14z"/></>,
  exclusividad: <><path d="M14 6h20l8 12-18 24L6 18z"/><path d="M6 18h36M18 6l-4 12 10 24 10-24-4-12"/></>,
  llave: <><circle cx="14" cy="24" r="8"/><path d="M22 24h22M36 24v8M42 24v6"/></>,
  laurel: <><path d="M16 42C8 34 8 18 16 8M32 42c8-8 8-24 0-34"/><path d="M14 34c-4 0-6-2-6-5 4 0 6 2 6 5zM12 24c-4-1-5-4-4-7 3 1 5 3 4 7zM14 14c-3-2-3-5-1-8 2 2 3 5 1 8zM34 34c4 0 6-2 6-5-4 0-6 2-6 5zM36 24c4-1 5-4 4-7-3 1-5 3-4 7zM34 14c3-2 3-5 1-8-2 2-3 5-1 8z"/></>,
  pin: <><path d="M24 44s14-14 14-24a14 14 0 0 0-28 0c0 10 14 24 14 24z"/><circle cx="24" cy="20" r="5"/></>,
  avion: <><path d="M44 8L4 22l14 6 4 14 8-10 10 6z"/><path d="M18 28L44 8"/></>,
  apreton: <><path d="M4 18l8-6 8 4 6-4 6 2 12 4"/><path d="M4 18v12l12 10c2 2 5 2 6 0l12-10 10-8V16"/><path d="M20 16l-6 8c-1 2 2 4 4 2l6-6 10 10"/></>,
  estrella: <><path d="M24 4l6 13 14 2-10 10 2 14-12-7-12 7 2-14L4 19l14-2z"/></>,
  documento: <><path d="M12 4h16l10 10v30H12z"/><path d="M28 4v10h10M18 24h14M18 32h14M18 40h8"/></>,
  dinero: <><rect x="4" y="12" width="40" height="24" rx="3"/><circle cx="24" cy="24" r="6"/><path d="M10 18v12M38 18v12"/></>,
  grafico: <><path d="M6 6v36h36"/><path d="M12 32l9-10 7 6 12-14"/><path d="M34 14h6v6"/></>,
  calendario: <><rect x="6" y="10" width="36" height="32" rx="3"/><path d="M6 20h36M16 6v8M32 6v8"/></>,
  firma: <><path d="M6 36c6-10 10-26 14-24s-6 22 0 22 8-12 12-10-2 10 2 10 6-4 8-4"/><path d="M6 42h36"/></>,
  check: <><circle cx="24" cy="24" r="19"/><path d="M15 24l6 6 12-13"/></>,
  banco: <><path d="M4 18L24 6l20 12z"/><path d="M8 18v18M16 18v18M32 18v18M40 18v18M4 40h40"/></>,
  flecha: <><path d="M8 24h32M28 12l12 12-12 12"/></>,
  // Contacto
  whatsapp: <><path d="M8 40l2.5-8A17 17 0 1 1 17 38z"/><path d="M18 17c0 7 6 13 13 13l3-3-5-3-2 2c-3-1-5-3-6-6l2-2-3-5z"/></>,
  email: <><rect x="4" y="10" width="40" height="28" rx="3"/><path d="M4 12l20 14 20-14"/></>,
  web: <><circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5c6 6 8 12 8 19s-2 13-8 19c-6-6-8-12-8-19s2-13 8-19z"/></>,
  instagram: <><rect x="6" y="6" width="36" height="36" rx="10"/><circle cx="24" cy="24" r="8"/><circle cx="34.5" cy="13.5" r="1.5"/></>,
};

export const AMENIDADES = {
  piscina: "Piscina", terraza: "Terraza", marquesina: "Marquesina", jardin: "Jardín", gimnasio: "Gimnasio",
  seguridad: "Seguridad 24/7", playa: "Playa", golf: "Golf", bbq: "BBQ", ascensor: "Ascensor",
  aire: "A/A", vista_mar: "Vista al mar", area_social: "Área social", parqueo: "Parqueo",
  jacuzzi: "Jacuzzi", amueblado: "Amueblado",
};
export const ICON_NAMES = Object.keys(P);

export function Icon({ name, className = "icon", style }) {
  return (
    <svg className={className} viewBox="0 0 48 48" style={style} aria-hidden="true">
      {P[name] || P.estrella}
    </svg>
  );
}
