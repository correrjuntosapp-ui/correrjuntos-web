# Auditoría SEO Consolidada — correrjuntos.com
**Fecha:** 2026-04-25
**Auditor:** Claude Code (sesión José Guettouche)
**Scope:** Auditoría técnica + estratégica honesta
**Datos pendientes para Fase 2:** GSC export, GA4 organic data

---

## TL;DR — La verdad incómoda

CorrerJuntos tiene **400+ artículos publicados, posición media 13 en Google, CTR 0.7%**. El problema no es "pocas visitas" — es que la **estrategia SEO actual no compite**. Llevamos meses publicando contenido y Google nos tiene en página 2 (donde nadie hace clic).

Posibles causas (a confirmar con datos GSC):
1. **Sitemap 40 días desactualizado** ✅ FIXEADO HOY (commit `e3bcb955`)
2. **Trailing slash redirects 308 en 1.500+ links internos** ✅ FIXEADO HOY (commits `d086b42d`, `75196595`)
3. **125 títulos truncados en SERP** (>70 chars, 40% del blog) — **PENDIENTE**
4. **48 URLs `.html` con redirect 308** — **PENDIENTE** (15 min sed batch)
5. **Sitemap solo incluye 686 URLs vs 937 que Google conoce** → 251 phantom pages
6. **Posibles thin/duplicate pages** (canibalización, broken /blog/categoria/, etc.)
7. **E-E-A-T débil** (sitio nuevo + sin backlinks confirmados) — estructural

---

## 1. ESTADO ACTUAL (datos MEMORY.md + verificación live)

| Métrica | Valor | Benchmark | Diagnóstico |
|---------|-------|-----------|-------------|
| Páginas indexadas | 722 | — | OK |
| Páginas NO indexadas | 215 (23%) | <10% saludable | 🔴 ALTO |
| Posición media SERP | 13 | <10 = página 1 | 🟠 MEDIO |
| CTR | 0.7% | 2-3% industria | 🔴 ALTO |
| URLs en sitemap | 686 | — | — |
| Discrepancia sitemap vs Google | 251 phantom | 0 ideal | 🟠 MEDIO |
| Artículos blog ES | 298 | — | — |
| Artículos blog EN | 242 | — | — |
| Title >70 chars | 125 (40.5%) | <10% | 🔴 ALTO |
| Meta desc >170 chars | 33 (10.7%) | <5% | 🟠 MEDIO |
| Internal redirect chains 308 | ~1.500 | 0 | ✅ FIXEADO HOY |
| Sitemap freshness | 40 días | <7 días | ✅ FIXEADO HOY |

---

## 2. HALLAZGOS TÉCNICOS

### 2.1 Indexación (🔴 CRÍTICO)
- **23% del sitio rechazado por Google** (215/937 URLs). Causas habituales:
  - "Crawled, currently not indexed" → contenido que Google no considera valioso
  - "Discovered, currently not indexed" → crawl budget agotado
  - "Duplicate, Google chose different canonical" → cannibalización
  - "Soft 404" → páginas con muy poco contenido
- **Acción**: necesitamos GSC export para ver el motivo exacto por URL

### 2.2 Sitemap (✅ FIXEADO HOY)
- **Antes**: lastmod=2026-03-15 en 211 URLs (40 días sin actualizar)
- **Después**: lastmod=2026-04-25 en 294 URLs
- IndexNow pinged con 31 URLs prioritarias

### 2.3 Redirect chains 308 (✅ FIXEADO HOY)
- **Antes**: trailing slash en `/blog/`, `/planes/`, `/cities/`, etc → 308 → 200
- **Después**: links directos sin redirect intermedio
- Impact: Google penaliza ligeramente las redirect chains. Crawl budget liberado.

### 2.4 Title length (🔴 PENDIENTE)
- **125 títulos >70 chars (40.5% del blog ES)** se truncan en Google SERP con "..."
- Top ofensores: artículos de media-maratón (101-131 chars)
- **Impacto en CTR**: títulos truncados pierden ~30% de clics vs títulos completos
- **Acción**: reescribir 125 títulos. Ya tenemos plantilla del blog generator. ~2-3h.

### 2.5 Meta description length (🟠 PENDIENTE)
- 33 metas >170 chars (10.7%)
- 63 metas en zona LIMIT (160-170)
- **Acción**: reescribir 33 metas críticas. ~1h.

### 2.6 URLs `.html` (🟠 PENDIENTE)
- 48 URLs únicas con sufijo `.html` causan 308 redirect a la versión limpia
- 105 ocurrencias en archivos HTML del blog
- Mismo pattern que el trailing slash fix
- **Acción**: sed batch (15 min). Pendiente para próximo commit.

### 2.7 Cannibalization confirmada
- 2 artículos con título idéntico:
  - `/blog/entrenamiento-de-fuerza-para-corredores`
  - `/blog/entrenamiento-fuerza-corredores`
- ✅ Ya tenemos redirect en vercel.json (línea 65-68) — el primero redirige al segundo
- **Pero**: el archivo HTML del primero sigue existiendo y se sirve. Google podría estar viendo ambas versiones según cómo lo crawlee.
- **Acción**: eliminar `entrenamiento-de-fuerza-para-corredores.html` (5 min)

### 2.8 Thin / ghost pages
- 4 archivos con <10 palabras de body:
  - `blog/running/mejores-zapatillas-empezar-correr-2026/index.html` (0 words)
  - `blog/categoria/entrenamiento/index.html` (3)
  - `blog/zapatillas/index.html` (3)
  - `blog/atletas-hibridos/index.html` (4)
- Probablemente son páginas placeholder o redirects sin contenido
- **Acción**: revisar uno por uno. Eliminar o llenar de contenido. (15 min)

### 2.9 Noindex incorrecto
- 6 archivos con `<meta name="robots" content="noindex">`:
  - 4 son category pages (OK no indexar)
  - 2 son sospechosos: `blog/en/running/best-running-shoes-empezar...` y `blog/running/mejores-zapatillas-empezar-correr-2026/`
- **Acción**: revisar si el noindex es intencional. Si no, quitar y indexar.

### 2.10 Canonical inconsistente
- 1 caso detectado: `blog/ansiedad-pre-carrera.html`
  - canonical: `/blog/ansiedad-pre-carrera`
  - JSON-LD `@id`: `/#organization` ❌
- **Acción**: fix manual (5 min)

---

## 3. HALLAZGOS ESTRATÉGICOS (sincero)

### 3.1 Posición media 13 con 400 artículos = problema estructural
Esto **no se arregla** con más artículos. El contenido publicado no está rankeando. Posibles causas:

**(a) Thin / GPT-style content**
Tu blog generator (`tools/blog-generator/generate-affiliate-article.cjs`) crea artículos a partir de configs JSON. Si los artículos son patrones repetitivos, Google los detecta como "low-effort" y los relega.

**(b) Weak E-E-A-T (Experience, Expertise, Authority, Trust)**
Google prioriza autoridad. Un sitio nuevo con dos autores ficticios (Jose Marquez + Carlos Ruiz, según author DB) compitiendo contra Runner's World, Decathlon, ASICS Blog → **no hay forma** de ganar queries head-term sin backlinks reales.

**(c) Targeting incorrecto**
"Mejores zapatillas running 2026" tiene KD 70+ (kw difficulty). Sitios con DA 10-20 NO pueden rankear ahí. Estás compitiendo donde no puedes ganar.

**(d) Backlinks profile**
Sin Ahrefs/Moz no puedo confirmar, pero apuesto que el DA está en 15-25 (sitio nuevo, sin outreach orgánico). Sin DA 30+ es muy difícil rankear queries comerciales.

### 3.2 El pivot plan-first es bueno pero crea inconsistencia SEO temporal
- Hasta hace 2 meses el messaging era "comunidad + quedadas"
- Ahora es "plan personalizado + Coach IA"
- Google puede tener el sitio mapeado a la primera intent, mientras los CTAs nuevos hablan de la segunda
- **Acción**: dar tiempo (3-6 meses) para que Google re-evalúe

### 3.3 Contenido masivo vs targeted
**Datos duros**: 400 artículos publicados, 6 users que corrieron. La conversión content→user es ~0%.

Posibles realidades:
- (a) Los artículos generan tráfico pero los CTAs no convierten → fix CRO
- (b) Los artículos no generan tráfico → fix SEO
- (c) Los artículos generan tráfico equivocado (ej. información, no compra) → fix targeting

**Necesito GSC export para distinguir**.

---

## 4. WHAT YOU CAN ACTUALLY WIN (estrategia honesta)

Dado tu DA bajo + sitio nuevo + competencia brutal en queries head-term, estas son las únicas batallas ganables:

### 4.1 Long-tail con intent claro
- ❌ "mejores zapatillas running 2026" (KD 70+)
- ✅ "plan entrenamiento 0-5K 6 semanas gratis principiantes" (KD 15-25)
- ✅ "que comer noche antes media maraton primera vez" (KD 10-20)
- ✅ "horario calculadora ritmo media maraton sub 2h con calentamiento" (KD <10)

**Acción**: cambiar enfoque de los próximos 14 artículos del calendar. Targets ultra-específicos con intent comercial.

### 4.2 Local-first (Huelva, ya consensuado en MEMORY.md)
- ✅ "grupos running huelva 2026"
- ✅ "rutas running huelva 10K marisma"
- ✅ "carreras populares huelva calendario"
- KD: <5 (nadie compite)
- Volumen bajo pero CONVIERTE → tu app es local

**Acción**: 5 artículos de Huelva con autoridad local + asociaciones reales = page 1 garantizado.

### 4.3 Comparison & decision queries
- ✅ "Hoka Clifton vs Asics Novablast cual elegir 2026" ← ya tienes
- ✅ "Garmin Forerunner 165 vs Coros Pace 3 para principiantes"
- ✅ "Plan Hal Higdon vs Plan Jack Daniels diferencias"

Estas tienen alto intent comercial + KD medio.

### 4.4 Schema markup avanzado
- ❌ Hoy tienes Article + BlogPosting + FAQPage básicos
- ✅ Añadir: HowTo en planes, Course en planes premium, Recipe en nutrición, AggregateRating en zapatillas
- Impacto: rich snippets en SERP → +20-40% CTR

### 4.5 IA Search visibility
- robots.txt YA permite GPTBot, ClaudeBot, PerplexityBot ✅
- ChatGPT/Claude/Perplexity indexan tu contenido para respuestas
- **Acción**: optimizar para "answer engines" — H2 en formato pregunta, párrafos cortos respuestas directas, citas verificables

---

## 5. PLAN ACCIONABLE (priorizado)

### 🔴 ESTA SEMANA (4-6 horas)
1. ✅ Sitemaps regenerados + IndexNow ping (HECHO HOY)
2. ✅ Trailing slash 308 redirects (HECHO HOY, 2 commits)
3. **Fix 48 URLs `.html` con sed batch** (15 min)
4. **Reescribir 125 títulos >70 chars** (3h) — usar plantilla:
   - `[Keyword principal]: [beneficio en 4 palabras] (2026)` ≤ 60 chars
5. **Reescribir 33 metas >170 chars** (1h)
6. **Eliminar 4 ghost pages** o llenarlas (15 min)
7. **Mergear los 2 artículos canibalizando** (15 min)
8. **Fix 1 canonical inconsistente** + verificar 2 noindex sospechosos (15 min)

### 🟠 ESTE MES (12-20 horas)
9. **Pull GSC data** → identificar top 50 queries con impresiones >100 y posición 11-20 (próximas a página 1)
10. **Optimizar 50 artículos "casi rankean"** — mejorar título + meta + añadir 200-400 palabras + internal linking
11. **Cannibalization deeper audit** — comparar TODOS los titles entre sí, mergear o diferenciar 20-30 pares sospechosos
12. **Internal linking strategy** — hub-and-spoke desde /planes/0-5k a top 10 artículos relacionados
13. **Schema upgrade** — HowTo en planes, AggregateRating en zapatillas
14. **Backlink baseline check** — Moz/Ahrefs free tier para conocer DA actual

### 🟡 PRÓXIMOS 3 MESES (estructural)
15. **Content calendar reorientado**: 50% local (Huelva primero), 30% long-tail comercial, 20% educacional evergreen
16. **Backlink outreach**:
    - Federaciones running provinciales
    - Asociaciones running locales (cada ciudad de tu cities/)
    - Bloggers running españoles micro-influencers
    - Guest posts cross-marketing con apps complementarias
17. **E-E-A-T fix**: convertir un autor (Jose Marquez) en perfil real con foto, biografía, redes sociales, schema Person enlazando @id consistente
18. **Page experience**: medir CWV reales con PageSpeed Insights (necesita API key)

---

## 6. LO QUE NECESITO DE TI (Fase 2)

Para que el plan sea ejecutable y no genérico, necesito:

### Search Console export (Configuración):
1. Ve a [search.google.com/search-console](https://search.google.com/search-console)
2. Selecciona dominio `correrjuntos.com`
3. Sección "Rendimiento" → últimos 90 días
4. Exporta: **Top 50 queries por impresiones** (CSV)
5. Exporta: **Top 50 páginas por clicks** (CSV)
6. Sección "Cobertura" / "Páginas" → exporta lista de **"Crawled, currently not indexed"** y **"Discovered, currently not indexed"**

### GA4 export:
1. Ve a analytics.google.com → propiedad CorrerJuntos
2. Reports → Engagement → Pages and screens
3. Filtra por: **Source/Medium = google / organic**
4. Últimos 90 días
5. Exporta top 30 páginas con sessions + bounce rate + avg engagement

### Backlinks (opcional):
- [Moz Link Explorer free](https://moz.com/link-explorer) (3 búsquedas gratis/día)
- Mete `correrjuntos.com` y mándame screenshot del DA + top backlinks

Pásame eso (o dime si prefieres que use Chrome MCP en tu sesión para extraer GA4/GSC directamente como hice el viernes con la auditoría de fotos), y construyo el plan de acción específico con los 50 artículos a optimizar.

---

**Tiempo estimado plan completo**:
- Quick wins esta semana: 4-6h trabajo
- Medio plazo este mes: 12-20h
- Estructural 3 meses: 30-50h

**Impacto realista esperado** (sin garantías, hablamos de SEO):
- Quick wins: +15-25% CTR (titles + metas optimizados)
- Medio plazo: +30-50% tráfico orgánico (50 artículos optimizados pasando de pos 11-20 → 5-10)
- Estructural: doblar tráfico orgánico en 6 meses si los backlinks llegan

**Lo que NO va a pasar**: rankear "mejores zapatillas running 2026" en página 1. Olvídate de queries head-term genéricas. Foco en long-tail + local + decisión.
