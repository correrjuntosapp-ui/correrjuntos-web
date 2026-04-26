# Checkpoint SEO — 7 mayo 2026
**Fecha de revisión:** miércoles 7 mayo 2026 (10 días tras deploy)
**Tiempo estimado:** 2-3 minutos en GSC
**Objetivo:** medir impacto de Schema upgrade Domingo 27 abril 2026

---

## 🎯 Las 5 URLs a revisar (copy-paste en GSC filter "Pages")

```
https://www.correrjuntos.com/blog/en/best-hydration-drinks-running
https://www.correrjuntos.com/blog/en/best-omega-3-running
https://www.correrjuntos.com/blog/en/best-energy-gels-running
https://www.correrjuntos.com/blog/en/running-belts
https://www.correrjuntos.com/blog/mejores-zapatillas-running-asfalto
```

---

## 📊 BASELINE 27 abril 2026 (90 días previos al deploy)

| URL | Clicks | Impresiones | CTR | Posición |
|-----|-------:|------------:|----:|---------:|
| `/blog/en/best-hydration-drinks-running` | 5 | 9.767 | 0,05% | 7,7 |
| `/blog/en/best-omega-3-running` | 1 | 2.003 | 0,05% | 8,7 |
| `/blog/en/best-energy-gels-running` | 1 | 1.750 | 0,06% | 9,4 |
| `/blog/en/running-belts` | 3 | 1.648 | 0,18% | 9,1 |
| `/blog/mejores-zapatillas-running-asfalto` | 16 | 2.348 | 0,68% | 13,4 |
| **Totales** | **26** | **17.516** | **~0,15%** | **9,7** |

---

## ✅ Qué buscar el 7 mayo (filtra por "últimos 7 días" en GSC)

### 🟢 SEÑAL POSITIVA (escalamos a más comparativas)
- **CTR ↑ ≥ +15%** vs baseline (target: 0,18% → 0,21%+ media)
- **Posición** estable o mejora 0,5+ posiciones
- **Algún rich result** detectado en SERP (ojo manualmente)

### 🟡 SEÑAL NEUTRAL (esperar 1 semana más)
- CTR estable ±10%
- Impresiones estables
- Sin rich results visibles aún

### 🔴 SEÑAL NEGATIVA (revisar urgente)
- CTR ↓ ≥ 20% (algo se rompió)
- Posición cae 2+ posiciones
- Pages dropped de index

---

## 🔬 Spot-check rich results (1 minuto)

Pegar UNA de estas URLs en https://search.google.com/test/rich-results:

```
https://www.correrjuntos.com/blog/en/best-hydration-drinks-running
```

**Esperado**: detectar `Product` (10) + `ItemList` (1) + `BreadcrumbList` + `FAQPage`

---

## 🎯 Decisión que se tomará tras la revisión

| Resultado | Acción |
|-----------|--------|
| 🟢 Mejora ≥+15% CTR en 3+/5 pages | **Escalar** SOLO el patrón que funcionó (no reoptimizar). Replicar a otras 10 comparativas (~3h) |
| 🟡 Mejora marginal o mixto | **Antes que esperar pasivo**: probar internal linking hacia estas 5 pages (hub-and-spoke). Suele ser falta de autoridad O de intención comercial en las queries. Después de eso, revisar 14 mayo |
| 🔴 Sin movimiento tras 21 días | Backlinks como **driver principal de consolidación** (no único). Sprint outreach: 30 sitios running ES con DA 25-50 |

## 🚨 Excepción a la cuarentena

Las URLs están congeladas (no tocar HTML/JSON-LD/estructura) **EXCEPTO**:

- ❌ Schema roto detectado → fix inmediato permitido
- ❌ 404 / page dropped → fix inmediato permitido
- ❌ Imagen caída (HEAD ≠ 200) → fix inmediato permitido

Todo lo demás → congelado hasta el 7 mayo.

---

## 📋 Estado deploys en producción al 27 abril 2026

- ✅ 5 páginas con Product+Offer schema (46 productos estructurados)
- ✅ Course schema en 6 plan landings
- ✅ 75 cannibalization pairs identificados, root cause fixeado
- ✅ ~1.500 redirects 308 internos eliminados
- ✅ Sitemaps regenerados (294 URLs lastmod 2026-04-25)
- ✅ IndexNow pinged 6 veces

---

## ⚠️ Recordatorio honesto

Si en 21 días (18 mayo) no hay movimiento:
- **NO es problema técnico**. El SEO técnico está al 95%.
- **ES problema de autoridad**: el sitio necesita backlinks reales.
- Sprint outreach next: 30 sitios running ES con DA 25-50 → guest posts / listings.

**El cuello más grande del NEGOCIO sigue siendo activación 1% → 10%, no SEO.**
