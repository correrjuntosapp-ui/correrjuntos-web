# Plan de fotos · Artículo Andalucía 2026

**Regla cabecera (MEMORY 25 abril):**
> "Cero IDs Pexels inventados · cero repetición · verificación visual obligatoria.
> Lección dura: uniqueness sin contexto temático = amateur. Hay que tener ambos."

## 10 fotos necesarias

| # | Posición | Tema buscado | Keywords Pexels | Notas |
|---|---|---|---|---|
| 1 | **Hero artículo** | Corredor en paisaje andaluz amanecer | `runners sunrise spain`, `running spain landscape morning` | Imagen icónica, NO genérica gym |
| 2 | Sección Huelva | Paseo marítimo Punta Umbría / marismas | `punta umbria`, `huelva beach`, `marismas spain coast` | Paisaje real Huelva |
| 3 | Sección Sevilla | Plaza España o Parque María Luisa | `plaza españa sevilla`, `parque maria luisa`, `sevilla architecture runner` | Iconografía Sevilla |
| 4 | Sección Cádiz | Costa atlántica / Jerez viñedos | `cadiz beach atlantic`, `jerez vineyard`, `andalusia vineyard` | Atlántico o Jerez |
| 5 | Sección Málaga | Costa del Sol / Ronda puente | `malaga coast sunset`, `ronda spain bridge`, `costa del sol running` | Costa o sierra |
| 6 | Sección Granada | Sierra Nevada / Alhambra | `sierra nevada spain`, `alhambra granada`, `granada landscape` | Montaña o Alhambra |
| 7 | Sección Almería | Cabo de Gata / desierto Tabernas | `cabo de gata`, `almeria desert`, `tabernas spain` | Paisaje único Almería |
| 8 | Sección Córdoba | Mezquita / olivar | `cordoba mezquita`, `andalusia olive grove`, `cordoba spain` | Mezquita o olivar |
| 9 | Sección Jaén | Olivar serrano / Cazorla bosque | `jaen olive grove sunset`, `cazorla forest`, `andalusia olive tree` | Olivos o sierra |
| 10 | "Cómo prepararte" | Hidratación / equipamiento running | `running hydration`, `runner water`, `runner stretching outdoor` | Más genérico OK |

## Workflow para verificar (mañana 30 abril)

Para cada foto:

### Paso 1 — Buscar en Pexels

Visitar `https://www.pexels.com/search/[KEYWORD]/`. Por ejemplo:
- https://www.pexels.com/search/punta%20umbria/
- https://www.pexels.com/search/sierra%20nevada%20spain/
- https://www.pexels.com/search/cabo%20de%20gata/

Listar 2-3 candidatos por sección con su URL única (formato `pexels.com/photo/[NOMBRE]-[ID]`).

### Paso 2 — Verificar uniqueness contra blog

```bash
# Obtener todos los IDs Pexels ya usados en el blog
all_used=$(grep -roh "pexels-photo-[0-9]*\|pexels.com/photo/[a-z0-9-]*-[0-9]*" blog/ 2>/dev/null | grep -oE "[0-9]+$" | sort -u)

# Verificar cada candidato (sustituir 24906520 por el ID real candidato)
echo "$all_used" | grep -w "24906520" && echo "❌ YA USADO" || echo "✅ NUEVO"
```

### Paso 3 — Verificación visual obligatoria

Por cada candidato:
- ✅ ACEPTAR si: corresponde literalmente al tema buscado, mínimo amateur deportivo
- ❌ RECHAZAR si: genérica de gym, otra ciudad, niños, foto stock obvia, no relevante

### Paso 4 — Anotar URL final

Guardar en este archivo (sección "URLs verificadas finales") con:

```
| # | URL | ID | Verificado | Status |
|---|---|---|---|---|
| 1 | https://www.pexels.com/photo/runners-sunrise-...-12345/ | 12345 | 2026-04-30 | ✅ |
```

## URLs verificadas finales

[Pendiente de rellenar mañana 30 abril durante la fase de verificación visual]

| # | Sección | URL Pexels | ID | Autor | Status |
|---|---|---|---|---|---|
| 1 | Hero | — | — | — | ⏳ pendiente |
| 2 | Huelva | — | — | — | ⏳ pendiente |
| 3 | Sevilla | — | — | — | ⏳ pendiente |
| 4 | Cádiz | — | — | — | ⏳ pendiente |
| 5 | Málaga | — | — | — | ⏳ pendiente |
| 6 | Granada | — | — | — | ⏳ pendiente |
| 7 | Almería | — | — | — | ⏳ pendiente |
| 8 | Córdoba | — | — | — | ⏳ pendiente |
| 9 | Jaén | — | — | — | ⏳ pendiente |
| 10 | Cómo prepararte | — | — | — | ⏳ pendiente |

## Tip honesto

Algunas búsquedas como "punta umbria" o "cabo de gata" pueden dar pocas fotos en Pexels. Si **no encontramos foto adecuada** para una provincia:

- **Plan B**: usar foto genérica andaluza (paisaje olive grove, sierra) etiquetada con caption específico de la provincia
- **Plan C**: usar foto Wikimedia Commons (también CC0) — más variedad geográfica española
- **NO inventar IDs ni copiar de otros blogs**

Si tras 30 minutos de búsqueda real no encontramos foto verificada para Almería o Córdoba, **mejor publicar SIN esa foto** que con una genérica engañosa.
