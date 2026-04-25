# SEO Audit: correrjuntos.com - Análisis de Codebase
**Fecha:** 2026-04-25  
**Artículos analizados:** 310 artículos blog (ES) + estructura multilingüe  

---

## 🚨 HALLAZGOS CRÍTICOS

1. **46 broken internal links (.html)** — Referencias a artículos que no existen en el filesystem
2. **Canibalization detectada:** 2 artículos duplican título exacto (`Entrenamiento de Fuerza para Corredores`)
3. **125 títulos excesivamente largos (>70 chars)** — 40% de los artículos sobrepasan límite óptimo
4. **4 artículos con 0-4 palabras** — Páginas vacías o redirecciones sin contenido
5. **33 meta descriptions demasiado largas (>170 chars)** — 11% del blog fuera de rango óptimo

---

## 1. DISTRIBUCIÓN DE TITLE LENGTH (ES)

**Totales:** 309 artículos analizados

| Categoría | Count | % |
|-----------|-------|-----|
| TOO_SHORT (<30 chars) | 2 | 0.6% |
| OK (30-60 chars) | 63 | 20.4% |
| LIMIT (60-70 chars) | 119 | 38.5% |
| TOO_LONG (>70 chars) | **125** | **40.5%** |

**Top 10 títulos MÁS LARGOS:**
1. [131] blog/hidratacion-media-maraton.html
2. [116] blog/ropa-media-maraton-que-llevar.html
3. [111] blog/que-comer-antes-media-maraton.html
4. [107] blog/equipamiento/mejores-bandas-frecuencia-cardiaca-running/index.html
5. [105] blog/estrategia-carrera-media-maraton.html
6. [104] blog/calentamiento-media-maraton.html
7. [101] blog/ritmo-media-maraton-calculadora.html
8. [96] blog/sobreentrenamiento-running-sintomas.html
9. [94] blog/test-cooper-running.html
10. [94] blog/como-preparar-primera-media-maraton.html

**Top 10 títulos MÁS CORTOS:**
1. [25] blog/zapatillas/index.html
2. [28] blog/categoria/entrenamiento/index.html
3. [30] blog/running/mejores-zapatillas-empezar-correr-2026/index.html
4. [32] blog/atletas-hibridos/index.html
5. [36] blog/entrenamiento/index.html
6. [38] blog/descarga-plan-10k/index.html
7-10. [44] blog/page/*/index.html

---

## 2. DISTRIBUCIÓN DE META DESCRIPTION LENGTH

**Totales:** 308 artículos con meta description

| Categoría | Count | % |
|-----------|-------|-----|
| TOO_SHORT (<120) | 1 | 0.3% |
| OK (120-160) | **211** | **68.5%** |
| LIMIT (160-170) | 63 | 20.4% |
| TOO_LONG (>170) | 33 | 10.7% |

10 descriptions más largas: 186-202 chars en media-maraton, trail, sobreentrenamiento, vo2-max, etc.

---

## 3. CANIBALIZATION DETECTION

**H1 duplicados exactos:**
- "Blog de Running" (12+ en /page/ indices)
- **"Entrenamiento de Fuerza para Corredores: Guía Completa 2026"** (2 artículos):
  - blog/entrenamiento-de-fuerza-para-corredores.html
  - blog/entrenamiento-fuerza-corredores.html
  - ⚠️ Compiten por misma keyword

---

## 4. THIN CONTENT DETECTION

**Estadísticas word count:**

| Métrica | Valor |
|---------|-------|
| Media | **2,819 palabras** |
| Mediana | **2,465.5 palabras** |
| Mínimo | 0 |
| Máximo | 10,038 |

**4 artículos críticos (<10 palabras):**
- blog/running/mejores-zapatillas... (0)
- blog/categoria/entrenamiento/... (3)
- blog/zapatillas/... (3)
- blog/atletas-hibridos/... (4)

---

## 5. SCHEMA VALIDATION (SAMPLE 10)

- 9/10 con JSON-LD blocks presentes
- Sintaxis JSON: ✓ válida en todos
- 1 sin schema: blog/atletas-hibridos/index.html

---

## 6. CANONICAL CONSISTENCY (SAMPLE 20)

**Resultado:** 19/20 consistentes

**1 inconsistencia:** blog/ansiedad-pre-carrera.html
- Canonical: /blog/ansiedad-pre-carrera
- JSON @id: /#organization (incorrecto)

---

## 7. INTERNAL LINKING - BROKEN PATHS

| Métrica | Valor |
|---------|-------|
| Total refs href="/blog/*.html" | 131 |
| **Broken links** | **46 (35.1%)** |

Ejemplos: /blog/en/10k-training-plan.html, /blog/en/benefits-of-group-running.html, etc. Probable problema de notación de URLs (faltan .html o rutas relativas incorrectas).

---

## 8. HREFLANG RECIPROCITY (SAMPLE 10)

9/10 con hreflang="en" presente y correcto

**1 missing:** blog/atletas-hibridos/index.html (sin hreflang a EN)

---

## 9. OPEN GRAPH & TWITTER CARD (SAMPLE 10)

**100% cobertura:** Todos 10 tienen og:title, og:description, og:image, og:type, twitter:card ✓

---

## 10. ROBOTS META & INDEXACIÓN

**6 artículos con noindex (no deberían):**
1. blog/categoria/entrenamiento/index.html
2. blog/categoria/index.html
3. blog/descarga-plan-10k/index.html
4. blog/en/categoria/index.html
5. blog/en/running/best-running-shoes.../index.html
6. blog/running/mejores-zapatillas.../index.html

Nota: Mayormente categorías/redirects (aceptable), excepto blog/en/running/— verificar intención.

---

## PRIORIDADES

| Prioridad | Problema | Acción |
|-----------|----------|--------|
| 🔴 CRÍTICA | 46 broken href | Auditar estructura URLs y corregir |
| 🔴 CRÍTICA | 2 artículos canibalizan | Mergear o cambiar keyword |
| 🟠 ALTA | 40.5% titles >70 chars | Reescribir (target: 30-60) |
| 🟠 ALTA | 4 artículos <10 palabras | Remover/redirigir |
| 🟡 MEDIA | 33 descriptions >170 | Optimizar a 120-160 |

---

**Generado:** 2026-04-25
