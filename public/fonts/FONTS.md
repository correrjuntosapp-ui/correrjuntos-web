# Tipografía local del preview — Inter Variable (latin)

| Dato | Valor |
|---|---|
| Fichero | `inter-latin-wght-normal.woff2` (48.256 bytes) |
| SHA-256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |
| Origen | paquete npm `@fontsource-variable/inter` 5.3.0, tarball `https://registry.npmjs.org/@fontsource-variable/inter/-/inter-5.3.0.tgz` (shasum `351dd1e02dab63a6cf66d57ec36dcfd10c07f07b`), obtenido con `npm pack` el 8 sep 2026 |
| Fuente original | Inter, The Inter Project Authors (https://github.com/rsms/inter), empaquetado por Fontsource |
| Licencia | SIL Open Font License 1.1 — copia íntegra en `LICENSE-OFL-1.1.txt` (SHA-256 `3b0a5fca3d17942cde889069889dedbbbd075e9b599968c82a95f4d944e9b345`). Permite uso, empaquetado y redistribución con la fuente; no puede venderse por sí sola. |
| Ejes | `wght` 100–900 (cubre los pesos 400/500/600/650/700/750/800/900 que usa `landing.css`); sin itálicas (no se usan) |
| Subconjunto | latin, mismo `unicode-range` que servía Google Fonts (U+0000-00FF, U+0152-0153, U+2000-206F, U+20AC…). Las flechas → ↗ y el ✓ caen al sistema, igual que antes |
| Carga | `@font-face` al inicio de `landing.css` con `font-display:swap`; `<link rel="preload" as="font" crossorigin>` en el `<head>` |

Antes (v9): 2 peticiones externas (fonts.googleapis.com/css2 + fonts.gstatic.com, 47 KB). Ahora: 0 peticiones externas; 48 KB servidos en local.

Al integrar: mover el WOFF2 y este LICENSE juntos a `/public/fonts/` y actualizar la ruta del `@font-face` y del preload (ver `INTEGRACION.md`).
