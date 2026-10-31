# KEYMEX Caribe · Generador de Post + Reel

Pasale a Claude **el link de una propiedad o un video** y devuelve:

| Salida | Formato |
|---|---|
| `post-01…05.png` | Carrusel 1080×1350 (portada · ficha · galería + destacados · lifestyle · CTA) |
| `reel.mp4` | Reel 1080×1920, ~18 s: gancho → datos → precio → placa roja de cierre |
| `reel-portada.jpg` | Portada del reel |
| `caption.txt` | Caption con ficha, CTA y hashtags |

## Uso manual
```bash
node generate.mjs propiedades/<carpeta>
```
La carpeta lleva `propiedad.json` + `fotos/` y/o `video.mp4` (y opcional `musica.mp3`). Resultado en `propiedades/<carpeta>/salida/`.

Logos oficiales (KEYMEX Caribe rojo/blanco y sello CONFOTUR) ya cargados en `assets/`. El WhatsApp del agente se pide en cada pieza.

---

# KEYMEX Caribe Studio (app web)

Carpeta `app/` · React + Vite. Plantillas: Ficha (clara/oscura) · Lote con drone (editor de polígono) · Hook · Educativo (3–6 pasos) · Prueba social (collage 3–5) · Slide foto · Story 9:16 de cualquiera · Portadas de destacadas.
Incluye caption automática (según segmento: inversor / familia / inversor AR-CL-PY), selector US$/RD$, sello CONFOTUR opcional, validaciones (precio, 1 palabra acento, contacto del agente, contraste AA) y carga masiva por CSV → ZIP.

```bash
cd app && npm install
npm run dev     # editar y probar en http://localhost:5173
npm run build   # genera dist/index.html (un solo archivo autocontenido)
```
CHANTAL: se carga desde la pestaña "Oficina y marca" (archivo .otf/.ttf/.woff2). Hasta entonces se usa una script provisoria.
