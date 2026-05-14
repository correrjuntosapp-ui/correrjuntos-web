# Sesión de trabajo — 15 may 2026

## Contexto del proyecto
- App: CorrerJuntos (correrjuntos.com)
- Stack: Next.js, Vercel, Supabase, Brevo
- Repo: correrjuntosapp-ui/correrjuntos-web

## Trabajo completado hoy

### Artículos publicados
- /blog/mejor-app-running-gratuita-2026 (ranking honesto 5 apps, ItemList schema, marcador NRC#1 Strava#2 CJ#3 Runna#4 Garmin#5)
- /blog/correrjuntos-vs-strava (comparativa honesta, marcador 6-4 Strava-favor, tesis "complementarias", filter intro)

### Internal links añadidos
- 5 links con keyword-anchors hacia mejor-app-running-gratuita-2026
- 5 links con keyword-anchors hacia correrjuntos-vs-strava
- IndexNow ping a 12 URLs en total

### Fixes técnicos
- Redirect /precios → /#pricing (vercel.json)
- newsletter.js inyectado en 525 artículos (287 ES + 238 EN)
- Brevo API key leaked → movida a env var
- Cookie banner CLS verificado como optimizado (position:fixed)

### SEO + AEO sprint
- /about page creada (16 tipos de schema: Organization, AboutPage, 
  SoftwareApplication, AggregateRating, 4×LocalBusiness con geo coords, 
  Person founder, SpeakableSpecification, BreadcrumbList)
- sitemap-pages.xml actualizado con /about
- IndexNow ping enviado

### Docs externos creados (docs/)
- linkedin-company-page.md (147 líneas)
- wikidata-item.md (175 líneas)
- crunchbase-profile.md (208 líneas)
- app-store-descriptions.md (382 líneas) — keywords field ES corregido 
  (99 chars, 0 duplicados con Name+Subtitle)
- google-business-profiles.md (205 líneas)
- forum-outreach-templates.md (289 líneas)

### Commits del día
- 3a1eec4c — feat(seo+aeo): /about page + outreach plan + brand consistency
- 89ef90a4 — fix(app-store): keywords field ES sin duplicados, ≤100 chars
- 64cc4b2b — docs(aeo): external platform copy ready — LinkedIn, Wikidata, Crunchbase, App Store, GBP, forums

## Playbook acordado (para artículos comparativos)

### Estructura artículo "vs" de marca
1. Filter intro — descarta al usuario satisfecho en línea 1
2. Byline con rel="author" → /blog/autor/[slug]
3. Intro con disclosure del founder
4. Tabla comparativa
5. Deep dive app rival — honesto, sin minimizar
6. Deep dive CorrerJuntos — wins primero, losses explícitas, losses primero en bullet list
7. Tesis "complementarias" — abrir con integración técnica verificable
8. Matriz de decisión con perfiles concretos
9. Soft CTA 1 línea ("si no es para ti, [rival] sigue ahí")
10. FAQ 7 preguntas bottom-funnel
11. Related links (incluir link recíproco al pillar)

### Reglas de tono (Wirecutter-style)
- Admitir pérdidas explícitamente, nunca enterrarlas
- Marcador honesto (6-4 Strava-favor, no 4-4 forzado)
- "Si tienes X, mejor usa Y" cuando es verdad
- Tono declarativo, no defensivo
- Disclosure del founder siempre visible

### Schema por tipo de artículo
- Ranking (5 apps): BlogPosting + ItemList + FAQPage + Person + BreadcrumbList
- Comparativo "vs": BlogPosting + FAQPage + Person + BreadcrumbList (sin ItemList)

## Próximos pasos acordados

### Esta semana
1. Completar 14 placeholders de Crunchbase (ver docs/crunchbase-profile.md)
2. Crear LinkedIn Company Page (ver docs/linkedin-company-page.md)
3. Preparar cuenta Wikidata (5-10 ediciones previas antes de crear item)

### En 30-45 días (cuando lleguen datos GA4)
4. Validar si mejor-app-running-gratuita-2026 + correrjuntos-vs-strava rankean
5. Si rankean → publicar los 3 comparativos restantes (vs Runna, vs NRC, vs Garmin Coach)
6. Si no rankean → revisar estructura antes de invertir más horas

### Backlog (prioridad media)
- Author pages para Abraham Márquez y Carlos Ruiz (boost E-E-A-T)
- Artículos partner clubs (Sevilla RC, Beer Runners Málaga, Soul Run Huelva)
- Outreach 5 clubs nuevos (template en docs/forum-outreach-templates.md)
- Email nurture 7-step cuando lista llegue a 100+ subs

## Datos reales al cierre 15 may 2026
- Usuarios activos: 612
- Clubs partners: 4 (Beer Runners Málaga, Sevilla RC, Soul Run Huelva, CSL TDM)
- Ciudades: 8
- Artículos blog: 243 ES + 238 EN = 481 total
- App Store rating: 4.8★
- Premium: 4,99€/mes · 29,99€/año
- Revenue aproximado: ~57€/mes
- Artículos comparativos publicados: 2/5
