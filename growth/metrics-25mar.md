# CorrerJuntos -- Metrics Snapshot
## 25 marzo 2026 | Fuente: Supabase (waihiwdbtcbdazmaxdor)

---

## 1. USUARIOS

| Metrica | Valor |
|---------|-------|
| Usuarios totales | **390** |
| Usuarios reales (sin seeds) | **374** |
| Seeds | 16 |
| Nuevos ultimos 7 dias | **102** |
| Nuevos ultimos 30 dias | **284** |
| Activos 7d (ultima_actividad) | **32** (8.2% del total) |
| Activos 30d (ultima_actividad) | **50** (12.8% del total) |
| Premium (is_premium o es_premium) | **9** (2.4% del total) |

### Registros por semana (ultimas 8 semanas)

| Semana | Nuevos | Tendencia |
|--------|--------|-----------|
| 23 mar 2026 | 37 | (parcial, 2 dias) |
| 16 mar 2026 | **84** | pico |
| 9 mar 2026 | **80** | fuerte |
| 2 mar 2026 | 55 | subiendo |
| 23 feb 2026 | 31 | |
| 16 feb 2026 | 34 | |
| 9 feb 2026 | 19 | |
| 2 feb 2026 | 18 | |
| 26 ene 2026 | 3 | |

**Tendencia**: Crecimiento fuerte en marzo. Semana del 16 mar fue la mejor (84 registros = 12/dia). Semana actual lleva 37 en 2 dias (~18.5/dia), ritmo record si se mantiene.

---

## 2. DISTRIBUCION POR PAIS

| Pais | Usuarios | % |
|------|----------|---|
| Espana (ES) | 292 | 74.9% |
| Mexico (MX) | 30 | 7.7% |
| Peru (PE) | 11 | 2.8% |
| EEUU (US) | 10 | 2.6% |
| Chile (CL) | 7 | 1.8% |
| Ecuador (EC) | 7 | 1.8% |
| Uruguay (UY) | 5 | 1.3% |
| Colombia (CO) | 5 | 1.3% |
| Argentina (AR) | 4 | 1.0% |
| Irlanda (IE) | 2 | 0.5% |
| Panama (PA) | 2 | 0.5% |
| Francia (FR) | 2 | 0.5% |
| Costa Rica (CR) | 2 | 0.5% |
| Venezuela (VE) | 1 | 0.3% |
| Reino Unido (GB) | 1 | 0.3% |

**Insight**: 75% Espana, 15% LATAM, 5% USA/Europa. El mercado hispanohablante total es el 97%. LATAM crece.

---

## 3. ACTIVIDADES (RUNS)

| Metrica | Valor |
|---------|-------|
| Total actividades registradas | **9** |
| Actividades ultimos 7 dias | **4** |
| Actividades ultimos 30 dias | **9** |
| Runners unicos con actividad | **4** |
| Distancia media por run | **4.65 km** |
| Duracion media por run | **14.2 min** |
| Km totales plataforma | **41.9 km** |
| Deporte principal | Running (8/9 = 89%) |

**ALERTA CRITICA**: Solo 4 de 374 usuarios reales han registrado al menos 1 actividad. Tasa de activacion: **1.1%**. Esto es el problema #1 del producto.

---

## 4. QUEDADAS

| Metrica | Valor |
|---------|-------|
| Total quedadas creadas | **13** |
| Quedadas futuras (activas) | **12** |
| Total participaciones | **19** |
| Usuarios que han participado | **11** |
| Media participantes/quedada | 1.5 |

**Nota**: 8 de las 13 quedadas son seeds (Madrid, Barcelona, Valencia, Sevilla, Londres, Paris, CDMX, Buenos Aires). 5 quedadas creadas por usuarios reales.

---

## 5. PLANES DE ENTRENAMIENTO

| Metrica | Valor |
|---------|-------|
| Planes iniciados | **0** |
| Usuarios con plan | **0** |
| Workouts completados | **0** |
| Usuarios con workout | **0** |

**Nota**: Los planes estan desactivados (badge "PROXIMAMENTE"). Se activan en abril 2026. Hay 7 planes con 322 sesiones y 1.025 steps listos en Supabase.

---

## 6. SOCIAL / ENGAGEMENT

| Metrica | Valor |
|---------|-------|
| Posts en feed | **261** |
| Likes en feed | **0** |
| Follows (seguidores) | **27** |
| Match requests | **19** |
| Match conversations | **1** |

**ALERTA**: 261 posts pero 0 likes = los usuarios publican actividades automaticamente pero nadie interactua con el feed. Matching tiene 19 requests pero solo 1 conversacion iniciada.

---

## 7. MONETIZACION

| Metrica | Valor |
|---------|-------|
| Premium subscriptions (RevenueCat) | **2** |
| Legacy subscriptions (Stripe web) | **367** |
| Newsletter suscriptores | **13** |
| Conversion free->premium (app) | **0.5%** (2/374) |
| Precio actual | 4.99 EUR/mes |

**Nota**: Las 367 "legacy subscriptions" probablemente son registros del sistema Stripe web anterior, no suscriptores activos pagando. Los 2 premium_subscriptions de RevenueCat son los unicos ingresos IAP confirmados.

---

## 8. RETENTION

| Metrica | Valor | Objetivo |
|---------|-------|----------|
| D7 Retention | **2.6%** | 40% |
| Cohorte analizada | 274 usuarios (creados hace 7-60 dias) | |
| Retenidos D7 | 7 usuarios | |

**ALERTA CRITICA**: D7 retention de 2.6% es extremadamente bajo. De cada 100 usuarios que se registran, solo 2-3 vuelven a la semana siguiente. Benchmark apps fitness: 25-40%.

---

## 9. TOP USUARIOS (por actividades)

| Nombre | Ciudad | Runs | Km | Puntos |
|--------|--------|------|-----|--------|
| Javi | Madrid | 4 | 38.6 | 1.195 |
| Para | Punta Umbria | 3 | 0.0 | 130 |
| Cristina | Punta Umbria | 1 | 3.3 | 425 |
| Laura | Valencia | 1 | 0.0 | 30 |

Solo 4 usuarios han registrado actividades. El resto (370) nunca ha usado el tracking.

---

## 10. DIAGNOSTICO: 3 PROBLEMAS CRITICOS

### PROBLEMA 1: Activacion casi nula (1.1%)
- 374 usuarios reales, solo 4 han registrado 1 actividad
- Los usuarios se registran pero no usan el producto core
- **Causa probable**: no hay onboarding que guie al primer run, no hay valor inmediato tras registro
- **Accion**: First-run experience que lleve al usuario a registrar su primera actividad en los primeros 5 minutos

### PROBLEMA 2: Retention D7 = 2.6% (objetivo 40%)
- De 274 usuarios en cohorte, solo 7 volvieron tras 7 dias
- Sin valor recurrente (no hay planes activos, no hay contenido in-app, no hay push notifications)
- **Causa probable**: no hay razon para volver. Sin planes, sin social activo, sin notificaciones
- **Accion**: Activar planes en abril + implementar push notifications de re-engagement + crear contenido in-app diario

### PROBLEMA 3: Engagement social = 0
- 261 posts, 0 likes. 19 match requests, 1 conversacion.
- La capa social esta rota: los usuarios no interactuan entre ellos
- **Causa probable**: masa critica insuficiente por ciudad. Madrid tiene ~220 usuarios pero sin actividad visible no hay con quien interactuar
- **Accion**: Las seed quedadas deben mostrarse en app (abril). Implementar push "X runners cerca de ti". Gamificar likes/follows.

---

## 11. METRICAS vs OBJETIVOS

| KPI | Actual | Objetivo Abril | Gap | Estado |
|-----|--------|----------------|-----|--------|
| Registros/semana | ~80 | 50 | +60% | SUPERADO |
| Descargas Android | 88 | - | - | Creciendo |
| Usuarios activos 7d | 32 | 100 | -68% | CRITICO |
| D7 Retention | 2.6% | 40% | -37.4pp | CRITICO |
| Activacion (1+ run) | 1.1% | 20% | -18.9pp | CRITICO |
| Premium conversion | 0.5% | 5% | -4.5pp | BAJO |
| Planes iniciados | 0 | 50+ | -100% | NO ACTIVO |
| Rating tiendas | 0 reviews | 20+ | -100% | PENDIENTE |
| Newsletter | 13 | 100 | -87% | BAJO |

---

## 12. PLAN DE ACCION INMEDIATO (Top 3)

### Accion 1: Activar planes de entrenamiento (abril, semana 1)
- **Hipotesis**: Los planes son la unica feature que genera valor recurrente diario
- **Metrica**: % usuarios que inician plan en primeros 7 dias
- **Resultado esperado**: D7 retention sube de 2.6% a 10%+ porque el plan les da razon para volver cada dia
- **Implementacion**: Ya preparado, solo falta activar el badge y el wizard

### Accion 2: Push notifications de re-engagement (abril, semana 1)
- **Hipotesis**: Los usuarios olvidan la app porque no reciben recordatorios
- **Metrica**: Open rate de push, % reactivacion de usuarios inactivos
- **Resultado esperado**: 15-20% de usuarios inactivos vuelven con push bien segmentado
- **Implementacion**: Expo Notifications ya integrado, falta logica de envio automatico

### Accion 3: Onboarding con primer run guiado (abril, semana 2)
- **Hipotesis**: Los usuarios no saben que hacer despues de registrarse
- **Metrica**: % usuarios que registran actividad en primeras 24h (activacion)
- **Resultado esperado**: Activacion sube de 1.1% a 10%+
- **Implementacion**: Wizard post-registro: "Sal a correr 10 min ahora" con tracking auto-iniciado

---

*Proximo snapshot: 1 abril 2026 (post-activacion planes)*
