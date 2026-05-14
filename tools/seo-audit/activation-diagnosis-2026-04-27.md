# Diagnóstico Activación — Lunes 27 abril 2026

**Fase:** "Traffic stable, conversion under-optimized phase"
**Capa:** 1 (Activación)
**Datos fuente:** Supabase + Sentry + analytics_events + conversación Miguel

---

## 🚨 EL FUNNEL REAL (sin maquillaje)

```
01. Signups                   638  ████████████████████████  100%
02. Email confirmed           619  ████████████████████████  97%   ← OK
03. At least one login        479  ████████████████████      75%   ← -22% se perdió
04. Profile completed         467  ███████████████████       73%   ← OK
─────────────────────────────────────────── ⚠️ AQUÍ COLAPSA
05. Users with plan             9  █                          1.4% ← -98.1%!!!
06. Users started workout       1  ▌                          0.2%
07. Users completed workout     1  ▌                          0.2%
08. Users with any run          6  █                          0.9%
09. Users with 2+ runs          3  ▌                          0.5%
10. Users with 3+ runs          2  ▌                          0.3%
─────────────────────────────────
Sociales:
11. Users sent match request   20  █                          3.1%
12. Users matched accepted      1  ▌                          0.2%
13. Total quedadas activas      1
14. Users joined quedada        0                              0%
```

**Total users activos REALES (al menos plan o run): 14 distintos.**

Cruce de datos:
- 1 user tiene plan AND run (el ideal)
- 8 users tienen plan PERO no han corrido nada
- 5 users tienen run SIN plan
- 624 users (97.8%) registraron y nunca usaron nada

---

## 🎯 Los 3 cuellos identificados

### Cuello #1 — La gran caída (el 98%)
**Entre "perfil completado" (467) y "tener plan" (9).**

**Datos cualitativos (analytics_events):**
- 33 users abrieron matching (89 events) ← lo MÁS usado
- 16 completaron perfil de matching (36 events)
- 13 vieron premium popup día 3
- **Solo 5 users iniciaron plan** (8 events)

**Hipótesis:** Los users abren la app, ven la home, **van a matching directamente** (es lo que les vendió el SEO de "encuentra runners cerca"), no encuentran valor inmediato (1 quedada activa, 0 participantes), y se van.

**El plan de entrenamiento es invisible o irrelevante** para la mayoría.

### Cuello #2 — Push notifications rotas (95+ errores Sentry)
```
push_register_fail:no_project_id          52 events  ← bug técnico
push_register_fail:permission_denied      38 events  ← user dijo no
push_register_fail:get_expo_token         5 events
```

**Sin push notifications, no hay reconvocatoria.** User registra → no abre → no recibe nada → muere para nosotros.

**Hipótesis:** El fix de v1.3.5 (hardcoded EAS projectId) no llegó a 100% de devices. Los `permission_denied` (38 users) son problema UX: no se les explica para qué sirve.

### Cuello #3 — Comunidad vacía (matching sin oferta)
- 33 users abrieron matching → pero solo 1 quedada activa, 0 participantes
- 20 sent match request → solo 1 accepted
- **El matching es asíncrono y la oferta es 0**

**Hipótesis:** Users vienen por "social running" (lo que buscan en Google), pero al abrir descubren que no hay nadie. Curva fría clásica de marketplace.

---

## 📋 Insights brutales

| Métrica | Valor | Lo que dice |
|---------|-------|-------------|
| Users que NUNCA abrieron app | 164 (25.7%) | Friction signup→download muy alta o app no se descarga |
| Solo 1 user paga premium | 1/638 (0.16%) | Premium NO es el cuello (si nadie usa la app, nadie compra) |
| Matching = feature #1 en uso | 33 users | El value prop real es social, NO entrenamiento |
| Solo 6 users con runs en 90 días | 0.9% | Core feature (correr) tampoco se usa |
| 2 users intentaron pagar y falló | purchase_failed | Bug de pago real (no Sentry crash, billing flow) |

---

## 🎯 LOS 3 FIXES PRIORIZADOS

### Fix #1 — POST-LOGIN ACTION FORZADA ⭐ (LEVERAGE MÁXIMO)
**Problema:** Users completan perfil → ven home → no saben qué hacer → se van.

**Solución quirúrgica:**
- Tras completar perfil, FORZAR un primer commit:
  - Pantalla "¿Qué quieres conseguir?" → 3 opciones grandes (no scroll):
    1. **Encontrar runners cerca** (50%+) → directo a matching
    2. **Empezar a correr** (no he corrido nunca) → plan 0-5K AUTOMÁTICO
    3. **Mejorar mi marca** → quiz rápido → plan personalizado
  
  **Sin opción de skipear. Sin home en medio.** Esta pantalla es entre Profile completed y Home.

**Esfuerzo:** 1 día código + 1 día testing
**Leverage:** Si convierte 30% (vs 1.4% actual) = **+200 users activos en 30 días**

---

### Fix #2 — PUSH NOTIFICATIONS REPARAR + EXPLICAR BIEN ⭐ (HIGH)
**Problema:** 52 users con `no_project_id` técnico + 38 con `permission_denied` UX.

**Solución doble:**

**Parte A — Técnico:**
- Auditar el fix de hardcoded EAS projectId en v1.3.5
- Verificar que los users en versiones más antiguas también tienen fix
- Si los `no_project_id` son v1.3.4 → push update a v1.3.5+ obligatorio

**Parte B — UX permiso push:**
- ANTES de pedir permiso, mostrar pantalla "¿Por qué necesitamos notificaciones?"
- Concreta: "Te avisamos cuando alguien se una a tu carrera, cuando tu plan tenga sesión hoy, cuando alguien te invite a quedada"
- Si user dice no: opción de re-pedir tras primera quedada exitosa

**Esfuerzo:** 2-3 días
**Leverage:** Sin push, no hay retención. Es estructural.

---

### Fix #3 — RESOLVER MARKETPLACE FRÍO (PROBLEMA "EMPTY VENUE") (MEDIO)
**Problema:** Users abren matching/quedadas, ven 0 actividad, se van.

**Decisiones honestas:**
- Re-introducir SEED quedadas (que borramos ayer) **PERO marcadas claramente como "Demo · CorrerJuntos te invita a probar"** y solo en homepage para ilustrar el flujo, no en feed real
- O: hacer que "Empezar a Moverte" cree automáticamente una quedada virtual/individual del user
- O: focus geográfico Huelva — concentrar early users en una sola ciudad para alcanzar masa crítica local antes de expandir

**Mi voto:** Sprint Huelva (consensuado en MEMORY). 5 quedadas reales en Huelva en 2 semanas + outreach asociaciones running locales.

**Esfuerzo:** 2 semanas, 1h/día outreach + organizar 1ª quedada
**Leverage:** 1 ciudad activa = 50 users que sí ven gente real = retención local validada

---

## 🚦 Decisión recomendada para HOY

**EMPEZAR POR Fix #1 (Post-login action forzada).**

Razones:
1. **Datos lo gritan**: 458 users perdidos en este step.
2. **Implementación quirúrgica**: 1 pantalla nueva, no rediseño.
3. **Reversible**: si no funciona en 2 semanas, se quita.
4. **Independiente**: no depende de otros fixes.
5. **Mide rápido**: 1 semana ya tienes señal (¿pasaron del 1.4% al 10%?).

**Fix #2 va detrás**: cuando el funnel mejore, push se vuelve crítico para retención.
**Fix #3 estructural**: 2-3 semanas de trabajo distribuido.

---

## ⚠️ Lo que NO recomiendo hacer ahora

❌ **Lanzar nuevas features** (no faltan features, falta uso de las existentes)
❌ **Más SEO** (genera más signups que nunca activan = más ruido)
❌ **Aumentar precios premium** (1 user paga, no es el problema)
❌ **Rediseño visual completo** (los datos no soportan que la UI sea el problema)

---

## 📊 Métricas para validar Fix #1 en 7 días

- Users que pasan de "profile completed" → "plan started" o "first matching action"
- Target: del 1.4% al 10% (10x improvement) en 30 días
- Si en 7 días no se mueve → revisar el fix, no eliminarlo

---

**Generado:** lunes 27 abril 2026 mañana
**Autor:** Diagnóstico cuantitativo (Supabase + Sentry + analytics_events) + cualitativo (conversación Miguel guardada en MEMORY)
