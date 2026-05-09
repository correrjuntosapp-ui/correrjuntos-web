# Reels Pipeline — kinetic typography 1080×1920

> Workflow validado para producir reels TikTok / Instagram / YouTube Shorts
> en estilo kinetic minimal (paper #f6f1e8, ember #f97316, ink #0b1220).
>
> De concepto a MP4 entregable: **~15 min** (10 min HTML + 5 min preview/render).

## Ventajas vs grabar pantalla / After Effects / Canva

- **Frame-perfect determinístico** — `renderAtTime(ms)` es función pura del tiempo.
  El recorder dispara screenshot por frame; capture-time desacoplado de animation-time.
  No importa cuánto tarde el screenshot I/O — cada frame es exacto.
- **Sin @keyframes ni rAF en captura** — `window.__capture = true` desactiva el rAF preview.
- **Fuentes Inter/JetBrains Mono** garantizadas pre-frame 0
  (`document.fonts.ready` antes del primer screenshot).
- **H.264 high profile + yuv420p + faststart** — compatibilidad universal iOS/Android/web.
- **CRF 17** preserva pesos finos (Inter 200) sin pixelar.
- **0 dependencias externas en el build** — Playwright + ffmpeg-static ya en node_modules.

## Estructura de archivos

```
tools/marketing/
├── reel-{slug}.html              # Diseño + timeline en JS
├── record-tiktok.cjs             # Recorder reutilizable (parametrizable por slug)
├── preview-{slug}-frames.cjs     # Snapshot de los picos de cada escena (validación)
├── reel-{slug}.mp4               # Output final
└── .reel-{slug}-preview/         # Frames PNG de cada escena (gitignored)
```

## Anatomía del HTML kinetic

### 1. Stage 1080×1920 + grid + contour rings + pulse

Capa estática (siempre visible):
- `--ink #0b1220` background
- Grid 80×80px en naranja 9% opacity
- 5 contour rings concéntricos rotando 1 vuelta / 60s
- Pulse halo en el centro: ciclo 2.4s, halo se expande 0→320px y se desvanece

### 2. Plates (escenas)

Cada `.plate` tiene:
- `position: absolute; inset: 0;` (cubre todo el stage)
- `opacity: 0` por defecto, `transform: translateY(36px)`, `filter: blur(6px)`
- El JS las controla: fade-in (450ms easeOut), hold, fade-out (350ms easeIn)
- Tipografía de Inter (200/600/700/800 según jerarquía)
- Eyebrow (`JetBrains Mono` 22px tracking 0.28em uppercase) con líneas a los lados

### 3. Timeline (cuando aplica)

Patrón usado en `reel-plan-adaptativo`:
- `.tl-track` 18px alto, `border-radius: 9px`, fondo paper 8% opacity
- 4 segmentos absolutos: `seg-base` (verde), `seg-build` (azul), `seg-peak` (ámbar), `seg-taper` (naranja)
- Width % proporcional al peso de cada fase
- `seg-gap` con `repeating-linear-gradient` rojo (para mostrar weeks orphaned en el "ANTES")
- Labels arriba (`tl-mark`) y abajo (`tl-mark.race-tag`, `tl-gap-label`)

### 4. JS timeline + renderAtTime

```js
const SCENES = [
  { id: 'p1', in: 200,    out: 2500  },
  { id: 'p2', in: 2700,   out: 6500  },
  // ... transición ~200ms entre escenas (out_anterior → in_siguiente)
];
const FADE_IN = 450, FADE_OUT = 350;
const TOTAL_MS = 19500;          // ~17-20s funciona bien en TikTok / Reels

function renderAtTime(t) {
  // Para cada plate: calcular opacity / translateY / blur según fase
  for (const s of plates) {
    if (t < s.in)               { op = 0; ty = +36; bl = 6; }            // antes
    else if (t < s.in+FADE_IN)  { /* easeOut(p): op 0→1, ty +36→0, bl 6→0 */ }
    else if (t < s.out)         { op = 1; ty = 0;  bl = 0; }             // hold
    else if (t < s.out+FADE_OUT){ /* easeIn(p):  op 1→0, ty 0→-36, bl 0→6 */ }
    else                        { op = 0; ty = -36; bl = 6; }            // después
  }
  // Contour rotación y pulse halo: pure functions of t
}

window.renderAtTime = renderAtTime;
window.TOTAL_MS = TOTAL_MS;

if (!window.__capture) {
  // Preview mode: rAF loop con loop infinito
} else {
  renderAtTime(0);  // Capture mode: solo frame inicial, recorder dispara el resto
}
```

## Workflow completo — paso a paso

### 1. Diseñar el guión (5-7 escenas, ~17-20s total)

Plantilla narrativa probada:
1. **Hook** (0-2.5s) — pregunta o afirmación con palabra clave en naranja
2. **Stat / Lista** (2.5-7s) — datos densos, jerarquía visual clara
3. **Stat / Comparación** (7-10s) — número grande o contraste
4. **Features / Beneficios** (10-14s) — 3-4 ítems con palabra clave en naranja
5. **Promesa emocional** (14-17s) — frase corta motivacional
6. **CTA** (17-19s) — marca + URL + stores

### 2. Crear el HTML

```bash
# Copia un reel existente como template
cp tools/marketing/reel-plan-adaptativo.html tools/marketing/reel-{nuevo-slug}.html
# Edita las 6 escenas (eyebrow, huge, stats, etc.)
# Ajusta SCENES timing si cambia número de escenas
```

### 3. Preview frames (validar diseño antes del render completo)

Crea `preview-reel-{slug}.cjs` (template en `preview-reel-frames.cjs`):
- Lanza Playwright con `__capture = true`
- Llama `renderAtTime(t)` con t = pico medio de cada escena
- Screenshot por escena → `.reel-{slug}-preview/N-name.png`

```bash
node preview-reel-{slug}.cjs
# Read cada PNG con tu cliente; ajusta texto/tamaño si hay overflow o quedan rotos
```

### 4. Render MP4 (1080×1920 · 30fps · ~3 MB)

```bash
node record-tiktok.cjs reel-{slug}
# El recorder es genérico: lee {slug}.html, escribe {slug}.mp4
# Usa fps fijo 30, lee TOTAL_MS del HTML, ffmpeg con CRF 17 + faststart
```

Output esperado: 1080×1920 · 19.5s · ~2.3-3.0 MB · ~1000-1300 kb/s.

### 5. Caption (siempre incluir)

- 2-3 líneas hook con el dolor
- 1 frase con la solución / feature
- "Gratis. App Store + Google Play."
- 5-8 hashtags relevantes (mix nicho + amplio)

### 6. Publicar SIN audio

TikTok/Reels priorizan algoritmo orgánico cuando añades música nativa de su biblioteca
en lugar de audio embebido. Súbelo mute, añade el sound dentro de la app.

## Decisiones de diseño que NO romper

- **Paleta:** ink #0b1220 background, paper #f6f1e8 texto, ember #f97316 acento, ash 42% para sub-texto
- **Tipografía:** Inter 200/600/700/800 + JetBrains Mono para eyebrows/dates/stats
- **Tipo de eye-catcher:** una sola palabra en naranja por escena (no más)
- **Timing:** plates entran 450ms / hold / salen 350ms — coincide con neuro-perceptión
- **Contour rotation muy lenta** (1 vuelta / 60s) — sensación de "está vivo" sin distraer
- **Pulse halo en el centro** — suple la falta de movimiento dentro de las plates estáticas
- **Cero emojis** dentro del reel — feel "data-driven" / Wirecutter-level
- **NUNCA grabar pantalla del navegador** — frame loss + jitter destruyen el vibe

## Reels producidos hoy (referencia)

| Slug | Tema | Duración |
|---|---|---|
| `reel-busca-tu-carrera` | Intro genérico ("eliges carrera, te doy plan") | 19.5s |
| `reel-plan-adaptativo` | **Adaptive — antes/después con timeline** | 19.5s |
| `reel-adaptive-plan-en` | Mismo que arriba en EN para UK/US | 19.5s |

## Troubleshooting

- **Texto se sale del frame** → `font-size` del `.huge` baja a 130px o reescribe en menos chars
- **Capture genera frames negros** → falta `await page.evaluate(() => document.fonts.ready)` antes del primer screenshot
- **MP4 no reproduce en iOS** → confirma `-pix_fmt yuv420p` (pixel format raro rompe quicktime)
- **MP4 grande (>5MB)** → sube `-crf` a 20 (~50% size, calidad sigue OK para TikTok)
- **`renderAtTime` no existe** → comprobar que el `<script>` no esté antes de los plates en el DOM

## Tiempo de iteración real

- Reel 1 (busca-tu-carrera): ~25 min (primera versión, decidiendo paleta + ritmo)
- Reel 2 (plan-adaptativo): ~15 min (reusando estructura + timeline ya existente)
- Reel 3 (EN translation): ~5 min (copy translation, ajustar wording)

Tras 3 reels el pipeline está plenamente afilado. Próximos reels deberían ser ~10 min cada uno.
