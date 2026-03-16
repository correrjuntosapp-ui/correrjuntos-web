# Plan Maestro AI SEO / AEO 2026 — CorrerJuntos
## De 100K a 1M visitas/mes

---

## 1. DIAGNOSTICO ACTUAL

### Inventario
| Tipo | Cantidad | Schema | FAQ | Hreflang |
|------|----------|--------|-----|----------|
| Blog ES | 212 | Article + BreadcrumbList | 208/212 (98%) | ES default |
| Blog EN | 192 | Article + BreadcrumbList | 188/192 (98%) | EN alternate |
| Cities | 58 | SportsOrganization + City + ItemList | No | Solo ES |
| Places | 30 | WebPage + ItemList | No | Solo ES |
| Events | 16 | WebPage + ItemList | No | Solo ES |
| Matching | 2 (ES+EN) | No auditado | No | ES+EN |
| Pages estáticas | 8 | Variado | No | Solo ES |

### Fortalezas
- **Autoridad de contenido**: 404 artículos bilingues con schema completo
- **Cobertura FAQ**: 98% de artículos tienen FAQPage schema (excelente para AI Overviews)
- **Internal linking**: 6.200+ enlaces internos contextuales
- **Marketplace SEO**: 58 cities + 30 places + 16 events = 104 páginas locales
- **robots.txt**: AI bots permitidos (GPTBot, PerplexityBot, ClaudeBot, Meta-ExternalAgent)
- **Sitemaps**: 7 sitemaps organizados por tipo, 560 URLs indexadas
- **Conversión**: App Store CTAs en 100% de artículos, newsletter en 56%

### Debilidades
- **Cities/Places/Events sin versión EN** — pierdes todo el tráfico internacional
- **Cities/Places/Events sin FAQ schema** — invisibles en AI Overviews
- **No hay SportsEvent schema en events** — Google Events no los muestra
- **No hay standalone training plan pages** — los planes están enterrados en artículos
- **20 artículos ES sin par EN** — gap de contenido bilingue
- **Places muy limitados** (30) — faltan ciudades españolas clave y barrios
- **Events solo 16 ciudades** — faltan las principales carreras de España
- **No hay páginas de comparativa ciudad vs ciudad** (ej. "correr en Madrid vs Barcelona")
- **No hay contenido programático por barrio/zona** (ej. "correr por Chamberí")
- **Matching landing solo 2 páginas** — falta SEO local por ciudad para matching
- **Sin HowTo schema** en artículos de tutorial/rutina
- **Sin VideoObject schema** (si hay videos embebidos)
- **Categories EN inconsistentes** (mezcla "shoes" con "zapatillas", "nutrition" con "nutricion")

---

## 2. OPORTUNIDADES (ordenadas por impacto × esfuerzo)

### Tier 1 — Alto impacto, bajo esfuerzo (Quick Wins)
1. **Internacionalizar cities/places/events** → EN versions = 104 nuevas URLs indexables
2. **SportsEvent schema en events** → aparecer en Google Events panel
3. **FAQ schema en cities/places/events** → AI Overviews para búsquedas locales
4. **HowTo schema en artículos de rutinas** → rich snippets de pasos
5. **Normalizar categorías EN** → consistencia para crawlers

### Tier 2 — Alto impacto, esfuerzo medio
6. **SEO programático: /planes/{objetivo}** → 20+ landing pages de planes de entrenamiento
7. **SEO programático: /barrios/{ciudad}/{barrio}** → 50+ páginas de barrios para correr
8. **SEO programático: /carreras/{carrera}** → 50+ fichas de carreras populares españolas
9. **Matching landing por ciudad** → /matching/{ciudad} × 20 ciudades
10. **Cluster "Comparativas de ciudades"** → "correr en Madrid vs Barcelona"

### Tier 3 — Impacto medio-alto, esfuerzo alto
11. **Contenido conversacional/AEO** → artículos formato Q&A profundo
12. **People Also Ask farming** → artículos enfocados en PAA clusters
13. **Guías definitivas por ciudad** → /guia-running/{ciudad} (mega-pages)
14. **Hub pages temáticos** → /entrenamiento/, /nutricion/, /zapatillas/ como topic hubs
15. **API de datos públicos** → ritmos medios, clima por ciudad, rankings

---

## 3. ARQUITECTURA RECOMENDADA

```
correrjuntos.com/
├── /blog/{slug}                    ← 212 ES artículos (existente)
├── /blog/en/{slug}                 ← 192 EN artículos (existente)
│
├── /cities/{ciudad}                ← 58 ciudades (existente, añadir EN)
├── /cities/en/{ciudad}             ← 58 ciudades EN (NUEVO)
│
├── /places/{lugar}                 ← 30 lugares (existente, añadir EN)
├── /places/en/{lugar}              ← 30 lugares EN (NUEVO)
│
├── /events/{ciudad}                ← 16 eventos ciudad (existente, añadir EN)
├── /events/en/{ciudad}             ← 16 eventos EN (NUEVO)
│
├── /carreras/{slug}                ← NUEVO: fichas de carreras individuales
├── /races/{slug}                   ← NUEVO: EN equivalents
│
├── /planes/{objetivo}              ← NUEVO: planes de entrenamiento
├── /plans/{objective}              ← NUEVO: EN equivalents
│
├── /barrios/{ciudad}/{barrio}      ← NUEVO: zonas para correr
├── /neighborhoods/{city}/{area}    ← NUEVO: EN equivalents
│
├── /matching/                      ← existente (ES)
├── /matching/en/                   ← existente (EN)
├── /matching/{ciudad}              ← NUEVO: landing por ciudad
├── /matching/en/{city}             ← NUEVO: EN equivalents
│
├── /guias/{ciudad}                 ← NUEVO: mega-guías running por ciudad
├── /guides/{city}                  ← NUEVO: EN equivalents
│
├── /hub/entrenamiento              ← NUEVO: topic hub pages
├── /hub/nutricion                  ← NUEVO
├── /hub/zapatillas                 ← NUEVO
├── /hub/trail                      ← NUEVO
```

---

## 4. PLANTILLAS EXACTAS PROGRAMATICAS

### 4A. /planes/{objetivo} — Planes de Entrenamiento
**URLs a crear (20):**
- /planes/5k-principiantes
- /planes/5k-sub-25
- /planes/5k-sub-20
- /planes/10k-principiantes
- /planes/10k-sub-50
- /planes/10k-sub-45
- /planes/10k-sub-40
- /planes/media-maraton-principiantes
- /planes/media-maraton-sub-2h
- /planes/media-maraton-sub-1h45
- /planes/media-maraton-sub-1h30
- /planes/maraton-principiantes
- /planes/maraton-sub-4h
- /planes/maraton-sub-3h30
- /planes/maraton-sub-3h
- /planes/trail-10k
- /planes/trail-21k
- /planes/fuerza-para-corredores
- /planes/vuelta-tras-lesion
- /planes/perder-peso-corriendo

**Estructura de cada página:**
```
- Hero: distancia + objetivo + duración del plan
- Resumen del plan (semanas, días/semana, km/semana pico)
- Tabla interactiva semana a semana (día, tipo sesión, distancia, ritmo)
- Tips clave para ese nivel
- FAQ (5-6 preguntas reales)
- CTA: "Descarga el plan en la app" → App Store/Play
- Cross-links: artículos relacionados, otros planes adyacentes
- Newsletter CTA: "Recibe el plan en PDF por email"
```

### 4B. /carreras/{slug} — Fichas de Carreras
**URLs a crear (50 carreras españolas más buscadas):**
- /carreras/san-silvestre-vallecana
- /carreras/zurich-maraton-sevilla
- /carreras/maraton-valencia
- /carreras/marato-barcelona
- /carreras/rock-and-roll-madrid
- /carreras/behobia-san-sebastian
- /carreras/cursa-bombers-barcelona
- /carreras/volta-a-peu-valencia
- /carreras/cursa-merce-barcelona
- /carreras/maraton-malaga
- /carreras/medio-maraton-madrid
- /carreras/carrera-de-la-mujer-madrid
- /carreras/10k-valencia
- ... (50 total)

**Estructura de cada ficha:**
```
- Hero: nombre, fecha, ciudad, distancias disponibles
- Info clave: inscripción, precio, recorrido, desnivel, límite participantes
- Mapa del recorrido (Leaflet embed)
- Perfil altimétrico si aplica
- Tips de preparación específicos
- Alojamiento y transporte
- FAQ (fecha inscripción, precio, cómo llegar, ritmo medio)
- CTA: "Busca compañero para esta carrera" → Matching
- Cross-links: plan de entrenamiento adecuado, guía de ciudad
```

### 4C. /barrios/{ciudad}/{barrio} — Zonas para Correr
**URLs a crear (50-80, empezando por las 5 ciudades principales):**

Madrid (10): chamberí, salamanca, retiro, moncloa, arganzuela, chamartín, latina, carabanchel, hortaleza, fuencarral
Barcelona (10): eixample, gracia, sarria, sant-marti, poblenou, montjuic, les-corts, horta, barceloneta, pedralbes
Valencia (6): ciutat-vella, ruzafa, benimaclet, patraix, campanar, malvarrosa
Sevilla (6): triana, nervion, macarena, los-remedios, santa-cruz, este
Málaga (5): centro, este, teatinos, huelin, pedregalejo

**Estructura:**
```
- Hero: "Correr en {Barrio}, {Ciudad}"
- Mapa con rutas populares del barrio (Leaflet)
- 3-5 rutas recomendadas (distancia, desnivel, superficie)
- Puntos de agua, fuentes, vestuarios
- Mejor hora para correr en esa zona
- Grupos de running activos en la zona
- Seguridad y iluminación nocturna
- FAQ (es seguro, mejor hora, km de la ruta)
- CTA: "Únete a una quedada en {Barrio}" → App
```

### 4D. /matching/{ciudad} — Landing Matching por Ciudad
**URLs a crear (20 ciudades):**
- /matching/madrid, /matching/barcelona, /matching/valencia, /matching/sevilla, /matching/malaga, /matching/bilbao, /matching/zaragoza, /matching/granada, /matching/san-sebastian, /matching/alicante, /matching/cordoba, /matching/vigo, /matching/murcia, /matching/palma, /matching/las-palmas, /matching/santander, /matching/oviedo, /matching/salamanca, /matching/cadiz, /matching/pamplona

**Estructura:**
```
- Hero: "Encuentra runners en {Ciudad}"
- Estadísticas locales: X runners activos, Y quedadas/semana
- Testimonios de runners locales
- Cómo funciona el matching (3 pasos)
- Zonas populares para correr (link a /barrios/)
- Próximas quedadas en la ciudad (link a app)
- FAQ (es gratis, cómo funciona, cuántos runners hay)
- CTA: "Ver mis matches en {Ciudad}" → App
```

### 4E. /guias/{ciudad} — Mega-Guías Running por Ciudad
**URLs a crear (10 ciudades principales ES + EN):**
- /guias/madrid, /guias/barcelona, /guias/valencia, /guias/sevilla, /guias/malaga
- /guides/madrid, /guides/barcelona, /guides/london, /guides/new-york, /guides/paris

**Estructura (2000-3000 palabras):**
```
- Hero: "Guía Completa de Running en {Ciudad} 2026"
- Por qué correr en {Ciudad}
- Top 10 rutas (con mapa)
- Mejores parques y circuitos
- Calendario de carreras del año
- Grupos y clubes de running
- Tiendas especializadas
- Clima por mes (tabla)
- Consejos prácticos (superficie, agua, seguridad)
- FAQ (10 preguntas)
- CTA: "Únete a la comunidad runner de {Ciudad}" → App
- Links: /barrios/, /places/, /events/, /matching/, /blog/ relacionados
```

---

## 5. CLUSTERS EXACTOS A CREAR

### Cluster A: "Planes de Entrenamiento" (20 ES + 20 EN = 40 páginas)
Hub: /planes/ (index)
Spoke: /planes/{objetivo} × 20
Enlace: cada plan → artículos de entrenamiento relacionados + /matching/{ciudad}

### Cluster B: "Carreras Populares España" (50 ES + 10 EN = 60 páginas)
Hub: /carreras/ (index por región/mes)
Spoke: /carreras/{nombre} × 50
Enlace: → plan adecuado + /events/{ciudad} + /guias/{ciudad}

### Cluster C: "Barrios para Correr" (50 ES + 20 EN = 70 páginas)
Hub: Integrado en /cities/{ciudad}
Spoke: /barrios/{ciudad}/{barrio} × 50+
Enlace: → /places/ cercanos + /matching/{ciudad} + /cities/{ciudad}

### Cluster D: "Guías de Ciudad" (10 ES + 10 EN = 20 páginas)
Hub: /guias/ (index)
Spoke: /guias/{ciudad} × 10
Enlace: → centraliza /cities/ + /places/ + /events/ + /barrios/ + /matching/

### Cluster E: "Matching Local" (20 ES + 20 EN = 40 páginas)
Hub: /matching/
Spoke: /matching/{ciudad} × 20
Enlace: → /cities/{ciudad} + /guias/{ciudad} + /barrios/{ciudad}/

### Totales programáticos nuevos: ~230 páginas (vs 560 actuales = +41%)

---

## 6. SCHEMA JSON-LD POR TIPO DE PAGINA

### /planes/{objetivo}
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "name": "Plan 10K Sub 50 min" },
    { "@type": "HowTo",
      "name": "Plan de Entrenamiento 10K Sub 50 minutos",
      "totalTime": "PT8W",
      "step": [
        { "@type": "HowToStep", "name": "Semana 1", "text": "3 días, 20 km total" },
        { "@type": "HowToStep", "name": "Semana 2", "text": "..." }
      ]
    },
    { "@type": "FAQPage", "mainEntity": [...] },
    { "@type": "BreadcrumbList" }
  ]
}
```

### /carreras/{slug}
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SportsEvent",
      "name": "San Silvestre Vallecana 2026",
      "startDate": "2026-12-31",
      "location": { "@type": "Place", "name": "Madrid", "address": {...} },
      "organizer": { "@type": "Organization" },
      "offers": { "@type": "Offer", "price": "15", "priceCurrency": "EUR" },
      "maximumAttendeeCapacity": 40000
    },
    { "@type": "FAQPage" },
    { "@type": "BreadcrumbList" }
  ]
}
```

### /barrios/{ciudad}/{barrio}
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Place",
      "name": "Correr en Chamberí, Madrid",
      "geo": { "@type": "GeoCoordinates", "latitude": 40.43, "longitude": -3.70 },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Fuentes de agua", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Iluminación nocturna", "value": true }
      ]
    },
    { "@type": "FAQPage" },
    { "@type": "BreadcrumbList" }
  ]
}
```

### /matching/{ciudad}
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebApplication",
      "name": "CorrerJuntos Matching — Madrid",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "iOS, Android",
      "offers": { "@type": "Offer", "price": "0" }
    },
    { "@type": "FAQPage" },
    { "@type": "BreadcrumbList" }
  ]
}
```

### /guias/{ciudad}
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "TouristDestination",
      "name": "Running en Madrid",
      "touristType": "Runners"
    },
    { "@type": "ItemList", "itemListElement": [...rutas...] },
    { "@type": "FAQPage" },
    { "@type": "BreadcrumbList" }
  ]
}
```

### Cities/Places/Events EXISTENTES — mejorar
- **Cities**: Añadir FAQPage schema (5 preguntas por ciudad)
- **Places**: Cambiar a Place schema con GeoCoordinates + Review + FAQPage
- **Events**: Añadir SportsEvent schema con fechas reales + FAQPage

---

## 7. PLAN DE ENLAZADO INTERNO

### Modelo Hub & Spoke por vertical

```
/guias/madrid (MEGA HUB)
  ├── /cities/madrid (city hub)
  │     ├── /barrios/madrid/retiro
  │     ├── /barrios/madrid/chamberi
  │     └── /barrios/madrid/moncloa
  ├── /places/retiro (place detail)
  ├── /places/casa-de-campo
  ├── /events/madrid (events hub)
  │     ├── /carreras/san-silvestre-vallecana
  │     ├── /carreras/rock-and-roll-madrid
  │     └── /carreras/medio-maraton-madrid
  ├── /matching/madrid (matching landing)
  ├── /blog/mejores-rutas-correr-madrid
  ├── /blog/grupos-running-madrid
  └── /planes/maraton-sub-4h (linked from carreras)
```

### Reglas de enlazado automático (añadir al batch script)
1. Cada /carreras/{x} enlaza → /planes/ recomendado + /events/{ciudad} + /guias/{ciudad}
2. Cada /barrios/{x}/{y} enlaza → /cities/{x} + /places/ cercanos + /matching/{x}
3. Cada /planes/{x} enlaza → artículos de blog relacionados + /carreras/ donde aplicar
4. Cada /guias/{x} enlaza → TODOS los recursos de esa ciudad
5. Cada blog article enlaza → /planes/ si menciona objetivos + /carreras/ si menciona carreras
6. Footer cross-links: todas las verticales se enlazan entre sí

### Breadcrumbs contextuales
```
Inicio > Guías > Madrid > Barrios > Chamberí
Inicio > Carreras > Madrid > San Silvestre Vallecana
Inicio > Planes > 10K > Sub 50 min
Inicio > Matching > Madrid
```

---

## 8. PLAN DE CONVERSION (SEO → Usuarios)

### Funnel por tipo de página

| Página | Intent | CTA Principal | CTA Secundario |
|--------|--------|--------------|----------------|
| Blog informativo | Aprender | Newsletter | App download |
| Blog transaccional | Comprar | Amazon affiliate | App download |
| /planes/ | Entrenar | "Descarga en app" / Email PDF | Newsletter |
| /carreras/ | Competir | "Busca compañero" → Matching | Plan entrenamiento |
| /barrios/ | Explorar | "Únete a quedada" → App | Matching local |
| /cities/ | Descubrir | "Ver quedadas" → App | Newsletter |
| /places/ | Correr | "Crear quedada aquí" → App | Rutas cercanas |
| /events/ | Planificar | "Entrenar juntos" → Matching | Plan entrenamiento |
| /matching/ | Conectar | "Ver mis matches" → App | Newsletter |
| /guias/ | Todo | App download | Matching + Newsletter |

### CTAs específicos a implementar
1. **Smart CTA contextual**: si el artículo menciona una ciudad → CTA con "Únete a X runners en {ciudad}"
2. **Plan PDF lead magnet**: cada /planes/ ofrece el plan en PDF vía email (captura lead)
3. **Carrera countdown**: /carreras/ con contador regresivo "Faltan X días" + "Busca compañero"
4. **Matching teaser**: en /barrios/ y /cities/ → preview del matching con 3 perfiles difuminados
5. **Social proof dinámico**: "X runners se unieron esta semana en {ciudad}"

---

## 9. ROADMAP POR FASES

### Fase 1 — Quick Wins (Semana 1-2)
- [ ] Añadir FAQ schema a 58 cities + 30 places + 16 events
- [ ] Añadir SportsEvent schema a 16 events pages
- [ ] Normalizar categorías EN en blog index (shoes→zapatillas, nutrition→nutricion, community→rutas)
- [ ] Añadir HowTo schema a 20+ artículos de rutinas/tutoriales
- [ ] Crear los 20 artículos ES faltantes en EN (cerrar gap bilingue)

### Fase 2 — Planes de Entrenamiento (Semana 3-4)
- [ ] Crear generador: tools/plans-generator/
- [ ] Crear plantilla HTML para /planes/{objetivo}
- [ ] Generar 20 páginas ES con HowTo + FAQ schema
- [ ] Generar 20 páginas EN equivalentes
- [ ] Crear /planes/index.html (hub page)
- [ ] Crear /plans/index.html (EN hub)
- [ ] Cross-link desde blog articles existentes
- [ ] Añadir a sitemaps

### Fase 3 — Carreras Populares (Semana 5-7)
- [ ] Crear generador: tools/races-generator/
- [ ] Recopilar datos de 50 carreras españolas (fecha, precio, distancias, recorrido)
- [ ] Crear plantilla HTML para /carreras/{slug} con SportsEvent schema
- [ ] Generar 50 páginas ES
- [ ] Generar 10 páginas EN (carreras internacionales o más buscadas)
- [ ] Crear /carreras/index.html con filtros por ciudad/mes/distancia
- [ ] Cross-link con /events/{ciudad} y /planes/{objetivo}
- [ ] Añadir a sitemaps

### Fase 4 — Barrios para Correr (Semana 8-10)
- [ ] Crear generador: tools/neighborhoods-generator/
- [ ] Recopilar datos: rutas, fuentes, iluminación, seguridad por barrio
- [ ] Crear plantilla HTML con Place schema + mapa Leaflet
- [ ] Generar 50 páginas ES (5 ciudades × 10 barrios)
- [ ] Generar 20 páginas EN (2 ciudades × 10 barrios)
- [ ] Enlazar desde /cities/{ciudad}
- [ ] Añadir a sitemaps

### Fase 5 — Matching Local (Semana 11-12)
- [ ] Crear plantilla /matching/{ciudad}
- [ ] Generar 20 páginas ES con WebApplication schema
- [ ] Generar 20 páginas EN
- [ ] Enlazar desde /cities/ + /barrios/ + /guias/
- [ ] Añadir social proof real (contadores de Supabase)

### Fase 6 — Guías de Ciudad + Internacionalización (Semana 13-16)
- [ ] Crear 10 mega-guías ES (/guias/{ciudad})
- [ ] Crear 10 mega-guías EN (/guides/{city})
- [ ] Internacionalizar cities/ (58 EN pages)
- [ ] Internacionalizar places/ (30 EN pages)
- [ ] Internacionalizar events/ (16 EN pages)
- [ ] Actualizar todos los sitemaps con hreflang

### Fase 7 — Hub Pages + AEO Optimization (Semana 17-20)
- [ ] Crear hub pages: /hub/entrenamiento, /hub/nutricion, /hub/zapatillas, /hub/trail
- [ ] Crear contenido Q&A conversacional (10 artículos formato "pregunta real + respuesta profunda")
- [ ] Optimizar meta descriptions para AI Overviews (formato pregunta-respuesta en primer párrafo)
- [ ] Añadir speakable schema a top 50 artículos
- [ ] People Also Ask farming: crear artículos basados en PAA clusters reales

---

## 10. TOP 20 ACCIONES PRIORITARIAS

| # | Acción | Impacto | Esfuerzo | Páginas nuevas |
|---|--------|---------|----------|----------------|
| 1 | FAQ schema en cities/places/events (104 pgs) | Alto | Bajo | 0 |
| 2 | SportsEvent schema en 16 events | Alto | Bajo | 0 |
| 3 | Normalizar categorías EN en blog index | Medio | Bajo | 0 |
| 4 | Crear 20 /planes/ ES + 20 EN | Muy alto | Medio | 40 |
| 5 | Crear /planes/index.html hub ES + EN | Alto | Bajo | 2 |
| 6 | HowTo schema en artículos de rutinas | Alto | Bajo | 0 |
| 7 | Crear 50 /carreras/ ES | Muy alto | Alto | 50 |
| 8 | Crear /carreras/index.html hub | Alto | Bajo | 1 |
| 9 | Crear 20 /matching/{ciudad} ES + EN | Alto | Medio | 40 |
| 10 | Crear 50 /barrios/ ES + 20 EN | Alto | Alto | 70 |
| 11 | Crear 10 /guias/ ES mega-pages | Muy alto | Alto | 10 |
| 12 | Crear 10 /guides/ EN mega-pages | Muy alto | Alto | 10 |
| 13 | Internacionalizar 58 cities a EN | Alto | Medio | 58 |
| 14 | Internacionalizar 30 places a EN | Medio | Medio | 30 |
| 15 | Internacionalizar 16 events a EN | Medio | Bajo | 16 |
| 16 | Cerrar gap: 20 artículos ES sin par EN | Medio | Medio | 20 |
| 17 | Hub pages temáticos (4 hubs) | Alto | Medio | 4 |
| 18 | Speakable schema en top 50 artículos | Medio | Bajo | 0 |
| 19 | Smart CTAs contextuales por ciudad | Alto | Medio | 0 |
| 20 | Plan PDF lead magnets en /planes/ | Alto | Bajo | 0 |

### Resumen de crecimiento esperado
| Métrica | Actual | Post-Plan |
|---------|--------|-----------|
| URLs indexadas | 560 | ~910 (+63%) |
| Páginas con FAQ schema | 396 | ~800 |
| Páginas con schema rico | ~400 | ~900 |
| Verticales SEO | 5 (blog, cities, places, events, matching) | 10 (+planes, carreras, barrios, guias, hubs) |
| Cobertura EN | 192 blog + 2 matching | 192 blog + 2 matching + 58 cities + 30 places + 16 events + 40 planes + 20 matching + 10 guías |
| CTAs de conversión | App download + Newsletter | + Plan PDF + Matching teaser + Carrera countdown + Smart city CTA |
