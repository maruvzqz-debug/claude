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

## Pendientes para dejarlo 100% de marca
- Cargar el logo oficial en `assets/logo-keymex-blanco.png` y `assets/logo-keymex-rojo.png` (PNG transparente).
- Datos reales de contacto (WhatsApp, Instagram) en cada `propiedad.json`.
