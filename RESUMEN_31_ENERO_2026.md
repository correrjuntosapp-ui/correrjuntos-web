# Resumen de Trabajo - 31 Enero 2026

## PROBLEMA INICIAL
La app no podía crear quedadas. Errores en TestFlight:
- `record "new" has no field "fecha_hora"`
- `record "new" has no field "distancia_km"`

---

## SOLUCIONES APLICADAS

### 1. Base de Datos (Supabase)
Ejecutamos estos comandos en SQL Editor:

```sql
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS distancia_km NUMERIC;
ALTER TABLE quedadas ADD COLUMN IF NOT EXISTS hora TIME;
```

### 2. Código de la App
Modificamos `src/screens/CreateQuedadaScreen.tsx`:

**Antes:**
```javascript
const quedadaData = {
  fecha: fecha.toISOString().split('T')[0],
  hora: formatTime(hora) + ':00',
  distancia: distancia.toString(),
  // ...
};
```

**Después:**
```javascript
// Formato seguro para hora (HH:MM:SS)
const horaNum = hora.getHours().toString().padStart(2, '0');
const minNum = hora.getMinutes().toString().padStart(2, '0');
const horaStr = `${horaNum}:${minNum}:00`;

// Formato fecha YYYY-MM-DD
const fechaStr = fecha.toISOString().split('T')[0];

// Combinar fecha y hora en formato ISO
const fechaHoraISO = `${fechaStr}T${horaStr}`;

const distanciaNum = parseFloat(distancia) || 0;

const quedadaData = {
  fecha: fechaStr,
  hora: horaStr,
  fecha_hora: fechaHoraISO,      // NUEVO - requerido por trigger
  distancia: distancia.toString(),
  distancia_km: distanciaNum,    // NUEVO - requerido por trigger
  // ...
};
```

---

## BUILDS CREADOS

| Build | Estado | Notas |
|-------|--------|-------|
| 13-15 | Fallidos | Errores de campos faltantes |
| 16 | Funciona | Añadido fecha_hora, distancia_km |
| 17 | **ENVIADO A APPLE** | Build final con todas las correcciones |

---

## APP STORE CONNECT

### Estado Actual
- **Versión:** 1.0.0
- **Build:** 17
- **Estado:** Pendiente de revisión
- **Fecha de envío:** 31 enero 2026, 22:26
- **Enviado por:** Abraham Marquez

### Configuración Verificada
- Capturas de pantalla (iPhone 6.5")
- Texto promocional (170 caracteres max)
- URL de soporte: https://correrjuntos.com
- URL de marketing: https://correrjuntos.com
- Copyright: 2026 Correr Juntos
- Suscripciones: premium_group (1 suscripción configurada)

---

## COLUMNAS ACTUALES EN TABLA `quedadas`

| Columna | Tipo |
|---------|------|
| id | uuid |
| titulo | text |
| ciudad | text |
| ubicacion | text |
| direccion | text |
| lat | double precision |
| lng | double precision |
| fecha | date |
| **hora** | time (NUEVO) |
| nivel | text |
| distancia | text |
| ritmo | text |
| max_participantes | integer |
| descripcion | text |
| creador_id | uuid |
| created_at | timestamp with time zone |
| plazas | integer |
| es_seed | boolean |
| organizador_nombre | text |
| organizador_foto | text |
| participantes_seed | jsonb |
| pais | text |
| **fecha_hora** | timestamp with time zone (NUEVO) |
| **distancia_km** | numeric (NUEVO) |

---

## ARCHIVOS MODIFICADOS

1. `correr-juntos-app/src/screens/CreateQuedadaScreen.tsx`
   - Añadidos campos fecha_hora y distancia_km
   - Formato de hora seguro con padStart

2. `correr-juntos-app/app.json`
   - buildNumber: "17"

---

## PRÓXIMOS PASOS

1. **Esperar revisión de Apple** (1-3 días normalmente)
2. Si aprueban → La app estará en App Store
3. Si rechazan → Revisar feedback y corregir

---

## COMANDOS ÚTILES

```bash
# Build iOS
cd "C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\correr-juntos-app"
eas build --platform ios --profile production

# Subir a TestFlight
eas submit --platform ios --latest

# Ver credenciales
eas credentials
```

---

## NOTAS IMPORTANTES

- Las compras in-app solo funcionan cuando la app esté en App Store (no en TestFlight)
- El JWT de Apple Sign In expira cada 6 meses - regenerar antes
- Antes de cada build, incrementar `buildNumber` en app.json
