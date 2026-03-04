# Image Audit Tools

Scripts para auditar, deduplicar y verificar las imágenes Pexels del blog.

## Image Policy (formal)

> **Regla: máximo 3 topics por imagen Pexels, máximo 6 archivos.**
>
> 1 topic = 1 tema de artículo (par ES/EN cuenta como 1 topic, es decir 2 archivos).
> Ejemplo: `mejores-zapatillas-running-asfalto.html` + `best-road-running-shoes.html` = 1 topic.

| Métrica | Límite | Motivo |
|---------|--------|--------|
| Archivos por imagen | ≤ 6 | Diversidad visual en OG cards, SEO (Google Discover), compartidos en RRSS |
| Topics por imagen | ≤ 3 | Evitar que un lector vea la misma foto en artículos distintos |
| Slots por artículo | 3 | `og:image` + `twitter:image` + hero `<img>` — siempre la misma foto |

### Fuente de imágenes
- Todas las imágenes son de **Pexels** (licencia gratuita, sin atribución obligatoria).
- URL pattern: `https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70`
- Registro completo en `pexels-registry.json`.

### Cuándo añadir imágenes nuevas
- Al crear artículos nuevos: buscar en Pexels una imagen que **no esté ya en 3 topics**.
- Si todas las imágenes del tema están al límite → buscar una nueva en Pexels y añadirla al registro.

---

## Scripts

### `scan-images.cjs`
Escanea todos los artículos del blog (ES + EN) y genera un inventario completo de imágenes Pexels agrupado por photo ID, ordenado por uso descendente.

```bash
npm run images:scan            # inventario completo
npm run images:scan -- --top 15  # solo top 15
```

### `verify-image-usage.cjs`
Verificación rápida post-batch: muestra conteo de uso por imagen con barras visuales y flags.

```bash
npm run images:verify            # top 20
npm run images:verify -- --top 30  # top 30
```

### `ci-check.cjs`
**Guardrail CI** — verifica que ninguna imagen supere los límites. Sale con código 1 si hay violaciones.

```bash
npm run images:ci     # exit 0 = OK, exit 1 = violations
node tools/image-audit/ci-check.cjs
```

Ideal para añadir como step en Vercel / GitHub Actions antes de deploy.

### `sync-index-cards.cjs`
Sincroniza las imágenes de las tarjetas del índice del blog con las imágenes hero de sus artículos correspondientes.

```bash
node tools/image-audit/sync-index-cards.cjs
```

### `replace-batch-XX.cjs`
Scripts de reemplazo por batch (01–08). Cada archivo contiene un array `replacements` con las sustituciones de ese batch. Solo se ejecutan una vez:

```bash
node tools/image-audit/replace-batch-01.cjs
```

**Historial de batches:**
| Batch | Cambios | Imágenes principales |
|-------|---------|---------------------|
| 01 | 4397831: 51→31 (headphones cluster) | 8380433, 3757954, 8454900, 29300647, 4793250 |
| 02 | 4397831: 31→31 (equipment) | Same as above |
| 03 | 4397831: 31→11 (training+health+nutrition) | 7869580, 373984, 437037 |
| 04 | 4397831: 11→6 (final cleanup) | 437037, 33921585, 3912944 |
| 05 | 1027130: 22→6, 4679246: 21→6 | 4065509, 3763869, 1040427, 5037319, 3999644 |
| 06 | 3756042: 14→6, 4056832: 13→6, 2526878: 12→6 | 7880090, 4426456, 7298421 |
| 07 | 3621168: 10→6, 3621185: 8→6, 8949023: 8→6, small fixes | 34712191, 2330502 |
| 08 | 4397831: 6→4 (auriculares optimization) | 3757954 |

---

## Workflow

```bash
# 1. Auditar estado actual
npm run images:scan -- --top 15

# 2. Verificar límites (CI)
npm run images:ci

# 3. Si hay violaciones: crear replace-batch-XX.cjs con los swaps planificados
node tools/image-audit/replace-batch-XX.cjs

# 4. Sincronizar tarjetas del índice
node tools/image-audit/sync-index-cards.cjs

# 5. Verificar resultado
npm run images:verify
```

## Estado actual (2026-03-04)

- **84 imágenes únicas** across 322 artículos (162 ES + 160 EN)
- **0 imágenes sobre el límite**
- Todas las tarjetas del índice sincronizadas con sus artículos
