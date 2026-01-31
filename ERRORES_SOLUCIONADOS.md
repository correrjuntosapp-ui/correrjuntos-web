# Errores Solucionados - Correr Juntos

## 1. Error 406 (Not Acceptable) al crear quedadas
**Problema:** Supabase rechazaba las inserciones en las tablas.
**Causa:** Faltaban las políticas RLS (Row Level Security).
**Solución:** Ejecutar SQL con políticas RLS para todas las tablas:
- `quedadas`
- `participantes`
- `subscriptions`
- `push_subscriptions`
- `level_verifications`
- `organizer_reviews`
- `profiles`

## 2. Perfil no se guardaba (status 204)
**Problema:** Al guardar el perfil, los cambios no persistían.
**Causa:** El método `update()` no funcionaba correctamente con las políticas RLS.
**Solución:** Cambiar `update()` por `upsert()` incluyendo el `id` del usuario.

```javascript
// Antes (no funcionaba)
.update({ nombre, apellidos, ... })
.eq('id', currentUser.id)

// Después (funciona)
.upsert({ id: currentUser.id, nombre, apellidos, ... })
```

## 3. Función saveProfile no esperaba respuesta
**Problema:** El perfil parecía guardarse pero al recargar volvía al estado anterior.
**Causa:** La función no era `async` y no esperaba a que el `upsert` terminara.
**Solución:** Convertir `saveProfile` en función `async` y usar `await`.

## 4. Columnas faltantes en profiles
**Problema:** Error "Could not find the 'notif_email' column".
**Causa:** La tabla `profiles` no tenía las columnas de notificaciones.
**Solución:** Añadir columnas:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_whatsapp BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notif_push BOOLEAN DEFAULT false;
```

## 5. JOIN con profiles mostraba "Runner" en lugar del nombre
**Problema:** Las quedadas mostraban "Organizador" y "Runner" como fallback.
**Causa:** El JOIN entre `participantes` y `profiles` no funcionaba porque `user_id` referenciaba a `auth.users`, no a `profiles`.
**Solución:** Crear foreign key explícita:
```sql
ALTER TABLE participantes
ADD CONSTRAINT participantes_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```
Y usar el nombre del constraint en la consulta:
```javascript
.select('...,participantes(user_id,status,profiles!participantes_user_id_fkey_profiles(id,nombre,apellidos,photo_url))')
```

## 6. Conflicto de relaciones múltiples
**Problema:** Error "Could not embed because more than one relationship was found".
**Causa:** Había dos foreign keys entre las mismas tablas.
**Solución:** Especificar explícitamente qué foreign key usar con `!nombre_constraint`.

---

## SQL Completo para configurar Supabase

Ver archivo: `supabase/00_quedadas_rls.sql`

## Comandos útiles para debug

```javascript
// Verificar usuario autenticado
window.supabaseClient.auth.getUser().then(r => console.log(r))

// Verificar datos del perfil
window.supabaseClient.from('profiles').select('*').eq('id', (await window.supabaseClient.auth.getUser()).data.user.id).then(r => console.log(r.data))

// Probar upsert manual
window.supabaseClient.from('profiles').upsert({id: 'USER_ID', nombre: 'Test'}).then(r => console.log(r))

// Ver currentUser
console.log(window.currentUser)
```
