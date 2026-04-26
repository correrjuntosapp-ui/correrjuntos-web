# Instagram Carousel Generator — CorrerJuntos

Generador local de carruseles 5-slide para Instagram con identidad visual **Meridian Motion** (dark `#0b1220` + ember `#f97316` + Inter 200/700).

## Uso

```bash
node tools/instagram-content/generate-carousel.cjs --theme planes
```

**Themes disponibles:**
- `planes` — 7 planes de entrenamiento (0-5K → maratón)
- `coach-ia` — Coach José IA (3 pasos: quiz → plan → análisis)
- `quedadas` — Sistema social: encuentra/crea/matching
- `gps-audio` — Tech features (GPS background, audio km, BLE)
- `transformacion` — De sedentario a 5K en 8 semanas
- `blog-tips` — 243 artículos: entrenamiento, equipamiento, nutrición

## Output

Cada ejecución genera en `tools/instagram-content/output/YYYY-MM-DD-{theme}/`:

```
slide-1.png       (1080×1350 PNG, hook con stat)
slide-2.png       (feature 1)
slide-3.png       (feature 2)
slide-4.png       (feature 3)
slide-5.png       (CTA con App Store + Google Play)
caption.txt       (texto listo para pegar en IG)
hashtags.txt      (30 hashtags running ES)
instructions.md   (pasos publicación + mejor hora)
```

## Workflow recomendado (cada 2 días)

1. Elige theme rotando: `planes` → `coach-ia` → `quedadas` → `gps-audio` → `transformacion` → `blog-tips` → repeat
2. `node tools/instagram-content/generate-carousel.cjs --theme <theme>`
3. Abre carpeta de output
4. Instagram → "+" → "Publicación"
5. Selecciona los 5 slides EN ORDEN
6. Pega caption + hashtags
7. Publica

**Total: 60 segundos de tu tiempo cada 2 días.**

## Mejores horas para publicar (España)

| Día | Mejor franja |
|-----|-------------|
| Lunes-Viernes | 7-9h o 19-21h |
| Sábado-Domingo | 10-12h |

## Calendario sugerido (2 publicaciones/semana, alterna 2 días)

```
Semana 1: Lunes planes  · Miércoles coach-ia · Viernes quedadas
Semana 2: Lunes gps-audio · Miércoles transformacion · Viernes blog-tips
Semana 3: repeat semana 1
```

## Añadir un nuevo theme

1. Copia un JSON de `themes/`, ej: `cp planes.json mi-nuevo-tema.json`
2. Edita los campos: `id`, `topic_label`, 5 `slides`, `caption`, `hashtags`
3. Estructura de slides:
   - Slide 1: `type: "hook"` con stat_label/stat_value
   - Slides 2-4: `type: "feature"` con eyebrow + title + subtitle + 3 bullets
   - Slide 5: `type: "cta"` con eyebrow + headline + subline
4. `node tools/instagram-content/generate-carousel.cjs --theme mi-nuevo-tema`

## Diseño técnico

- **Format**: 1080×1350 PNG (4:5 portrait, formato preferido IG carrusel)
- **Render**: Puppeteer (Chrome headless) via puppeteer-core
- **Fonts**: Inter 200/400/700/800 + JetBrains Mono (Google Fonts)
- **Brand**: Meridian Motion (dark `#0b1220` + ember `#f97316`)
- **Density**: deviceScaleFactor 2 (retina-quality)

## Reglas de marca (NO romper)

- ❌ NO añadir emojis dentro de los slides (sí en caption)
- ❌ NO usar fotos genéricas de runners stock
- ❌ NO claims sin datos verificables
- ✅ Datos reales del producto (planes, sesiones, precios reales)
- ✅ "Plan-first" messaging consensuado en MEMORY
- ✅ Cero precios fake, cero stats inventadas
