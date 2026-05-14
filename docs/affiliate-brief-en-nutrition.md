# Brief afiliados — próxima sesión

**Fecha brief**: 15 may 2026 (cierre del día)
**Para ejecutar**: próxima sesión (no urgente)
**Estimación**: 3-4h trabajo · +20-40€/mes recurrente

---

## Contexto

Tras audit corregido del 15 may 2026 (pattern `amzn.to|amazon.`):
- 280 articles del blog YA tienen afiliados Amazon (52% coverage)
- 255 mencionan productos SIN afiliados todavía
- **De esos 255, ~30-40 son realmente product-affiliate-friendly** (resto son social/psychology/race-guides/etc — falsos positivos)
- Estado financiero: Amazon afiliados generaba 25,11€/mes al cierre 11 may

## Objetivo de esta sesión

Añadir afiliados a los **10 artículos EN de nutrición** que están sin monetizar. Son los de mayor ROI real porque:
1. Nutrición = consumibles (re-compras Amazon)
2. Mercado EN es enorme vs solo ES
3. Geles y suplementos pagan bien en Amazon Associates

## Artículos a atacar — orden recomendado

| # | Slug | Foco producto | Productos a referenciar |
|---|---|---|---|
| 1 | `blog/en/best-energy-snacks-for-runners.html` | Snacks energéticos | Clif Bars, RX Bars, Honey Stinger, geles, dátiles |
| 2 | `blog/en/best-foods-for-runners.html` | Comida general runner | Avena, plátanos secos, frutos secos, mantequillas frutos secos |
| 3 | `blog/en/protein-for-runners.html` | Proteína | Whey Optimum, ISO HD, casein, proteína vegetal Vega |
| 4 | `blog/en/creatine-for-runners.html` | Creatina | Creapure, Optimum micronized, Bulk creatine monohydrate |
| 5 | `blog/en/iron-for-runners.html` | Hierro | Floradix, Solgar gentle iron, Spatone |
| 6 | `blog/en/best-breakfasts-before-running.html` | Desayunos | Avena Quaker, granolas, mantequilla cacahuete, miel |
| 7 | `blog/en/nutrition-for-runners.html` | Nutrición general | Mix de los anteriores |
| 8 | `blog/en/trail-running-nutrition.html` | Nutrición trail | Geles Maurten, SiS, Spring Energy, sales electrolitos |
| 9 | `blog/en/best-trekking-poles-trail-running.html` | Bastones trail | Black Diamond, Leki, Komperdell |
| 10 | `blog/en/quick-recipes-for-runners.html` | Recetas rápidas | Ingredientes Amazon Pantry, batidoras, blenders |

## Playbook obligatorio

Seguir **GOLD STANDARD CLAUDE.md sección 12** al pie de la letra:

| Paso | Acción |
|---|---|
| 1 | Scrape Amazon ES con queries genéricas (no marca/modelo específico) |
| 2 | Extraer ASINs reales del HTML de búsqueda |
| 3 | Obtener hiRes image vía `/dp/{ASIN}` page scrape |
| 4 | Descargar imagen + **VERIFICAR VISUALMENTE con Read tool** (cada una, todas) |
| 5 | Self-hostear en `/public/blog-images/{slug}/{producto}.jpg` |
| 6 | Botones formato `/dp/{ASIN}?tag=diezmejores21-21&linkCode=ll1` |
| 7 | Atributos: `target="_blank" rel="nofollow sponsored noopener"` |
| 8 | Schema.org `ItemList` con URLs canónicas |
| 9 | Body copy basado en specs reales (NO aspiracional) |
| 10 | IndexNow ping post-deploy |

## Reglas críticas (de la sección 12 del CLAUDE.md)

❌ **NUNCA**:
- Inventar ASINs (productos pueden no existir en Amazon.es)
- Usar URLs `/s?k=` (search) — siempre `/dp/{ASIN}`
- Aceptar primer resultado de Amazon sin verificación visual
- Hot-link imágenes de Amazon CDN (rotan sin aviso)

✅ **SIEMPRE**:
- Self-host imágenes
- Verificar cada imagen con Read tool antes de commit
- Tag `diezmejores21-21` en cada URL
- `&linkCode=ll1` para mejor tracking

## Estructura sugerida por artículo

```html
<!-- Sección "Top picks" cerca del comienzo, antes del bulk del article -->
<div class="affiliate-grid">
  <div class="product-card">
    <a href="https://www.amazon.es/dp/{ASIN}?tag=diezmejores21-21&linkCode=ll1"
       target="_blank" rel="nofollow sponsored noopener">
      <img src="/public/blog-images/{slug}/{producto}.jpg" alt="{Producto}"
           loading="lazy" width="300" height="300">
    </a>
    <h3>{Producto}</h3>
    <p>~{precio}€ on Amazon</p>
    <a href="...affiliate URL..." class="cta">View on Amazon</a>
  </div>
  <!-- 4-6 productos por sección -->
</div>
```

## Mix de productos por artículo

Sweet spot Amazon ES: **6-10 productos** por article, mix de:
- 2 entry-level (€10-30)
- 4-5 mid (€30-60)
- 1-2 premium (€60-100+)

NO meter premium €200+ — suelen ser USA-only o suplementos especializados no disponibles en Amazon.es.

## Output esperado por artículo

```
- 10 productos identificados con specs reales
- 10 ASINs verificados en Amazon.es
- 10 imágenes self-hosted en /public/blog-images/{slug}/
- Sección de "Top picks" añadida al article
- 6-8 menciones in-line dentro del texto (con links afiliados)
- Schema.org ItemList con las 10 URLs canónicas
- IndexNow ping al final
```

Tiempo por artículo: 20-30 min cumpliendo el playbook completo.

## Cuando termines los 10

Verificar coverage final con script:
```bash
node tmp/affiliate-audit.cjs
```

(El script existirá en próxima sesión si lo guardas — alternativa: re-correr el de hoy).

Esperar 30-45 días para ver el bump en comisiones Amazon. Target: pasar de **25,11€/mes** a **45-65€/mes** con esta tanda.

## Casos exitosos previos a replicar

- ✅ `mejores-bicicletas-estaticas-runners` (11 may 2026) — 10 productos €99-€269, 100% self-hosted, founder aprobó "muy bien"
- ✅ Pillar `guia-equipamiento-running-2026` (9 may 2026) — driver del salto 19→25€/mes Amazon

## NO hacer hasta que esto rankee

Después de los 10 EN nutrition, **NO** atacar inmediatamente más articles. Esperar 30-45 días para validar que estos generan revenue real. Si rankean → replicar formato en TIER B (beginners) + TIER D (gear). Si no → revisar formato antes de invertir más horas.
