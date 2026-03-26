# Tarea: Reescribir artículo a nivel profesional

## Prompt para el agente Content Creator

```
Eres el creador de contenido de CorrerJuntos. Proyecto en C:\Users\guett\OneDrive\Escritorio\correrjuntosV2

Tarea: REESCRIBIR y MEJORAR el artículo existente blog/[SLUG].html a nivel profesional (estilo Foro Atletismo / Runners World).

## FOTOS — REGLA CRÍTICA DE UNICIDAD

Buscar 6-8 fotos en Pexels (pexels.com) de running/correr. PERO ANTES de usar cualquier foto:

1. Ejecutar: grep -r "pexels-photo-" blog/*.html blog/**/*.html | grep -o "pexels-photo-[0-9]*" | sort -u
2. Esto te da TODOS los IDs de Pexels ya usados en el blog
3. NUNCA usar un ID que aparezca en esa lista
4. Buscar fotos NUEVAS que NO estén en ningún artículo del blog
5. Verificar CADA foto individualmente: grep "pexels-photo-XXXXX" blog/*.html — debe dar 0 resultados

Fotos necesarias (todas únicas, nunca usadas):
- Hero: [foto relevante al tema del artículo]
- Sección 1: [foto contextual]
- Sección 2: [foto contextual]
- Sección 3: [foto contextual]
- Sección 4: [foto contextual]
- Sección 5: [foto contextual]
- Opcional extra: [foto contextual]

Formato OBLIGATORIO para cada foto:
<figure style="margin:32px 0;text-align:center">
  <img src="https://images.pexels.com/photos/XXXXXXX/pexels-photo-XXXXXXX.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop&q=75" alt="[Descripción detallada y única]" loading="lazy" style="max-width:100%;border-radius:12px">
  <figcaption style="font-size:.85rem;color:#888;margin-top:8px">[Caption descriptivo contextual]</figcaption>
</figure>

## ENLACES DE AFILIADO — INLINE EN EL TEXTO

NO solo en tarjetas de producto. Cada vez que el texto menciona un producto, enlazar INLINE:

- Tag OBLIGATORIO: diezmejores21-21
- Formato: https://www.amazon.es/dp/[ASIN]?tag=diezmejores21-21
- BUSCAR tú mismo los ASINs reales en Amazon.es — NUNCA inventar
- Mínimo 8-10 enlaces inline de afiliado repartidos por TODO el artículo
- Además, mantener tarjetas de producto con grid para productos principales

Ejemplo enlace inline:
"unas <a href="https://www.amazon.es/dp/BXXXXX?tag=diezmejores21-21" target="_blank" rel="nofollow sponsored noopener">Nike Pegasus 41</a> son perfectas para empezar"

## CONTENIDO — Subir a ~2.500 palabras

- Datos científicos reales con cifras
- Tablas HTML formateadas (specs, comparativas, planes)
- Elementos visuales: stat-box, solution-box, warning-box, tip boxes
- Vocabulario técnico del nicho
- Experiencia personal del autor (José Márquez)

## INTERNAL LINKS — Mínimo 8-10

Buscar artículos existentes: ls blog/*.html
Enlazar a artículos reales del blog, NO inventar URLs.

## FAQ — 8 preguntas optimizadas para AI Overviews

## NO TOCAR
- Estructura HTML base (nav, head, estilos, scripts, footer)
- Solo modificar contenido dentro de <div class="container content">
- Actualizar Schema dateModified a fecha de hoy

Autor: José Márquez
Slug: [SLUG] (mismo archivo, reescribir)

Después del commit + push, enviar a IndexNow.
```

## Cómo usar esta plantilla

1. Copiar el prompt de arriba
2. Reemplazar `[SLUG]` con el slug del artículo
3. Adaptar las descripciones de fotos al tema del artículo
4. Ejecutar en Claude Code como agente Content Creator
