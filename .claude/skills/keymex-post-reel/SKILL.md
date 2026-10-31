---
name: keymex-post-reel
description: Genera el post de Instagram (carrusel 1080x1350 + caption) y el reel (1080x1920 MP4) de una propiedad para KEYMEX Caribe a partir de un link de publicación, fotos o un video. Usar cuando el usuario pase un link de propiedad, un video o fotos y pida post, carrusel, reel o contenido de Instagram.
---

# KEYMEX Caribe · Propiedad → Post + Reel

Motor: `keymex-caribe-social/generate.mjs` (Playwright + ffmpeg, fuentes Montserrat/Poppins incluidas).
Marca: aplicar siempre el skill `keymex-brand-guidelines` (Rojo #ad1d28, blanco, Montserrat/Poppins, logo sin modificar).

## Flujo

1. **Crear carpeta** `keymex-caribe-social/propiedades/<slug>/` (slug: tipo-zona-corto, ej. `villa-cap-cana`).
2. **Conseguir los datos**
   - *Link*: leer la página con WebFetch. Extraer: operación, tipo, título, zona, ciudad, precio + moneda, habitaciones, baños, m² construidos/terreno, parqueos, amenidades, descripción y URLs de fotos (buscar `og:image`, galerías, `<img>` grandes). Descargar 6–10 fotos a `fotos/01.jpg, 02.jpg…` ordenadas así: 01 fachada/vista hero, 02 living o vista, 03 vertical/interior, 04 detalle, 05 atardecer/amenidad lifestyle, 06 la mejor que quede.
   - *Video* (archivo o link descargable): guardarlo como `video.mp4`. Si no hay fotos, el motor saca fotogramas del video para el carrusel.
   - Si falta un dato clave (precio, contacto del agente), preguntar; nunca inventar precios, metros ni amenidades.
3. **Escribir `propiedad.json`** (ver `propiedades/ejemplo-cap-cana/propiedad.json`). Copywriting:
   - Español neutro caribeño con **tú** (no voseo). Tono lujo cercano, frases cortas.
   - `titulo` ≤ 40 caracteres; `hook_reel` ≤ 28 caracteres, pregunta o promesa (“¿Te imaginas vivir aquí?”, “Tu casa frente al mar”).
   - `destacados`: 3–5 ítems ≤ 28 caracteres cada uno.
   - `frase_lifestyle`: una línea aspiracional (omitir para carrusel de 4 slides).
   - `caption`: escribirla a mano (mejor que la de plantilla): gancho + 2 líneas de historia + ficha con emojis + precio + CTA WhatsApp + link en bio + 8–12 hashtags (mezcla zona/nicho/marca: #KeymexCaribe siempre). Opcional `caption_reel` más corta.
4. **Generar**: `cd keymex-caribe-social && node generate.mjs propiedades/<slug>`.
5. **Revisar visualmente** antes de entregar: armar una hoja de contacto de los slides y de fotogramas del reel y mirarla (texto cortado, foto mal encuadrada, logo tapado). Corregir JSON/orden de fotos y regenerar.
6. **Entregar** con SendUserFile: los `post-XX.png`, `reel.mp4`, `reel-portada.jpg` y el texto de `caption.txt` pegado en el chat listo para copiar.

## Opciones del JSON
`reel_seg_por_escena` (2.6), `reel_max_datos` (5), `reel_duracion` (24, modo video), `reel_audio_original` (true para conservar audio del video), `hashtags` (array), `cta_titulo`, `cta_texto`, `cta_reel`, `fotos` (orden explícito).
Música: dejar `musica.mp3` con licencia en la carpeta; si no, recomendar agregar audio en tendencia desde la app de Instagram.

## Logos (en `keymex-caribe-social/assets/`)
- `logo-keymex-rojo.png` / `logo-keymex-blanco.png`: logo oficial "KEYMEX · LE CENTRE IMMOBILIER CARIBE" (el blanco es el mismo archivo en blanco). Rojo sobre fondos claros, blanco sobre foto o rojo. Nunca deformar ni recolorear de otro modo.
- `sello-confotur.png`: sello "Proyecto Turístico Clasificado por CONFOTUR". Poner `"confotur": true` **solo** si la publicación/desarrollador confirma la clasificación CONFOTUR (buscar "CONFOTUR", "Ley 158-01", "exento de IPI/transferencia" en la ficha). Si no está claro, preguntar al usuario. Con `true` el sello aparece en portada, ficha, gancho y precio del reel, y la caption suma la línea de beneficios fiscales + #Confotur.
