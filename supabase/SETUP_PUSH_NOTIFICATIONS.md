# CONFIGURACION DE NOTIFICACIONES PUSH

## Estado Actual

**VAPID Public Key (ya configurada en index.html):**
```
BNJhptRCObC_HA6Kljndalcy_4YZ-AxfAeuoTLF8jjTU-qrfscu4uIMLs3-i1-LK8tPhHVs0-MFu1-6jBk5E1Lc
```

**VAPID Private Key:** Necesita configurarse en Supabase Secrets

---

## Pasos para activar las notificaciones:

### 1. Ejecutar SQL en Supabase

Ve a tu proyecto Supabase > SQL Editor > Ejecuta EN ORDEN:

```bash
# Tablas base (si no existen)
01_push_subscriptions.sql     # Suscripciones push

# Preferencias y auditoria
11_notificacion_preferencias.sql   # Preferencias granulares
12_notificaciones_enviadas.sql     # Historial de notificaciones
```

### 2. Configurar VAPID Private Key en Supabase

**Opcion A: Usando Supabase CLI**

```bash
# Instalar CLI si no lo tienes
npm install -g supabase

# Login y vincular proyecto
supabase login
supabase link --project-ref waihiwdbtcbdazmaxdor

# Configurar secrets
supabase secrets set VAPID_PRIVATE_KEY="TU_CLAVE_PRIVADA_AQUI"
supabase secrets set VAPID_PUBLIC_KEY="BNJhptRCObC_HA6Kljndalcy_4YZ-AxfAeuoTLF8jjTU-qrfscu4uIMLs3-i1-LK8tPhHVs0-MFu1-6jBk5E1Lc"
```

**Opcion B: Desde el Dashboard de Supabase**

1. Ve a https://supabase.com/dashboard/project/waihiwdbtcbdazmaxdor
2. Settings > Edge Functions > Secrets
3. Agrega:
   - `VAPID_PRIVATE_KEY` = tu clave privada
   - `VAPID_PUBLIC_KEY` = la clave publica de arriba

### 3. Si necesitas generar NUEVAS claves VAPID

Solo si las actuales no funcionan:

```bash
npx web-push generate-vapid-keys
```

Luego actualiza:
- La public key en `index.html` (linea ~6854)
- Ambas keys en Supabase Secrets

### 4. Desplegar Edge Function

```bash
supabase functions deploy send-push-notification
```

---

## Verificar instalacion

### Desde la app:

1. Registrate/Inicia sesion
2. Ve a Perfil > seccion Notificaciones
3. Activa el toggle "Notificaciones push"
4. Acepta el permiso del navegador
5. Deberias ver "Notificaciones activadas"

### Desde Supabase:

Verifica que exista tu suscripcion:
```sql
SELECT * FROM push_subscriptions WHERE user_id = 'tu-user-id';
```

---

## Estructura de archivos

```
supabase/
├── 01_push_subscriptions.sql        # Tabla de suscripciones
├── 06_notification_preferences.sql  # Columnas en profiles
├── 11_notificacion_preferencias.sql # Preferencias granulares
├── 12_notificaciones_enviadas.sql   # Historial/auditoria
├── SETUP_PUSH_NOTIFICATIONS.md      # Este archivo
└── functions/
    └── send-push-notification/
        └── index.ts                 # Edge Function
```

---

## Troubleshooting

### "Tu navegador no soporta notificaciones push"
- Asegurate de usar HTTPS (no funciona en HTTP excepto localhost)
- Chrome, Firefox, Edge y Safari (iOS 16.4+) lo soportan

### "Permiso denegado"
- El usuario debe aceptar el permiso
- Si lo denego, debe ir a configuracion del navegador para reactivarlo:
  - Chrome: click en el candado de la URL > Permisos > Notificaciones
  - Firefox: click en el candado > Permisos > Notificaciones

### Las notificaciones no llegan
1. Verifica que la Edge Function este desplegada:
   ```bash
   supabase functions list
   ```
2. Revisa los logs en Supabase Dashboard > Functions > Logs
3. Verifica que el VAPID_PRIVATE_KEY este configurado:
   ```bash
   supabase secrets list
   ```
4. Verifica que el usuario tenga una suscripcion activa en `push_subscriptions`

### Error en Edge Function
- Revisa los logs para ver el error especifico
- Asegurate de que las tablas `notificacion_preferencias` y `notificaciones_enviadas` existan

---

## Costes

- **Supabase Edge Functions**: 500,000 invocaciones/mes gratis
- **Push notifications**: Gratis (usa Web Push Protocol estandar)

Con 1000 usuarios activos creando 100 quedadas/dia = ~3000 invocaciones/dia = 90,000/mes (dentro del tier gratis)
