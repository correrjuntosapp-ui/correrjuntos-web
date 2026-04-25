# Auditoría SEO Final — Sesión 2026-04-25
**6 commits ejecutados, deployed y pinged a IndexNow**

---

## 🎯 LO QUE HE APRENDIDO HOY (datos reales GSC, no especulación)

### Tu sitio NO tiene "pocas visitas". Tiene "tráfico al borde de página 1".

```
2.630 clicks  /  250.000 impresiones  /  CTR 1,1%  /  Pos media 11,7
                            últimos 90 días
```

**Curva de crecimiento real:** de 0 a 100 clicks/día en 60 días (febrero → abril). El SEO **sí** está funcionando. Solo está estancado en posición 11-12 (justo al borde del top 10).

### El cuello real es CANNIBALIZATION SEVERA

**75 pares de URLs duplicadas indexadas en Google** (`.html` y sin `.html`). Compiten entre sí, dividiendo señales:

| URL ganadora | Impr | URL perdedora | Impr |
|------|------|------|------|
| `/blog/mejores-apps-running.html` | **2.225** | `/blog/mejores-apps-running` | 1.353 |
| `/equipamiento/bebidas-hidratacion-running` | **3.378** | `.../bebidas-hidratacion-running.html` | 1.299 |
| `/blog/carga-hidratos-maraton` | 717 | `/blog/carga-hidratos-maraton.html` | 516 |
| `/cities/madrid` | 292 | `/cities/madrid.html` | 145 |
| ... 71 pares más | ... | ... | ... |

**Total impresiones desperdiciadas en cannibalization: ~10.000/90d** = ~3.300/mes

---

## ✅ LO QUE HE EJECUTADO HOY (6 commits)

### Fase A — Fixes técnicos críticos (commit `d6cbe567`)
1. **48+ URLs `.html`** eliminadas de internal links → cero redirects 308 internos
2. **5 ghost pages** con `<meta http-equiv="refresh">` → reemplazadas por Vercel 308 directo
3. **Cannibalization mergeada**: `entrenamiento-de-fuerza-para-corredores.html` (duplicado) eliminado
4. **19 artículos** con Person schema bug `"name":"Carlos Ruiz"` + `"url":"jose-marquez"` → corregidos
5. **Sitemap regenerado** (294 URLs con lastmod=2026-04-25, antes congelado en 2026-03-15)

### Fase B — Golden zone optimization (commit `f0dcdc37`)
1. **Description corrupta** en `/blog/en/best-budget-running-shoes` (284 chars, texto duplicado) → reescrita 152 chars
2. **4 titles >70 chars** acortados (Madrid Marathon Guide, Bebidas Hidratación, Best Running Shoes Overweight, How Long Running Shoes Last)
3. **🚨 ROOT CAUSE de cannibalization fixeado**: 10 archivos `/equipamiento/*.html` tenían canonical apuntando a SI MISMO con `.html`. Eso confunde a Google. Ahora todos los canonicals apuntan a la versión limpia.
4. **Hreflang, og:url, twitter:url** limpios de `.html` en mismos archivos
5. **sitemap-equipamiento.xml**: 11 URLs limpiadas

### Auditoría previa (commits anteriores hoy)
- Trailing slash 308 redirects: ~1.500 links internos limpios
- Sitemaps regenerados de 686 URLs
- IndexNow pinged 3 veces con URLs prioritarias

---

## 📊 GOLDEN ZONE — Top 10 oportunidades reales

Páginas con **>2.000 impresiones y CTR <1%** (lo que daría más impacto si subiera el ranking):

| URL | Impr | Clicks | CTR | Pos |
|-----|------|--------|-----|-----|
| `/blog/en/best-hydration-drinks-running` | 9.767 | 5 | 0.05% | 7.7 |
| `/blog/cuanto-tardo-en-correr-5km` | 8.973 | 28 | 0.31% | 9.5 |
| `/blog/en/best-running-apps` | 6.237 | 1 | 0.02% | 8.6 |
| `/blog/en/best-budget-running-shoes` | 5.307 | 15 | 0.28% | 7.0 |
| `/blog/en/madrid-marathon-guide` | 4.925 | 67 | 1.36% | 9.3 |
| `/blog/en/strava-vs-garmin-connect` | 4.644 | 10 | 0.22% | 9.9 |
| `/equipamiento/bebidas-hidratacion-running` | 3.378 | 6 | 0.18% | 5.6 |
| `/blog/en/tapering-race-week-guide` | 3.238 | 0 | 0.00% | 7.3 |
| `/blog/en/best-running-shoes-overweight` | 3.141 | 7 | 0.22% | 11.6 |
| `/blog/en/average-5k-time-by-age` | 2.997 | 1 | 0.03% | 10.3 |

**Si estos 10 pasan de pos 7-12 a pos 3-5** (con CTR 5-10% en vez de 0.1%) = **+1.500-3.000 clicks/mes** solo de estas 10.

---

## 💡 LO QUE LOS DATOS ME DICEN DE TU TRÁFICO REAL

### Tu tráfico orgánico viene de 3 grupos:

**1) Carreras españolas específicas (40% de los clicks)**
- "trail costa quebrada 2026", "cursa de la merce 2026", "jean bouin 2026"
- CTR alto (8-34%) cuando la page rankea bien
- Hay 50+ landings de carreras en `/carreras/` y SÍ están funcionando

**2) Blog EN saturado de impresiones, CTR bajísimo**
- Tu contenido EN está rankeando posiciones 7-15 para queries grandes (best running shoes, etc.)
- Pero el SERP en EN está dominado por sitios DA 60+ (Runner's World, Outside, etc.)
- Estás "presente pero invisible"

**3) Long-tail comercial (zapatillas, comparativas)**
- "hoka clifton vs", "asics nimbus 26 vs nike pegasus", "salomon speedcross 6"
- CTR decente (1-2%) cuando rankeas bien
- Esto es donde TIENES OPORTUNIDAD REAL

---

## 🎯 PRÓXIMOS MOVIMIENTOS ESTRATÉGICOS (HONESTOS, NO MAGIA)

### Lo que SÍ va a mover la aguja:

**A) Esperar 4-12 semanas y medir**
Los fixes de hoy (cannibalization, sitemap, internal links) tardan **semanas** en consolidarse en Google. Mide en GSC en mayo y junio. Si en 8 semanas no hay +15-25% impresiones, algo más está pasando.

**B) Backlinks orgánicos (NECESARIO para superar pos 10)**
Tu sitio probablemente está en DA 15-25. Para rankear top 5 en queries comerciales necesitas DA 30+. Acciones:
- Listarte en directorios de running ES (Federación Española de Atletismo, asociaciones provinciales)
- Guest post en 5-10 blogs running medianos (DA 25-40)
- Outreach a micro-influencers running ES con perfil <50k (más alcanzable)
- Aparecer en podcasts running (links en show notes)

**C) Local-first Huelva (consensuado en MEMORY.md)**
- KD <5 en queries hyper-locales
- 5-10 artículos: "grupos running huelva", "rutas marisma huelva", "carreras populares huelva 2026"
- Contacto con asociaciones running locales (links + comunidad real)
- Esto SÍ puede llegar a top 3 sin pelea

**D) Schema upgrade en top pages**
- FAQPage en top 20 artículos golden zone
- HowTo en planes (`/planes/0-5k`, etc.)
- ItemList + Product en `/equipamiento/*`
- Rich snippets pueden subir CTR +30-40%

### Lo que NO va a mover la aguja (no perdamos tiempo):

- ❌ Reescribir 125 títulos a ciegas — la mayoría no tienen impresiones
- ❌ Publicar más artículos genéricos — ya tienes 540 y la mayoría no rankean
- ❌ Pelear queries head ("mejores zapatillas running 2026") — KD 70+, imposible sin DA 50+
- ❌ Más optimización on-page sin backlinks — ya está casi todo bien

---

## 📁 ARCHIVOS GENERADOS HOY

- `tools/seo-audit/audit-2026-04-25-consolidated.md` — auditoría inicial técnica
- `tools/seo-audit/codebase-audit-2026-04-25.md` — análisis automated del código
- `tools/seo-audit/golden-zone-50.csv` — 50 páginas priorizadas
- `tools/seo-audit/gsc/pages.csv` — 1.000 páginas de GSC raw
- `tools/seo-audit/gsc/queries.csv` — 1.037 queries de GSC raw
- `tools/seo-audit/audit-2026-04-25-final-report.md` — este archivo

---

## 📊 SESIÓN HOY EN NÚMEROS

- **35+ commits** SEO + UX
- **~1.500 redirects 308** internos eliminados
- **75 cannibalization pairs** identificados, root cause fixeado
- **10 canonicals incorrectos** arreglados en `/equipamiento/`
- **5 ghost pages** eliminadas
- **19 schema bugs** corregidos
- **294 URLs sitemap refrescadas**
- **3 IndexNow pings** con URLs prioritarias

**Esperar resultados:** 4-12 semanas para que Google consolide. La métrica clave a vigilar en GSC: si las 75 cannibalization pairs se reducen, el tráfico debe subir +15-25% en mayo-junio.
