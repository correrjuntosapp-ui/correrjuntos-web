# Integridad editorial del blog — reglas y procedimiento

> Creado el 23 jul 2026 tras la limpieza de confianza de la rama `claude/blog-overhaul-p0`.
> Este documento es interno (excluido del deployment vía `.vercelignore`, regla `*.md`/`docs/`).

## Fuente de verdad

- **Los HTML de `blog/`, `blog/en/` y `equipamiento/` SON la fuente primaria.** No se regeneran desde Markdown, CMS ni plantillas: cada edición se hace sobre el HTML.
- El único generador activo es `tools/blog-generator/generate-affiliate-article.cjs` (crea artículos NUEVOS desde configs JSON; nunca regenera los existentes). ⚠️ A fecha de hoy **no parsea** (`node --check` falla, error preexistente en la plantilla); si se repara, sus strings de autoría ya son honestas (Abraham, Fundador).
- Los JS de `blog/` (`enhance.js`, `author.js`, `cro.js`, `related.js`, `toc.js`, `newsletter.js`, `share.js`, `city-links.js`) son runtime del navegador, no generadores.

## Reglas de autoría (no negociables)

1. **Un solo responsable editorial real: Abraham Márquez Rodríguez** (`blog/autores.json` es la fuente de verdad de autores).
2. Prohibido crear personas, pseudónimos o "equipos" ficticios. Los históricos (Carlos Ruiz, José Márquez byline, María López, "Diario de un Corredor") están retirados; solo sobreviven sus redirects 301 en `vercel.json`.
3. Prohibidas credenciales sin evidencia: periodista, coach, entrenador, nutricionista, experto, años de experiencia, títulos profesionales. `jobTitle` permitido: `Fundador de CorrerJuntos` / `Founder of CorrerJuntos` (o eliminar el campo).
4. José y Ana son asistentes de IA del producto, nunca autores ni revisores.
5. Revisores profesionales: solo con nombre, titulación, organización y fecha REALES (esquema en `blog/autores.json`).

## Reglas de contenido

- **Prohibidas experiencias personales fabricadas**: kilometrajes "probados", "llevo X km", "he probado N modelos", resultados deportivos, citas atribuidas sin fuente. Si no hay test real documentado, el texto es análisis editorial: especificaciones del fabricante, consenso de usuarios (atribuido), comparativas.
- **Prohibidos ratings fabricados**: nada de `AggregateRating`, `reviewCount`, `ratingCount` ni reviews autogeneradas sin valoraciones reales de usuarios. Ni en HTML ni inyectados por JS. Tampoco sustituirlos por 0/1/valores fijos.
- "Probado/tested" solo si existe un test real y documentado; por defecto, "analizado".
- Afiliación: disclosure automático (módulo de transparencia en `enhance.js`) + `/legal/afiliados`. Productos cedidos y colaboraciones se señalizan en el artículo.
- Salud/nutrición: aviso educativo automático (mismo módulo); no sustituye revisión profesional, que hoy NO existe y no debe afirmarse.
- IA: puede usarse como apoyo (investigación, estructura, edición); la responsabilidad final es humana (`/legal/politica-editorial`).

## Búsqueda forense obligatoria antes de publicar cambios de contenido

```bash
git grep -inE "aggregateRating|ratingValue|ratingCount|reviewCount|reviewRating" -- 'blog/' 'equipamiento/'
git grep -inE "periodista|journalist|running coach|entrenador de|años de experiencia|years of experience|experto en" -- 'blog/' 'equipamiento/'
git grep -inE "he probado|hemos probado|llevo [0-9]+ km|I tested|we tested|I have logged|tested for a minimum" -- 'blog/' 'equipamiento/'
```

Resultado esperado: cero coincidencias fuera de menciones legítimas (marcas, frases sobre el lector, redirects, este doc).

## Validaciones obligatorias

- `node --check` en todo JS tocado.
- Parseo de TODOS los bloques JSON-LD tocados (script en sesión: recorrer `application/ld+json` + `JSON.parse`).
- `git diff --check`.
- Vista en navegador de una muestra (portada, categoría, artículo afiliado, artículo sensible) sin errores de consola.

## Scripts retirados (23 jul 2026) — NO restaurar

`check-authors.cjs`, `fix-all-author-boxes.cjs`, `fix-author-boxes.cjs`, `fix-authors.cjs`, `fix-schema-batch.cjs`, `fix-seo-blog-cities.cjs`, `translate-cities.cjs`, `tools/replace-jose-to-abraham.cjs`, `tools/create-real-quedadas.cjs`, `blog/enhance.min.js` (minificado muerto), copias obsoletas de `tmp/`. Todos podían reintroducir personas/credenciales/ratings falsos. Si se necesita algo de ellos, está en el historial de git — reescribir con copy honesto antes de reusar.

## Deployment

`outputDirectory: "."` → todo el repo se sirve tal cual. `.vercelignore` excluye lo interno: `correr-juntos-app/`, `.claude/`, `*.md`, `tmp/`, `tools/`, `docs/`, `supabase/`, `tests/`, `*.cjs`. Cualquier archivo nuevo fuera de esas rutas queda públicamente accesible por URL: no dejar borradores fuera de `tmp/`.
