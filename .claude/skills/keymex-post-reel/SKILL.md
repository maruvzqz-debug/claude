---
name: keymex-post-reel
description: Genera el carrusel de Instagram, la story, el reel animado (incluido el reel de lote con drone y polígono) y la caption de una propiedad para KEYMEX Caribe a partir de un link, fotos, un video o un ZIP exportado de KEYMEX Caribe Studio. Usar cuando el usuario pase un link de propiedad, un video o fotos y pida post, carrusel, reel o contenido de Instagram.
---

# KEYMEX Caribe · Propiedad → Carrusel + Story + Reel + Caption

Motor: `keymex-caribe-social/generate.mjs`. Renderiza con las MISMAS plantillas de la app KEYMEX Caribe Studio (`keymex-caribe-social/app`, modo render de `app/dist/index.html`) + ffmpeg. Si falta `app/dist`, correr `cd keymex-caribe-social/app && npm install && npm run build`.
Marca: skill `keymex-brand-guidelines` + brief de Maru (rojo #AD1D28, rojo oscuro #7A141C, dorado #C9A24A solo para 1 palabra/acento, crema #F6F1E7; Montserrat + Poppins + CHANTAL; tagline "La revolución del real estate"; filete dorado y LAT 18°N en el footer; @keymexamerica en cada caption).
Referencia de estilo/estructura: @bierard (NO copiar logo, fotos, textos ni slogan).

## Flujo

0. **Preguntar SIEMPRE, antes de generar, con qué agente va la pieza**: nombre y WhatsApp. No reutilizar el de otra propiedad ni inventarlo. Si ya lo dio en el mismo pedido, no repreguntar. También preguntar el **segmento** si no es obvio: `inversor` (US$, segunda vivienda), `familia` (RD$, primera vivienda) o `sur` (inversor Argentina/Chile/Paraguay, copy rioplatense).
1. Carpeta `keymex-caribe-social/propiedades/<slug>/`.
2. **Datos**
   - *Link*: WebFetch de la ficha. Extraer tipo, operación, proyecto, zona, ciudad, precio + moneda, m² solar/construcción, habitaciones, baños, amenidades, terminaciones, plan de pagos, si es CONFOTUR, y URLs de fotos (bajar 6–10 a `fotos/01.jpg…`, 01 = mejor portada).
   - *Video*: guardarlo como `video.mp4`. Sin fotos, el motor saca fotogramas para el carrusel.
   - *ZIP de la app*: usar su `datos.json` como `propiedad.json` (ya trae agente, polígono y textos) y pedir las fotos/video originales.
   - Nunca inventar precios, metros ni amenidades. CONFOTUR solo si la ficha lo confirma (si no, preguntar).
3. **`propiedad.json`** (ver `propiedades/ejemplo-cap-cana` y `propiedades/ejemplo-lote-drone`):
   `tipo` villa|apartamento|casa|adosado|penthouse|lote · `operacion` venta|alquiler · `titulo` + `palabra_acento` (1 palabra del título, va en dorado) · `proyecto`, `zona`, `ciudad` · `bajada` · `frase_script` · `moneda` USD|RD$ · `precio` (número) · `precio_desde` · `m2_solar`, `m2_construccion`, `habitaciones`, `banos` · `amenidades` (claves: piscina, terraza, marquesina, jardin, gimnasio, seguridad, playa, golf, bbq, ascensor, aire, vista_mar, area_social, parqueo, jacuzzi, amueblado) · `destacados` (≤3, frases cortas) · `terminaciones`, `caracteristicas`, `plan_pagos` [{etapa, valor}] · `confotur` · `segmento` · `variante` clara|oscura · `hook_reel` (≤ 40 caracteres; `*texto*` = parte en script dorada) · `agente` {nombre, whatsapp, email} · opcional `caption` escrita a mano.
   Lote: `lote` {uso, niveles, medidas[] (una por lado, en orden), poligono_reel [[x,y]…] (0–1 sobre el cuadro 9:16), t_freeze (segundo del video para el revelado) o still (imagen)}.
4. **Lote con drone**: correr `node generate.mjs propiedades/<slug> --frame`, MIRAR `salida/marcar-poligono.jpg` (grilla cada 0.1), escribir `lote.poligono_reel` con los vértices en orden y las `medidas` por lado. Si el polígono vino de la app (marcado en la portada 4:5 sobre la foto 01), el motor lo convierte solo.
5. **Generar**: `node generate.mjs propiedades/<slug>` (≈40 s).
   Salida en `salida/`: `post-01-portada.png` + `post-NN-foto.png` (1080×1350), `story-portada.png` = `reel-portada.png` (1080×1920), `reel.mp4`, `caption.txt`.
   Reel propiedad: gancho → medidas → amenidades → frase → precio → cierre. Reel lote: gancho (video) → revelado (fotograma congelado + polígono que se dibuja, medidas, píldora m²) → info del lote → precio → cierre.
6. **Revisar**: extraer 5–7 fotogramas del reel y una hoja con los slides y mirarlos (texto cortado, polígono desalineado, foto mal encuadrada). Corregir y regenerar.
7. **Entregar** con SendUserFile: slides, story, `reel.mp4` y la caption pegada en el chat lista para copiar. Recordar: agregar audio en tendencia desde Instagram (o dejar `musica.mp3` con licencia en la carpeta) y aprobación de Marketing KEYMEX América antes de publicar.

## Zonas seguras (obligatorio, todas las piezas)
- 9:16 (reel, story, TikTok, portada de reel): texto, logo, precio y tarjetas dentro de x 60–940 · y 220–1440 (arriba 220, abajo 480, derecha 140, izquierda 60). Ya está en las plantillas; si se agrega algo nuevo, respetarlo.
- Feed 4:5: la grilla del perfil recorta 34 px por lado (3:4); texto a ≥ 56 px del borde.
- Lotes: el polígono y sus medidas deben quedar dentro de la zona segura; `--frame` pinta en rojo lo prohibido y el generador avisa con ⚠ si un vértice cae afuera → elegir otro `t_freeze` o reubicar.
- Al revisar fotogramas, superponer esas zonas y confirmar que ningún texto quede debajo.

## Archivos de marca
- `assets/logo-keymex-rojo.png` / `logo-keymex-blanco.png` (oficial "KEYMEX · LE CENTRE IMMOBILIER CARIBE"), `assets/sello-confotur.png`. También embebidos en la app (`app/src/assets/brand`).
- `oficina.json`: nombre, tagline, instagram, web, email, firma LAT. Cambiarlo ahí.
- CHANTAL: si el usuario entrega el archivo, guardarlo como `assets/fonts/CHANTAL.(woff2|otf|ttf)`; el motor lo usa solo. Hasta entonces se usa una script provisoria.
