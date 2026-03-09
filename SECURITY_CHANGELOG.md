# Security Changelog — Auditoría marzo 2026

**Tag:** `security-audit-2026-03-09`
**Estado:** Cerrada — todos los issues P0, P1 y P2 resueltos.

---

## P0 — Críticos (5/5 cerrados)

| ID | Issue | Fix | Commit |
|----|-------|-----|--------|
| P0-01 | GCP service account key expuesta en repo | Rotada en GCP Console, subida a RevenueCat, antiguas eliminadas. `google-services.json` reemplazado con placeholder | `b4ba2af` |
| P0-02 | Strava client_secret hardcodeado en frontend | Secretos movidos a env vars de Vercel. Token exchange via `/api/strava-auth.js` (serverless) | `9788000` |
| P0-03 | Stripe webhook sin verificación de firma | `constructEvent()` con `STRIPE_WEBHOOK_SECRET` + idempotencia con Set | `cdae4d0` |
| P0-04 | Checkout/portal sin autenticación | JWT identity check + `PAYMENT_URL_ALLOWLIST` en edge functions | `1fd94dd` |
| P0-05 | Password recordada almacenada en cliente | Eliminado `rememberedPassword` de SecureStore/AsyncStorage | `e656373` |

## P1 — Altos (8/8 cerrados)

| ID | Issue | Fix | Commit |
|----|-------|-----|--------|
| P1-01 | TypeScript errors (11 errores) | Refs `any`, props RN inválidos, navigation types, `expo-vector-icons.d.ts` | `70ae0a0` |
| P1-02 | MapScreen performance (0 memoización) | `useMemo` filteredQuedadas, `useCallback` 9 handlers, memoized theme/heatmap | `7ed5c64` |
| P1-03 | Queries sin paginación | `.limit(100)` en queries de quedadas en `app.js` | `e463e79` |
| P1-04 | PWA sin offline fallback | `offline.html` branded + `sw.js` v30 con cache strategy | `e463e79` |
| P1-05 | Modelo de coordenadas inconsistente | Eliminado fallback `quedada.lat`/`.lng`, solo `latitud`/`longitud` | `70ae0a0` |
| P1-06 | Tracker sin cleanup al navegar | `beforeRemove` listener → `gpsTracker.reset()` + `stopBackgroundTracking()` | `70ae0a0` |
| P1-07 | CORS `Access-Control-Allow-Origin: *` | Allowlist de orígenes en `strava-auth.js` + `strava-refresh.js` | `e463e79` |
| P1-08 | Web Push sin VAPID ni encryption | Rewrite completo: VAPID JWT (RFC 8292) + AES-128-GCM (RFC 8291) + rotación de claves | `cec9863`, `7ec2e7a` |

## P2 — Medios (1/1 cerrado)

| ID | Issue | Fix | Commit |
|----|-------|-----|--------|
| P2-05 | Hook huérfano `useQuedadas.ts` | Eliminado (dependía de `@tanstack/react-query` no instalada, 0 imports) | `70ae0a0` |

## Infraestructura

- **Supabase secrets:** 11 configurados (STRIPE, VAPID, BREVO, service keys)
- **Edge functions:** 14 activas, 7 críticas desplegadas con auth + CORS
- **GCP:** Clave `e31005c7b63e` activa, 2 antiguas eliminadas
- **RevenueCat:** Credenciales validadas ("Valid credentials")
- **`tools/security/`:** Añadido a `.gitignore` (material de trabajo del audit)

## Verificación

- `npx tsc --noEmit --skipLibCheck` → 0 errores
- Preview server sin errores de consola ni servidor
- Edge functions desplegadas y activas
- Secrets presentes en Supabase dashboard
