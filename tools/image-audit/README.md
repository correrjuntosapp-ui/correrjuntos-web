# Image Audit Tools

Scripts para auditar y deduplicar las imágenes Pexels del blog.

## Scripts

### `scan-images.cjs`
Escanea todos los artículos del blog (ES + EN) y genera un inventario completo de imágenes Pexels agrupado por photo ID, ordenado por uso descendente.

```bash
npm run images:scan            # inventario completo
npm run images:scan -- --top 15  # solo top 15
```

**Salida ejemplo:**
```
BLOG IMAGE SCAN
============================================================
Total ES: 162 | Total EN: 160 | Unique IDs: 67
Over limit (>6 files / >3 topics): 10

PHOTO 4397831 | TOTAL: 51 (ES:23 EN:28) *** OVER LIMIT
  [ES] auriculares-conduccion-osea-vs-in-ear-running.html | Auriculares de Conducción Ósea...
  [EN] best-running-headphones.html | Best Running Headphones 2026
  ...
```

### `verify-image-usage.cjs`
Verificación rápida post-batch: muestra conteo de uso por imagen con barras visuales y flags.

```bash
npm run images:verify            # top 20
npm run images:verify -- --top 30  # top 30
```

**Salida ejemplo:**
```
IMAGE USAGE VERIFICATION
============================================================
Total articles: 322 (ES: 162 | EN: 160)
Unique images: 67
Over limit (>6 files): 10
At limit (4-6 files): 8
Healthy (1-3 files): 49

TOP 20:
  4397831:  51 ################################################## OVER
  1027130:  22 ###################### OVER
  3601094:   6 ###### ~OK
  1099680:   5 ##### ~OK
  ...
```

### `replace-batch-XX.cjs`
Scripts de reemplazo por batch. Cada archivo contiene un array `replacements` con las sustituciones de ese batch. Se ejecutan directamente:

```bash
node tools/image-audit/replace-batch-01.cjs
```

**Para crear batch 2:** duplicar `replace-batch-01.cjs` como `replace-batch-02.cjs`, cambiar el array `replacements` con los nuevos swaps, y ejecutar.

## Límites

- **Max 3 topics por imagen** (1 topic = par ES/EN = 2 archivos, max 6 archivos)
- Cada artículo tiene 3 slots con la misma imagen: `og:image`, `twitter:image`, hero `<img>`
- Los scripts reemplazan el patrón `photos/{ID}/pexels-photo-{ID}` en los 3 slots automáticamente

## Workflow

```bash
# 1. Auditar estado actual
npm run images:scan -- --top 15

# 2. Crear replace-batch-XX.cjs con los swaps planificados

# 3. Ejecutar batch
node tools/image-audit/replace-batch-XX.cjs

# 4. Verificar resultado
npm run images:verify
```
