# KEYMEX Caribe · Contenido de Instagram y TikTok

Dos herramientas que comparten las mismas plantillas de marca:

1. **KEYMEX Caribe Studio** (`app/`): app web para armar fichas, lotes con drone, hooks, educativos, prueba social, slides de foto, stories y portadas de destacadas, con caption automática y exportación en ZIP.
2. **Generador de reels** (`generate.mjs`): de una propiedad (link, fotos o video) saca carrusel, story, reel animado y caption.

## Zonas seguras (todas las plantillas)
| Formato | Regla |
|---|---|
| 9:16 (Reels, Stories, TikTok, portada de reel) | Texto y tarjetas dentro de x 60–940 · y 220–1440. Arriba 220 px (barra de IG/TikTok), abajo 480 px (usuario, caption, audio, navegación), derecha 140 px (botones). Las fotos sí ocupan todo el lienzo. |
| Feed 4:5 (1080×1350) | La grilla del perfil muestra el centro en 3:4: recorta 34 px por lado. El texto va a ≥ 56 px del borde. |
| Portada de reel en la grilla | Se ve el centro 3:4 (y 240–1680): queda cubierto por la zona 220–1440. |

Los valores están en `app/src/lib/format.js` (`SAFE`) y en `generate.mjs`. La app tiene el interruptor **"Zonas seguras IG + TikTok"** para verlas en la vista previa (no se exportan). En lotes, el generador avisa si un vértice del polígono cae bajo la interfaz.

## KEYMEX Caribe Studio
```bash
cd app && npm install
npm run dev     # http://localhost:5173
npm run build   # dist/index.html: un solo archivo autocontenido (también lo usa el generador)
```
CHANTAL: se carga desde la pestaña "Oficina y marca". Hasta entonces se usa una script provisoria.

## Generador de reels
```bash
node generate.mjs propiedades/<carpeta>            # carrusel + story + reel animado + caption
node generate.mjs propiedades/<carpeta> --frame    # lotes: fotograma 9:16 con grilla y zonas prohibidas en rojo
```
La carpeta lleva `propiedad.json` + `fotos/` y/o `video.mp4` (y opcional `musica.mp3`). Salida en `propiedades/<carpeta>/salida/`:
`post-01-portada.png`, `post-NN-foto.png` (1080×1350), `story-portada.png` = `reel-portada.png` (1080×1920), `reel.mp4`, `caption.txt`.
Ejemplos: `propiedades/ejemplo-cap-cana` (villa con fotos) y `propiedades/ejemplo-lote-drone` (lote con video de drone y polígono animado).

Datos fijos de la oficina en `oficina.json`. Logos oficiales (KEYMEX Caribe rojo/blanco y sello CONFOTUR) en `assets/`. El WhatsApp del agente se pide en cada pieza.
