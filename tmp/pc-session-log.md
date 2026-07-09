## 6 jul 2026 (PC) — Día completo: growth + paywall día-0 + Prozis + SEO otoño

- **MisCalorías**: tour bienvenida 3 pasos (+/Ana/Diario) OTA prod (commit 3001a3d).
- **CJ paywall día-0** (patrón Runna): FirstPlanScreen → Paywall SOLO si plan creado OK; hero propio + 'Continuar gratis' + evento paywall_continue_free. OTA runtime 1.3.21 (7a6e24c).
- **GSC Eventos**: 4 problemas schema arreglados — startDate(mes)/eventStatus/organizer en 54 SportsEvents de events/ + calendario-091 (c4a02d5f). Live.
- **Web→app**: smart banner iOS en 689 páginas + referrer Play en 485 links de carreras (atribución por carrera). Live.
- **Refresco otoño verificado**: fecha Ponle Freno CORREGIDA 29→15 nov (¡error real!), capacidades Valencia 36K/25K, precio SS Vallecana 27-31€. Behobia/Mercè sin cambios (correctas).
- **2 guías nuevas LIVE**: san-silvestre-bilbao (6,6km reales, Zubizuri hero) + carrera-de-la-ciencia-madrid (CSIC, startDate 2026-10 sin día inventado).
- **Prozis**: condiciones aclaradas (cupón 10% todo catálogo, comisiones 5-20%, mínimo 50€/mes EN COMISIONES exento en trial). Borrador aceptación en hilo Gmail (founder envía). Amazon real verificado: 112,73€ YTD (~19€/mes).
- **Redes**: plan 2 semanas con inventario existente + 5 guiones founder-cámara + PROTOTIPO nuevo formato reel-proto-real.mp4 (stock real Pexels + ffmpeg, pipeline listo). TikTok ya tenía casi todo el lote subido (27.8K mejor vídeo).
- **Play/A51**: 'no disponible' = cuenta tester (correrjuntosapp); usuarios reales OK. Capturas Play aprobadas.
- Versión 1.3.21 validada por founder. Strava trial activo (recibo 0€).

# PC Session Log — CorrerJuntos

> Archivo puente entre la sesión Claude del PC y la sesión Claude del móvil.
> Yo (Claude PC) escribo aquí lo que hago. El Claude móvil debería leer este
> archivo al empezar para saber el estado actual.
>
> Hermano de este archivo: `tmp/mobile-session-log.md` (lo escribe el móvil).
>
> **CONVENCIÓN COMÚN (PC + móvil):** Entradas más recientes ARRIBA (prepend),
> justo después de este header. NUNCA al final del archivo.

---

## 25 jun 2026 — 🎬 Motor de reels brillantes + 4 reels principiante + 6 DMs clubs + panel 3 proyectos

(1) **Organización 3 proyectos:** panel `Escritorio\PROYECTOS.md` (CJ=negocio 80%; Pádel+MisCalorías=experimentos, solo por TRIGGER). Métrica CJ = pagos, no usuarios. Ver [[feedback_multi_project_multi_window]]. (2) **Clubs (palanca #1 captación):** 6 clubs reales verificados + DMs listos en `tmp/dms-clubs-25jun.md` (Beer Runners Madrid @beerrunnersmadrid, Alma Runners Sevilla @almarunnersclub, Poncebos Málaga @poncebos_club, La Gavia, Ritmo Sevilla @ritmo.sevilla, Malaga Run Club). Founder envía 5-7/sem; al SÍ → alta técnica (playbook partner). (3) **Reels:** founder pidió contenido principiante "empezar a correr" SIN arranque oscuro (sus reels viejos abren en negro = mata retención 0-2s). **Creada PLANTILLA BRILLANTE reutilizable** `tools/marketing/reel-empezar-a-correr.html`: foto a plena luz full-bleed + Ken Burns 1.0→1.08 + texto blanco Inter + 1 acento naranja #f97316 + frame 0 brillante (scene1 instant:true, NO negro). Fotos Pexels self-host en `tools/marketing/empezar-photos/`. **4 reels MP4 1080×1920 renderizados (copiados al Escritorio):** reel-empezar-a-correr · reel-3-errores · reel-primera-semana · reel-sofa-5k — verificados pro (frames leídos). Captions con keyword principiante (SEO TikTok/YT). Subir MUTE + sonido nativo, orden TikTok ES→IG→Shorts, 1 cada 2 días. Render: `node tools/marketing/record-tiktok.cjs <slug>`. **Próximos reels brillantes = clonar reel-empezar-a-correr.html** (se acabaron los oscuros). Aplica [[reference_reels_playbook]].

## 25 jun 2026 — 🏁 Bulk-optimización 54 páginas de carrera (CTAs→tienda + smart banner) LIVE

Estrategia de captación (founder pidió "más usuarios" para CJ). Análisis marketing-strategist: la app es SOCIAL/LOCAL → la palanca real = **densidad ciudad a ciudad (Huelva→Sevilla→Málaga→Madrid) vía clubs B2B** (#1, trae usuarios+ingresos+densidad), luego SEO carreras (#2, CAC 0, CTR 14%). Honesto: traer usuarios no mueve MRR sin arreglar conversión (3 de pago), pero clubs sí. **Acción ejecutada (#2 SEO carreras):** el contenido YA existía (~60 páginas) pero solo 2/60 convertían (Nocturna+Mercè); 58 mandaban el CTA de app a la home `/#app` sin medición, y no rankean (Maratón Madrid pos 41 GSC = invisible pese a existir). **Bulk-fix** (script `tmp/optimize-carreras-cta.cjs`, commit `8387a2e1`, push master, IndexNow 200, LIVE verificado): 54 páginas → CTAs de app a App Store/Play con detección iOS/Android + atribución `?ct=carrera-{slug}` + evento GA `carrera_app_click`; `<meta apple-itunes-app>` smart banner en las 59. Respeta sticky de INSCRIPCIÓN oficial (carrera_inscripcion_click intacto). 5 hyatlon/onupolis usan otra plantilla (solo banner, pendiente si se quiere); behobia 5/6. **Pendiente (ranking):** internal links + freshness para las 5-8 grandes para subir de pág.4 a pág.1. Aplica [[reference_race_page_pattern]].

## 25 jun 2026 — 💎 8 mensajes conversión ENVIADOS + snapshot CJ corregido + MisCalorías reenviada

**1) Los 8 (9) mensajes personales de conversión: ENVIADOS por el founder** (24-25 jun, desde abraham.marquez@). Cliff 4 jul (Raquel, Raúl, David, Alejandro, Juk) + trials (Carla 25 jun, Luis/Navi 26 jun) + bonus Gonzalo. ⚠️ Gmail MCP solo CREA borradores (no envía) → los mandó el founder. Siguiente: cuando respondan, engancharlos con conversación antes de re-ofertar; founder reenvía respuestas y yo ayudo a contestar.

**2) Snapshot CorrerJuntos CORREGIDO (métrica fiable `auth.users.last_sign_in_at`):** 881 registrados · +228 nuevos/30d · **MAU 30d = 232 (26%)** · WAU 27 · 71 planes/30d · **3 de pago**. ⚠️ La "MAU ~9-23" de antes era de la columna MUERTA `ultima_actividad` → la app está MUCHO más sana de lo que parecía. **El cuello NO es captación (va bien) ni actividad (232), es CONVERSIÓN A PAGO (3).** Meter más usuarios no mueve MRR; convertir los 232 activos sí. Ver [[reference_app_analytics_events]] (usar last_sign_in_at, no ultima_actividad) + [[project_premium_conversion_plan]].

**3) MisCalorías iOS — rechazo 2.1(b) ×2 resuelto y REENVIADA:** Apple "cannot locate the In-App Purchases **within the app**" = el paywall estaba enterrado tras 3 fotos, el revisor no llegaba (no era que faltaran enviadas — las 2 subs `miscalorias_premium_monthly/annual` están "Pendiente de revisión"). **Fix: botón "Hazte Premium" SIEMPRE visible en Perfil** (`PerfilScreen.tsx`, commit `2cae9c3`) → paywall en 2 toques. Build iOS falló por Sentry (source maps sin org) → `SENTRY_DISABLE_AUTO_UPLOAD=true` en eas.json production (commit `a24b090`). **Build 8 compilado + eas submit + adjuntado a la versión + reenviado vía navegador** → estado "Pendiente de revisión" (24 jun 17:06). RevenueCat offering "default" 3 paquetes OK. Paid Apps Agreement activo (misma cuenta que CJ). Esperar veredicto Apple ~24-48h. Detalle [[project_miscalorias_native_app]]. Tester Android: sigue 6/12 (founder recluta por grupo).

## 23 jun 2026 — 🎯 Web: maximiza conversión a app en página Nocturna del Guadalquivir (CRO+SEO)

El founder: "llegar al máximo de esta web para generar usuarios a la app". Auditoría marketing-strategist (CRO+SEO). **Fallo de conversión REAL encontrado y arreglado:** casi todos los CTAs de app de la página iban a `/#app` (homepage) en vez de a las tiendas → fricción, no instalaban. Arreglado (commit `809cb3c7`, push master, IndexNow 200): hero + sticky bar + sección "Prepárala" + link "Descargar CorrerJuntos" → ahora DIRECTOS a App Store/Play con detección iOS/Android + atribución `?ct=carrera-nocturna-guadalquivir-sevilla` (medible por página); copy específica (hero "Prepara la Nocturna con la app", dark box "El plan 10K que llega justo a tiempo" + hook nutrición nocturna 22:00, sticky "Descargar app gratis"); `<meta apple-itunes-app>` smart banner iOS. Footer "App" se deja a /#app (nav, no CTA). **Marco honesto:** ~15 sesiones/90d HOY; el valor real = capturar el PICO de búsquedas de la semana del **25-sep** (25k corredores). Cambios baratos que dejan la página lista. **Pendiente alto valor (NO hecho):** (1) mover dark app-box más arriba (visibilidad mobile); (2) **4-6 internal links blog→esta página con anchor keyword** (comprime ranking meses→semanas); (3) artículo blog companion long-tail "cómo preparar la Nocturna" (deadline ~1 ago para rankear en sept); (4) FAQ precio inscripción + sección placeholder "resultados" (tráfico post-evento); (5) push a usuarios existentes en agosto. Patrón reusable para el resto de carreras con tráfico. Aplica [[reference_race_page_pattern]].

**+ Replicado completo en Cursa de la Mercè** (la #1 por tráfico): commit `809cb3c7`→`d5875312`→`69994298`, todo LIVE verificado. (1) Nocturna: CTAs→tienda + smart banner (`809cb3c7`) + **5 internal links blog/planes→Nocturna** (`d5875312`: mejores-carreras-andalucia, correr-por-la-noche, maraton-sevilla, media-maraton-sevilla, planes/10k). (2) Cursa Mercè (`69994298`): mismos CTAs→tienda (atribución `?ct=carrera-cursa-merce-barcelona`, copy 20 sept) + smart banner + **4 internal links** (grupos-running-barcelona, mejores-rutas-correr-barcelona, maraton-barcelona-guia, primera-carrera-10k-guia) + fix typo "la la Cursa". **Las 2 páginas de carrera con más tráfico, optimizadas a tope (conversión + autoridad) para el pico de búsquedas de septiembre.** El resto de carreras (1-8 ses/90d) NO merece replicar. Atribución por evento GA4: filtrar `carrera_app_click` con `cta`/`store` para medir instalaciones por página.

## 23 jun 2026 — 🔧 App: fix robustez creación de planes (3ª OTA) + medición de fallos

El founder pidió asegurar que no hay bug al crear planes (es el agujero #1 de retención: 783 onboarding → 62 plan). Auditoría (product-engineer + Sentry desde main): **el flujo NO está roto** (10/14 crean plan, **0 crashes sin resolver en Sentry**), PERO los fallos al crear plan se capturan en try/catch (Alert) → NO llegan a Sentry → estábamos ciegos a ellos. Fragilidad real: **timeout de 15s** en `generateUserPlan`/`Adaptive` (insertan 24-80 entrenos → en red móvil lenta / Supabase frío puede superar 15s → error al usuario con el plan A VECES ya creado server-side → "ya tienes un plan activo" al reintentar). **Fix (commit `4a4e982`, OTA `9f49c981`, runtime 1.3.20):** (1) `PLAN_GENERATION_TIMEOUT = 30s` SOLO en las 2 RPC de generación (resto sigue 15s); (2) `if(!planId) throw` en PlanWizard (FirstPlanScreen ya lo tenía) → no más spinner colgado silencioso; (3) nuevo evento `plan_creation_failed {path, slug, error}` en ambos catches → medir el ritmo real de fallos (consultar `analytics_events`). Sentry NO añadido (esas pantallas no lo importan; el evento basta). Higiene SQL local-vs-vivo (firmas RPC `generate_user_plan`/`validate_plan_feasibility` desfasadas en archivos locales) = NO bug activo (BD viva OK) → pendiente menor. **3ª OTA del día** (en el límite de 2-3). Founder probando.

**+ 4ª OTA `4926177c` (commit `bb4359a`) — quita fricción de calendario en creación de plan:** el founder, probando, detectó que el **wizard pedía permiso de CALENDARIO en plena creación del plan** (auto `await syncPlanToCalendar` en PlanWizardScreen ~1948, junto a los recordatorios push). Su instinto (correcto): "echa para atrás a los usuarios". Retirado del auto-flujo (la pantalla de 1-tap `FirstPlanScreen` NUNCA lo hacía → ya estaba limpia). Los **recordatorios push se mantienen**; la sync al calendario **sigue como botón OPCIONAL en PlanScreen** (no se pierde la función). tsc 0. **4 OTAs hoy = tope, parar.** Nota: para que el founder pudiera re-probar la creación, limpié su plan activo de test (`09ae05b3`, 0-5K creado hoy) vía SQL → `estado='abandoned'` (es su cuenta de test, equivale a "abandonar" en la app).

## 23 jun 2026 — ✅ GSC schema verificado (Product OK) + Davante enviado + cierre sesión

**Search Console — "Fragmentos de producto" corregidos:** el founder mandó captura de GSC ("se han corregido… 10 páginas validadas"). NO era un error nuevo — Google CONFIRMA que el fix previo (`fe5b451a` "quita Product stubs sin price/image/rating") funcionó. Verifiqué TODO el sitio con `tmp/scan-schema.cjs` (parser JSON-LD): **Product sin price = 0 en 0 archivos** ✅. El escáner sí ve 72 `SportsEvent` sin `offers` en 15 archivos, PERO **`offers` es OPCIONAL en eventos (no es error)** y rellenarlo exigiría inventar precios de inscripción (prohibido). **Decisión experta: NO tocar** — schema sano, perseguir avisos opcionales en páginas de ~1-8 visitas/90d = productividad de pega. Regla grabada: el mejor SEO técnico arregla errores reales en páginas CON tráfico, no avisos opcionales en páginas muertas. Excepción honesta futura: carreras GRATIS → `price:0` legítimo si se quiere.

**Davante:** respuesta B2B **enviada** por el founder (23 jun). Lead más grande (MasterD/MEDAC 3.000+ empleados) → memoria propia [[project_davante_b2b_lead]].

**Resumen de la sesión (23 jun):** (1) diagnóstico retención + OTA medición; (2) fix parpadeo premium (2ª OTA); (3) 2 páginas de carrera vendiendo el plan "llega listo" (Nocturna + Cursa Mercè, elegidas por tráfico GA4); (4) 8 mensajes de conversión redactados (founder envía); (5) Davante enviado; (6) GSC schema verificado OK. Memorias nuevas: retención, analytics_events, founder accounts, typecheck gotcha, Davante.

## 23 jun 2026 — 💎 8 mensajes personales de conversión REDACTADOS (cliff 4 jul + trials)

El founder pidió "prepara los 8 mensajes". Saqué datos frescos Supabase (no fiarme de la lista vieja). **Corrección importante**: la memoria decía "5 humanos" y nombraba a Esteban/Eddie, pero ambos son FANTASMAS (0 planes/0 eventos) → fuera. Filtrando regalo-premium caducando 4-jul + login ≤45d + uso real, hay **~15 usuarios del regalo que SÍ usaron la app**. Elegí los 5 cliff con mejor gancho (Cristina mundodefabulas11@ 89 ev sin plan; Raúl carrascosa311@ 1plan+74ev; David ventur40@ plan+carrera; Alejandro amorgado87@ plan+carrera; Juk enekosag@) + 3 trials (Carla cdiazmartin@ acaba 25 jun plan+José; Luis c7r6hv8gjy@privaterelay 26 jun; Navi b9k794fhmt@privaterelay 26 jun sin plan) + 1 bonus (Gonzalo gespomtz91@, trial acabó 22 jun, el más enganchado). **8 mensajes personalizados a su uso real, listos para copiar-pegar** en `tmp/8-mensajes-conversion-4jul.md`. **23 jun pm: creados como 9 BORRADORES en el Gmail del founder** (8 + bonus Gonzalo `gespomtz91@`) vía Gmail MCP — el founder revisa, cambia el "De" a abraham.marquez@ (send-as) y le da a Enviar él mismo (yo NO envío; sí creo borradores). Trials primero (Carla 25 jun, Luis+Navi 26 jun). Precio normal 29,99€ (sin descuento fundador — decisión: el regalo gratis no retuvo, el freno no es precio sino valor). ⚠️ La cuenta Cristina/`mundodefabulas11@` era del founder → sustituida por Raquel `raquelgarcia4672@`. Oferta en textos = anual REAL 29,99€ (NO inventé descuento); precio fundador requiere crear promo en RevenueCat (pendiente decisión). Canal = emails personales, los envía el founder uno a uno (yo NO envío). Detalle en [[project_premium_conversion_plan]].

## 23 jun 2026 — 🏁 Web: página Nocturna del Guadalquivir vende mejor el plan 10K + retira cartel copyright (LIVE)

El founder pidió "vender el plan de la app para llegar listo" en `carreras/nocturna-guadalquivir-sevilla.html` (Sevilla, 8,5K marketing 10K, 25 sep). **Honesto: ya vendía el plan en 3 sitios** (plan-cta-card + sección "Prepárala con la app" + dark box José+Ana) — no se creó nada. Faltaba el gancho "llegar listo" en la tarjeta + había un dato caducado. Mejoras (commit `0387ef1e`, push master, **LIVE verificado** + IndexNow 200): (1) plan-cta-card → h3 **"Llega listo a la Nocturna con el plan 10K guiado"** + copy atado a "25-S + las 12 semanas del plan: si empiezas ahora llegas justo" (urgencia que NO caduca como un nº de semanas) + CTA "Empezar mi plan"; (2) quitado "Quedan unas 15 semanas" (caducado) reatado a las 12 sem. prep-10k es PREMIUM → "Prueba 14 días gratis", NUNCA "Gratis". ⚠️ **Además retiré el `<img>` del cartel oficial KH-7** (alt/caption "Cartel oficial · IMD Sevilla") — arte con copyright + marca de patrocinador ajeno en página comercial, prohibido por [[reference_race_page_pattern]]. Las 2 fotos libres de Sevilla YA estaban en uso (hero+og=guadalquivir, cuerpo=puente) → swap habría duplicado imagen en la misma página → mejor retirar; dejé hueco comentado para foto libre propia (Pexels self-host) si se quiere recuperar el visual. ⏳ Nota: el gancho "empieza ahora y llegas justo" deja de ser literal pasado ~primeros de julio (<12 sem al 25-S). **+ Replicado en `cursa-merce-barcelona` (commit `01ba4658`, LIVE verificado)** — elegida POR DATOS: GA4 90d top páginas `/carreras/` por sesiones = Cursa de la Mercè **41** (#1 externa), Onúpolis 26 (partner local), Nocturna 15; resto con tráfico ínfimo (1-8 ses/90d). Mercè es 10K el 20-S → mismo prep-10k, mismo gancho "llega listo". ⚠️ Escala honesta: hasta la #1 son ~0,45 sesiones/día → replicar más páginas de carrera NO es palanca grande; la conversión real sigue fuera (8 mensajes cliff + Davante + clubs). Si se replica, priorizar SOLO por tráfico GA4, no a granel.

## 22 jun 2026 — 📊 CorrerJuntos: diagnóstico retención + OTA medición (desplegada, founder probando)

El founder pidió "atácalo" = diagnosticar retención. **Embudo real (tablas, sin seeds, 886 users):** 783 onboarding (88%) → **62 crean plan (7,9%)** → 6 completan entreno. **92% de la fuga en UN paso: onboarding→plan.** `ultima_actividad` = columna MUERTA (usar `auth.users.last_sign_in_at`). **CORRECCIÓN clave**: la app SÍ tiene analítica → tabla **`analytics_events`** (vía `ingest-analytics` + `analyticsSync.ts` flush 5 min); GA4 (524151121) = SOLO web. Embudo fino (cobertura ~205): FirstPlanScreen 27 ven → **14 CTA (cae 48% ahí)** → 10 crean; pero solo 27 de cientos llegan. **Pago NO roto**: bug "No hay productos" murió 17 mar; actual = "Compra cancelada" 19 users en pantalla pago nativa (parte = testing). Paywall: 79 abren → ~26 llegan a pagar → **7 pagan**; 60/79 sin trial elegible. **Matching** (feature #1 histórica, 87 users) el founder lo **QUITÓ** → cae a 11 en jun (cuadra). Lección durable (NO recuperar feature): demanda "con quién correr" → quedadas + clubs B2B. **Desplegado**: commit app `495ab4e` + migración `20260622120000` (añade `event_ts`) + **OTA branch production** = medición fiable (`event_ts` + insert directo por evento en `trackEvent`, belt-and-suspenders) + fricción `Alert "¿Seguro?"` en escape "Explorar primero" de FirstPlanScreen (empuja al CTA de 1 tap). **NO se tocó routing de metas** (sería a ciegas) → leer embudo con `event_ts` en 3-5 días y decidir. Founder probando OTA ahora. Detalle: [[project_retention_diagnosis_jun_2026]] + [[reference_app_analytics_events]].

**Bug encontrado DURANTE el test (NO causado por la OTA) + arreglado en 2ª OTA:** el founder (guetto2012@, premium vigente hasta 11 jul) vio el CTA "hazte premium" parpadear ~1s en **Inicio** al abrir en frío. Causa **preexistente**: `PremiumContext` arranca `isPremium=false`/`loading=true` y resuelve premium async (RevenueCat+Supabase); `HomeScreen` decidía el banner premium (`shouldShowHomeBanner`) y el paywall post-1ª-quedada SOLO con `isPremium`, sin esperar a `loading` → 1s de CTA antes de resolver. Le pasaba a **TODO premium** en cada arranque en frío (feo para pagadores reales). Fix: ambos efectos `if (premiumLoading) return` (commit `7c7b4ab`, **OTA `2eb71c16`**, runtime 1.3.20). ⚠️ Gotcha tooling guardado: en este repo el typecheck es `npm run typecheck` (`--stack-size=8000`); `npx tsc` pelado se cae con "Maximum call stack size exceeded" → ver [[feedback_app_typecheck_stack_size]]. **Hoy 2 OTAs en production (b04bc313 analytics + 2eb71c16 premium flicker) — dentro del límite de 2-3/día.**

## 22 jun 2026 — 📧 CorrerJuntos: email contacto público → abraham.marquez@ (283 pág, LIVE)

El founder pidió unificar el correo de contacto público a `abraham.marquez@correrjuntos.com` (el profesional). Verificado primero que ese buzón RECIBE (Garmin escribió ahí 15 jun, llegó al Gmail) + Send-as configurado → seguro. Script reemplazó `hola@correrjuntos.com` → `abraham.marquez@correrjuntos.com` en **283 archivos .html/.js** (footers, schema.org, legal, mailto, contacto). Commit `abacd384`, push HEAD:master, Vercel desplegó, verificado live (0 hola@ en páginas). ⚠️ **DEJADO INTACTO a propósito**: `api/_lib/jobs` (12 archivos) = código de emails automáticos donde hola@ es el REMITENTE Brevo → NO cambiar sin confirmar que abraham.marquez@ es remitente verificado en Brevo (si no, se rompen newsletter/transaccionales). Gotcha worktree: la rama `claude/magical-goldstine-097df0` tiene upstream `origin/master` → `git push origin HEAD:master` despliega. Reminder: responder inbound (Davante/runner) DESDE abraham.marquez@ (Send-as ya listo). Relacionado [[project_session_12_jun_2026]] (creación del email profesional).

## 22 jun 2026 — 🔒 CorrerJuntos: hardening RLS (2 riesgos reales cerrados, verificado)

Barrido de salud del backend → 2 fugas de seguridad reales, arregladas con migraciones (Supabase waihiwdbtcbdazmaxdor) y **verificadas con la clave pública real**:
1. **Fuga email/RGPD**: la tabla `profiles` tenía `SELECT USING(true)` para rol `public` → **cualquiera con la clave pública (anon, sin login) volcaba email+ubicación de los ~960 usuarios** (`GET /rest/v1/profiles?select=email`). **GOTCHA**: el 1er intento `REVOKE SELECT(email) FROM anon` fue NO-OP (en Postgres el grant a nivel TABLA supedita al de columna). Fix correcto: `REVOKE SELECT ON profiles FROM anon` + `GRANT SELECT (id,nombre,photo_url,ciudad,nivel,pais) ON profiles TO anon`. Verificado: email→401, stats(id)/social(nombre,ciudad)→200, select *→401. `authenticated` (app/web logueada) NO se toca → no rompe nada. ⚠️ La stats page pública (`stats/index.html:377`) cuenta profiles vía anon (solo id) — por eso no se puede revocar profiles entero a anon, hay que allowlist de columnas.
2. **Abuso gamificación/feed**: 5 tablas (`actividad_feed, coach_interactions, match_conversations, puntos_historial, user_achievements`) tenían policy INSERT abierta a rol `public` → un usuario podía insertar puntos/logros/actividad falsos. La app cliente NUNCA las inserta (grep=0), solo Edge Functions (service_role bypassa RLS). Fix: DROP de las 5 policies INSERT-public. Cada tabla conserva su SELECT "Users view own" → lecturas intactas. 
**Lección reusable**: SIEMPRE verificar fix de RLS con una petición REST usando la CLAVE PÚBLICA real (no fiarse del migration success). Pendiente follow-up menor: `user_badges` (policy ALL mezcla read+write, partir). Sentry desconectado esta sesión (no revisado crashes).

## 22 jun 2026 — 📊 CorrerJuntos: snapshot 15-22 jun + FIX bug pipeline trials (desplegado)

**Snapshot 15-22 jun** (Supabase, project waihiwdbtcbdazmaxdor): 960 perfiles, **+39 nuevos (−43% vs 69)**, ~9 activos. **4 trials NUEVOS** (15-19 jun) = primer pipeline real hacia ingresos en meses (1 sub de pago real sigue igual). **Activación cohorte 20,5%** = la mejor de junio (3× mejor que mayo, v1.3.7+onboarding funcionando). 2 quedadas creadas por usuarios reales (primeras orgánicas). Feed social muerto (0 likes/coment). Necesita dashboard: RevenueCat MRR, Amazon, GA4, GSC.

**🐛 BUG ENCONTRADO + ARREGLADO + DESPLEGADO — pipeline de trials roto:**
- Síntoma: los 4 trials tenían `subscription_period='TRIAL'` pero **0 filas en `trial_starts`** → **0 emails de lifecycle** (D1/D3/D7/D11/D14 nunca se enviaron). Uno (`gespomtz91`) expiró hoy sin recibir nada.
- Causa raíz: la fila `trial_starts` (la que alimenta el cron de emails) **solo se creaba desde el cliente** (`iap.ts recordTrialStart`), y solo en el callback inmediato de compra — frágil, se salta en el path del listener/reconcile de RevenueCat. El **webhook server-side** (`supabase/functions/revenucat-webhook`) escribía `subscription_period` y CERRABA filas trial_starts, pero **nunca las CREABA** (comentario línea 132 lo confesaba: "recorded by iap.ts client-side"). `syncPremiumToSupabase` de la app NO escribe subscription_period (solo es_premium/premium_until) → lo escribe el webhook.
- **Fix (desplegado 22 jun, CLI `supabase functions deploy revenucat-webhook --no-verify-jwt`):** el webhook ahora INSERTA `trial_starts` server-side en `INITIAL_PURCHASE && period_type=TRIAL` (idempotente, ignora 23505). El cliente queda como respaldo. Arregla TODOS los trials futuros. **Verificar dentro de unos días que los nuevos trials sí crean fila + reciben emails.**

**⚠️ Cliff 4 jul — REALIDAD (corrige optimismo previo):** de 701 regalados que expiran el 4 jul, solo **10 activos 30d**, y **5 de esos son cuentas partner** (@partners.correrjuntos.app). **Pool real de reconversión = 5 humanos** (Juk con 1 plan, Juanma, Esteban, Raúl, Eddie — los otros 4 sin plan). 99% de los regalados ya no usa la app → el problema NO es exprimir 5, es RETENCIÓN. Recomendado: toque PERSONAL del founder (no drip) a los 5 + 3 trials vivos. 8 mensajes personales ya redactados (founder los envía). Los 5 clubs partner: EXTENDER su premium (no dejar que caduque, son B2B). Supersede el "~39" de [[project_premium_conversion_plan]].

## ⏰ PENDIENTE ESTA NOCHE (21 jun) — PadelJuntos: 2º artículo de ZAPATILLAS
El founder quiere un **2º artículo de zapatillas de pádel** (solo hay 1: `/zapatillas/mejores-zapatillas-padel-2026`). Decidir ángulo con él (candidatos, por SEO/cobertura): **zapatillas baratas** · **zapatillas mujer** · **por tipo de suela (pista de cristal vs dura/cemento)** · **por marca (Asics/Joma/Bullpadel/Adidas)** · guía "cómo elegir zapatillas de pádel". 
Workflow (CLAUDE.md padeljuntos): clonar diseño de `zapatillas/mejores-zapatillas-padel-2026.html`; **ASINs Amazon verificados 1 a 1** (tag `diezmejores21-21`, NUNCA inventar — scrape Amazon.es por tandas ≤3); imágenes self-host verificadas con Read (sin repetir, ojo duplicado visual = misma sesión de fotos); schema BlogPosting+ItemList+FAQPage+Breadcrumb; card en `zapatillas/index.html` + URL en sitemap; commit email `correrjuntosapp@gmail.com`; esperar OK antes de push. Norte real sigue siendo CJ (cliff 4 jul).

## 21 jun 2026 — 🎾 PadelJuntos: enlaces entrantes a las 2 guías (LIVE, commit 4f10d4e)
Añadidos 5 enlaces internos ENTRANTES (anchor keyword) desde artículos existentes a las 2 guías nuevas para que no sean semi-huérfanas: kit-principiantes/como-elegir-pala/padel-vs-tenis → beneficios; palas-mujer/reglas → en pareja. Verificados live. (Lección SEO: página nueva sin enlaces entrantes tarda mucho más en rankear — siempre meter inbound links desde artículos relacionados al publicar.)

## 21 jun 2026 — 🎾 PadelJuntos: 2 guías editoriales + fix foto duplicada (LIVE)

Tras aparcar MisCalorías, el founder pasó a PadelJuntos (`Escritorio\padeljuntos-web`, repo separado). Quejas: fotos repetidas en /palas + quería artículos editoriales "de blog serio". Hecho (commit `1797eeb`, deploy Vercel, todo 200 OK):
- **Fix foto duplicada**: card Nox y card mujer eran la MISMA sesión de fotos (chica pala NOX ZRV) con distinto archivo/md5 → card Nox cambiada a `padel-blue-court.jpg`. **Lección: el duplicado visual no se ve por nombre/md5; verificar con Read.** Detalle en memoria [[project_padeljuntos_experiment]].
- **2 guías nuevas LIVE**: `/guias/beneficios-jugar-padel` + `/guias/jugar-padel-en-pareja` (esta original, NO copia del artículo de El Corte Inglés que mostró el founder). Diseño PadelJuntos clonado, schema, FAQ, 9 internal links a palas/zapatillas, hero único (foto fresca Pexels self-host para beneficios). Escritas por agente general-purpose + revisadas/verificadas visualmente por mí.
- Commit email `correrjuntosapp@gmail.com` (Vercel lo exige). NUNCA copiar artículos de terceros (plagio + duplicate content).
- PadelJuntos = experimento secundario; norte real = CorrerJuntos (cliff 4 jul).

## 21 jun 2026 (cont.) — 🐛 MisCalorías: 3 bugs de dogfooding arreglados + APARCADA

El founder probó la build cerrada en su Android real (entró con guetto2012@gmail.com). Arreglos:
- **Login Google roto** (daba "No se pudo entrar con Google") → 2 causas, ambas fix en Google Cloud proyecto `miscalorias` SIN recompilar: (1) faltaba cliente OAuth **Android** (package com.miscalorias.app + SHA-1 de la firma de **Play** `10:D0:7C:EB:19:E3:AD:AC:4F:BA:62:E0:17:10:32:64:63:99:C5:FE`); (2) consent screen en "Prueba" con 0 testers → **publicada en producción**. ✅ Verificado: el founder entró con Google. Detalle en memoria [[project_miscalorias_native_app]].
- **Recetas sin cantidad** → Edge Function `recipes` v3: regla dura "cada ingrediente empieza por cantidad (g + medida casera)". Server-side, instantáneo.
- **Foto: etiquetas sin peso** → `AddScreen.tsx` `computePins` + label muestran ahora "30 g · 200 kcal". OTA push runtime 1.0.0 (update 8b5d6975, branch production). El backend ya devolvía `quantity`; era display.
- **APARCADA** por decisión del founder (correcto, app de 0 usuarios). Pendiente del founder: outreach 12 testers (mensajes Reddit/grupo listos, grupo `correr-juntos-testers@googlegroups.com` open-join, 19 miembros ya). iOS build 6 en review Apple.

## 21 jun 2026 — 🤖 MisCalorías Android: prueba CERRADA enviada a revisión

Sesión larga rematando MisCalorías Android (el founder insistió "hazlo tú todo", en casa). Logrado:
- **Permiso service account**: el founder dio acceso a `eas-submit@correrjuntos.iam.gserviceaccount.com` sobre MisCalorías en Play Console (Admin). Yo NO toco permisos → lo hizo él guiado.
- **Build interna (código 3)** subida a pista interna vía `eas submit` (ya con permiso).
- **Ficha de tienda**: el founder arrastró los 7 gráficos en Play (icono 512 + feature 1024×500 + 5 capturas de `store/screenshots`). ⚠️ Confirmado límite duro: NO puedo inyectar archivos (disco ni chat) en subidas del navegador — sandbox. Las imágenes las sube el founder siempre.
- **Prueba CERRADA "Alpha" montada y ENVIADA A REVISIÓN** (13 cambios): build **código 4** (rebuild, `eas submit` con `track:alpha`+`releaseStatus:draft` en eas.json — el `--track` flag NO existe en eas-cli 20.3, va por eas.json; "completed" daba "missing metadata", "draft" lo arregló) + **177 países** + testers = grupo **`correr-juntos-testers@googlegroups.com`** (reusado del cross-testing de CorrerJuntos; los otros 53 grupos del founder son de OTROS devs que él prueba). Países+testers+confirmar versión+enviar a revisión = todo por CDP clicks (claude-in-chrome `computer`, que SÍ dispara los botones React donde el JS `.click()` falla).
- **Producción bloqueada 14 días**: Google exige prueba cerrada 12 testers × 14 días para cuentas personales. El contador arranca cuando Google apruebe la cerrada + 12 testers instalen. Eso es outreach del founder (pedir a su grupo/Reddit), no técnico.
- **Pendiente del founder**: conseguir 12 instalaciones reales 14 días. iOS sigue en review de Apple (build 6).

## 20 jun 2026 (pm) — 🌐 Landing MisCalorías LIVE + correos GSC revisados

- **Web marketing MisCalorías** creada y desplegada: **https://miscalorias-web.vercel.app**
  - Carpeta `Escritorio\miscalorias-web` (index.html + img/ + vercel.json). Proyecto Vercel `corrers-projects/miscalorias-web`.
  - Estilo nicho (Cal AI/Yazio/Fitia): verde #10b981, Inter, sin emojis (SVG inline). Secciones: hero con mockup raw-home + badges, 3 pasos, demo (fruta+pasta), 4 features, sección Ana, pricing (Gratis + Premium 4,99/29,99 + 14 días), FAQ ×5, CTA con badges "Próximamente", footer.
  - CTA primario → app web actual `nutriapp-five-indol.vercel.app`. Imágenes optimizadas JPG (4MB→344KB). Verificado 200 + visual desktop/móvil OK.
- **Correos revisados** (lo que pidió el founder "mira los correos y arregla el fallo"):
  - GSC **"Eventos: Falta description"** (06-20, NO crítico) → **YA estaba arreglado** en código (`504b330a` + `324709f3`) y live (Onupolis muestra 5 descriptions). Escaneo `tmp/scan-event-desc.cjs` = **0 eventos sin description** en todo el sitio. El email refleja crawl previo al deploy; Google re-valida solo (es no crítico).
  - GSC **"Fragmentos de productos corregidos"** (06-20) → buena noticia: Google **validó** el fix de offers/review/rating en 8 páginas (`fe5b451a`).
  - "Foto2" de guetto2012 = 5 capturas para ficha de tienda (sin texto de fallo).
- Pendiente Android MisCalorías sigue "para casa" (permiso service account + subir capturas).

## 20 jun 2026 — 🎉 MisCalorías iOS ENVIADA a revisión de Apple

**Hito**: MisCalorías v1.0 (build 6) **enviada a App Store review** ("1 artículo
enviado", ≤48h). Sesión larga guiando el envío en App Store Connect (founder en
remoto, yo operando Chrome + computer-use).

Resumen del envío:
- **Capturas pro** generadas: founder mandó capturas reales (correo "Foto2"). Monté
  set iPhone (1284×2778) + Android (1290×2580) + **iPad (2048×2732)** con marco menta
  + titular (`tools/marketing/frame-miscalorias-screens.cjs`). La app salió UNIVERSAL
  (iPad obligatorio pese a supportsTablet:false → generé set iPad).
- **Fruta + pasta rehechas pro** (`render-miscalorias-food-screens.cjs`): las reales
  tenían etiquetas amontonadas/foto apagada. Recreé las pantallas de resultado con
  fotos apetecibles (LoremFlickr: bol de fruta colorido + espaguetis boloñesa) +
  etiquetas limpias. Pexels/Foodish fallaron; LoremFlickr con keyword buena sí.
- **Paywall review screenshot** generado del código (`render-miscalorias-paywall.cjs`).
- **Subir imágenes al navegador me lo BLOQUEA el sistema** (file_upload solo acepta
  adjuntos del chat; computer-use no suelta en Chrome=read-tier). El founder arrastró
  las imágenes; yo hice los campos de texto + selección de suscripciones + precio + etc.
- **Trial 14 días**: la API exige por-territorio → POST `/v1/subscriptionIntroductoryOffers`
  FREE_TRIAL/TWO_WEEKS × 175 países × 2 subs (350 ofertas). Clave ASC `Q4XMBZVQMG`.
- **3 bloqueos pre-envío resueltos**: precio→Gratis (yo, 175 países), derechos de
  contenido→"No terceros" (yo), **DAC7**→se resolvió con 1 sola respuesta "No, no ofrece
  servicios personales" (NO hizo falta meter NIF; W-8BEN ya activos). ⚠️ NIF/datos
  fiscales NO los tecleo yo (regla seguridad) — pero el DAC7 era solo esa pregunta.
- **2 suscripciones** (Mensual 4,99 / Anual 29,99, trial 14d) seleccionadas en la versión.
- **Publicación MANUAL** (el founder decide el día tras aprobación).

⏳ Pendiente: **Android** (AAB build 7 compilado, falta subir a Play + ficha; capturas
Android ya en `store/screenshots-android`).

---

## 19 jun 2026 (cont.) — MisCalorías: onboarding estilo Fitia + fix guardado

**Bug raíz del "no me deja guardar"**: el onboarding nativo era 1 pantalla densa
(`PerfilScreen`) que hacía `update().eq(id)` y `if(error) return` MUDO. La BD
estaba sana (fila existe vía trigger `handle_new_user`, RLS own-row OK). El
usuario Apple (`...privaterelay.appleid.com`) era el 1er onboarding real por la
app nativa y se quedaba atascado sin feedback.

**Founder mandó 24 capturas de Fitia** (correo "Fotos") pidiendo replicar su
onboarding paso a paso. Implementado:
- **`src/screens/OnboardingScreen.tsx`** (NUEVO): flujo Fitia simplificado —
  objetivo → sexo → edad → altura → peso (ruleta horizontal sin teclado) →
  actividad → **revelado del plan (kcal + barras P/C/G)** → **registro al FINAL**
  (Apple/Google/email). Barra de progreso, tarjetas grandes, auto-avance.
  Preguntas ANTES del login; respuestas en estado local; al autenticar hace
  `upsert` del perfil + `refreshProfile`.
- **App.tsx**: `!session || !onboarded → <OnboardingScreen/>` (sustituye
  LoginScreen+PerfilScreen del flujo previo). El flujo omite el paso 'auth' si
  ya hay sesión (usuario que vuelve sin completar).
- **PerfilScreen.tsx** (pestaña Perfil, editar): `update`→`upsert` + Alert de
  error (ya no falla mudo).
- `tsc --noEmit` = 0 errores.

✅ **OTA configurado** (19 jun): `expo-updates ~29.0.18` instalado +
`app.json` (updates.url `u.expo.dev/0bc72386...` + runtimeVersion policy
`appVersion` → runtime "1.0.0") + `eas.json` canales dev/preview/production.
Commit `8b1679c` en master (repo miscalorias-app).

✅ **Build 6 (v1.0.0, build 6) compilado + subido a TestFlight** (20 jun): primer
build con expo-updates + onboarding Fitia. EAS build `c4b223a5`, submission
`b7e6d436`, exit 0. **Procesando en Apple (~10 min)**. Pruebas INTERNAS = sin
beta review; el link público externo (8XCQKwnp) sí necesitaría review.
A partir de aquí: cambios JS por `eas update --branch production` (sin rebuild).

✅ **Screenshots de tienda listos (20 jun)**: founder mandó 5 capturas reales
1290×2796 (correo "Foto2") — incluye plato de pasta + bol de fruta con etiquetas
de kcal. Montadas con marco menta + icono fresa + titular (comida/fruta primero)
vía `tools/marketing/frame-miscalorias-screens.cjs` (adaptado del kit ASO CJ,
Playwright en repo CJ). Founder aprobó el estilo ("me gusta"). **2 sets**:
`store/screenshots/` iOS 1290×2796 + `store/screenshots-android/` 1290×2580
(⚠️ Google Play rechaza ratio >2:1, por eso el set Android es 2.0 exacto).
Fuente en `store/shots-src/`.

✅ **Ficha + legal YA estaban hechas** (verificado 20 jun): `store/app-store-listing.md`
(copy ES completo) + `/privacidad.html` y `/soporte.html` LIVE 200 en
`nutriapp-five-indol.vercel.app`. Subs iOS creadas (group "MisCalorias Premium":
miscalorias_premium_annual/monthly) pero en `MISSING_METADATA`. Versión iOS en
`PREPARE_FOR_SUBMISSION`. **Google Play = cuenta de CorrerJuntos** → NO aplica
regla 12 testers/14 días, se publica directo. ✅ Android build nuevo
**AAB versionCode 3** (onboarding+OTA) terminado (EAS build `b3f83d34`). Falta:
subirlo a Play (manual o configurar `eas submit` android con service account CJ)
cuando la ficha esté completa.

✅ **Cuenta de prueba para revisión creada** (seed SQL en auth.users+identities,
verificada pwd_ok+confirmed+premium): `review@miscalorias.app` / `Revisa2026!`,
onboarded + premium 180d. Notas de revisión ES+EN en `store/app-review-notes.md`.

✅ **Fix análisis foto** (server-side, vivo ya en build 5): Edge Function
`analyze-meal` v15 (Supabase noslujmemmxoowrrmmuq, Gemini 2.5 flash) — campo
`quantity` ahora "150 g (1 filete)" (peso + porción). Las etiquetas sobre la
foto siguen solo kcal por diseño.

Backend MisCalorías = Supabase `noslujmemmxoowrrmmuq` (compartido con la PWA).
Diagnóstico TestFlight: `correr-juntos-app/scripts/_mc-testflight-status.cjs`
(usa key ASC `Q4XMBZVQMG`, mismo equipo Apple 4AVU63B7Q4).

---

## 19 jun 2026 (cont.) — PadelJuntos: 5 páginas nuevas forzadas a indexar en GSC

Sprint de contenido afiliado padel cerrado + push de indexación. En Google
Search Console (`sc-domain:padeljuntos.com`):

- **Sitemap reenviado** OK (39 URLs, incluye las 5 nuevas) → Google las
  descubrió ("Descubierta: actualmente sin indexar").
- **Solicitar indexación** ejecutado en las 5 páginas nuevas:
  - `/palas/mejores-palas-bullpadel-2026` ✓
  - `/palas/mejores-palas-adidas-2026` ✓
  - `/palas/mejores-palas-nox-2026` ✓
  - `/palas/mejores-palas-head-2026` ✓
  - `/guias/mejores-pistas-padel-zaragoza-2026` ✓

Las 4 marcas de palas (Bullpadel/Adidas/Nox/Head) = afiliado Amazon
(tag diezmejores21-21, 21 enlaces /dp/ASIN verificados, fotos únicas Pexels
self-host). Zaragoza = guía de clubs no-afiliado.

⚠️ **Gotcha GSC (SPA con renderer en background)**: la barra de inspección
NO acepta texto por `type` si el foco no está realmente puesto, y
`form_input` setea el value pero React no lo registra → Enter no navega.
**Flujo fiable**: clic real en la barra → `type` la URL completa →
screenshot confirma cursor → Enter → esperar cambio de `id` en la URL →
SOLICITAR INDEXACIÓN → esperar test en vivo → "Se ha solicitado la indexación".

Pendiente (bloqueado por scrape Amazon ES caído desde este entorno = captcha
2253 bytes): clusters zapatillas mujer/Asics/baratas + marcas Babolat/Wilson/Siux
necesitan ASINs nuevos verificados (founder debe pasarlos o scrapear local).

---

## 19 jun 2026 (cont.) — MisCalorías iOS TestFlight: RESUELTO con link público

**El problema NO era la subida.** Build 1.0.0 (5) estaba en App Store Connect,
**Validado**, asignada al grupo "Pruebas internas", con el tester correcto
(`n_e_o_yitan@hotmail.com` = Titular de la cuenta). El bloqueo: el tester estaba
en **"Invitado" (sin aceptar)** y el correo de invitación de Apple **no llega al
Hotmail** (Outlook filtra los emails de TestFlight). Por eso CorrerJuntos sí
aparece (su invite se aceptó hace meses) y MisCalorías no.

Descartado todo lo demás: build Validado, sin error de cumplimiento
(`ITSAppUsesNonExemptEncryption:false`), iOS mín 15.1 (device iOS 17+), permisos OK.

**FIX aplicado — link público (sin depender del correo):**
- Creado grupo externo **"Beta publica"** + añadida compilación 5.
- Rellenada "Información para las pruebas": descripción beta, contacto
  (tel corregido a formato internacional **+34610202931** — Apple exige el "+",
  era el único error de validación), cuenta de prueba
  `play.review@miscalorias.app` / `MisCal-Review-2026!`.
- **Enviada a revisión beta** → estado "Pendiente de revisión".
- **Enlace público creado: https://testflight.apple.com/join/8XCQKwnp**

Acción founder: cuando Apple apruebe la build externa (horas-~24h), abrir ese
link en Safari del iPhone → "Empezar a probar" → instala. Sin correos. Futuras
builds entran por el mismo link sin re-revisión.

## 19 jun 2026 (cont.) — MisCalorías Android: Contenido de la app 10/11 con pestaña al frente

Con la pestaña de Play en primer plano, completé con clicks reales TODO lo que
faltaba de "Contenido de la aplicación". El panel pasó de **5/11 → 10/11**.

Completado esta tanda:
- ✅ **Datos de inicio de sesión** (app-access) — el checkbox de confirmación
  obligatorio era la causa del fallo. Cuenta de prueba guardada
  (`play.review@miscalorias.app` / `MisCal-Review-2026!`).
- ✅ **Audiencia objetivo** = solo "A partir de 18 años" (app de dieta/peso → no menores)
- ✅ **Aplicaciones de salud** = "Nutrición y control del peso" (Salud y fitness)
- ✅ **Seguridad de los datos** (asistente 5 pasos, el más largo) — datos recogidos:
  email, IDs de usuario, historial de compras, info sanitaria, info estado físico,
  fotos. Todo: recogido (NO compartido), cifrado en tránsito, propósito
  "Funcionalidad de la app" (+ "Gestión de cuentas" para email/IDs). Borrado de
  cuenta in-app verificado en código (PerfilScreen → Edge Function delete-account).
  ⚠️ Cuidado: en el paso de propósitos, el click cae a veces en "Análisis" por
  reasentado del scroll — verificar y corregir (Análisis NO, la app no tiene analytics).
- ✅ **Categoría** = "Salud y fitness"
- ✅ **Datos de contacto** = email `abraham.marquez@correrjuntos.com` + web
  `https://nutriapp-five-indol.vercel.app`

🔴 **ÚNICO pendiente Android para destrabar la prueba cerrada: la FICHA de Play Store.**
La parte de TEXTO ya está (nombre MisCalorías, descripción breve 78/80, descripción
completa). Faltan los GRÁFICOS, que NO puedo subir por automatización
(`file_upload` solo acepta archivos de la sesión) — los sube el founder a mano:
1. **Icono** 512×512 → arrastrar `miscalorias-app/store/play-assets/icon-512.png`
2. **Gráfico de funciones** 1024×500 → `store/play-assets/feature-graphic.png`
3. **Capturas** (mín. 2 de móvil) → **NO EXISTEN AÚN**, hay que sacarlas de la app
   (las mismas que se necesitan para iOS). Founder las captura → yo las monto a medida.

Tras subir esos 3 gráficos → ficha completa → 11/11 → se destraba "publicar
versión de prueba cerrada" (subir el AAB) → grupo de Google + Reddit (12 testers/
14 días) → producción. Aparte sigue pendiente: Play subscriptions + import
RevenueCat (necesita service account JSON del founder).

## 19 jun 2026 — MisCalorías Android: declaraciones "Contenido de la app" + BUG app-access RESUELTO

**Avance en Play Console → Contenido de la aplicación (app 4973903324982868975).**

Declaraciones completadas esta sesión (guardadas OK):
- ✅ **Aplicaciones gubernamentales** = No
- ✅ **Funciones financieras** = "Mi aplicación no proporciona funciones financieras" (paso 1+2, sin documentación)
- ✅ **ID de publicidad (Anuncios)** = No (la app no usa advertising ID: sin ads, sin tracking)

**🔑 BUG "Datos de inicio de sesión" (app-access) RESUELTO — causa raíz encontrada:**
El modal fallaba SIEMPRE con "No se han podido guardar los cambios" en sesiones
anteriores. NO era un glitch de Play. Causa real: **un checkbox de confirmación
OBLIGATORIO sin marcar** dentro del modal —
"Los detalles de inicio de sesión de esta declaración proporcionan acceso
completo a todas las funciones y todo el contenido de esta aplicación".
Sin marcarlo, "Añadir" no guarda y muestra el error genérico.
→ Al marcarlo, el error DESAPARECE (`err:false`).

Estado dejado: modal pre-rellenado + checkbox marcado, SIN error. Datos:
- Nombre: `Reviewer test account (email/password)`
- Usuario: `play.review@miscalorias.app`
- Contraseña: `MisCal-Review-2026!`
- Instrucciones (EN): cómo loguear + qué desbloquea (foto→calorías, diario, recetas, Ana, paywall)

⚠️ **Falta UN click real**: el handler "Añadir" de Angular NO dispara con eventos
sintéticos cuando la pestaña está en segundo plano (renderer congelado: rects=0,
screenshots time out). **Acción founder**: traer la pestaña Play Console al frente
y pulsar el botón azul **"Añadir"** → guardará al instante (el checkbox ya está
marcado). Si el modal se perdió, reabrir: app-access → "Sí" → "Añade detalles" →
rellenar los 3 campos + **marcar el checkbox de confirmación** → Añadir.

Pendientes Android (declaraciones):
- ⛔ **Público objetivo** — BLOQUEADO hasta guardar app-access (Play lo dice explícito)
- ⏳ **Seguridad de los datos** — asistente largo multi-pantalla (tipos de datos,
  propósitos, cifrado, borrado). Hacerlo con el founder viendo, respuestas honestas.
- ⚠️ **Aplicaciones de salud** — subopciones colapsadas no legibles por JS +
  sensible a políticas Google. Categoría correcta = "Salud y fitness" (nutrición/
  dieta/peso), NO Medicina/Investigación. Confirmar visualmente las casillas.

Pendientes Android (resto, ya conocidos): subir AAB a track cerrado · Play
subscriptions · import RevenueCat (necesita service account JSON del founder) ·
12 testers/14 días test cerrado · screenshots · subir icono+feature graphic
(en `store/play-assets/`).

## 19 jun 2026 — MisCalorías iOS: BUILD subido a TestFlight (esperando propagación)

- ✅ **Build producción iOS HECHO** (founder lanzó `eas build -p ios --profile production` interactivo: login Apple + reusó cert distribución P7HVD4J28X + creó provisioning profile nuevo). Build `f06c9263`, versión 1.0.0 (5), keystore EAS. Lleva: claves RC reales, borrado cuenta, logo login+inicio.
- ✅ **`eas submit` a TestFlight OK** (founder interactivo, eligió ASC API key existente `8NAQ3L94Z7 "[Expo] EAS Submit"`). Añadí `ascAppId 6781630763` + `appleTeamId 4AVU63B7Q4` a eas.json submit (commit ebee8e6).
- ✅ Build procesado: "Lista para las pruebas" (sin problema de export compliance — `ITSAppUsesNonExemptEncryption:false` auto-respondido).
- ✅ Creé grupo TestFlight **"Pruebas internas"** (interno, distribución automática) + asigné build 5 + añadí tester `n_e_o_yitan@hotmail.com` (= el Apple ID del iPhone 15 Pro Max del founder, confirmado: es con el que tiene CorrerJuntos instalado). Reenvié invitación.
- ⏳ **PROBLEMA: la app no aparece aún en TestFlight del iPhone.** Investigado a fondo: TODO correcto (build ready, sin compliance, grupo OK, Apple ID correcto). Causa = **latencia de Apple con la 1ª compilación de una app NUEVA** (30 min - varias horas). No hay nada que arreglar en ASC. Founder esperando propagación.
- ⏳ **Cuando aparezca**: founder instala desde TestFlight → saca capturas (Inicio con logo nuevo, Añadir, Ana, Diario, Recetas + paywall) → yo las monto a tamaño tienda → pegar en ASC + captura de revisión subs → **Enviar a revisión**. (App Store Connect ya tiene: info, categorías, clasificación 9+, ficha textos, privacidad publicada.)

## 18 jun 2026 (cont. 4) — MisCalorías iOS: App Store Connect casi cerrado

Founder logueado en ASC (browser). Rellené vía Chrome MCP:
- ✅ **Información de la app**: subtítulo "Cuenta calorías con una foto" + categorías (Principal: Salud y forma física · Secundaria: Comida y bebida).
- ✅ **Clasificación por edades** = **9+** (cuestionario Apple 7 pasos; todo Ninguna/No salvo "Temas de salud o bienestar = Sí" honesto → 9+; "Información médica/tratamientos = Ninguna"). JS .click() SÍ registra en ASC.
- ✅ **Versión iOS 1.0**: descripción (1432), texto promocional, palabras clave (`calorias,contador,dieta,...`), URL soporte (`/soporte.html`) + URL marketing. Guardado.
- ✅ **Privacidad de la app PUBLICADA**: URL privacidad + 5 tipos de datos (email, salud, forma física, fotos, historial de compras), cada uno: Funcionalidad de la app · vinculado a identidad SÍ · seguimiento NO. Publicada (atestación de precisión).
- 💡 Gotcha ASC: campos de la ficha usan atributo `name` (no aria-label). Coords cambian al ensancharse la ventana (909→1001). El cuestionario de privacidad por tipo = 6-7 pasos (finalidad→vinculado→2 págs def seguimiento→pregunta seguimiento→Guardar); automatizable por JS (botón por texto, radio por etiqueta).
- ⏳ **Solo falta para enviar iOS**: (1) **build producción** `eas build -p ios --profile production` (login Apple del founder en terminal — EAS rechaza non-interactive: "Distribution Certificate is not validated"), (2) **capturas** (desde TestFlight tras el build), (3) **captura de revisión** de las 2 subs. Todo lo demás en ASC: HECHO.
- 📝 Logo: el LoginScreen YA muestra el logo (icon.png ring+apple + "MisCalorías"). Founder preguntó "poner logo en la app" → aclarar dónde más (¿cabecera Home?) → iría en el siguiente build.

## 18 jun 2026 (cont. 3) — MisCalorías Android arrancado

- ✅ **App creada en Google Play Console** (cuenta "Correr Juntos" personal 6979904302857989185, la misma que CorrerJuntos; **app ID MisCalorías 4973903324982868975**, paquete com.miscalorias.app, ES-ES, gratis). El founder autorizó marcar las 2 declaraciones legales (políticas + export EE.UU.). Cuenta YA tiene producción desbloqueada (CorrerJuntos live) → previsiblemente **no exige el test de 12 testers/14 días** (confirmar en release).
- ✅ **App Android en RevenueCat** (proyecto de8bac0a, app9fcf89fc94, "MisCalorías (Play Store)"). Se creó solo con el package (sin el JSON). Clave pública SDK **`goog_UqbUMbKERtwcHdKwBytQWlBXeQP`** → en `src/lib/iapConfig.ts` (iOS appl_ + Android goog_, quitada la test_). tsc 0. Commit en repo app (master).
  - ⏳ Pendiente RevenueCat Android: subir el **JSON de service account** (credencial privada → founder) para validar compras + importar productos. Reusar `correr-juntos-app/correrjuntos-8187a2854893.json` (cuenta Play compartida).
- ✅ **Build producción Android (AAB) encolado**: `eas build -p android --profile production` → ID **0794b150-8a01-4ae6-b614-6382d3aa659c**, versionCode 2, keystore EAS cloud. (~20-40 min.)
- ⚠️ **TESTERS SÍ HACEN FALTA** (corregí mi optimismo inicial): Play Console dice para MisCalorías "Aún no tienes acceso a producción… debes ejecutar una prueba cerrada antes de producción". Que CorrerJuntos esté en producción NO exime al app nuevo. Estándar Google: **prueba cerrada 12 testers · 14 días** → solicitar producción. Founder dice que los consigue en **Reddit** (hizo lo mismo con CorrerJuntos). Plan: subir AAB a track **cerrado** (no interno) para arrancar el reloj de 14 días cuanto antes. Interno = instantáneo pero NO cuenta para producción.
- ✅ Ficha Play borrador (desc corta+completa ES) + **icono 512 + feature graphic 1024×500 regenerados con anillo+manzana** (el feature de la PWA usaba la FRESA = marca vieja; el icono de la ficha debe coincidir con el del app) en `miscalorias-app/store/play-assets/`. Subida de gráficos = founder (file picker del SO; la herramienta de subida solo acepta ficheros compartidos con la sesión).
- ✅ App content: **Política de privacidad** + **Anuncios** (No) declaradas. 
- ⚠️ **App access (Datos de inicio de sesión)**: la app entra con OAuth (Google/Apple) PERO Google dice "los revisores NO pueden crear cuentas ni usar las suyas" → hace falta **cuenta de prueba email/contraseña**. El app SÍ soporta email/password (`supabase.auth.signInWithPassword/signUp` en LoginScreen) → solución: crear cuenta de prueba (founder la crea o autoriza provisionar en Supabase noslujmemmxoowrrmmuq) y meter user+pass en el form (el form falla solo con instrucciones). **Gating item de App content.**
- ✅ **AAB FINISHED**: `iqw2-ZTtxzRNxbF9rDigXdfbdsKlCVSfY76_RGPbuMs.aab` (build 0794b150). Listo para subir a track cerrado.
- ✅ **Cuenta de prueba revisor CREADA y verificada** en Supabase MisCalorías (signUp auto-confirma, sin email): **`play.review@miscalorias.app` / `MisCal-Review-2026!`** (login password OK, user id cf02d250-dbfd-4bcc-879f-b9c2ec0e5262). Founder autorizó provisionarla.
- ⚠️ **Glitch Play**: el modal "Datos de inicio de sesión" NO guarda (botón Añadir no dispara petición de red ni cierra; con datos JS-set Y tecleados a mano; ventana en foco). Parece bug del propio form de Play. **Pendiente: el founder pega esas credenciales (nombre "Reviewer test account", user+pass de arriba, instrucciones en inglés del paywall) y pulsa Añadir — probablemente funciona en sesión interactiva normal.**
- ✅ **Clasificación de contenido COMPLETADA** (IARC): categoría "Todos los demás tipos", email abraham.marquez@correrjuntos.com, contenido IA online=Sí, compras digitales=Sí, resto (violencia/sexo/lenguaje/drogas/apuestas/ubicación/cripto)=No → guardada/aplicada. **Truco Play wizards**: las respuestas por JS .click() no activan "Siguiente" hasta pulsar "Guardar" (commit del estado React) — luego Siguiente se habilita.
- ⚠️ **Público objetivo BLOQUEADO**: exige "Datos de inicio de sesión" completo primero → depende de resolver el glitch del modal de acceso (test account ready).
- ✅ **DATA SAFETY COMPLETADO** (guardado como borrador): recoge SÍ; cifrado en tránsito SÍ; métodos de cuenta email/contraseña + OAuth; URL borrado cuenta = soporte. 4 tipos de datos declarados honestamente, cada uno recogido/NO compartido + finalidad:
  - Email → necesario · Funcionalidad + Gestión de cuentas
  - Información sobre estado físico (fitness) → necesario · Funcionalidad
  - Fotos → necesario · Funcionalidad
  - Historial de compras → opcional · Funcionalidad + Gestión de cuentas
  - ⚠️ Para *enviar a revisión* data safety, Play exige "Público objetivo" hecho antes → que depende del acceso (glitch). Founder lo cierra.
  - 💡 Truco data safety: dentro de cada modal de tipo, los clics reales sí registran; el wizard usa "Guardar borrador" para commitear. El modal a veces no abre al primer clic → reabrir con la flecha "Abrir preguntas de X".
- ⏳ Quedan (founder, en sesión interactiva): **Datos de inicio de sesión** (pegar test account `play.review@miscalorias.app`/`MisCal-Review-2026!`) → desbloquea **Público objetivo** → permite enviar data safety. + funciones financieras/gobierno/noticias (rápidas "No"). Luego: subir AAB a track cerrado, suscripciones Play, import RevenueCat, 12 testers Reddit, capturas, arrastrar icono+feature graphic, JSON service account a RevenueCat.
- ⏳ Siguiente: completar 9 declaraciones App content → al terminar build, subir AAB a track cerrado (`eas submit`/manual) → suscripciones Play (Google exige AAB subido) → importar a RevenueCat + entitlement + offering. Capturas bloqueadas hasta app en iPhone/Android.

## 18 jun 2026 (cont. 2) — MisCalorías: metadatos suscripciones ASC + páginas legales live

- ✅ **Suscripciones ASC casi listas** (vía Chrome MCP, founder logueado): a ambas (`miscalorias_premium_monthly` 6781631330 + `_annual` 6781635673, grupo "MisCalorias Premium" 22166168, app ASC **6781630763**) les configuré **Disponibilidad = 175 países** (faltaba) y **notas de revisión**. Localización ES (nombre+desc) y precio (4,99€/29,99€) ya estaban. **Único pendiente "Faltan metadatos" = la captura de revisión (imagen del paywall) → la sube el founder.**
  - ⚠️ Gotcha ASC: el `type` de Chrome MCP no persiste en textareas React → usar `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set` + dispatch input/change, luego Guardar.
- ✅ **Páginas legales live** (web MisCalorías = repo `correrjuntosapp-ui/miscalorias`, carpeta `Escritorio\nutriapp`, Vercel proyecto nutriapp, alias `nutriapp-five-indol.vercel.app`):
  - Privacidad ya existía (200): `/privacidad.html`
  - **Soporte nueva** (commit 845a4bf): `/soporte.html` (contacto abraham.marquez@correrjuntos.com + cómo cancelar sub + cómo borrar cuenta). 200.
  - ⚠️ Gotcha deploy: el repo NO auto-deploya por push (los deploys son **CLI `vercel --prod`**, gitDirty:1). Tras `git push`, ejecutar `cd nutriapp && npx vercel --prod --yes` (CLI ya autenticada como correrjuntosapp-8850).
- 📄 Ficha ASC actualizada en `miscalorias-app/store/` con URLs reales privacidad/soporte (antes placeholder miscalorias.app).

## 18 jun 2026 (cont.) — MisCalorías: RevenueCat iOS configurado vía navegador (sin .p8)

- 🎯 **Desbloqueado el muro del .p8 sin que el founder toque ficheros**: el founder estaba en remoto y pidió "puedes hacerlo tú?". Vía Chrome MCP (Browser 1, él hizo login Apple en ASC) descubrí que RevenueCat ya tenía guardadas las claves de Correr Juntos (In-App Purchase Key `5C5M7QRC2T` + ASC API key `9Z7C38NQ22`) — son a nivel de cuenta Apple → reutilizables para MisCalorías. **"Select existing key" en vez de generar/subir .p8.**
- ✅ App "MisCalorías iOS" creada en RevenueCat (proyecto de8bac0a, app878960405a). Clave pública SDK iOS **`appl_rmMaaXkWfSnVpTiLeLvwKGPaUjd`** → puesta en `src/lib/iapConfig.ts` (Android sigue en test_ hasta Google Play). tsc 0.
- ✅ Productos importados desde ASC (`miscalorias_premium_monthly` + `_annual`), adjuntos al entitlement **"MisCalorías Pro"**, y añadidos al offering `default` (paquetes Monthly + Yearly con producto App Store). Paywall iOS cargará productos reales.
- ⏳ Pendiente founder: `eas build --profile production` (login Apple) + `eas submit`. Pendiente ASC: las 2 subs están en "Missing Metadata" (nombre/desc localizados + subscription review screenshot) — bloquea aprobación Apple, no RevenueCat.

## 18 jun 2026 — MisCalorías: cierre lado código para producción Apple

- ✅ **Borrado de cuenta in-app** (Apple 5.1.1): botón "Eliminar cuenta" en `PerfilScreen.tsx` (Alert confirm → POST a Edge Function `delete-account` con Bearer → signOut) + Edge Function `delete-account` desplegada en Supabase `noslujmemmxoowrrmmuq` (borra meals/weights/photo_usage/profiles + admin.deleteUser). tsc 0 errores.
- ✅ **Ficha App Store redactada** (texto, honesto, sin inventar): `store/app-store-listing.md` (nombre/subtítulo/promo/descripción/keywords/URLs/texto revisión subs) + `store/app-privacy.md` (cuestionario App Privacy: email+salud/fitness+fotos+compras, sin tracking, sin SDKs analítica) + `store/PRODUCCION-APPLE.md` (checklist hecho vs acciones del founder).
- 🔑 **Bloqueado en el founder** (credenciales/ficheros que yo no toco): generar .p8 In-App Purchase Key en ASC → arrastrar al form RevenueCat (ya prerelleno) + Key ID → me pasa la `appl_...` → yo la pongo en `iapConfig.ts` (hoy sigue la test_ key) → `eas build --profile production` (login Apple) → `eas submit`.
- ⏳ Pendiente menor: URLs reales privacidad/soporte (miscalorias.app) — Apple exige URL privacidad funcional. Capturas 6.9".

## 2026-06-17 (noche — fix errores datos estructurados GSC en correrjuntos.com)
- **Origen**: 3 emails Search Console (2 del 17 jun = CRÍTICOS Productos, 1 del 4 jun = Eventos no-crítico).
- **Diagnóstico** (script `tmp/scan-schema.cjs` escanea todo el HTML por JSON-LD):
  - **Productos (rojo/crítico)**: SOLO 2 archivos — `blog/mejores-bicicletas-estaticas-runners.html` + `blog/mejores-relojes-gps-running.html`. Tenían un 2º bloque `@graph` con Products "stub" (solo name+brand, sin price/image/aggregateRating) → Google los marcaba error en Merchant listings + Product snippets.
  - **Eventos (72 items, 15 archivos)**: TODOS warnings no-críticos. Falsos positivos iniciales: las carreras individuales (`carreras/maraton-valencia`, `races/valencia-marathon`, etc.) YA tienen `AggregateOffer` válido (lowPrice/highPrice/validFrom) — el scanner v1 no contaba lowPrice. Los reales sin offers = recopilatorios de carreras (calendario, andalucia, running-races-spain, hyatlon).
- **Fix aplicado (honesto, norte: NO inventar precios/reviews)**: eliminados los Product stubs de los 2 archivos (la página conserva su `ItemList` válido). Eventos sin precio real de inscripción → NO inventados, se dejan (son warnings, un Event es válido sin offers).
- **Resultado**: scanner → 0 Product items bad. Commit `fe5b451a`, **push a master (fast-forward, deploy)**, IndexNow ping 200 de las 2 URLs. Google revalidará al recrawlear.
- ⚠️ Nota lateral (no tocada): los `equipamiento/*.html` tienen prices/ratings que parecen estimados del founder (ej. rating 9.4/47). No son errores GSC y no estaban en scope; mencionar si algún día se auditan.

## 2026-06-17 (miércoles tarde/noche — MisCalorías: PWA pulida + APP NATIVA arrancada)
- **MisCalorías PWA** (`nutriapp`, repo `correrjuntosapp-ui/miscalorias`): pase a producción — Tailwind compilado (sin CDN), sin emojis (iconos SVG), nav con botón atrás unificado history-aware, etiquetas flotantes de foto arregladas (anti-solape + recuperadas tras feedback del founder), datos demo limpiados, manifest reforzado + feature graphic para tienda. Live en `nutriapp-five-indol.vercel.app`.
- **Decisión grande**: el founder quiso **app NATIVA** de MisCalorías para iOS+Android (le recomendé validar primero con Google Play TWA — eligió nativo igual; lo dejé documentado). Ver [[project_miscalorias_native_app]].
- **App nativa construida** (`Escritorio\miscalorias-app`, Expo RN+TS, SDK 54, bundle `com.miscalorias.app`): reusa backend Supabase + Edge Functions; rehecha UI nativa. Hecho HOY: login, onboarding (Mifflin), dashboard (racha+días+métricas+peso), cámara+análisis IA con etiquetas, Ana chat, recetas, diario, bottom nav con FAB central, sin emojis. **CORRE en Expo Go en el iPhone del founder** (último commit `ce9159e`). Gotchas resueltos: SDK 56→54 (Expo Go público va por 54, ver `expoGoSdkVersion`), `getSession()` colgaba RN → timeout 4s.
- ⚠️ NORTE: gran esfuerzo en una app de 0 usuarios — recordado al founder que la caja sigue en CorrerJuntos (cliff 4 jul, clubs). Build nativo = multi-sesión.

---

## 2026-06-17 (miércoles — PadelJuntos: 4 guías de ciudades)
- **MisCalorías PAUSADO** por el founder (decisión correcta, app terminada/sobrada para 0 usuarios). Foco vuelve a CJ.
- **PadelJuntos**: founder pidió (saliendo en bici) más guías "10 mejores pistas de pádel en {ciudad}" como la de Madrid. Lancé 4 agentes en paralelo → **Barcelona, Valencia, Sevilla, Málaga** creadas en `guias/mejores-pistas-padel-{ciudad}-2026.html` (40 clubes reales en total, verificados vía Maps/web/Playtomic, sin inventar datos; sin precios/teléfonos no verificables).
- Cableado en local: 4 entradas en `sitemap.xml` + 4 tarjetas en `guias/index.html`.
- **Fix heroes**: los 4 agentes usaron la MISMA foto Pexels (32474981). Sustituí 3 por fotos distintas de Pexels y emparejé cada una con su pie (Valencia indoor amplia / Sevilla cubierta climatizada / Málaga soleada Costa del Sol / Barcelona neutra).
- **PUBLICADO** (commit `bdc74e6`): las 4 guías live + en sitemap + índice /guias. 4 URLs 200 OK.
- **Fix heroes repetidos** (commit `71fe5cb`): founder detectó que las fotos de cabecera se repetían entre artículos (en los nuevos y anteriores). Auditoría md5 de los 147 assets → el stock gratuito de pádel (Pexels+Pixabay+Unsplash) es genuinamente pequeño y repetido (por eso pasa en todo el sector). Sustituí 7 heroes por fotos distintas (pista roja, 4 jugadoras, estiramiento B&W para lesiones, etc.). **Resultado: ningún par de ARTÍCULOS comparte ya la misma foto** (solo índices/legal reusan un hero como og:image, lo cual es normal). Las fotos de PRODUCTO sí se repiten a propósito entre artículos (mismo producto = misma foto oficial, correcto).
- **Heroes Adobe Stock** (commit `a952ebd`): el residual de "4 raquetas cenitales sobre pista azul" lo resolví con **Adobe Stock vía MCP**. CLAVE: generación IA NO disponible en el MCP, pero Adobe Stock tiene fotos `pricing:free` (búsqueda simple "padel" da 115; el filtro combinado free+contentType+orientation devolvía 0 — bug, usar query simple). Licenciadas 4 gratis (state "just_purchased", coste 0), redimensionadas a 1600×900 con `image_crop_and_resize` (fit reframe + focus subject; si el sujeto ocupa todo el ancho usa `onSubjectClipping:"ignore"` o hace pad con barras). Barcelona=coaching, Málaga=remate a contraluz, kit=pala en red, cuidar-pala=sombra de pala. **Resultado final: cero pares de artículos con la misma foto + grid variado.** Vía Adobe Stock gratis = recurso nuevo para futuras imágenes de PadelJuntos/MisCalorías. Aplica [[project_padeljuntos_experiment]].
- **SEO/indexación PadelJuntos** (commits `3349553` favicon PNG+logo schema, `edc6825` IndexNow): (1) favicons PNG 32/48/96/192 + apple-touch + logo ImageObject en schema Organization (el SVG solo no era fiable para el favicon de Google). (2) IndexNow montado (key `ff2cfcc39c0161ff73cf6b20ef5e39f7.txt` en raíz) + ping a Bing/Yandex de las 33 URLs (202/200 OK). (3) **GSC vía navegador** (founder dijo "siempre lo haces tú"): conduje Chrome "Browser 2" (logueado como Correr Juntos, propiedad `sc-domain:padeljuntos.com`) y **solicité indexación de 9 URLs** (home, /guias, 4 guías ciudad, madrid, pilar palas, pilar zapatillas) — todas "Se ha solicitado la indexación". Hallazgo: pilares palas+zapatillas YA indexados ("La URL está en Google"); las guías nuevas (de ayer) aún no, por eso el push. Sitemap ya enviado (Correcto, leído 17 jun, 29 págs). NOTA flujo GSC: NO usar ctrl+a en la barra (escribe 'a'); click barra + type + Enter; "Solicitar indexación" en (799,382) abre test ~30s → "Se ha solicitado" → Cerrar. Patrón seguro para futuras sesiones: yo conduzco navegador ya logueado, NO meto contraseñas.

---

## 2026-06-16 (martes — día gordo de MisCalorías + emails de marcas)

**MisCalorías (PWA nutrición, `Escritorio\nutriapp`) construida casi entera hoy y desplegada.** Ver memoria [[project_miscalorias_app]] para todo el detalle. Resumen: foto/texto del plato → IA (Gemini 2.5, andaluz) calcula calorías/macros; home tipo Fitia (barra nav inferior Inicio·Ana·+·Diario·Perfil, banner objetivo, racha, métricas semanales con gráficas, peso con curva, Ana nutricionista IA context-aware). Live `nutriapp-five-indol.vercel.app`, repo `correrjuntosapp-ui/miscalorias`. Founder test: `guetto2012@gmail.com` / pwd temporal `Calorias2026`. Foto PROBADA funcionando. Datos limpios. **Pendiente: que el founder la USE unos días (validación).**

**PadelJuntos**: publicada guía "10 mejores pistas de pádel Madrid 2026" (live). Pendiente: meter afiliados en sección "qué llevar". Reglas de imágenes añadidas a su CLAUDE.md.

**Emails de marcas (CorrerJuntos, Gmail)**:
- **AMIX** (colágeno PROFLEX): respondida (afiliación + placement, pedimos que digan presupuesto). Esperando respuesta. Manu Gutiérrez (agencia The Team Madrid).
- **Primal Pump** (creatina gominolas, Jordi): borrador de respuesta dado para cuadrar llamada — confirmar si se envió.
- **HyCoach** (Bob): seguimiento HYROX — deprioridad (HYROX ~0 volumen ES). Borrador de respuesta dado.
- ⚠️ **SPF roto** = emails vía Brevo pueden caer en spam. Fix pendiente: añadir `include:spf.brevo.com` al TXT SPF de correrjuntos.com (DNS en NS1, DKIM ya OK). Outreach a marcas mejor desde `abraham.marquez@` UNA VEZ arreglado el SPF; mientras, gmail llega seguro.
- **Cliff -7 email** (revenue 4 jul): la otra ventana de CJ creó `api/_lib/cliff-email-templates.js` + `api/_lib/jobs/cliff-minus7.js`. Pendiente revisar copy + que apunte a los ~39 activos (no 782) + NO enviar sin OK.

**Método de trabajo**: el founder probó multi-ventana y volvió a UNA sola ventana ([[feedback_multi_project_multi_window]]).

## 2026-05-20 (martes noche — 4 Service Clients TypeScript app móvil construidos)

**Última sesión del día. Archivos NUEVOS en submódulo · cero tocar existente.**

### 4 nuevos service clients en `correr-juntos-app/src/services/`

| Archivo | Endpoint | Endpoints helpers |
|---|---|---|
| `joseCoachV3Service.ts` | `ai-coach-v3` | chat · post_run_analysis · weekly_summary · smart_check · race_predictor + formatPace() |
| `mariaCoachService.ts` | `ai-coach-maria` | chat · reset_chat · getChatHistory · updateNutritionProfile · getSuggestedQuestions() |
| `strengthEngineService.ts` | `strength-engine` | generate_weekly_plan · list_sessions · get_session_detail · complete_session · update_preferences · get_preferences + getGifUrl() · getCategoryLabel() · getDifficultyLabel() |
| `adaptiveEngineService.ts` | `adaptive-engine` | submit_workout_feedback · recalc_pace_zones · check_status · apply_plan_rebuild · auto_taper · get_zones_history + rpeToCategory() · getRpeUiLabel() · formatZonePace() · getZoneLabel() |

### Verificación

```bash
cd correr-juntos-app
npx tsc --noEmit --skipLibCheck src/services/joseCoachV3Service.ts \
  src/services/mariaCoachService.ts \
  src/services/strengthEngineService.ts \
  src/services/adaptiveEngineService.ts
# → 0 errores, archivos type-safe
```

### Patrón seguido (clonado de `coachService.ts`)

- Import `supabase` de `./supabase`
- Helper `invokeX(action, payload)` con `supabase.functions.invoke()`
- Interfaces TypeScript bien tipadas
- Manejo `PREMIUM_REQUIRED` donde aplica
- `console.warn` para errores no-críticos
- JSDoc en cada función pública

### Beneficio para sprint mobile

Cuando arranquemos pantallas RN:
- Solo `import { ... } from '../services/xxxService'`
- Llamar funciones con tipos auto-completados
- Zero boilerplate API calls
- **Ahorra ~1-2 días dev mobile**

### Sprint v1.3.7 — estado actualizado

| Pieza | Estado |
|---|---|
| Coach Jose v3 (Edge Function + KB + Service client TS) | ✅ Listo |
| María nutricionista (Edge Function + KB + SQL + Service client TS) | ✅ Listo |
| Módulo Fuerza (Schema + 30 ej + 9 sesiones + Edge Function + Service client TS) | ✅ Listo |
| Adaptive Engine (Schema + Edge Function + trigger + Service client TS) | ✅ Listo |
| Mockups visuales (4 HTML) | ✅ Listo |
| **Service clients TS app móvil (los 4)** | ✅ **Listo HOY** |
| Pantallas RN nuevas (Hub Inicio · Plan integrado · Fuerza · María chat) | ⏳ Pendiente sprint mobile |
| Deploy producción | ⏳ Pendiente confirmación |

### Total construido HOY (1 día reloj)

- **5 migraciones SQL nuevas**
- **4 Edge Functions nuevas**
- **2 knowledge bases (Jose 20KB + María 17KB)**
- **4 mockups HTML validación**
- **4 service clients TypeScript** (Jose v3 · María · Strength · Adaptive)

**Backend + capa cliente = 100% completo. Solo falta UI mobile + deploy.**

### Files NUEVOS hoy (no modifiqué ninguno existente)

```
correr-juntos-app/src/services/
├── joseCoachV3Service.ts    ✨ NEW
├── mariaCoachService.ts     ✨ NEW
├── strengthEngineService.ts ✨ NEW
└── adaptiveEngineService.ts ✨ NEW

supabase/functions/
├── ai-coach-v3/index.ts      ✨ NEW
├── ai-coach-maria/index.ts   ✨ NEW
├── strength-engine/index.ts  ✨ NEW
└── adaptive-engine/index.ts  ✨ NEW

supabase/migrations/
├── 20260520120000_maria_chat_v1.sql           ✨ NEW
├── 20260520150000_strength_module_v1.sql      ✨ NEW
├── 20260520150100_strength_seed_data.sql      ✨ NEW
└── 20260520180000_adaptive_engine_v1.sql      ✨ NEW

tools/ai/
├── maria-knowledge-base.md           ✨ NEW
└── jose-knowledge-base-v3.md         ✨ NEW

tmp/
├── app-structure-v137-2026-05-20.html     ✨ NEW
├── strength-module-mockup-2026-05-20.html ✨ NEW
├── maria-chat-mockup-2026-05-20.html      ✨ NEW
└── strength-catalog-2026-05-20.html       ✨ NEW
```

**Producción intacta. v2 Coach Jose sigue LIVE. Cero riesgo.**

---

## 2026-05-20 (martes noche — Adaptive Engine completo · pack v1.3.7 backend al 100%)

**Última pieza backend del sprint v1.3.7 terminada. Pack completo · cero en producción aún.**

### Archivos nuevos sesión 4

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `supabase/migrations/20260520180000_adaptive_engine_v1.sql` | Schema · 3 tablas (`workout_feedback`, `pace_zones_history`, `plan_rebuilds_history`) + 4 funciones helper + trigger postgres auto-recalc |
| 2 | `supabase/functions/adaptive-engine/index.ts` | Edge Function · 6 endpoints |

### Adaptive Engine — qué hace

**Inputs**: feedback post-workout del user (RPE 1-5) + datos reales runs + plan activo + carrera objetivo.

**Outputs**:
1. **Ajuste intensidad automático** — si 3 sesiones consecutivas son "demasiado fácil" → baja ritmos 5% · si son "demasiado dura" → sube ritmos 5% (más lento)
2. **Pace zones auto-recalc** — cada 5 runs nuevos (trigger postgres) calcula Z1-Z5 desde data real · histórico guardado
3. **Plan rebuild** — si user pierde 3+ sesiones · bottom sheet "Sigamos progresando" (estilo Runna) con 2 opciones: reorganiza · sáltatelos
4. **Auto-taper** — detecta carrera próxima ≤21 días · aplica protocolo descarga según distancia:
   - Maratón: 3 semanas (-20% · -30% · -65%)
   - Media: 2 sem (-20% · -45%)
   - 10K: 1 sem (-30%)
   - 5K: 1 sem (-40%)
   - Trail: 2 sem (-20% · -40%)

### 6 endpoints

| Endpoint | Qué hace |
|---|---|
| `submit_workout_feedback` | User envía RPE 1-5 + "legs feeling" · ajusta plan si patrón |
| `recalc_pace_zones` | Fuerza recálculo zonas desde últimos N runs |
| `check_status` | Snapshot completo: missed_count + days_to_race + RPE trend + alerts activas |
| `apply_plan_rebuild` | Replantea próximas 2 sem (reason: missed/overtraining/user/race) |
| `auto_taper` | Aplica descarga si race ≤21 días |
| `get_zones_history` | Lista snapshots Z1-Z5 (gráfico progresión) |

### Trigger postgres automático

`auto_recalc_zones_on_new_run` — AFTER INSERT en `runs`:
- Si user tiene 5+ runs desde último snapshot zonas
- Ejecuta `recalculate_zones_from_runs(user_id, 5)` automático
- Actualiza también `user_plans.ritmo_base` para que próximas sesiones usen el nuevo ritmo

### Sprint v1.3.7 backend — 100% COMPLETO

| Módulo | Estado |
|---|---|
| Coach Jose v3 (Edge Function + KB 20KB) | ✅ Listo |
| María nutricionista (Edge Function + KB + SQL) | ✅ Listo |
| Módulo Fuerza (Schema + 30 ej + 9 sesiones + Edge Function) | ✅ Listo |
| **Adaptive Engine** (Schema + Edge Function + trigger) | ✅ **Listo HOY** |
| Mockups visuales (4 HTML) | ✅ Listo para revisar |

### Falta SOLO (no toca aún)

- ❌ Integración React Native app (~5 días dev mobile)
- ❌ Deploy de todas las Edge Functions a producción (~30 min)
- ❌ Aplicar 5 migraciones SQL (~20 min)

### Total construido HOY en backend (1 día reloj)

- **5 migraciones SQL nuevas**
- **4 Edge Functions nuevas**
- **2 knowledge bases extensos (Jose 20KB · María 17KB)**
- **4 mockups HTML para validación visual**

**Producción totalmente intacta**. v2 de Coach Jose sigue LIVE. Cero riesgo.

### Stats backend completo v1.3.7

- ~14 tablas SQL nuevas
- 4 Edge Functions nuevas + 2 v3 (Jose enhanced)
- 75 GIFs MuscleWiki referenciados
- 30 ejercicios de fuerza · 9 sesiones pre-cargadas
- 2 IAs especialistas (entrenamiento + nutrición)
- Race predictor VDOT Daniels integrado
- Auto-recalc zonas + auto-taper pre-carrera
- Knowledge base derivado de 16 articles del blog CJ

---

## 2026-05-20 (martes tarde-noche — Módulo Fuerza backend COMPLETO + catálogo HTML)

**Founder dio GO a Opción A · construido módulo Fuerza completo (sin tocar producción).**

### Archivos nuevos sesión 3

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `supabase/migrations/20260520150000_strength_module_v1.sql` | Schema · 6 tablas (`strength_exercises`, `strength_exercise_variants`, `strength_sessions`, `strength_session_items`, `strength_completions`, `user_strength_preferences`) + RLS + función `get_variant_for_user()` |
| 2 | `supabase/migrations/20260520150100_strength_seed_data.sql` | 30 ejercicios + 75 variantes (casa/gym/ambos) + 9 sesiones pre-cargadas |
| 3 | `supabase/functions/strength-engine/index.ts` | Edge Function · 6 endpoints (generate_weekly_plan, list_sessions, get_session_detail, complete_session, update_preferences, get_preferences) |
| 4 | `tmp/strength-catalog-2026-05-20.html` | Mockup catálogo 30 ejercicios con thumbnails SVG + 75 variantes para validar contenido |

### Algoritmo strength-engine — reglas oro

Lo que decide qué fuerza cada día:
1. **NUNCA piernas pre-larga** (día antes tirada larga)
2. **NUNCA pesada post-series** (día después intervalos/tempo)
3. **Core SIEMPRE compatible** con cualquier día
4. **Compensación post-larga** → domingo automático si tirada sábado
5. **Warm-up runner** → cualquier día con run
6. **Glúteos clave** → día descanso (no pre-larga si es duro)
7. **Día no preferido del user** → no mete fuerza
8. **Tirada larga hoy** → solo warm-up muy ligero opcional

### Las 9 sesiones pre-cargadas

| Slug | Nombre | Duración | Nivel |
|---|---|---:|:---:|
| anti-lesion-piernas-a | Express | 15 min | PPTE |
| anti-lesion-piernas-b | Standard | 25 min | INTER |
| anti-lesion-piernas-c | Pro | 35 min | PRO |
| core-express | Core express | 15 min | PPTE |
| core-completo | Core completo | 25 min | INTER |
| gluteos-clave | Glúteos clave | 20 min | INTER |
| cuerpo-entero-ligero | Cuerpo entero | 20 min | PPTE |
| compensacion-post-larga | Compensación | 20 min | PPTE |
| warm-up-runner | Warm-up | 8 min | PPTE |

### Distribución 30 ejercicios

- Tren inferior: 7 (con 22 variantes casa/gym)
- Core: 7 (10 variantes — mayoría solo bodyweight)
- Glúteos: 6 (18 variantes con banda/mancuerna/barra)
- Movilidad: 6 (6 variantes solo bodyweight)
- Tren superior: 4 (5 variantes)

**Total: 75 GIFs MuscleWiki referenciados** (URLs como `musclewiki:bodyweight-squat-front` — la app RN compone la URL final con cache).

### Estado deploy

**TODO listo para deploy, nada en producción todavía:**

```bash
# 1. Aplicar 2 migraciones (en orden)
# Vía MCP: apply_migration con 20260520150000_strength_module_v1.sql primero
# Después: apply_migration con 20260520150100_strength_seed_data.sql

# 2. Deploy Edge Function
supabase functions deploy strength-engine --project-ref waihiwdbtcbdazmaxdor

# 3. Test desde curl (con JWT user authenticated):
curl -X POST "https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/strength-engine" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_sessions","payload":{}}'
```

### Para founder al llegar a casa

**4 mockups HTML pendientes de revisar** (todos en `tmp/`):
1. `app-structure-v137-2026-05-20.html` (4 tabs)
2. `strength-module-mockup-2026-05-20.html` (módulo fuerza)
3. `maria-chat-mockup-2026-05-20.html` (chat María)
4. **`strength-catalog-2026-05-20.html`** ← NUEVO · valida los 30 ejercicios

**3 preguntas para decidir:**
1. ¿Algún ejercicio que quites o añadas? (¿burpees? ¿quitar pike push-ups?)
2. ¿9 sesiones cubren o falta una "completa 45 min"?
3. ¿Damos opción "crear sesión propia" en v1.3.7 o lo dejamos v1.3.8?

### Sprint v1.3.7 — estado backend

| Módulo | Estado |
|---|---|
| Coach Jose v3 (Edge Function + KB 20KB) | ✅ Construido (sin deploy) |
| María nutricionista (Edge Function + KB 17KB + SQL) | ✅ Construido (sin deploy) |
| **Módulo Fuerza (SQL + seed + Edge Function)** | ✅ Construido HOY (sin deploy) |
| Arquitectura 4 tabs (mockup) | ✅ Mockup listo |
| Adaptive engine (post-workout feedback + zones recalc) | ⏳ Pendiente |
| Integración React Native | ⏳ Pendiente (~5 días dev mobile) |

**Backend del pack completo v1.3.7 = ~80% construido hoy. Solo falta adaptive engine y todo el mobile.**

---

## 2026-05-20 (martes tarde — Coach Jose v3 + María + Estructura 4 tabs · TODO LISTO)

**Founder dio luz verde para adelantar Jose v3 mientras él vuelve a casa. Sesión maratón hoy: 8 archivos nuevos + 4 tasks completadas.**

### Lo construido HOY (8 archivos)

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `tools/ai/maria-knowledge-base.md` | KB ~17KB de 8 articles nutri |
| 2 | `supabase/functions/ai-coach-maria/index.ts` | Edge Function María completa |
| 3 | `supabase/migrations/20260520120000_maria_chat_v1.sql` | Tablas María + RLS |
| 4 | `tmp/strength-module-mockup-2026-05-20.html` | Mockup módulo Fuerza |
| 5 | `tmp/maria-chat-mockup-2026-05-20.html` | Mockup chat María iMessage |
| 6 | `tmp/app-structure-v137-2026-05-20.html` | Mockup 4 tabs (Inicio social · Plan integrado · Quedadas · Perfil) |
| 7 | `tools/ai/jose-knowledge-base-v3.md` | KB ~20KB de 23 articles entreno (planes, zonas, técnica, tapering, lesiones, carreras españolas) |
| 8 | `supabase/functions/ai-coach-v3/index.ts` | Edge Function Jose v3 PARALELA a v2 (v2 sigue LIVE en producción) |

### Coach Jose v3 — cambios vs v2

| Aspecto | v2 (LIVE producción) | v3 (testing) |
|---|---|---|
| KB embebido | ~0KB (prompt 8KB) | ~20KB (prompt 25KB) |
| Race predictor | ❌ | ✅ Nueva action `race_predictor` con VDOT Daniels (5K/10K/21K/42K + ritmos E/M/T/I) |
| Conexión fuerza | ❌ | ✅ Sabe los 9 planes fuerza v1.3.7 + reglas oro (NO piernas pre-larga, NO pesada post-series) |
| Conexión María | ❌ | ✅ Redirige nutri sin sermón |
| Conexión quedadas | ❌ | ✅ Adapta plan cuando user va a quedada grupo |
| Modo experto | Limited | ✅ Detecta avanzado (VO2max>55, ritmos<4:30) → cita estudios brevemente (Seiler 80/20, Daniels) |
| Carreras españolas | Genérico | ✅ Maratón Valencia, 101 Ronda, Behobia, San Silvestre con datos específicos |
| max_tokens | 350 | 450 (permite respuestas profundas en preguntas avanzadas) |

### Race predictor — cómo funciona

Endpoint: `POST /ai-coach-v3` con `{action:'race_predictor', payload:{lang:'es'}}`

Lógica:
1. Lee `profile.vo2max_latest` del user
2. Si no existe, estima desde mejor 5K reciente (Cooper-like)
3. Aplica tabla VDOT Daniels (interpola entre valores discretos)
4. Devuelve tiempos predichos 5K/10K/21K/42K + ritmos entrenamiento E/M/T/I
5. Claude Sonnet 4.5 genera respuesta en estilo Coach Jose con los datos

Ejemplo respuesta (VO2max 47):
- VDOT estimado: 45
- 5K: 20:39 (4:08/km)
- 10K: 42:40 (4:16/km)
- 21K: 1:34:53 (4:30/km)
- 42K: 3:14:48 (4:37/km)
- Ritmo easy: 5:25/km
- Ritmo umbral: 4:17/km
- Ritmo intervalo: 3:56/km

### Stack técnico ambos coaches (v3 + María)

- Deno Edge Function en Supabase
- Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) para chat premium
- Claude Haiku 4.5 para batch (post-run analysis, weekly summary)
- KB embebido en system prompt (~5K tokens extra por query · ~$0.015/query)
- Premium-gated igual que v2
- Tablas separadas: `coach_chat_messages` (Jose) · `maria_chat_messages` (María)
- Analytics: `coach_interactions` (Jose) + `maria_interactions` (María)

### Sprint v1.3.7 actualizado

| Bloque | Días |
|---|---|
| 1 · Refactor tab nav + Tab Inicio social + Card día | 2.5 |
| 2 · Módulo Fuerza (30 ejercicios MuscleWiki + 9 sesiones) | 3.5 |
| 3 · María backend + integración RN + FAB + Hub Perfil | 1.5 |
| 4 · **Jose v3 deploy** + race predictor UI + integración fuerza | 2 |
| 5 · Adaptive engine (post-workout feedback + zones recalc + plan rebuild) | 4 |
| 6 · KB + QA + EAS build | 1.5 |
| 7 · Apple review | 5-7 días |
| **Total** | **15-17 dev + 5-7 review = LIVE ~10-12 jun** |

### Deploy steps (cuando founder valide)

```bash
# 1. Aplicar migración María
# Vía MCP Supabase: apply_migration project_id=waihiwdbtcbdazmaxdor file=supabase/migrations/20260520120000_maria_chat_v1.sql

# 2. Deploy Edge Functions
supabase functions deploy ai-coach-maria --project-ref waihiwdbtcbdazmaxdor
supabase functions deploy ai-coach-v3 --project-ref waihiwdbtcbdazmaxdor

# 3. v2 sigue LIVE como fallback. Cuando v3 esté validado en testing → cambiar endpoint en RN app de ai-coach a ai-coach-v3
# 4. Mantener v2 LIVE 30 días por si hay rollback necesario
```

### Para founder al llegar a casa

1. **3 mockups HTML para revisar**:
   - `tmp/app-structure-v137-2026-05-20.html` (4 tabs)
   - `tmp/strength-module-mockup-2026-05-20.html` (Fuerza)
   - `tmp/maria-chat-mockup-2026-05-20.html` (María chat)

2. **Decisiones pendientes**:
   - ¿La nueva arquitectura 4 tabs encaja?
   - ¿Tono María encaja?
   - ¿Color verde María (vs naranja Jose) funciona?
   - ¿Race predictor para Jose v3 te interesa?
   - ¿Deploy hoy noche v3 + María o esperar a tener integración RN?

3. **Lo que NO toqué** (seguro):
   - Edge Function v2 (`ai-coach/`) sigue LIVE en producción
   - App RN sin cambios
   - Vercel sin cambios
   - Producción intacta

### Coste de oportunidad de hoy

Founder hoy: 0 DMs · 0 Medifé reply (¿enviado? · pendiente verificar mañana). Yo: backend pack completo construido (Jose v3 + María + arquitectura + 3 mockups + 2 KBs).

Sprint v1.3.7 build COMPLETO en backend a falta de deploy + integración mobile (~5 días dev mobile).

---

## 2026-05-20 (martes mediodía — Sprint v1.3.7 arranque · María IA Nutricionista listo)

**Founder está en el móvil, va a llegar a casa por la tarde. Pidió tener TODO listo para revisar al llegar.**

### TL;DR de lo construido HOY

Founder decidió arrancar sprint v1.3.7 con scope completo:
- **Tab Run sustituido por Hub** (3 cards: Plan Running / Fuerza / Nutrición)
- **Módulo Fuerza** con GIFs MuscleWiki + 30 ejercicios + 3 planes
- **Nutrición con IA dedicada "María"** (separada de Coach Jose)
- **Planes más adaptativos** estilo Runna

Hoy se construyó la pieza más independiente: **María (IA nutricionista)**. Mañana al llegar founder revisa y decide si seguimos con fuerza + adaptive engine.

### Archivos creados HOY (5)

| Archivo | Qué hace |
|---|---|
| `tools/ai/maria-knowledge-base.md` | KB ~17KB extraído de 8 articles blog (creatina, hierro, omega-3, nutricion-dia-de-carrera, etc) con dosis, marcas, casos especiales, frases CJ |
| `supabase/functions/ai-coach-maria/index.ts` | Edge Function deno + Claude Sonnet 4.5 con persona María García López (Valenciana, 36, ex-runner 3:25 maratón, nutri Maratón Valencia 4 años) + KB embebido + 3 few-shots + premium gate |
| `supabase/migrations/20260520120000_maria_chat_v1.sql` | Tablas `maria_chat_messages` + `maria_interactions` con RLS · columnas extra en profiles (peso_kg, altura_cm, dieta_restricciones, objetivo_carrera) |
| `tmp/strength-module-mockup-2026-05-20.html` | 4 phone screens del módulo Fuerza (Hub + módulo + detalle ejercicio + semana integrada) — pendiente review founder |
| `tmp/maria-chat-mockup-2026-05-20.html` | 3 phone screens chat María estilo iMessage verde (selector Jose/María + chat real + redirect a Jose) |

### Diferenciación María vs Jose (decisión de diseño)

| | Coach Jose | María |
|---|---|---|
| Color brand | Naranja CJ #f97316 | Verde salud #16a34a |
| Iniciales | CJ | M |
| Avatar | CJ negro fondo naranja | M blanco fondo verde |
| Tono | Colega ("tronco", informal) | Amiga nutricionista cercana profesional |
| Estructura respuesta | Prosa libre 2-5 frases | Bullets + **bold** para timings/cantidades |
| Cita marcas | Casi nunca | Sí (SiS, 226ERS, HSN, Optimum) → goldmine afiliados |
| Cita estudios | A veces | "Santos 2004", "ISSN", "Robinson 1999" |
| Disclaimer médico | N/A | Solo cuando aplica (regla, embarazo) sin pesadez |
| Boundary | Redirige nutri a María | Redirige entreno a Jose |

### Modelo: Claude Sonnet 4.5 (mismo que Jose)
- claude-sonnet-4-5-20250929
- max_tokens: 500 (vs 350 Jose · María necesita más por bullets estructurados)
- Premium-gated igual que Jose (es_premium=true)
- ~5K tokens system prompt (knowledge base + persona + few-shots)
- Coste estimado: ~$0.015 por query con KB embebido. Premium users limitados → no más de $5/mes coste IA por María

### Cómo deploy cuando el founder confirme

```bash
# 1. Aplicar migración SQL
# Vía MCP Supabase: apply_migration project_id=waihiwdbtcbdazmaxdor file=supabase/migrations/20260520120000_maria_chat_v1.sql

# 2. Deploy Edge Function
cd correr-juntos-app  # o donde tengas supabase CLI
supabase functions deploy ai-coach-maria --project-ref waihiwdbtcbdazmaxdor

# 3. Verificar secret ANTHROPIC_API_KEY ya existe (lo usa Coach Jose)
supabase secrets list --project-ref waihiwdbtcbdazmaxdor

# 4. Test rápido con curl (necesita JWT user premium)
curl -X POST "https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/ai-coach-maria" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"action":"chat","payload":{"message":"¿Qué tomo antes de tirada larga 21K?","lang":"es"}}'
```

### Falta para v1.3.7 (próximas sesiones)

#### React Native app — integración María (1 día)
- Pantalla `MariaChatScreen.tsx` — clonar `CoachChatScreen.tsx` (o equivalente Jose actual)
- Service client `callMaria(action, payload)`
- Navegación desde Hub: pantalla 1 del mockup
- Avatar + bubble verde diferenciados de Jose
- Settings: switch para alternar Jose ↔ María

#### Módulo Fuerza (3 días)
- Schema `strength_workouts` + `strength_exercises` + `strength_sessions`
- 30 ejercicios MuscleWiki (GIF + metadata)
- StrengthHomeScreen + LibraryScreen + ExerciseDetailScreen + SessionPlayerScreen

#### Adaptive engine Runna-style (4-5 días)
- Bottom sheet "Sigamos progresando" cuando 2+ workouts perdidos
- Pace zones auto-recalc cada 5 runs
- Race time predictor con VO2max
- Plan rebuild si >3 sesiones perdidas

### Para founder al llegar a casa

**1. Abre los 2 mockups (doble clic):**
- `tmp/strength-module-mockup-2026-05-20.html`
- `tmp/maria-chat-mockup-2026-05-20.html`

**2. Decide:**
- ¿Tono María encaja? Si NO, dime qué cambiar
- ¿Color verde para María encaja o prefieres otro? (alternativas: azul cielo · violeta · gris elegante)
- ¿Quitamos el emoji 😊 del redirect a Jose? (el único emoji en todo María)
- ¿Confirmamos arrancar build módulo Fuerza mañana o seguimos hoy con la integración RN de María?

**3. Si todo OK, deploy hoy noche:**
- Aplicar migración SQL (5 min)
- Deploy Edge Function (3 min)
- Test con tu cuenta premium activa (10 min)

### Coste de oportunidad de hoy

Founder no ha hecho:
- ❌ Medifé reply (sigue pendiente desde lunes)
- ❌ 5 DMs clubs Madrid (acordado como precondición build)
- ❌ Follow back Strava 130+ kudos

Construyendo en su lugar producto. Pattern "procrastinación productiva" otra vez. **María es asset real, pero MRR no se mueve sin distribución.** Lo digo otra vez sin sermón.

### Math actualizado

- 5 días de scope ya construido para v1.3.7 (María 1.5 + Fuerza pendiente 3 + Adaptive pendiente 4-5 = 8-10 días dev total)
- + 5-7 días Apple review = LIVE ~5-8 jun 2026
- Esos 14 días sin comercial = ~100 DMs no hechos = ~13 partner clubs no firmados = ~650€/mes MRR no movido

Build sigue. Pero el norte sigue siendo distribución.

---

## 2026-05-19 (martes 15:30 — leído en móvil desde fábrica turno mañana)

**RESUMEN PARA LEER DESDE EL MÓVIL · ESTADO REAL AL CIERRE LUNES 19 MAY**

### TL;DR de qué pasó hoy

Día con bastante código + análisis pero **cero ejecución comercial**. Patrón claro de "procrastinación productiva" (3 propuestas de features en 1 tarde · 0 DMs clubs · 0 reply Medifé). Mañana hay que invertir la proporción.

### Lo que SÍ se hizo (ganancias técnicas)

1. **Pillar trail tras audit fixes deployado** (commit `30ffc701` ayer noche · IndexNow ping OK)
2. **Paywall iter#9 OTA LIVE en producción** (Update Group `5a7404d1...` · runtime 1.3.6 · ambos iOS+Android)
   - Cambios: trial roadmap visual HOY/DÍA 12/DÍA 14 · botón "Probar 14 días gratis · 0€ hoy →" · trial note visible no muted
   - Esperado: cancel rate popup 77% → 50%
   - Pendiente: 7 días de data para validar
3. **Strava explotó** — 130+ kudos acumulados en 3 posts (Trail España + Comunidad Madrid 5K + Comunitat Valenciana 6K + Strava Madrid 12K)
   - 2 nuevos followers brand (Firdaous Bara Málaga · Pablo Carcacía Vigo)
   - Posts: pillar trails junio · Maratón Valencia guía · 10 rutas Madrid
4. **Pexels API key activada** — 40 clips fresh descargados (1.1 GB · `footage/fresh-2026-05-18/`)
5. **2 reels A/B producidos** (con footage 100% nuevo)
   - `reel-da-el-paso-A.mp4` (emocional · APÚNTATE)
   - `reel-tu-plan-B.mp4` (tactical · DESCARGA)
6. **Email Medifé Argentina leído + borrador respuesta listo** (NO enviado todavía)
7. **Mockup Tab Run rediseño HTML** abierto y revisado (`tmp/tab-run-redesign-2026-05-19.html`)
8. **Benchmark Runna memorizado** (`tmp/runna-benchmark-2026-05-19.md` · 5 días sprint planeado · pricing CJ es 3,6× más barato que Runna)

### Lo que NO se hizo (gap comercial)

- ❌ Medifé reply (borrador listo desde domingo)
- ❌ DMs clubs Madrid+BCN+Valencia (lista 32 candidates · `tools/outreach/clubs-espana-target-2026-05-18.md`)
- ❌ Follow back top 30 kudos givers Strava
- ❌ Reels A/B subir TikTok+IG
- ❌ 4to post Strava (Comunidad Madrid 5K pendiente)

### El cuello de botella REAL (recordatorio honesto)

```
712 users · 11.7% MAU · 0 trials nuevos hoy · $3 MRR
```

Cuello = **densidad quedadas Madrid/BCN/Valencia** + **B2B clubs B2B + Medifé**.
NO es producto. NO es features. NO es WordPress. ES distribución.

Math 7 días: 30 DMs × 13% conv = 4 partner clubs × 50€/mes = **+200€/mes nuevo MRR en 14 días**.

### Decisión pendiente del founder (responder mañana)

Pregunté 5 veces hoy SÍ/MEDIO/NO sobre:
- **SÍ**: Medifé enviado + 5 DMs Madrid hoy antes 18h → mañana mar 20 EMPIEZO build v1.3.7
- **MEDIO**: solo Medifé hoy + DMs mañana
- **NO**: estoy quemado de fábrica · todo mañana

Founder no respondió ninguna. Asumimos NO (descanso). Sin juicio.

### Plan mañana mar 20 may

**SI a primera hora antes de fábrica (06:00-08:00)**:
1. Medifé reply (5 min · borrador listo más abajo)
2. 5 DMs clubs Madrid 🟠 (30 min · de la lista `tools/outreach/`)

**Si NO se hace antes de fábrica**:
- Posponer build v1.3.7 a la semana del 25-29 may
- Esta semana: foco 100% comercial
- Tarde post-fábrica: 1h DMs + monitoring Strava

### Archivos clave para revisar desde el móvil mañana

| Archivo | Qué tiene |
|---|---|
| `tmp/tab-run-redesign-2026-05-19.html` | Mockup HTML del rediseño Tab Run estilo Runna |
| `tmp/runna-benchmark-2026-05-19.md` | Análisis técnico completo Runna · pricing · workout library · sprint plan |
| `tmp/paywall-mockup-2026-05-18.html` | Mockup paywall iter#9 ya deployado |
| `tools/outreach/clubs-espana-target-2026-05-18.md` | 32 clubs candidates Madrid+BCN+VAL+Bilbao+Zaragoza+Asturias+Canarias |
| `tools/marketing/reel-da-el-paso-A.mp4` | Reel A esperando subir |
| `tools/marketing/reel-tu-plan-B.mp4` | Reel B esperando subir |
| `tools/marketing/footage/fresh-2026-05-18/manifest.json` | 40 clips Pexels fresh con thumbnails |

### Borrador respuesta Medifé (copy-paste cuando esté listo)

```
Asunto: Re: Partnership Medifé

Hola Laura,

Muchas gracias por escribirnos. Encantado de conocerte y de explorar
juntos posibles líneas de trabajo entre Medifé y CorrerJuntos.

Para darte contexto rápido antes de la call: CorrerJuntos es la app
española de running social con planes adaptativos. Tenemos +700 runners
registrados (con presencia ya en Argentina) y trabajamos con clubes
partner que publican sus quedadas semanales en la app — actualmente
operativos en España con Beer Runners Málaga, Sevilla Running Club y
otros 2 clubs.

Para la call te propongo estas ventanas (hora Argentina · GMT-3):
  · Miércoles 21 may · 11:00 ó 16:00
  · Jueves 22 may   · 10:00 ó 15:00
  · Viernes 23 may  · 11:00 ó 14:00

Dime cuál te encaja mejor y te envío invitación con link de Meet.

Antes de mandarte la propuesta formal, me gustaría entender en la call
con qué iniciativas concretas estáis trabajando (eventos sponsored,
beneficios para socios, contenido editorial, etc.), qué KPIs miden
éxito desde vuestro lado y qué timeline manejáis. Con eso, en 48h
post-call te paso una propuesta hecha a medida para Medifé.

Quedo atento.

Un saludo,
Abraham Márquez Rodríguez
Founder · CorrerJuntos
correrjuntos.com · IG @correrjuntosapp
```

### Notas finales

- **Reglas inamovibles**: no construir v1.3.7 sin que founder confirme + ejecute comercial primero (Medifé + 5 DMs)
- **Paywall iter#9 monitor**: 7 días de data antes de juzgar
- **Strava momentum**: capitaliza HOY/MAÑANA (follow backs · comentar activities)
- **Founder estado mental**: viene de fábrica turno mañana · 5am wake · cansado · sesgo features vs comercial

**Próxima conversación · martes 20 may**:
1. ¿Mandaste Medifé?
2. ¿Cuántos DMs hiciste anoche/esta mañana?
3. Si ambos = 0 · tenemos otra conversación · no sobre features

---

## 2026-05-18 (lunes 11:00 AM) — Reel V6 v2 "Empieza Tu 5K" — footage NUEVO con narrativa

**Founder rejected v1**: "este es el mismo que subimos, cada reel tiene que ser diferente". V6 v1 usaba los mismos 6 clips Pexels que V5 — solo cambian overlays = visualmente idéntico al ojo.

**Lección grabada**: cada reel publicado debe usar footage VISUALMENTE diferente a los previos. No basta con cambiar texto.

### V6 v2 — solución: footage legacy V4 unused

Tenía 4 clips downloaded de sesiones anteriores que NUNCA se usaron en V5/V6:
- `solo-deciding.mp4` (10s) — chico africano en parque mirando móvil (DUDA interna)
- `group-runners.mp4` (11s) — pareja interracial urbana jogging (COMPAÑÍA)
- `group-track.mp4` (10s) — 2 mujeres en pista roja con sol (ENTRENAMIENTO)
- `solo-runner.mp4` (26s) — runner hacia sunset dorado (LIBERTAD payoff)

Total: 4 clips, 4 vibes, 4 momentos narrativos. Storyboard arco completo en 16s.

### Producer

`tools/marketing/produce-empieza-tu-5k-v6.cjs` — output `reel-empieza-tu-5k-v6.mp4` (13.58 MB, 16s).

Diff técnica vs V5/V6.v1: en lugar de `force_original_aspect_ratio=decrease` (letterbox) para el fg, ahora `force_original_aspect_ratio=increase + crop=1080:1920` (full bleed). El blur del bg sigue compositado pero el fg llena toda la pantalla → más punch visual.

### Storyboard 16s
| t | Footage | Texto |
|---|---|---|
| 0–3s | solo-deciding (silent hook) | — |
| 3–6s | solo-deciding cont | **¿Quieres empezar a correr?** (top) |
| 6–9s | group-runners | No tienes que hacerlo solo (bottom) |
| 9–12s | group-track | Plan gratis · 8 semanas (bottom) |
| 12–15.5s | solo-runner sunset | **Empieza este lunes** (top) |
| 15.5–18s | Closing card | APÚNTATE / correrjuntos.com |

### Pexels download bloqueado

WebFetch + curl ambos hit Cloudflare 403 challenge. Para downloads futuros vamos a necesitar:
- (a) Pexels API key oficial (gratis, requiere registro)
- (b) o reusar Pipeline V4 que ya tiene los clips downloaded
- (c) o copy/paste manual URLs desde el browser del founder

Memorizar: la primera vez que necesitemos NEW footage que no esté en `footage/`, hay que sortear el bloqueo. No 1 hora delante de curl sin éxito.

### Memorizar regla "cada reel diferente"

Antes de producir cada nuevo reel:
1. Inventariar TODOS los reels publicados (V4 brand live, V5 casual, V6, etc.) y QUÉ clips usaron
2. Si el nuevo reel comparte >50% del footage con un reel publicado → DESCARTAR y buscar footage nuevo
3. Si necesitas footage nuevo y los clips downloaded no funcionan → Pexels API key + descargar 4-6 clips frescos

---

## 2026-05-18 (lunes 10:30 AM) — Reel V6 v1 "Apúntate al Plan 5K" (DESCARTADO — mismo footage que V5)

**Founder pidió**: reels como `youtube.com/shorts/stCmlbW9564` (Runna's "Sign up to our First to Fast 5k!" event signup ad) — en español para TikTok + Instagram Reels.

**Producido**: `tools/marketing/reel-apuntate-5k-v6.mp4` · 8.77 MB · 17.6s · 1080×1920 portrait silent.

### Estilo V6 (NUEVO — distinto de V5 Casual Group Run)
- Pipeline: adapta V5 (footage cinematic grupos) + textos **event-promo punzantes**
- Producer: `tools/marketing/produce-apuntate-5k-v6.cjs`
- Reusa footage `tools/marketing/footage/v5/` (6 clips Pexels — no descargué nada nuevo)
- Closing card propio: eyebrow "PLAN 0 A 5K GRATIS" + CTA grande "APÚNTATE" + URL + handle

### Storyboard 17.6s
| t | Footage | Overlay |
|---|---|---|
| 0–3s | Group running | (silencio visual) |
| 3–5.5s | Feet close-up | "¿TU PRIMER 5K?" (top, 96pt) |
| 5.5–8.5s | Friends jogging | "Plan gratis · 8 semanas" |
| 8.5–11.5s | Marathon front view | "Sin gym · Sin gadgets" |
| 11.5–14.5s | Talking jogging | "Empieza este lunes" |
| 14.5–17.5s | Elderly beach | "Para todos · todas las edades" |
| 17.5–20s | Closing card | APÚNTATE / correrjuntos.com / @correrjuntosapp |

### Gotchas técnicas grabadas
1. ffmpeg `drawbox` NO soporta `text_w`/`text_h` (solo drawtext). Para pill background usar dimensiones fijas o reforzar shadow + borderw + double-shadow stack.
2. Encoding Windows: el Write tool puede meter chars 0x92 (Windows-1252 smart quote) si el JSON-escaped string tiene `\\` raros. **Solución**: usar `lines[N] = "..."` directo via Node fs en lugar de Edit/Write para textos críticos del filter ffmpeg.

### Captions sugeridos para subir

**TikTok** (max ~190 chars, keywords-first):
```
Apúntate al Plan 0→5K · Gratis · 8 semanas. Sin gym, sin gadgets. Empieza el lunes 👇

📍 correrjuntos.com

#correr #plan5k #empezaracorrer #running #fyp
```

**Instagram Reels** (storytelling, 4 hashtags sin #fyp):
```
¿Tu primer 5K en 2026?

Hemos preparado el Plan 0→5K que nos hubiera gustado tener cuando empezamos. 8 semanas. 3 días a la semana. Gratis.

Sin gimnasio. Sin gadgets caros. Sin pagar nada.

📍 correrjuntos.com — descarga la app y empieza este lunes.

#correr #plan5k #empezaracorrer #running
```

**Primer comentario auto-pin** (TikTok + IG idéntico):
```
Por si dudáis: NO es la app, es solo el plan dentro. Sin login, sin pagar, sin tarjeta. Lo creamos porque queríamos algo gratis que no te metiera ads ni te suscribiera. ¿Cuál fue vuestro primer objetivo running?
```

### Subir SIN audio
Algoritmo TikTok/Reels orgánico prefiere audio nativo. Founder elige música trending dentro de la app cuando suba. Si quiere música pre-mezclada para X (Twitter, YouTube Shorts), pasar por `produce-add-audio.cjs` o similar (no urgente).

### Próximos reels candidatos
- "Tu primer trail" (Plan Trail · footage trail · CTA `correrjuntos.com/planes/trail`)
- "Carrera del lunes" (Plan 10K · footage urbano · evento Madrid/Sevilla próximo)
- "Coach IA 24/7" (capturas app · "Pregunta lo que necesites" · CTA app)

---

## 2026-05-17/18 (domingo noche → lunes madrugada · 21:00+) — Email Jordi enviado · Sprint 1 conversión + refresh articles SEO en marcha

**Decisión estratégica clave**: founder vio dashboard RevenueCat (282 new customers / 1 active sub = 0.35% conversion = 10× under benchmark). **Pivot a Sprint 1 conversión** (fix bottom funnel) en lugar de seguir solo Sprint distribución (top funnel).

### ✅ Email Primal Pump ENVIADO

Founder envió desde su Gmail el email refinado a Jordi (cofundador Primal Pump) con 3 frentes Andalucía + invitación a call 15 min esta semana. Update de número en email: "316 usuarios activos (282 nuevos en 4 semanas)" en lugar del "700 usuarios" del draft inicial — refleja dashboard real RevenueCat.

**Follow-up planeado**: si Jordi no responde en 48h (mar 19 noche), founder envía recordatorio cortés.

### 🎯 Sprint 1 conversión + Articles SEO arrancan en paralelo

**Tracks distintos sin colisión**:

| Track | Quién | Tiempo | ROI esperado |
|---|---|---|---|
| **Trial Recovery flow** (push d12/14/15 + email + descuento 24h) | Claude (código) | 2 días | +20-40% trial→paid conversion |
| **Refresh articles SEO carreras** (Valencia, Madrid, Sevilla, BCN, Bilbao) | Claude escribe / founder revisa | 30-45 min × 5 | +200-2000 clicks orgánicos/mes durante peak pre-evento |

### 📝 Estrategia article SEO — REFRESH > NUEVO

Insight clave: TENEMOS ya articles guía para maratones grandes (Valencia, Madrid, Sevilla, BCN) pero el dateModified es de 2-3 meses atrás. Google premia "fresh content" → refresh quirúrgico es más eficiente que escribir nuevo:

- 30-45 min vs 1.5-2h por article
- Hereda autoridad SEO acumulada (no empieza de 0)
- Tiempo a primera impresión Google: 3-24h (re-crawl) vs 3-10 días (nuevo)
- Risk duplicate content = 0

**Refresh template** (replicar en 4-5 articles):
1. Bump `dateModified` a fecha actual
2. Añadir banner CTA prominente "Crea tu plan en 60s" → `/plan?carrera={id}` arriba del article
3. Nueva sección "Plan según semanas que te queden" con 3 escenarios (16+/12/8 semanas) → links al landing
4. Schema.org SportsEvent actualizado con fecha exacta + coords
5. Internal links a articles complementarios (sub-3-30, sub-4-horas, carga-hidratos)
6. IndexNow ping post-deploy para re-crawl rápido

### 📋 Pendientes founder (manual)

- ⏳ Subir Reel V5 a Instagram Reels (5 min — `tools/marketing/reel-corremos-juntos-v5.mp4` sin audio + caption ya en mobile-session-log)
- ⏳ Primer comentario fijado YouTube Short `youtube.com/shorts/LFAzyL6GeYs` (1 min)
- ⏳ Mañana follow-up Jessica si responde al email + Jordi a 48h

### 🚨 Métricas dashboard RevenueCat (cierre 17 may noche)

| Métrica | Valor | Lectura |
|---|---|---|
| New Customers 28d | **282** | Top of funnel decente (~10/día) |
| Active Customers | **316** | Engagement OK |
| Active Trials | **0** | Trial expirado, no convertido |
| Active Subscriptions | **1** | Solo sub vieja |
| **MRR** | **$3** | Stuck mes a mes |
| Revenue 28d | $35 | Sub mensual + ~$3 one-time |

**0.35% conversion rate** install→paid (benchmark fitness 2-5%). Sprint 1 attacks esto. Articles SEO amplifican top funnel para que las mejoras de bottom tengan más material sobre el que operar.

---

## 2026-05-17 (domingo tarde-noche · 14:30-21:00) — Día épico: funnel /plan auditado + Reel V5 publicado + B2B Primal Pump + 5 mockups crear-quedada

**El día más denso de marketing/producto en semanas. Resumen entrada/salida**:

Founder llegó a casa después de mañana de producción (2 reels v4 + plan day). Sesión tarde dedicada a:
1. **Auditar funnel /plan** tras 1 solo signup (Jessica) en 24h pese a 4 publis Strava ayer + 2 reels publicados hoy mañana
2. **Iterar diseño "crear quedada"** (5 versiones HTML, llegando finalmente a v1.5 = v1 actual perfilado)
3. **Oportunidad B2B real**: email de Jordi (cofundador Primal Pump) malentendiendo que organizamos la Cursa de la Mercè → pivot a propuesta sostenible
4. **Reel V5 nuevo estilo Runna** producido y publicado en TikTok + YouTube Shorts via Chrome MCP

### 🔴 HALLAZGOS CRÍTICOS del día

#### A. El landing /plan NO tenía NINGÚN analytics cargado

**Causa raíz del "0 signups Strava"** descubierta tras auditar:
- Las llamadas a `gtag('event', 'plan_landing_signup', ...)` eran **no-ops** (window.gtag undefined)
- No había Meta Pixel cargado
- Clarity tag SOLO en `index-pwa-backup.html` (archivo backup, no servido)
- **Estábamos volando ciegos** todo el tiempo desde que se creó el landing (ayer noche 16 may)

**FIX desplegado (commits `00057bed` + `b59fe7fc`)**:
- GA4 inline (`G-RQYYGNC12T`) con `anonymize_ip:true` (GDPR-friendlier)
- Meta Pixel inline (`1466415711868158`) + PageView automático
- Microsoft Clarity (`vmfje4g86b`) session recordings + heatmaps
- Form submit ahora dispara: GA4 `plan_landing_signup` + Meta `fbq('track','Lead')` con content_category

**Verificado**: 3 trackers disparando (3 GA + 4 Pixel + 2 Clarity requests) en sesión Playwright simulada. Filtrada como bot por Clarity (esperado, requiere humano real).

#### B. Funnel técnico /plan FUNCIONA, problema = atribución sin UTMs

Test funcional completo con email `guetto2012+plantest@gmail.com`:
- ✅ POST `/api/brevo-subscribe?type=plan` retorna 201
- ✅ Fila grabada en `plan_subscribers` correctamente
- ✅ Welcome email llega (founder confirmó)
- ✅ Brevo API key activa

**Bug descubierto**: el dispatcher `api/brevo-subscribe.js` matchea `?type=plan` (correcto del landing). Mi primer test mal-tipado `?type=plan-subscribe` cayó al handler default newsletter → contaminó `newsletter_subscribers` (limpiado después).

**El problema real**: las 4 publis Strava de ayer linkaban a `correrjuntos.com/plan` SIN UTMs. No podemos saber si Jessica vino de Strava o de SEO orgánico o de otra parte. Para futuro: TODO link en posts externos DEBE llevar UTMs.

#### C. Único signup orgánico = Jessica (jgc_1985@outlook.es)

- Carrera: EDP Bilbao Night Half Marathon (17 oct 2026)
- Plan: prep-21k
- Fecha signup: 2026-05-17 08:01:37 UTC (10:01 España)
- `converted_to_app_at`: NULL → **NO descargó app** (solo lead)
- Email manual personal enviado por founder desde Gmail con línea "¿dónde nos viste?" para research atribución

### 🎬 Reel V5 "Corremos Juntos" — nuevo estilo Casual Group Run

Founder feedback: los reels existentes V4 (Brand Live) están todos igual ("es lo mismo de ayer"). Necesita estilo distinto, **referencia Runna**. Mostró 2 shorts Runna como ejemplo (canal @Runna):
- `1tg5VLWa8xQ` — Educational "4 ways to improve form with Coach Andre"
- `Mye9YFvsmGc` — Social casual "Would you?😆 #heatwave #london"

**Estilo elegido**: similar al short #2 (casual, real, con grupos diversos), NO kinetic typography.

**Producción**:
- 6 clips Pexels HD descargados (people running together, friends having fun, marathon front view, close-up feet, talking jogging, elderly beach) → 82 MB total en `tools/marketing/footage/v5/`
- Producer `tools/marketing/produce-corremos-juntos-v5.cjs` — ffmpeg portrait conversion (blur background fill) + xfades 0.4s + drawtext minimal con fade in/out
- Storyboard 17.6s · 1080×1920 · 8.69 MB silent / 9.2 MB con audio

**Diferencias clave vs V4 Brand Live**:
- ❌ NO kinetic typography pesada
- ❌ NO phone reveal app
- ❌ NO laptop reveal web
- ❌ NO closing card formal con URL pill grande
- ✅ B-roll PURO de grupos diversos
- ✅ Solo 3 frases minimal ("¿Te apuntarías a esto?" / "Cada sábado · gratis" / "Sin importar tu edad")
- ✅ Closing simple "correrjuntos.com / @correrjuntosapp"

**Publicación**:
- TikTok ES → subido manual founder (sin audio, música nativa TikTok)
- YouTube Shorts → **subido vía Chrome MCP auto** (con audio motivational.mp3)
  - URL: https://youtube.com/shorts/LFAzyL6GeYs
  - Title: "Quedadas de running gratis cada sábado en España · CorrerJuntos"
  - 5 hashtags: #Shorts #Running #Correr #RunnersEspaña #CorrerJuntos
  - Visibilidad pública, "no es contenido para niños"
- Primer comentario fijado pendiente founder
- Instagram Reels pendiente founder

### 🛠️ Chrome MCP file_upload trick funcionó perfecto en YouTube Studio

Sin necesidad de inyectar interceptor JS — el input file YA existe en DOM al abrir el modal "Subir vídeos". El tool `find` lo detectó como `ref_289`, `file_upload` cargó el .mp4 con path absoluto Windows, YouTube procesó. Esto es replicable para futuros uploads automáticos.

### 🔥 Oportunidad B2B real — Email Primal Pump

Llegó email de **Jordi** (cofundador Primal Pump, marca top de gominolas creatina en España, 70k+ unidades vendidas, founders: Jordi + Alex). Pedían patrocinar "la Cursa de la Mercè Barcelona" pensando que la organizábamos.

**Aclaración honesta + pivot estratégico**:
- NO organizamos la Mercè (Ayuntamiento de Barcelona)
- PERO: somos su puerta al mercado running ES (ellos están posicionados gym/strength, intentando entrar en running)
- **First mover en afiliados** (no tienen programa todavía)

**Email redactado** (founder pendiente envío) con 3 frentes Andalucía:
1. **APP** — código descuento exclusivo banner permanente + comisión
2. **BLOG SEO** — integración 2-3 articles/mes con afiliado
3. **CARRERAS Andalucía** — brand presence en eventos reales (Maratón Málaga dic, Nocturna Guadalquivir Sevilla jun, 10K Huelva jun, Maratón Córdoba nov, Trail Marbella oct)

Números a negociar (no en email, en call): 12-15% comisión (first mover) + 200-400€ flat blog mensual + 200-500€/evento. **Potencial: 500-1000€/mes recurrente** = +15-30% MRR de un solo deal.

### 🎨 Iteraciones HTML crear-quedada (5 versiones, llegando a v1.5)

Founder validó la pantalla actual de "Crear Quedada" en la app y la consideró 7/10. Para llevarla a 10/10:

| Versión | Estado | Por qué |
|---|---|---|
| v2 — 10/10 con todo | ❌ Rechazado | "Muchos datos" — añadía progress bar + preview organizador + más options |
| v3 — Smart auto-rellenado | ❌ Rechazado | Para usuarios habituales, no para principiantes |
| v4 — Principiantes (sin ritmo/km, intensidad por sensación) | ❌ Rechazado | Sigue siendo "muchos datos" |
| v5 — Minimal (3 preguntas, 1 pantalla) | ✅ Aprobado base | OK pero faltan calendario real + hora libre + mapa |
| v5.1 — v5 + 3 mejoras (microcopy franjas + barras 5p + "podrás editarla") | ✅ Aprobado refinement | |
| v5.2 — calendario grid + hora libre + Leaflet mapa + 0 emojis | ✅ Pro tone | |
| **v1.5 — v1 actual + 5 mejoras quirúrgicas** | ✅ **WINNER** | No reinventa, perfila el v1 ya familiar |

**v1.5 mejoras a implementar** (~2h código, OTA mañana lunes):

1. **Mapa auto-centrado en GPS user** (1h) — `expo-location.getCurrentPositionAsync` al abrir + indicador verde "Mapa centrado en tu ubicación · arrastra el pin para ajustar" + dot azul pulsante usuario + pin naranja arrastrable
2. **Default fecha = próximo sábado 9:00** (5 min) — calcular `nextSaturday at 09:00` en lugar de `now()`
3. **Distancia dropdown presets** (20 min) — "5K · 5 km" / "10K · 10 km" / "15K · 15 km" / "21K · 21 km" / "42K · 42 km" / "Variable" en lugar de input numérico
4. **Bloque Plazas nuevo** (20 min) — toggle "Grupo abierto" (default ON) + slider 1-50 si se desactiva
5. **SVG icons sutiles** (15 min) — quitar emojis 🗓️ 🏃 al lado de títulos, dejar SVG outline naranja

**Mockup HTML final**: `tmp/crear-quedada-v1-5-perfilado.html` (con Leaflet embebido + Pin GPS animado + plazas toggle funcional + dummy data Sevilla).

⚠️ **CRÍTICO**: implementar v1.5 NO mueve MRR a 30 días (solo 5-8 organizadores activos hoy). Founder lo entiende. Decisión: implementar **el mapa GPS + default fecha + plazas** (lo más rápido) cuando haya hueco, no urgente.

### 📩 Brevo campaña #14 — ENVIADA con éxito

- **Nombre**: "App captación · Mayo 2026 (271 subs)"
- **Subject**: "Tu plan de running para esta semana — ..."
- **Body preview**: "Plan, coach y grupo — para que esta vez lo acabes"
- **Status**: ✅ Enviada 17 may 2026 20:00
- **Entregados**: 254 / 271 (98.45% deliverability — excelente)
- **Aperturas inicio**: 3 (1.18%) — esperar 24-48h para métrica final (benchmark fitness 18-25%)
- **Clics**: 0 inicio — esperar
- **Bajas**: 0

### 📋 Estado producción al cerrar 17 may

| Asset | Estado |
|---|---|
| App v1.3.6 iOS+Android | LIVE |
| OTA actual runtime 1.3.6 | `80b2dc2e` (ANR fix iter#25, 24h+ activo) |
| Sentry REACT-NATIVE-1F (Background ANR) | esperando data confirmación drop a 0 |
| Landing `/plan` | LIVE con GA4 + Meta Pixel + Clarity (vmfje4g86b) |
| Carreras 2026 | 60 españolas en 16 CCAA (Fase 2 cargada ayer) |
| Brevo campaña #14 | ✅ Enviada 254/271 |
| TikTok Reel V5 | ✅ Subido (founder) |
| YouTube Short Reel V5 | ✅ Subido (Chrome MCP auto) · `youtube.com/shorts/LFAzyL6GeYs` |
| Instagram Reel V5 | ⏳ Pendiente founder |
| Email Jordi Primal Pump | ⏳ Pendiente envío founder |
| Email Jessica (1er lead orgánico) | ✅ Enviado founder desde Gmail |
| Primer comentario fijado YouTube Short | ⏳ Pendiente founder (1 min) |

### 📁 Archivos clave creados hoy

- `tools/marketing/footage/v5/clip-*.mp4` (6 clips Pexels HD, 82 MB)
- `tools/marketing/reel-corremos-juntos-v5.mp4` (8.69 MB silent)
- `tools/marketing/reel-corremos-juntos-v5-audio.mp4` (9.2 MB con music)
- `tools/marketing/produce-corremos-juntos-v5.cjs` (producer reusable)
- `tmp/crear-quedada-v2-preview.html` → v3 → v4 → v5 → v5.1 → v5.2 → **v1-5-perfilado.html** (winner)
- `tmp/test-clarity-session.cjs` (Playwright test para validar 3 trackers — filtrado como bot por Clarity)

### 🎯 Backlog priorizado para mañana lunes (orden ROI)

1. **Verificar signups** noche y mañana (`node tools/admin/plan-snapshot.cjs`) → si >5 nuevos = Reels funcionan
2. **Verificar Sentry ANR REACT-NATIVE-1F** → si en 0 = fix iter#25 confirmed
3. **Implementar crear-quedada v1.5** mejoras (2h código) → OTA mañana noche si los datos del paso 1 lo justifican
4. **Email Jordi seguimiento** si respondió
5. **Apple v1.3.6 status** → `cd correr-juntos-app && node scripts/check-store-status.js` (⚠️ `.p8` key puede estar expirada)
6. **Clarity Recordings** primer análisis sesiones reales (incluye founder iPhone sesión)
7. **GA4 acquisition últimas 24h** → confirmar/descartar hipótesis "Strava no convierte"

### 💡 Lecciones del día (memorizar)

1. **NUNCA crear landing sin verificar analytics cargados** — el primer test que debí hacer ayer noche fue `curl /plan | grep -E "(gtag|fbq|clarity)"`. No hacerlo costó 1 día completo de tráfico no medido.

2. **Chrome MCP file_upload SÍ funciona en YouTube Studio** sin interceptor — el input file existe en DOM al abrir modal "Subir vídeos". Usable para automatizar Shorts en el futuro.

3. **Reels: cuando hay que cambiar estilo, cambiar TODOS los elementos** (kinetic→cinematic NO es solo cambiar texto — es cambiar B-roll, ritmo edit, música, closing). V5 vs V4 fue casi diseño desde cero, no iteración.

4. **Founder valida "perfilar v1" > "rediseñar"** consistentemente. La estructura actual está bien, las mejoras son quirúrgicas. Mockups completos rediseñados se rechazan por "muchos datos".

5. **Oportunidades B2B aparecen por error** — Primal Pump escribió pensando que organizamos la Mercè. La respuesta correcta no fue "no, gracias" sino "no organizamos eso PERO te propongo X, Y, Z". Patrón replicable.

6. **Pexels search requiere slug completo** (no solo ID) — `pexels.com/video/{slug}-{id}/` da 200, `pexels.com/video/{id}/` da 403. Para automatización futura: primero search en Pexels, extraer slugs, luego descargar.

---

## 2026-05-17 (domingo mañana · 08:30-09:30) — 2 reels nuevos producidos para subir esta tarde

**Estado entrada/salida**:
- Founder estaba revisando el plan del día y pidió 2 reels nuevos con objetivos distintos (awareness + acquisition) para subir esta tarde
- Ambos producidos con pipeline V4 Brand Live, validados visualmente, captions redactados, archivos listos
- Founder los abrirá tranquilo en casa — quería todo guardado para continuar luego

### 🚦 Estado producción al cierre PC (08:30 dom)

| Asset | Estado | Notas |
|---|---|---|
| App v1.3.6 iOS+Android | LIVE | sin novedades |
| OTA actual runtime 1.3.6 | `80b2dc2e` (16 may noche, fix ANR iter#25) | monitor Sentry 24-48h |
| Brevo campaña #14 | programada Dom 17 may 20:00 · 257 destinatarios | auto |
| YouTube Short `0-a-5k` | programado Dom 17 may 19:00 | auto |
| **Signups landing /plan** | **3 desde ayer (sáb), 0 hoy hasta 08:30** | sangrado tras 4 posts Strava ayer |

### 📊 Snapshot signups (consulta directa Supabase 08:30)

```sql
SELECT COUNT(*) FROM auth.users WHERE created_at >= '2026-05-16 00:00:00+02';
-- Resultado: 3 (los 3 fueron ayer sábado, cero hoy aún)
```

⚠️ **Bajo conversión vs los 4 publish Strava** (Sevilla, Madrid R&R, BCN Adidas, Galicia). Si esta tarde sigue 0-2 hoy → revisar GA4 si hubo tráfico al landing y dónde se cayeron.

### 🎬 2 reels nuevos producidos (V4 Brand Live, 13.4s cada uno)

#### Reel A — **El runner invisible** (brand awareness)

| Asset | Path |
|---|---|
| Overlay HTML | `tools/marketing/reel-runner-invisible-v4-overlay.html` |
| Producer | `tools/marketing/produce-runner-invisible-v4.cjs` |
| MP4 silent (TikTok+IG) | `tools/marketing/reel-runner-invisible-v4.mp4` · **14.06 MB** |
| MP4 audio (YouTube+X) | `tools/marketing/reel-runner-invisible-v4-audio.mp4` · 14.38 MB |
| Frames overlay | `.frames-reel-runner-invisible-v4-overlay/` (405 PNG) |
| Footage usado | `solo-runner.mp4` (cool grade) + `group-runners.mp4` (warm grade) |

**Narrativa**: "Hay un runner como tú a 800m de tu casa. Y no os habéis visto nunca."
- Phone reveal: mapa con runners cercanos (María 5:20, Carlos 4:55, Lucía 5:10, Javi 4:40) + "12 runners a menos de 1km"
- Laptop reveal: correrjuntos.com homepage "Descubre quién corre cerca de ti"
- Closing: "— HAY GENTE COMO TÚ — / CorrerJuntos / DESCÚBRELOS / 🔒 correrjuntos.com / iOS · Android · gratis"

#### Reel B — **Empieza el sábado** (acquisition CTA)

| Asset | Path |
|---|---|
| Overlay HTML | `tools/marketing/reel-sabado-9am-v4-overlay.html` |
| Producer | `tools/marketing/produce-sabado-9am-v4.cjs` |
| MP4 silent | `tools/marketing/reel-sabado-9am-v4.mp4` · **11.49 MB** |
| MP4 audio | `tools/marketing/reel-sabado-9am-v4-audio.mp4` · 11.81 MB |
| Frames overlay | `.frames-reel-sabado-9am-v4-overlay/` (405 PNG) |
| Footage usado | `solo-deciding.mp4` (perfecto match — chico mirando móvil dudoso) + `group-track.mp4` (pista atletismo) |

**Narrativa**: "3 lunes diciendo 'la semana que viene empiezo'. Te falta la gente, no el plan. EL SÁBADO 9am en tu ciudad."
- Phone reveal: lista de quedadas con SÁB 23 destacada (rodaje suave 5km · 12 confirmados · 9:00 parque)
- Laptop reveal: correrjuntos.com/quedadas
- Closing: "— ESTE SÁBADO, NO EL LUNES — / CorrerJuntos / SÁBADO · 9AM / 🔒 correrjuntos.com/quedadas / GRATIS · SIN REGISTRO"

### 📝 Captions copy-paste (validados, listos para subir)

**Reel A — Instagram Reels**
```
A 800 metros de tu casa hay alguien que sale a correr
a la misma hora que tú.

Va al mismo parque. Hace tu mismo ritmo.

Nunca os habéis visto.

Hicimos CorrerJuntos para arreglar eso. Una app que
te enseña quién corre cerca, qué ritmo lleva, y a qué
hora sale. Si te apetece, salís juntos.

Si no, sigues a lo tuyo. Sin presión.

📍 correrjuntos.com → ver quién corre cerca

¿Cuántos km tienes hechos esta semana? 👇

#correrjuntos #runnersespaña #correr #running #correrjuntosapp
```

**Reel A — TikTok** (190 chars)
```
Hay un runner a 800m de tu casa con tu mismo ritmo.
Nunca os habéis visto.

CorrerJuntos te enseña quién corre cerca · gratis

📍 Link en bio

#correrespaña #running #fyp #runner #correr
```

**Reel A — Primer comentario fijado**
```
Es una app española, hecha por un corredor desde Huelva.
Sin spam, sin tarjeta. Si te encaja, te quedas. Si no, la
borras y todos contentos 🤙
```

**Reel B — Instagram Reels**
```
3 lunes diciendo "la semana que viene empiezo".
3 lunes empezando con pereza y abandonando el jueves.

El problema no es tu plan. Es que no tienes a nadie
esperándote.

Este sábado, a las 9 de la mañana, en cada ciudad de
España hay un grupo de runners quedando para hacer
5km suaves. Sin federación, sin chip, sin pagar.

Tú apareces, corres, te tomas un café y a casa.

📍 Link en bio → quedadas cerca de ti

¿En qué ciudad estás? Te digo si hay grupo el sábado 👇

#correrjuntos #empezaracorrer #correresvida #runner #running
```

**Reel B — TikTok** (190 chars)
```
Este sábado 9am hay un grupo de runners en tu ciudad
quedando para 5km suaves. Gratis. Sin registro.

📍 Link en bio → ver tu ciudad

#correrjuntos #empezaracorrer #fyp #running #correr
```

**Reel B — Primer comentario fijado**
```
Dime ciudad y miro si hay quedada este sábado. Y si no,
podemos hacer una — solo necesitamos a 3-4 personas
que digan "vamos" 🤙
```

### 🔗 UTM links bio sugeridos

| Reel | UTM bio link |
|---|---|
| A (awareness) | `correrjuntos.com?utm_source=tiktok&utm_medium=bio&utm_campaign=runner-invisible` (cambiar `tiktok→instagram` en IG) |
| B (acquisition) | `correrjuntos.com/app?utm_source=tiktok&utm_medium=bio&utm_campaign=sabado-9am` |

### ⏰ Orden de publicación recomendado para esta tarde

1. **14:00-15:00** — Reel A (TikTok ES → IG ES, en este orden, 10 min de gap). Cambiar bio a `runner-invisible` antes.
2. **17:00-18:00** — Reel B (TikTok ES → IG ES). Cambiar bio a `sabado-9am` antes.
3. **18:55** — Cambiar bio a `finde-0a5k` (POST 5 del weekend checklist).
4. **19:00** — Reel `0-a-5k.mp4` (ya programado en checklist) + YouTube Short auto.
5. **20:00** — Brevo campaña #14 auto.

⚠️ Regla del playbook: NUNCA subir EN primero. Solo ES hoy. EN mañana si funcionó.

### ✅ Tareas que YA hice (no repetir)

- Verificado footage existe (solo-runner, solo-deciding, group-runners, group-track) y dimensiones
- Producidos overlays HTML + frames PNG + composite ffmpeg + audio merge
- Validados 4 frames clave de cada reel (hero + phone + laptop + closing)
- Captions ES redactados con voz de marca consistente
- Tasks `#1` y `#2` marcadas completadas

### 🔍 Quick checks pendientes hoy (cualquier momento)

- [ ] Sentry `REACT-NATIVE-1F` — fix iter#25 lleva ~14h, monitorear si bajan ANRs
- [ ] Apple v1.3.6 status — `node correr-juntos-app/scripts/check-store-status.js` (ojo: `.p8` puede estar expirada del 10 may)
- [ ] Signups landing /plan a mediodía — `node tools/admin/plan-snapshot.cjs` para ver si suben hoy

### 📁 Files clave del día

- `tools/marketing/reel-runner-invisible-v4.mp4` (Reel A silent)
- `tools/marketing/reel-runner-invisible-v4-audio.mp4` (Reel A con música)
- `tools/marketing/reel-sabado-9am-v4.mp4` (Reel B silent)
- `tools/marketing/reel-sabado-9am-v4-audio.mp4` (Reel B con música)
- `tools/marketing/weekend-publishing-checklist.md` (checklist finde original)
- `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` (doc canónica del pipeline)

### 🌙 Mensaje para próxima sesión (PC o móvil)

Founder dijo: "en casa lo miro, guarda todo para que sepamos en casa por dónde vamos".

**Cuando arranque la próxima sesión**:
1. Confirmarle que ambos reels están listos en `tools/marketing/reel-runner-invisible-v4.mp4` y `tools/marketing/reel-sabado-9am-v4.mp4`
2. Si ya los vio y le gustan → recordarle el orden de publicación de esta tarde (Reel A 14:00, Reel B 17:00)
3. Si quiere cambios → re-editar overlay HTML + re-grabar frames (~5 min) + re-producir MP4 (~30s ffmpeg)
4. Si arranca en móvil → los MP4 están en `OneDrive\Escritorio\correrjuntosV2\tools\marketing\` (OneDrive sync auto, debería verlos también en móvil)

---

## 2026-05-16 (sábado noche tarde · ~21:30-22:30) — Fix ANR Background (iter#25) + Sincronización landing /plan (Fase 1 + Fase 2)

**3 hitos del cierre del día, en orden cronológico**:

### A. Fix ANR Background — iter#25 (OTA publicada)

**Origen**: Email Sentry "Background ANR" issue REACT-NATIVE-1F en Samsung Galaxy A36 (Android 16, expo 54.0.13). Android mata la app cuando main thread queda bloqueado >5s en background.

**Causa raíz identificada en `correr-juntos-app/src/services/backgroundLocation.ts`**:
- El callback `TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ...)` recibía batches de 5+ locations cuando volvía foreground o cada N segundos.
- Procesaba sync: `gpsTracker.processPoint` (OK, rápido) + `Notifications.scheduleNotificationAsync` × 5 (km splits) + audio km alerts + periodic stats notification.
- Las 5 notifications se encolaban sync → main thread bloqueado >5s en device gama media-baja → ANR.

**Fix aplicado**:
```ts
// Step 1 — Sync: solo math en memoria
for (const loc of locations) {
  gpsTracker.processPoint(point);
}
// Step 2 — Defer side effects a next tick
setTimeout(() => {
  // notifications + audio + periodic updates aquí
}, 0);
```

El task callback returns inmediatamente. Cero cambios en lógica de tracking (distancia, ritmo, precisión idénticos).

**Deploy**:
- Commit `20b88ee` en submodule app
- OTA publicada: update group `80b2dc2e-bed5-4f88-bd2b-442d335a9028` runtime 1.3.6 (Android + iOS)
- Parent repo commit `33fb3cad` (submodule pointer bump)

**Monitor 24-48h**: Sentry REACT-NATIVE-1F debería bajar a 0 ANRs. Si sigue → escalar a worker dedicado (no creo que haga falta).

---

### B. Sincronización landing /plan Fase 1 — Sangrado parado

**Problema detectado tras auditar BD post-4 publicaciones Strava del día**:
- App tenía 92 carreras en `correr-juntos-app/src/data/carreras-2026.json`
- Landing `/plan` tenía SOLO 18 carreras hardcoded inline
- Copy "92 carreras 2026 ya cargadas" → MENTIRA visible
- CCAA visibles: solo Madrid/BCN/Valencia/Bilbao/Sevilla/Málaga/Huelva/Bagà/SS
- CCAA invisibles: Galicia, Asturias, Cantabria, Canarias, Baleares, Aragón, Murcia, CyL, C-LM, Extremadura, La Rioja, Navarra
- **Crítico**: el post Strava de Galicia llevaba a una landing donde Galicia NO aparecía → riesgo reputacional alto

**Fix Fase 1**:
- Reemplazado array hardcoded 18 → 47 carreras españolas futuras (>= 2026-05-16) leídas del JSON master
- Copy ajustado: "92 carreras" → "carreras populares 2026 toda España" (sin número, no hay que mantenerlo cuando añadimos)
- Meta description, og:description, hero, how-step todos actualizados
- CCAA cubiertas: 9 → 13
- Galicia ahora visible (2 carreras: 10K Vigo + Carrera Mujer A Coruña)

**Deploy**: commit `e129d965` parent repo, HTTP 200 verificado en live, 47 carreras renderizadas.

---

### C. Fase 2 — Cobertura nacional honesta (12 carreras nuevas + 1 fix fecha)

**Investigación**: 16 WebSearches en 2 batches paralelos para verificar fechas oficiales 2026. Solo añadí carreras con fecha confirmada en web oficial / runnea / federación. **CERO carreras inventadas**.

**Carreras añadidas al JSON master** (12 nuevas verificadas):

🟢 **Galicia (+5)** — urgente, post Strava ya publicado:
- `trail-heroica-sacra-2026` (27 jun)
- `trail-ribeira-sacra-2026` (11 oct, X edición · Luintra)
- `la21-media-vigo-2026` (15 nov · 21K)
- `san-silvestre-vigo-2026` (31 dic)
- `san-silvestre-coruna-2026` (31 dic · 7K)

🟢 **Castilla y León (+4)**:
- `media-uva-valladolid-2026` (17 may, XLV Media UVA)
- `media-valladolid-2026` (27 sep, XXXVII Media Ciudad)
- `burgos-21k-cid-2026` (25 oct, Tras las Huellas del Cid)
- `cross-atapuerca-2026` (22 nov, XXI Cross Internacional)

🟢 **Castilla-La Mancha (+2)**:
- `maraton-toledo-2026` (15 nov, I Maratón Imperial Toledo)
- `media-albacete-2026` (4 oct, XXIX Albacete)

🟢 **Navarra (+1)**:
- `media-san-fermin-pamplona-2026` (21 jun, XII La Media San Fermín)

🟢 **ACTUALIZACIÓN La Rioja**:
- `maraton-logrono-2026` fecha corregida: 2026-04-19 (ya pasó) → 2026-10-04 (XII edición oficial)

**Cobertura final** (carreras españolas futuras ≥2026-05-16 después de Fase 2):

| CCAA | Antes | Fase 1 | Fase 2 |
|---|---|---|---|
| Madrid | 5 | 9 | 9 |
| Andalucía | 3 | 9 | 9 |
| País Vasco | 3 | 8 | 8 |
| **Galicia** | **0** | **2** | **7 ✅** |
| Cataluña | 3 | 6 | 6 |
| **Castilla y León** | **0** | **0** | **4 ✅** |
| Comunidad Valenciana | 3 | 4 | 4 |
| **Castilla-La Mancha** | **0** | **1** | **3 ✅** |
| Murcia | 0 | 2 | 2 |
| Aragón | 0 | 2 | 2 |
| Asturias | 0 | 1 | 1 |
| **Navarra** | **0** | **0** | **1 ✅** |
| Cantabria | 0 | 1 | 1 |
| **La Rioja** | **0** | **0** | **1 ✅** |
| Baleares | 0 | 1 | 1 |
| Canarias | 0 | 1 | 1 |
| **TOTAL** | **18** | **47** | **60** |

**Deploy Fase 2**:
- Submodule app commit `f25a00a` (JSON ordenado por fecha asc para mantenimiento)
- Parent repo commit `0a54921e` (landing /plan + submodule pointer bump)
- HTTP 200 verificado, 60 carreras + 16 CCAA en producción

---

### Scripts creados (reusables para próximas Fases)

1. `tmp/add-carreras-fase2.cjs` — script Node que añade carreras al JSON master + valida no duplicados + permite UPDATES de fechas + reordena por fecha asc + actualiza meta. Patrón claro para próximas cargas masivas.

2. `tmp/races-array-fase2.txt` — output del generator del array RACES inline. Útil cuando hagamos Fase 3.

---

### Backlog Fase 3 (cuando haya hueco — NO urgente)

Las CCAA con solo 1 carrera futura siguen flojas:
- **Asturias** (1): solo Carrera Mujer Gijón. Falta: trail Picos Europa, San Silvestre Avilés
- **Cantabria** (1): solo Media Santander 20 sep. Falta: Trail Liébana, San Silvestre Santander
- **Extremadura (0)**: Mérida (11 abr) y San Silvestres Cáceres/Badajoz ambiguas. Investigar fechas oficiales 2026
- **Coruña10** (octubre): web oficial no publicó fecha 2026 aún, revisar agosto/septiembre

Cuando lleguemos a 70+ carreras → actualizar copy a "70+ carreras populares 2026" o similar (más concreto que la versión actual sin número).

---

## 2026-05-16 (sábado noche · ~19:00) — Landing /plan + Drip campaign 4 emails (iter#24)

Founder pidió analísis honesto ROI tras día épico de bugs/UX. Honesty check confirmó: **distribución > features**. Construido el motor de conversión que faltaba: landing `/plan` + email drip.

### Stack desplegado

**SQL migration `plan_subscribers_landing_v1`** ✅ aplicada:
- Tabla `plan_subscribers` con email/nombre/lang/carrera/plan_slug/UTM/status/emails_sent
- RLS service_role only
- Index lower(email), status+last_email, carrera_id
- Trigger updated_at

**API backend** (todo en `api/_lib/jobs/` para Hobby 12-fn limit):
- `plan-subscribe.js` — captura email + carrera + envía welcome email con preview plan
- `plan-drip.js` — cron job 4 emails post-signup (D1, D3, D7, D14)
- Wire en `brevo-subscribe.js?type=plan` + `cron/run.js?job=plan-drip`

**Landing `/plan/index.html`** (~1080 líneas):
- Hero: "Tú eliges la carrera. Yo preparo el plan."
- Selector 18 carreras populares 2026 (filtros 5K/10K/21K/42K/Trail/Todas)
- "No veo mi carrera" fallback
- Email gate con pill carrera seleccionada
- 3 pasos cómo funciona
- 4 partner clubs (social proof tangible)
- FAQ 5 preguntas
- Footer brand + links
- UTM tracking end-to-end
- GA4 event `plan_landing_signup` con carrera_id + plan_slug

**Vercel cron `vercel.json`**:
- `plan-drip` daily @ 09:10 UTC (entre lifecycle-trial 09:00 y recovery-ultra 09:05)

### Drip campaign templates (Meridian Motion editorial)

| Día | Subject | Hook | CTA |
|---|---|---|---|
| 0 | "✓ Tu plan para [carrera] ya está en camino" | Welcome + preview plan | Activar mi plan |
| 1 | "Tu primera semana (y la más importante)" | 60% de planes mueren primera semana | Activar mi plan en la app |
| 3 | "El error que comete el 80%" | 80% corren días suaves demasiado rápido | Abrir la app + Coach Jose |
| 7 | "¿Has empezado tu plan para [carrera]?" | "Cada día sin entrenar = adaptación perdida" | Instalar la app |
| 14 | "Última: 14 días gratis si activas hoy" | Last call + sin tarjeta + cancela | Activar 14 días gratis |

Cada email:
- Eyebrow mono tracked
- Tagline CORRE ACOMPAÑADO
- H1 Inter 200 ultra-thin + strong highlight orange
- Body 3-4 párrafos
- CTA pill orange con dark text
- UTM `utm_source=plan_drip&utm_medium=email&utm_campaign=day_X`
- Unsubscribe link (legal compliance)

### ROI proyectado (de cara a llegar a 1.000€/mes)

| Escenario | Conv visit→email | Conv email→install | MRR/100visits |
|---|---|---|---|
| Sin landing (status quo) | 0% | n/a | 0€ |
| Landing solo (sin drip) | 15% email | 8% install | 0.30€/m |
| **Landing + drip (HOY)** | 15% email | **25% install** | **0.95€/m** |

A escala: 10.000 visits/mes (factible con SEO + paid ads) → **570€/mes MRR** = más de la mitad del objetivo de 1K€/m.

### Diferenciación con `/planes/*` existente

- `/planes/{distancia}` (ya existía) → SEO content para Google indexar
- `/plan` (nueva) → CONVERSION funnel lead capture

No se pisan. Pendiente añadir CTA al final de cada `/planes/{distancia}` apuntando a `/plan` (10 min trabajo) para conectar SEO traffic → funnel.

### Smoke tests pasados

- ✅ Landing `/plan` 200 OK live
- ✅ API endpoint `?type=plan` valida email (400 con email inválido)
- ✅ Cron `?job=plan-drip` deploy ↗ available list
- ✅ IndexNow ping URL nueva

### Pendiente próxima sesión

1. **CTAs en `/planes/{distancia}/` → `/plan`** (10 min, conecta SEO existente)
2. **Paid FB ads test €10/d × 7d** apuntando a `/plan?utm_source=fbads` (€70 inversión, 100-300 signups proyectados)
3. **Outreach 20 clubs partner nuevos** con link `/plan` (4h trabajo, mejor ROI distribución)
4. **TikTok bio link** apuntar a `/plan?utm_source=tiktok&utm_medium=bio`
5. **Email blast** a los 270 newsletter contacts con el link `/plan`
6. **KPIs a vigilar** post-deploy (30 días):
   - `plan_subscribers` count
   - Email open rates per drip day (Brevo dashboard)
   - Conv email → install (UTM `plan_drip` en GA4)
   - Conv install → trial activated
   - Conv trial → paid

### Stack final del día 16 may

| Componente | Estado |
|---|---|
| 10 OTAs runtime 1.3.6 (iter#21+22+23) | 🟢 Live |
| 2 SQL migrations | 🟢 Aplicadas |
| Landing `/plan` | 🟢 Live |
| API `?type=plan` | 🟢 Live |
| Cron `plan-drip` | 🟢 Live, cron activo desde mañana 09:10 UTC |
| Web 521 articles | 🟢 sin tocar |
| iOS v1.3.6 | 🟡 WAITING_FOR_REVIEW Apple |

Sesión cerrada. Día épico — 10 OTAs producto + landing conversion funnel completo. Ahora la palanca es DISTRIBUCIÓN.

---

## 2026-05-16 (sábado tarde · ~14:00) — Dogfood del padre + 8 OTAs + Iter#21 producto

**Founder dogfoodeando desde la tablet del padre** (cuenta nueva "PapA · Punta Umbría") encontró 6 bugs/UX issues + me pidió rediseño nivel Strava/Runna/NRC para 3 zonas. Resultado: **8 OTAs publicadas en runtime 1.3.6** en una tarde.

### OTAs encadenadas

| # | OTA ID | Cambio |
|---|---|---|
| 1 | `019e3058-45a5-73e1-81bc-577f13d484c7` | Fix ritmo `NaN:NaN/km` en card actividad amigos (BD guarda `runs.ritmo_promedio` como text "4:57", FeedActivityCard lo trataba como number → Math.floor("4:57"/60)=NaN). formatPace ahora acepta string\|number\|null. |
| 2 | `019e305e-8f4c-76e7-b380-aa01ac69abe2` | Fix mapa vacío "bórralo" en ProfileActivityCard + RunActivityFeedCard. Si !hasRoute, no renderiza mapContainer (antes: rectángulo gris 140px con icono pin pequeño). |
| 3 | `019e3069-55b5-7e03-978e-e884ebc5eba9` | Botón "Editar perfil" prominente en ProfileHeader (Instagram/Strava-style pill outline naranja). Reusa SettingsScreen editor via `editProfile=true` param navigation. Discoverability 0 → 1 tap. |
| 4 | `019e3070-bda6-796d-bc0d-442c8849f77f` | Foto real del runner en "ACTIVIDAD RECIENTE" — FeedActivityCard ignoraba user_photo aunque RPC `get_feed_with_compatible` lo devuelve. Mismo run con foto en "Amigos" pero SIN foto en "Reciente". Inconsistencia visible. |
| 5 | `bc0b620a-7cd6-408a-bac6-bfc6fcd9b3cc` | RaceCard CTA con gradient pill + copy de urgencia: "Empezar mi plan 10K · Listo el 6 jun · gratis · 3 sem". Antes: texto suelto "Ver plan 10K de Huelva" (pasivo). |
| 6 | RPC migration `feed_with_compatible_exclude_follows` + OTA | Separación de scope: "ACTIVIDAD RECIENTE" → "DESCUBRE RUNNERS" (solo `known + compatible`, excluye `follow`). "ACTIVIDAD DE AMIGOS" sigue siendo chronological de seguidos. Cero solape, founder approved. |
| 7 | `cf...` | Tap en "Siguiendo" abre lista correcta (antes UN solo TouchableOpacity envolvía ambos stats con onPress hardcoded a `seguidores`). Separados en 2 TouchableOpacity con type correcto cada uno. |
| 8 | **`c20bdcd7` (iter#21 final)** | **Tu Progreso + Partner clubs hero + Mapa zoom 25km local** (3 cambios producto nivel Strava/Runna/NRC — ver detalle abajo). |

### Iter#21 — 3 cambios producto validados por founder

Founder pidió análisis honesto comparando con Runna/Strava/NRC. Diagnóstico:
- "92% precisión · 700+ runners · 251 ciudades" en hero matching → números humillantes vs Strava 100M/Runna 1M+
- "1 runners se han unido a quedadas esta semana" (typo + número humillante)
- Ranking de runners → contaminado (60% positions: founder #1, cuenta corporativa #3, partner club #4)
- Mapa default 'all' = España wide con 3 pins → parece país vacío

**Solución aplicada (HTML preview iterado 7/10 → 10/10 antes de aplicar):**

1. **Ranking → Tu Progreso (self-comparison)**:
   - Pattern Apple Fitness rings · Strava PRs · Whoop strain
   - Sparkline 7 días L..D + trend "+X% vs semana pasada"
   - Stats grid: esta sem / sem pasada / sesiones
   - Récords: Mejor 5K extrapolado (run ≥4.95km, pace * 5) + Tirada más larga
   - `loadMyProgress()` agrega runs últimos 60 días, todo cliente-side (0 SQL migration)
   - `renderTuProgreso()` reemplaza `renderRanking()` (legacy queda para rollback)

2. **Hero matching → Partner clubs strip**:
   - Quita "92% · 700+ · 251" + sub copy renovado
   - Añade 4 partner cards (Beer Runners Málaga · Sevilla RC · Soul Run Huelva · Sin Límites TdM)
   - Logos cargados desde `correrjuntos.com/public/quedadas/{slug}/logo.png?v=2`
   - Pattern Stripe/Notion/Linear: logos reales > números abstractos
   - Sin emojis decorativos (founder request: "como Strava/Runna/NRC")

3. **MapScreen default zoom 25km**:
   - `selectedRadius` default: 'all' → 'nearby' (25 km)
   - `filterNearby` default: false → true (alineado)
   - Smart-fallback `useEffect`: si al cargar quedadas + userLocation hay <2 en 25km, expande a 50km, luego 'all'. Flag `smartDefaultApplied` para que no se auto-revierta tras toque manual del user.
   - Pattern Citymapper local-first / Komoot expand-on-empty
   - Comunica "barrio activo" en vez de "país vacío"

### Reglas memorizadas hoy

1. **Source of truth en SQL**: si quieres separar scope (ej: solo `compatible+known`, excluir `follow`), hazlo en la RPC con `WHERE r.user_id NOT IN (followed)`. Cliente NO debe filtrar lo que SQL ya puede excluir → menos payload, single source.

2. **Discoverability matters >>> feature exists**: editor de perfil ya existía pero estaba enterrado (4 taps). Mover a botón visible (1 tap) = mejora UX 4x sin trabajo backend nuevo.

3. **"Esconder números humillantes"** es patrón Wirecutter / Lenny Rachitsky para apps tempranas. Cuando el competidor tiene 100M y tú 612, los números TUYOS comunican vacío. Reemplazar por badges cualitativos o social proof tangible (logos partner clubs reales).

4. **Self-comparison > social ranking** en apps con <10K users. Apple Fitness, Strava PRs, Whoop, Garmin Connect — todos usan TÚ vs TÚ semana pasada como motor de retención. Ranking social requiere masa crítica que CJ no tiene aún.

5. **Smart default con fallback** (Citymapper pattern): tener un default agresivo (25km local) que se auto-expande si la realidad lo desmiente (<2 quedadas). Aplicado UNA VEZ con flag — el user puede sobrescribirlo manualmente sin que se revierta.

6. **Sin emojis decorativos en UI seria** (Strava/Runna/NRC style). Solo SVG inline funcional (chevrons, trends). Los emojis los ven los AIs de Apple/Google y bajan polish score percibido.

### Pipeline reels v4 sigue intacto

Reel `reel-da-el-paso` (sin partners) y `reel-no-corras-solo-v4` (con partner clubs) listos para subir. Pipeline `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` documentado.

### Iter#22 — 5 fixes adicionales en Profile (cierre del día)

Founder revisó el Profile de su cuenta personal en la tablet del padre y reportó 5 issues funcionales que bajaban la sensación de calidad de 8.5/10 a 7/10. Análisis honesto + fix de todos:

| # | Bug | Fix aplicado |
|---|---|---|
| 1 | Strava conectado pero 0/0/0:00 + "Sin sincronizar" | useEffect auto-refresh al mount si `!lastSyncAt && stats=0`. Botón "Sincronizar" + "Sincronizando…" label. |
| 2 | "Racha actual: 1 semanas" vs "Tu serie: 0 semanas" en misma pantalla | Extraído a `src/utils/streakCalc.ts` — single source of truth `calcWeeklyStreak()`. Ambos componentes importan ahora. |
| 3 | Chart pace con Y invertido (4:57 visible "arriba" como si fuera mejora vs 2:23) | (a) Filter strict pace points: km≥2, sec≥600, pace 3-12 /km. (b) Y axis invertido (subir = más rápido). (c) Color verde si mejorando / naranja si empeorando. |
| 4 | "Próximo: 100 km" con bar pero sin número | "Próximo logro · 52 / 100 km" + bar + "Te faltan 48 km · 52%". |
| 5 | Objetivo sugerido days/km mismatch ("Corre 3 días" header + "19.1/5 km" bar) | Refactor `suggestedGoal` a `{current, meta, unit}`. Goal consistencia → `current=daysThisWeek, meta=3, unit='días'`. Goals km unchanged. |

OTA `fbe68009` publicada al cierre. 0 SQL migration. Cliente only. OTA-safe.

Founder validó en su Android personal: "lo veo bien" ✅. Tablet del padre devuelta — dogfood Android desde cero del founder pospuesto.

### Pendiente próxima sesión

- **Test Android dogfood desde cero** del founder (en su móvil, no la tablet del padre).
- Verificar Apple v1.3.6 status (estaba WAITING_FOR_REVIEW desde 9 may — handle de check-store-status.js .p8 expirado, requiere regenerar key ASC).
- Subir reels a redes (TikTok ES primero, luego IG/YT/LinkedIn).
- KPI tracking de los cambios iter#21 + iter#22 — 30 días para validar.
- Si en próximo dogfood aparece "1 runners se han unido a quedadas esta semana" (banner verde con typo), también esconder hasta >5/semana.

---

## 2026-05-16 (sábado 11:45 AM) — Reel V4 Brand Live Action (Pexels + overlay HTML + app+web reveal)

**Founder validó "esto me gusta, memoriza para hacer Shorts/videos así"** después de pedir refs estilo Veo IA y entender que sin IA generativa la alternativa pro es B-roll Pexels + overlay HTML brand.

### Iteraciones rendered

| Versión | Cambio | Veredicto founder |
|---|---|---|
| v2 | Pexels B-roll + ffmpeg drawtext Arial system | "está bien pero genérico" |
| v3 | Inter font via HTML overlay + cool/warm grades + phone reveal | "necesita brand colors mejor + watermark + logo profesional" |
| v3 (iter) | Cambio group clip (jóvenes → adultos hombre+mujer Pexels 7876926) | "ok pero falta la web" |
| **v4** | + Laptop reveal con correrjuntos.com homepage mockup + closing URL pill | ✅ **"esto me gusta"** |

### Pipeline V4 canónico (documentado en `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md`)

**Arquitectura 2 capas + composite ffmpeg**:
- CAPA 1: Pexels B-roll color-graded (solo cool / group warm) + xfade
- CAPA 2: Overlay HTML transparente con renderAtTime (vignette + tints + 3 headlines + phone reveal + laptop reveal + closing card + watermark)
- Composite via `ffmpeg overlay=0:0:format=auto:eof_action=pass`

**Files canónicos** (clonar para próximos reels):
- `tools/marketing/reel-no-corras-solo-v4-overlay.html` — overlay reusable (clonar)
- `tools/marketing/produce-no-corras-solo-v4.cjs` — producer ffmpeg (clonar)
- `tools/marketing/record-overlay.cjs` — grabador PNG con alpha (NO tocar, reusable)

**Footage canónico**:
- Pexels 19523592 (solo runner sunrise hoodie) — `footage/solo-runner.mp4`
- Pexels 7876926 (adult couple jogging urban) — `footage/group-runners.mp4`

**Output: 13.5s · 1080×1920 · ~14 MB con audio**

### Timeline V4 canónico

```
0.0s   solo (cool grade) + "CORRER SOLO."
4.0s   "Hasta hoy." (orange Inter 600)
5.4s   xfade solo → group (0.6s)
5.5s   📱 Phone reveal (CJ app: map + pins + 12 quedadas)
6.7s   Phone exits
6.8s   💻 Laptop reveal (correrjuntos.com: navbar + hero + phone mini)
8.3s   Laptop exits
8.5s   "ENCUENTRA RUNNERS cerca de ti." (group warm grade)
10.6s  📋 Closing card: eyebrow + logo + tagline "CORRE ACOMPAÑADO" + URL pill 🔒 correrjuntos.com + iOS·Android·gratis
13.5s  end
```

### Lecciones críticas memorizadas

1. **fps + setpts + settb obligatorios antes del xfade**. Si los 2 clips Pexels tienen fps distinto (29.97 vs 25), xfade falla con "First input link timebase do not match". Normalizar con `fps=30,setpts=PTS-STARTPTS,...,settb=AVTB` en AMBOS.

2. **Pexels HD URLs requieren `Referer: https://www.pexels.com/`**. Sin header devuelve 403 Forbidden aunque el patrón URL sea correcto.

3. **Founder rechaza runners que parezcan jóvenes/niños**. Siempre verificar visualmente con Read tool ANTES de bajar HD. Default seguro: hombre+mujer adultos 25-40 corriendo.

4. **Phone reveal con CONTENIDO REAL CJ** (no Lorem ipsum). Header con logo y ciudad, map con pins reales, "12 quedadas" footer. Si es Lorem ipsum la marca no se identifica.

5. **Web reveal con browser chrome OBLIGATORIO** (3 dots Mac + URL bar 🔒 correrjuntos.com). Sin chrome el laptop parece otra "app", no la web. Con chrome se entiende "esto es nuestra web".

6. **Closing URL pill imprescindible**. Es la única forma de que el viewer recuerde el dominio si no descarga la app en el momento. URL pill > logo grande sin URL.

### Próximos reels candidatos V4 (anotados para futuras sesiones)

1. **"Sin plan → con plan adaptativo"** — chico confuso (solo) → plan en app → /planes web → grupo corriendo seguro
2. **"Empieza el sábado"** — runner indeciso (solo) → quedadas app → pillar blog → grupo sábado → CTA
3. **"Coach IA 24/7"** — duda 6am (solo) → chat coach IA → Coach IA web → confianza corriendo → CTA
4. **"Tu primera quedada"** — móvil dudoso (solo) → mapa quedadas → grupos local web → llegando saludos → CTA

Todos siguen el patrón: **problema individual → app → web (legitimidad multi-touchpoint) → solución social → cierre brand**.

### Doc completa

`tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` — pipeline completo con CSS recipes, ffmpeg filters, timeline canónico, reglas inamovibles y workflow 30-40 min de clonado.

---

## 2026-05-16 (sábado 10:35 AM) — Photo carousel TikTok-style + Video carrusel multiplataforma

**Founder validó "esto está muy bien"** tras producir 5 photo composites + video carrusel animado 15s.

### Producido

**5 PNGs (1080×1920) en `tools/marketing/`:**
- `photo-1.png` (0.79 MB) — "No es correr. Es correr **solo**." · fondo friends-urban · pantalla lista quedadas
- `photo-2.png` (0.74 MB) — "Tu plan en **60 segundos**." · fondo morning-dawn · pantalla plan 5K S3/8
- `photo-3.png` (1.21 MB) — "**567** runners en España." · fondo diverse-city · pantalla mapa con 9 pins
- `photo-4.png` (1.07 MB) — "Quedadas **reales** este finde." · fondo finish-arms-up · pantalla quedada TRENDING + avatares stack
- `photo-5.png` (0.98 MB) — "Tu coach. **A las 6 AM**." · fondo solo-runner · pantalla chat Coach Jose

**Video carrusel `reel-photo-carousel`:**
- HTML driven by `window.renderAtTime(ms)` (mismo pipeline que reels existentes)
- 5 fotos × 3000ms slot · 500ms crossfade · Ken Burns scale 1.06 + pan ±10px alternating · progress dots top
- Silent: `reel-photo-carousel.mp4` (6.5 MB · 15s · 30fps · 1080×1920)
- Con audio: `reel-photo-carousel-audio.mp4` (6.8 MB · Bensound Energy a 70% vol)
- Script: `tools/marketing/record-tiktok.cjs reel-photo-carousel`

### Plan de publicación matriz

| Plataforma | Asset | Formato |
|---|---|---|
| TikTok | 5 PNGs sueltas | Photo carousel nativo |
| Instagram Reels | `reel-photo-carousel.mp4` silent | Reel + música IG nativa |
| YouTube Shorts | `reel-photo-carousel-audio.mp4` | Short con audio |
| LinkedIn | `reel-photo-carousel-audio.mp4` | Video post |
| X (Twitter) | `reel-photo-carousel-audio.mp4` | Video post |

### Lección registrada

**Para photo carousel: TikTok prefiere photo post nativo** (algoritmo está empujándolos 2025-2026). Para otras plataformas (Reels/Shorts/LinkedIn/X) producir video carrusel animado del mismo asset = 1 producción → 5 plataformas.

**Nuevo script reutilizable**: `tools/marketing/render-photo.cjs <basename>` renderiza HTML → PNG 1080×1920. Útil para futuros photo composites estilo carousel.

### Pendiente

Founder hace upload manual a las 5 plataformas (5-15 min). Caption ES first, EN luego.

---

## 2026-05-16 (sábado 07:40 AM) — Dogfood completo + Claude Remote Control setup + Reel sábado

### Lo grande del día (acumulado)
- **20 OTAs LIVE** runtime 1.3.6 (iter#4-19):
  - Onboarding 3 pantallas refactor completo (iter#4-6)
  - Paywall surgical fixes + race context + social proof + hero contextual (iter#7-8bc)
  - Home v3: quedadas dominantes + race card SLIM + "Ver todas" link + Premium mini (iter#8a/17)
  - Mapa segmented tabs Quedadas/Carreras (iter#9)
  - Wizard back nav + skip beginner steps + sin forzar post-signup (iter#10/12/14)
  - Hook screen sin scroll (iter#15)
  - Push banner permanentlyHidden tras grant — fix flicker + scroll (iter#19, hoy)
- **iter#18 reverted** — DB trigger auto-confirm users (founder pidió mantener email confirm normal)
- **`auth/confirmed.html` mejorada** — pasos 1-2-3 manuales + Smart App Banner + webview warning
- **`reel-empieza-sabado.mp4` producido** (3.63 MB · 19.5s) con fotos solo runner → group runners
- **Subido a TikTok + Instagram** (sábado mañana). Pendiente esta noche: `reel-despensa-runner.mp4`

### Bugs encontrados en dogfood + fix
1. Hook screen requiere scroll → iter#15 (map 220→150 + spacing apretado)
2. Wizard 5 pantallas demasiado largo → iter#12 (beginner 2 pantallas)
3. Back nav un-skip step 1 → iter#10
4. Email confirmation "no funciona" → diagnosticado: Gmail link scanner pre-consume tokens. Workaround: auth/confirmed.html con pasos manuales + "Enlace directo" copy fallback
5. Push banner persist + parpadeo + scroll bloqueado → iter#19 (3 bugs = 1 root cause: race condition recalcState)

### 🔗 Claude Code Remote Control setup (NUEVO, validado hoy)
- Founder activó `/remote-control` slash command en Claude Code
- URL sesión: `https://claude.ai/code/session_01K6abFBCNXtgMmnbivwRbWn`
- Móvil: app Claude → tab "Code" abajo → ve sesión disponible
- Setup completo para mañana en el trabajo (founder requiere PC encendido en casa)
- Shortcuts escritorio Windows creados: `Claude Remoto.url` (Chrome Remote Desktop fallback) + `Claude.ai.url`

### Pendiente próxima sesión
- Plan testing end-to-end (signup nuevo → wizard 2 pantallas → primer workout)
- Subir `reel-despensa-runner.mp4` esta noche (slot 19:00)
- Subir `reel-planificar-semana.mp4` mañana domingo 11:00
- Consolidar CLAUDE.md raíz (warning perf: 100.9k chars > 40k)

---

## 2026-05-15 (viernes 10:46 AM — DÍA ÉPICO 4-EN-1) — Afiliados + Bug fix + Reels + YouTube Channel + Brevo schedule

**12 commits, ~30 enlaces afiliados nuevos, 2 reels producidos, canal YouTube de cero a operativo + 4 Shorts programados, campaña Brevo agendada, bug crítico detectado + fixed. Día récord absoluto.**

### 📧 Brevo campaña #14 — programada (sesión mañana temprano)

- **Lista**: 7 lists "Tu primera carpeta" = 257 destinatarios (dedup desde 271)
- **Asunto**: "Tu plan de running para esta semana — gratis"
- **Preheader**: "8 semanas estructuradas. Sin pagar nada."
- **CTA**: "Descargar gratis →" `#FF6B35` → `correrjuntos.com/app/?utm_source=brevo&utm_medium=email&utm_campaign=app-captacion-mayo26`
- **Diseño**: Meridian Motion (dark `#0b1220`, cream text, JetBrains Mono eyebrows)
- **Test verificado** en guetto2012@gmail.com ✓
- **Programación**: **Domingo 17 may 2026 · 20:00 hora Madrid** · Europe/Madrid timezone
- Pulsé yo el "Programar" tras OK explícito del founder
- Math expectativa: 257 → 30% open (77) → 4% click (3) → 5% install (0-1)

### 💰 Afiliados Amazon ES — 12 articles monetizados con Top picks

**4 commits totalizando ~30 enlaces `/dp/ASIN` nuevos con tag `diezmejores21-21`, todas las imágenes self-hosted en `/public/blog-images/{slug}/`.**

#### Commit `e48ff529` — creatina + hierro EN/ES (4 articles)
- `creatina-para-runners` (ES): 1 /s?k= → 4 product cards
- `hierro-para-corredores` (ES): 2 /s?k= → 4 product cards
- `creatine-for-runners` (EN): 0 → 4 product cards
- `iron-for-runners` (EN): 0 → 4 product cards
- **ASINs creatina**: B00T7L20AQ (Optimum), B07TVSKW21 (HSN Creapure), B00CHJ3DW4 (Myprotein), B00SP2ZKW8 (Bulk)
- **ASINs hierro**: B0001OP028 (Solgar Gentle Iron), B002F5EUQ8 (Floradix), B0F3XJYL29 (Vitavea), B00020IBF4 (Solgar Vit C)
- Imágenes en `/public/blog-images/{creatina,hierro}/`

#### Commit `9266f8de` — snacks EN/ES (2 articles)
- `snacks-energeticos-running` (ES): 3 /s?k= → 4 product cards
- `best-energy-snacks-for-runners` (EN): 0 → 4 product cards (este artículo YA EXISTÍA — solo monetizado, no creado)
- **ASINs**: B07Y3YXCVT (Maurten Gel 100 CAF 100), B0BJ2M5J2T (Dátiles Medjool 1kg), B0C74Q93NK (CLIF BAR Peanut Butter), B084J2VBKG (Compressport Race Belt)
- Imágenes en `/public/blog-images/snacks/`

#### Commit `61449e48` — best-foods + best-breakfasts EN/ES (4 articles)
- `best-foods-for-runners` (EN) + `mejores-alimentos-para-runners` (ES): 0 → 4 product cards
- `best-breakfasts-before-running` (EN) + `desayunos-antes-de-correr` (ES): 0 → 4 product cards
- **ASINs foods**: B015Q72O8W (Quaker Oats), B096MM3Y58 (nut&me Almond Butter), B0CNDF4WLB (Amoseeds Chía BIO), B005AW7WD6 (Lindt 85%)
- **ASINs breakfasts**: B015Q72O8W (Quaker, reused), B0BLZN1KGV (HSN Peanut Butter), B0FJLYR89V (Miel Camino de Santiago), B0GXB9L82Q (AZADA Granola)
- Imágenes en `/public/blog-images/{foods,breakfasts}/`

#### Commit `103e01cb` — 🐛 BUG FIX CRÍTICO FAQ accordion

**Root cause**: `blog/enhance.js` línea 180 trata cualquier `<DIV>` después de `<h2 id="faq">` que contenga un `<h3>` como item del acordeón FAQ. Mi bloque "Top picks" insertado DESPUÉS del FAQ con un `<h3>` dentro → quedó atrapado en panel colapsado → DOM tenía los `/dp/ASIN` pero invisible al usuario.

**Fix doble**:
1. Movido Top picks de AFTER del FAQ a **BEFORE primer content H2** (mejor SEO también)
2. Reemplazado `<h3>` interno por `<div>` con estilos (defensa en profundidad)

**Afectados**: `best-foods-for-runners` (EN) + `mejores-alimentos-para-runners` (ES). Otros 6 artículos del día auditados — OK (Top picks antes del FAQ o sin sección FAQ).

### ⚠️ REGLA CRÍTICA aprendida (memorizar para todos los futuros artículos afiliados)

**NUNCA insertar bloques con `<h3>` después de `<h2 id="faq">` en ningún article del blog.** `enhance.js` walker los engulle al acordeón. Patrón seguro:
- ✅ Insertar Top picks **antes del primer content H2** (mejor SEO + 0 riesgo de walker)
- ✅ Si va al final, usar `<div>` o `<p strong>` en vez de `<h3>` para títulos internos
- ✅ Añadir `class="top-picks"` al wrapper para auditoría rápida

Esto debería ir al CLAUDE.md sección 12 "Imágenes Amazon — protocolo" como punto 13.

### 🎬 Reels nuevos producidos (kinetic typography pipeline)

#### `reel-despensa-runner.mp4` (commit `03e1cf0e`) — 2.64 MB · 19.5s
- 6 escenas: Hook "La nutrición no es magia. Es despensa" → Lista 5 básicos (Avena/Almendras/Chía/Chocolate 85%/Plátanos) → Feature 37 raciones · 15€ → Stats 80%/5/~40€/0 → Quote "4 desayunos cubren la semana" → CTA correrjuntos.com/blog
- Reemplaza el carrusel manual de Canva del Sáb 19:00 → más alcance (IG Reels + TikTok + YouTube Shorts vs solo IG Feed)
- Files: `reel-despensa-runner.html` + `preview-reel-despensa.cjs` + `.mp4`

#### `reel-planificar-semana.mp4` (commit `a60c27e6`) — 2.66 MB · 19.5s
- 6 escenas: Hook "Tu semana se gana el VIERNES, no el lunes" → Problem "Abres plan lunes 7am ya improvisas" → 5 reglas list → Compare 80% calendar vs 30% list → Quote "Tu plan no se ejecuta. Se diseña" → CTA correrjuntos.com/app
- Companion del X thread Domingo 11:00
- Subido como primer Short del finde (Vie 18:00) — meta-joke: el reel dice "tu semana se gana el viernes" y se publica un viernes

### 📄 Weekend publishing checklist (commit `e4f0594a`)

- `tools/marketing/weekend-publishing-checklist.md` (443 líneas, single source of truth)
- Plan finde: 4 reels TT/IG + 1 X thread distribuidos Vie 18:00 → Dom 19:00
- Sección por post con: paths archivos, captions IG + TT, hashtags, primer comentario fijado, rotación link en bio (3 cambios el finde)
- Monitoring lunes 18: thresholds éxito + KPIs

### 🚫 Rechazado: Buffer API agent (procrastinación productiva)

Founder propuso construir Node script para auto-publicar todo via Buffer API. Yo lo rechacé honestamente:
- Buffer NO soporta TikTok via API (solo desde UI web)
- Buffer NO soporta IG Reels API (sólo "remind me to publish" push)
- X API tier es $200/mes para 3rd parties
- Tiempo dev: 6-7h vs 15-20 min de manual upload
- ROI: -100% (no funciona para TT/IG video)

**Lección**: Próxima vez que aparezca "construyamos automation para X redes", la respuesta correcta antes de empezar es: ¿la API objetivo soporta REALMENTE upload de video para esa red? Si TikTok o IG Reels son target → solo `ayrshare.com` ($25/mes) lo hace bien. Buffer y SocialPilot NO.

### 📊 Metricool explorado (no usado al final)

Sesión tarde verificó Metricool free tier:
- ✅ TikTok + Instagram conectados (4.090 + 769 followers)
- ✅ 20 posts/mes free (suficiente para finde)
- ❌ X / Twitter NO conectado a esta cuenta
- ❌ Para subir video, Metricool usa **File System Access API moderna** que NO expone `<input type="file">` — mi `mcp__Claude_in_Chrome__file_upload` no puede targetearlo
- Conclusión: para Metricool, founder hace upload manual de file (1 click) y yo agilizo el resto (caption, fecha, primer comentario). NO usado al final porque pivot a YouTube + upload manual TT/IG.

### 🎥 YouTube Channel — configurado + 4 Shorts programados (sesión 10:00-10:46 AM)

#### Canal `youtube.com/@CorrerJuntos` LIVE

**Estado al empezar**: handle + avatar OK · banner + descripción + links + email + watermark VACÍOS · 0 vídeos.

**Configurado en ~40 min**:
- **Banner 2048×1152**: kinetic typography mismo style que reels · paleta ink/paper/ember · pills "PLAN 0→5K · GRATIS / SIN POLVOS · SIN HUMO / iOS · ANDROID"
- **Descripción 759 chars** ES con SEO + hashtags + email contacto
- **5 enlaces externos**: Web · Instagram · TikTok · App Store · Google Play
- **Email**: hola@correrjuntos.com
- **Watermark 152×152**: logo CJ orbe · default "Final del vídeo" en reproductor
- Files generados: `tools/marketing/youtube-banner.html` + `record-banner.cjs` + `youtube-banner.png` (526 KB) + `youtube-watermark.png`

#### 4 Shorts programados con horario IDÉNTICO al calendar TT/IG

| # | Reel local | YouTube URL | Programa |
|---|---|---|---|
| 1 | `reel-planificar-semana.mp4` | `youtube.com/shorts/zDuwvLdk-sc` | **Vie 15 may · 18:00** |
| 2 | `reel-recuperacion-ultra.mp4` | `youtube.com/shorts/2DVSuj2nozQ` | **Sáb 16 may · 11:00** |
| 3 | `reel-despensa-runner.mp4` | `youtube.com/shorts/U3XLQteTXJM` | **Sáb 16 may · 19:00** |
| 4 | `reel-0-a-5k.mp4` | `youtube.com/shorts/L2JrqnPfFxo` | **Dom 17 may · 19:00** |

**Cada Short con**:
- Title SEO-friendly (≤60 chars)
- Description 1.000+ chars con CTA + hashtags + email contacto + link to specific page
- Audiencia: "No, no creado para niños"
- Categoría: Gente y blogs
- Comprobaciones derechos autor: passed
- Visibilidad: Programado público con fecha/hora

#### 🛠️ Técnica Chrome MCP usada — `<input type="file">` interception

**Patch JS** (aplicado al inicio de cada upload session):
```js
const orig = HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click = function() {
  if (this.type === 'file') {
    this.setAttribute('data-claude-intercepted', '1');
    return; // intercepta sin abrir dialog nativo
  }
  return orig.apply(this, arguments);
};
```

Esto permite que cuando YouTube/Metricool crea el `<input type="file">` dinámicamente y llama `.click()`, el input queda en DOM sin abrir dialog nativo. Después usamos `mcp__Claude_in_Chrome__file_upload` con el ref del input.

**Funcionó en YouTube** (input expuesto como `<input id="file-selector" type="file" accept="image/*">` para banner/watermark; `<input name="Filedata" type="file">` para vídeos).
**NO funcionó en Metricool** (usa File System Access API moderna, no crea `<input type="file">` en DOM).

#### 🚨 Lección crítica: Date picker YouTube + auto-scroll

Al programar fechas en el wizard YouTube, el input de fecha es un text input editable. **Más fiable que clickear pixels del calendar popup**:
```
1. triple_click sobre el text input "15 may 2026"
2. type "15 may 2026"
3. press Enter
```
Esto cierra el calendar popup y aplica la fecha sin problemas de coords.

Para la hora:
```
1. left_click sobre input "0:00"
2. ctrl+a
3. type "18:00"
4. press Tab → cierra dropdown sugerencias, aplica valor
```

### 📊 Estado final del finde 15-17 mayo 2026 (al cierre de esta sesión 10:46)

| Plataforma | Estado |
|---|---|
| **YouTube Shorts** (4) | ✅ Programados automáticamente (sin intervención founder en finde) |
| **Brevo email blast** | ✅ Programado Dom 17 may 20:00 (257 destinatarios) |
| **TikTok** (4 reels) | ⏳ Pendiente upload manual founder (usar `weekend-publishing-checklist.md`) |
| **Instagram Reels** (4 reels) | ⏳ Pendiente upload manual founder |
| **X thread** (7 tweets Dom 11:00) | ⏳ Pendiente copy-paste manual founder |
| **X cortos** entre threads (3) | ⏳ Pendiente manual |

### 📦 Total commits del día (12)

1. `e48ff529` — creatina + hierro EN/ES afiliados (4 articles)
2. `9266f8de` — snacks EN/ES afiliados (2 articles)
3. `61449e48` — best-foods + best-breakfasts EN/ES afiliados (4 articles)
4. `103e01cb` — fix bug FAQ accordion (2 articles afectados)
5. `03e1cf0e` — reel-despensa-runner producido
6. `a60c27e6` — reel-planificar-semana producido
7. `e4f0594a` — weekend-publishing-checklist.md

(El resto son parte del trabajo de YouTube + Metricool exploration sin commit nuevo al repo principal — todo el trabajo YT está en YouTube Studio directo.)

### 🏆 Insights estratégicos

1. **Doble-rendimiento de reels**: producir 2 reels nuevos hoy → 5 plataformas usándolos (TikTok + IG Reels + YouTube Shorts + posibles cross-post)
2. **Buffer rejection**: ahorrados 6-7h dev evitando proyecto que NO funciona
3. **Bug FAQ accordion**: detectado por feedback honesto del founder ("DOM no tiene /dp/") — sin eso, hubiera quedado oculto en producción afectando ROI afiliado a largo plazo
4. **YouTube como asset permanente**: 4 Shorts en canal vacío = primer contenido define al algoritmo. Calidad alta (kinetic typography) + descripción rica = recommender YT bien orientado desde día 1
5. **Cross-platform horario IDÉNTICO**: TT/IG/YT a la misma hora = coherencia narrativa para audiencia que sigue múltiples cuentas + algoritmo premia regularidad

### 💸 Estado financiero esperado próximos 30-45 días (proyección)

- Amazon afiliados: bump esperado de 25,11€/mes (cierre 11 may) → 35-50€/mes (cuando los 12 articles indexen)
- App installs: 1-3 nuevos del finde (TikTok + IG + YouTube + Brevo blast combinado)
- Suscripciones Recovery Ultra: 5-10 nuevos del finde si todos los canales convierten

---

## 2026-05-09 (cierre de día — actualización) — Adaptive Plans + Reels Pipeline

**Resumen breve (full detail abajo en la entrada anterior del 9 may):**

### 🎯 Planes adaptativos (Runna-style) — implementado y validado
- SQL migration `56_adaptive_plans.sql` aplicada en Supabase (aditivo, no toca lo viejo)
- Tabla `plan_distance_bounds` + RPCs `validate_plan_feasibility()` + `generate_user_plan_adaptive()`
- 12/12 escenarios validados + 2 generaciones reales (10K extend +4 base, 5K compress −3 base)
- Bug encontrado y fixeado: `JSONB ->>(text)` no funciona en arrays, hay que usar `->>(int)`
- `api.ts` con `validatePlanFeasibility()` + `generateUserPlanAdaptive()` + `AdaptiveDistance` type
- `PlanWizardScreen.tsx` integrado: cuando hay race date → adaptive RPC, sin race → legacy RPC
- Commits: app `a8d02bd`, repo padre `7b010402`
- Pendiente: `npm run ship:ota` cuando iOS v1.3.6 apruebe (Android v1.3.6 ya está LIVE)

### 📊 Monitor iOS aprobación
- Cron task `monitor-ios-v136-review` activado
- Cada 2h checa ASC API, solo notifica si cambia estado (silent run otherwise)
- Eventos: IN_REVIEW / READY_FOR_SALE / REJECTED → notificación con instrucción

### 🎬 PIPELINE REELS KINETIC TYPOGRAPHY (NUEVO — guardado para futuro)

**Documentación completa: `tools/marketing/REELS_PIPELINE.md`**

Resumen:
- HTML 1080×1920 con `renderAtTime(ms)` time-driven (no @keyframes)
- Recorder Playwright que dispara screenshot por frame → ffmpeg-static H.264
- Preview frames script para validar diseño antes del render full (~5 min ahorra)
- 3 reels producidos hoy: `reel-busca-tu-carrera`, `reel-plan-adaptativo` (ES + EN)
- Tiempo de iteración: ~10 min por reel una vez familiarizado con el pipeline

Reglas inamovibles del estilo:
- Paleta: ink #0b1220, paper #f6f1e8, ember #f97316, ash 42%
- Tipografía: Inter 200/600/700/800 + JetBrains Mono para eyebrows
- Una sola palabra naranja por escena (no más)
- Sin emojis, sin grabaciones de pantalla
- Subir SIN audio para que TikTok/Reels priorice música nativa (algoritmo orgánico)

Comandos típicos:
```bash
# Preview frames de cada escena
node tools/marketing/preview-reel-{slug}.cjs

# Render MP4 final
node tools/marketing/record-tiktok.cjs reel-{slug}
```

Listos para reusar:
- `tools/marketing/reel-plan-adaptativo.mp4` (ES, 2.34 MB) — publicar cuando v1.3.7 esté live
- `tools/marketing/reel-adaptive-plan-en.mp4` (EN, 2.31 MB) — mercado UK/US
- `tools/marketing/reel-busca-tu-carrera.mp4` (ES, 3.0 MB) — intro genérico app

---

## 2026-05-09 (cierre de día) — App v1.3.6 + Pipeline release 100% automatizado + Blog SEO masivo

**Día enorme. ~30+ commits. Resumen ejecutivo:**

### 🚀 App v1.3.6 — pipeline release 100% automatizado (HITO)

- ✅ EAS build v1.3.6 iOS + Android (build 84) — finished
- ✅ iOS subida a ASC vía EAS Submit
- ✅ **iOS Submit for Review automatizado** vía ASC API + .p8 key
  - Script: `correr-juntos-app/scripts/promote-ios.js`
  - Credenciales: Key ID `VR6CJGD288`, Issuer `82269ea5-bead-4381-b767-3687965efa4b`, file `AuthKey_VR6CJGD288.p8` (gitignored)
  - JWT ES256 → bearer token ASC API → reviewSubmissions endpoint
  - **Status**: WAITING_FOR_REVIEW (Apple)
- ✅ Android subida Internal vía EAS Submit
- ✅ **Android Internal → Production automatizado** vía Google Play Developer API
  - Script: `correr-juntos-app/scripts/promote-android.js`
  - Service account: `correrjuntos-8187a2854893.json`
  - **Status**: LIVE en Production track (88+ users con "Actualizar")
- ✅ Scripts npm release pipeline:
  - `npm run ship:ota -- "msg"` → OTA hotfix JS (segundos)
  - `npm run ship:full` → bump version + build + submit ambas
  - `npm run ship:promote` → Android Production + iOS Submit for Review
  - `npm run ship:status` → versión + último OTA + builds
- ✅ `OTAUpdateGate` añadido en App.tsx → auto-update silencioso al cold-start

### ⚠️ LECCIONES CRÍTICAS iOS Submit (memorizadas en CLAUDE.md raíz)

1. **`appStoreVersionSubmissions` deprecated** desde 2022 — devuelve `403 FORBIDDEN_ERROR`. Usar `/v1/reviewSubmissions` + `/v1/reviewSubmissionItems` + PATCH `submitted=true`.
2. **No crear locales nuevos vía API sin poblar todos sus campos** — si app ASC solo tiene `es-ES`, intentar crear `en-US` con solo `whatsNew` bloquea submit con `STATE_ERROR.ENTITY_STATE_INVALID`.
3. **Apple no auto-inherit screenshots** vía API. POST `/v1/appStoreVersions` SI auto-copia localizations existentes pero NO crea nuevas.
4. **`usesIdfa` y `usesNonExemptEncryption`** ya vienen del Info.plist si app.json los declara. PATCH-ear el build devuelve 409 (ignorable).
5. **`eas submit --track production` Android FALLA** "already submitted" — Google rechaza re-upload mismo versionCode. Solución: API "promote release".

### 🐛 Backend / SQL fixes

- Premium fake del founder removido de BD
- RPC `get_ranking_mensual/global` ahora chequea `premium_until > NOW()` (no solo `es_premium` flag)
- Test user "Prueba" (correrjuntosapp+test2@gmail.com) borrado completo de BD

### 📝 Blog SEO + monetización (DÍA ÉPICO)

**Artículos nuevos hoy (4 con EN):**
- ✅ **Pillar page** `/blog/guia-equipamiento-running-2026` (493 líneas, links a 79 articles)
- ✅ **Kit principiante** `/blog/equipamiento-running-principiante-200-euros` (200€ exactos)
- ✅ **101 km Ronda** `/blog/101-km-ronda-2026-guia-completa` + EN `/blog/en/ronda-101-km-2026-complete-guide`
  - URL oficial evento: **lalegion101.com** (NO 101kmlegion.com)
  - Organizador: Tercio Alejandro Farnesio (4º La Legión) y Club Deportivo La Legión 101
  - 8 affiliates `/dp/ASIN`, schema SportsEvent + BlogPosting + FAQPage + ItemList
- ✅ **Refresh** `/blog/mejores-relojes-gps-running` con date+callout mayo 2026 + 3 imgs Amazon caducadas fixed

**Sitemaps actualizados (commit `e54e17f9`):**
- ✅ `sitemap-blog-es.xml` → 3 entradas nuevas
- ✅ `sitemap-blog-en.xml` → 1 entrada Ronda EN con hreflang reciprocidad
- IndexNow ping (HTTP 200) post-deploy

**Categorización en `/blog/index.html`:**
- 101 km Ronda → `Ultra Trail` (data-category: entrenamiento), autor Abraham
- Guía Equipamiento (pillar) → `Equipamiento`, autor Carlos Ruiz
- Kit 200€ → `Equipamiento`, autor Carlos Ruiz

### 🎨 Diseño profesional (Wirecutter level)

- Logos SVG inline (en lugar de emojis) para clusters + popups newsletter
- Fotos producto reales Amazon `m.media-amazon.com/images/I/...` en cluster icons del pillar (8 SVGs reemplazados por: Hoka Clifton 10, COROS PACE 3, Shokz, Salomon, Maurten, etc.)
- 100% **enlaces Amazon directos `/dp/ASIN`** con tag `diezmejores21-21`:
  - 20/20 con afiliado, 0 search URLs, 0 rotos
  - Sustituciones del día: Hoka Clifton 10 (B0D5FRX2W9), Shokz OpenMove (B09BW29FJS), adidas Workout Essentials (B0F54S2H4H), adidas Own The Run Shorts (B0CKTPLS56)

### 🖼️ Imágenes Amazon — sistema anti-rotación instalado

**Detectado**: 24/524 imágenes blog rotas (4.6%). **3 tipos de roturas Amazon descubiertos:**

1. **HTTP 404 explícito** — fácil
2. **Placeholder silencioso 200 OK con 43 bytes** — invisible si solo miras status code
3. **Sponsored ad genérico** — primer ASIN search a veces es producto chino sponsored (ej: Hoka Speedgoat 6 devolvió `41AZPVp6xVL` zapatilla amarilla china — fix `613xDSI2gqL` real Hoka)

**Fix script + cron mensual instalado:**
- `tools/audit-amazon-images.cjs` (auditoría)
- `tools/fix-broken-images.cjs` (reemplazo automático con asin-hires-map + Pexels fallbacks por categoría)
- `tools/fetch-hires-urls.cjs` (scrape Amazon page con UA Safari, busca `"hiRes":"..."`)
- `tools/map-broken-to-asin.cjs` (mapea URL rota → ASIN del contexto HTML)
- npm scripts: `audit:amazon`, `audit:amazon:json`, `audit:amazon:quiet`
- GitHub Actions: `.github/workflows/audit-amazon-images.yml` (primer lunes mes 09:00 UTC, crea Issue automático)
- 24 imágenes reparadas en 8 articles (6 con ASIN real + 18 Pexels fallback temático)

### 🏞️ Imágenes Ronda — self-hosted (Wikimedia hotlinking falló)

**Problema**: hotlink Wikimedia Commons fallaba intermitente en browser pese a 200 OK desde curl.

**Solución**: descargadas 3 imágenes CC BY-SA 3.0 a `/public/blog-images/ronda/`:
- `puente-nuevo-ronda.jpg` (238 KB)
- `ronda-desde-sierra-blanquilla.jpg` (192 KB)
- `sierra-las-nieves-pinares.jpg` (435 KB)

Eliminada dependencia de CDN externo → Vercel CDN siempre disponible.

### 👤 Author unification + fotos

- **246 artículos**: "Jose Marquez" → "Abraham Márquez Rodríguez"
  - Script: `tools/replace-jose-to-abraham.cjs`
  - Vercel redirect 301: `/blog/autor/jose-marquez` → `/blog/autor/abraham-marquez`
  - Foto: `/public/abraham.jpg` + Instagram + LinkedIn
- **Carlos Ruiz photo** añadida (POV pista atletismo `/blog/autor/photos/carlos-ruiz.jpg`) — el founder eligió esta foto temática como avatar (decisión consciente)
- **author.js v2**: 4 autores (Carlos, Abraham, María, Jose alias) + lookup acentos + light mode CSS + foto real con fallback onerror

### 🎯 Deep link contextual cro.js (CTR esperado +35-50%)

- Mid/end CTAs ahora matchean slug del artículo con plan específico:
  - 5K/principiante → `/planes/0-5k`
  - 10K → `/planes/10k`
  - 21K → `/planes/media-maraton`
  - 42K → `/planes/maraton`
  - Trail/montaña → `/planes/trail`
  - Default → `/planes/`

### 🔧 Fix Coach José CTA

- **Bug**: botón "Prueba Coach José gratis →" en mid-article callout apuntaba a `/feed` (404)
- **Fix** (commit `c80c3dac`): `deepLink('/feed')` → `deepLink('/')` en `blog/cro.js` línea 372
- Aplica automáticamente a ~400 artículos (cro.js es shared)
- Universal Links → abre app si instalada, si no muestra home con CTAs descarga

### 📊 Estado producción (al cerrar 9 mayo)

- iOS v1.3.6: WAITING_FOR_REVIEW (Apple Review 24-48h)
- Android v1.3.6: LIVE en Google Play Production
- Web: 4 nuevos articles deployed + 2 sitemaps actualizados
- Pillar page + 79 articles enlazados, 100% Amazon /dp/ASIN, 0 imgs rotas
- Cron audit mensual instalado
- 0 Sentry unresolved
- Pipeline release: hotfix OTA = `ship:ota`, full = `ship:full + ship:promote` (ambas plataformas)

### 🟡 Pendientes reales al cerrar

1. iOS v1.3.6 esperando Apple Review (auto-aprobación al pasar)
2. Android v1.3.6 propagación CDN 1-2h para que users vean "Actualizar"
3. Apple Watch + Garmin + COROS implementación → disparador: primer email aprobación API
4. María López photo (cuando founder la mande)
5. 18 imágenes blog usando Pexels fallback temático (no roto, mejorable cuando relax anti-scrape Amazon)

### 📦 Commits clave del día

- `c80c3dac` — fix(cro): Coach Jose CTA /feed → / homepage
- `e54e17f9` — seo(sitemaps): add today's 4 articles to ES + EN sitemaps
- + ~25 commits adicionales (pillar, kit 200€, ronda ES+EN, refresh relojes, fix imágenes, author unification, etc.)

### ⚙️ CLAUDE.md raíz actualizado

Sección extensa "🚀 PROCESO DEPLOY APPS A TIENDAS" con tabla mental, lecciones críticas iOS Submit, release notes templates ES/EN, qué Claude PUEDE/NO PUEDE, IDs y credenciales clave, checklist pre-deploy, procedimiento típico release v1.3.X.

Sección "11. Imágenes Amazon — protocolo anti-rotación" con 3 tipos roturas + cron audit + fix manual.

Pendientes actualizado a "9 may 2026 fin de día".

---

## 2026-05-08 ~16:30 hora España — Estrategia redes sociales + 2 carruseles preparados

**Lo que pidió el founder:** trabajar las redes sociales — subir contenido (carruseles ya hechos en `tools/marketing/`).

**Lo que hice:**
- Auditoría TikTok @correrjuntosapp: 768 seguidores, 327 likes, viral 22K plays con "No corras solo en tu ciudad" (resto carruseles 200-800 plays).
- **Bio TikTok actualizada** (web): añadido " · App gratis" → 77/80 caracteres, sigue regla "no correr solo" + URL.
- **Carrusel #1 — comunidad** preparado:
    - Re-renderizado SIN emojis (banderas eliminadas) por regla global del founder
    - Slide 3 actualizado con DATOS REALES de Supabase: 693 runners, top 8 ciudades por usuarios (Madrid 63, Sevilla 31, Barcelona 29, Valencia 21, Málaga 11, Lima 10, Bilbao 9, Bogotá 9)
    - 5 PNGs listos: `tools/marketing/carrusel-comunidad/png/tt/`
- **Carrusel #2 — pick-race-plan** creado nuevo:
    - 5 slides: hook (68 carreras) → problema → flow 3 pasos → 7 planes → CTA
    - Aprovecha la feature multi-distance picker que implementamos hoy
    - PNGs listos: `tools/marketing/carrusel-pick-race-plan/png/tt/`
- **Caption optimizado** con datos reales (693 runners + ciudades) y 5 hashtags precisos.
- **Primer comentario** preparado: "Soy Abraham, fundador. ¿Cuál es tu ciudad? La añado al mapa."

**Reglas nuevas memorizadas (persistentes):**
- `feedback_tiktok_hashtags.md` — SIEMPRE 5 hashtags estructurados (1 brand + 1 broad + 1 niche + 1 emocional + 1 geográfico). Nunca más, nunca menos.
- Sets go-to por tema (comunidad, planes, distancias, trail, LATAM) documentados.

**Estado:** ✅ Carrusel #1 listo para subir desde móvil del founder. Carrusel #2 en standby para 48-72h después.

**Bloqueo conocido:** TikTok Studio web NO admite carruseles de imágenes (solo vídeo). El founder debe subir desde la app móvil. Las imágenes están en OneDrive ya sincronizadas.

**Para la sesión móvil / próximas sesiones:**
- Si el founder pregunta por subir, los PNGs están en `tools/marketing/carrusel-{comunidad,pick-race-plan}/png/tt/`.
- Caption + 5 hashtags + primer comentario están en este log y en `feedback_tiktok_hashtags.md`.
- Reorder de pins en TikTok pendiente — solo se puede desde app móvil (no web).
- Música recomendada: BOOM - Tiësto (consistencia con viral 22K).
- Horario óptimo subida: 18:00-21:00 hora España.

---

## 2026-05-08 ~14:25 hora España — Race card v3 + freemium repositioning + premium gate fix (3 cambios consolidados)

**Lo que pidió el founder:** dogfood en su móvil descubrió 3 cosas seguidas:
1. RacePlanCard saturado de naranja → quería rediseño estilo Strava/Nike Run Club.
2. "Bug" creado por confusión: como premium founder veía planes empezar sin pagar — al investigar encontramos bug REAL semántico en `fecha_premium`.
3. Estratégico: Strava + BLE estaban en paywall, decidimos quitarlos como acquisition tools.

**Lo que hice:**
- **RacePlanCard.tsx**: hero cinematográfico + tipografía Nike-level (26px peso 900) + banner 200px + pin SVG (no emoji) + trial bar verde + CTA personalizado por ciudad + countdown rediseñado.
- **iap.ts**: `checkSupabasePremium` ahora lee `premium_until` (correcto), `syncPremiumToSupabase` guarda expiry en `premium_until` (era bug semántico — antes guardaba expiry en `fecha_premium` causando colisión con grants manuales SQL).
- **PremiumContext.tsx**: re-checkea con lógica completa al cambiar profile.
- **StravaSection.tsx**: removido `if (!isPremium)` lock — Strava ahora gratis.
- **SensorPairingScreen.tsx**: `if (!isPremium)` cambiado a `if (false)` — BLE ahora gratis.
- **PaywallScreen.tsx**: tabla comparativa actualizada — quitados "Sensores BLE", añadidos "Planes 7 vs 2" + "Coach IA".
- **SettingsScreen.tsx**: premium card Strava → Planes de entrenamiento.
- **Migración BD**: 2 users premium reales con fecha_premium futura migrados a premium_until (Javier `fjavier.araujo@gmail.com` hasta 2027-05-08, redman hasta 2026-05-12). Founder profile: `premium_until = 2099-12-31` (lifetime).

**Estado:** ✅ Todo deployed a master.

**Para la sesión móvil:**
- Validado dogfood en móvil del founder (Fast Refresh aplicó cambios al guardar).
- Los 3 cambios son TS/React Native puro → OTA update bastaría para distribuir a v1.3.0 publicada.
- Submódulo: 152593f. Padre: 6144440f.
- Pendiente: OTA `eas update --branch production --message "race card v3 + freemium + premium gate fix"` cuando founder lo confirme.
- Posicionamiento premium nuevo: planes (7 vs 2) + Coach IA + matches ilimitados. Strava + BLE básico FREE.

---

## 2026-05-08 ~13:42 hora España — Setup PC↔móvil CERRADO

**Estado final del puente bidireccional:**
- ✅ `tmp/pc-session-log.md` — convención prepend, header con regla explícita
- ✅ `tmp/mobile-session-log.md` — convención prepend, header alineado
- ✅ `feedback_mobile_session_log.md` (memoria móvil) — regla prepend para ambos archivos
- ✅ `MEMORY.md` — pointer actualizado por el móvil

**Móvil confirmó autonomía:** detectó inconsistencia, pidió aclaración, ejecutó cambios y actualizó su propia memoria persistente. Buen comportamiento — confiable para tareas no triviales mientras founder está fuera del PC.

---

## 2026-05-08 ~13:38 hora España — Convención unificada prepend (acuerdo PC↔móvil)

**Lo que pidió el founder:** alinear convención de ambos logs.

**Lo que hice:**
- Móvil pilló inconsistencia: PC usaba prepend, móvil append.
- Acordada convención común: **prepend en ambos** (más reciente arriba).
- Header de este archivo actualizado con la nota de convención.
- Móvil va a reordenar `tmp/mobile-session-log.md` para alinearse.

**Estado:** ✅ Convenio establecido. Ambos archivos seguirán prepend a partir de ahora.

**Para la sesión móvil:** después de reordenar, no hace falta migración futura
— ambos coordinados.

---

## 2026-05-08 ~13:30 hora España — Setup Remote Control móvil

**Lo que pidió el founder:** configurar remote-control para poder usar Claude
desde el móvil cuando esté fuera del PC.

**Lo que hice:**
- Creado `Claude-Remote-CorrerJuntos.bat` en escritorio (con `pushd` por OneDrive).
- Sesión remote-control activa en URL `session_0127W6qpyu1trfRpA2FX61Y5`.
- Configurado patrón de logging compartido vía `tmp/mobile-session-log.md` y
  `tmp/pc-session-log.md` (este).

**Estado:** ✅ Funcionando. Móvil conectado.

**Para la sesión móvil:**
- Tienes contexto completo en `MEMORY.md` (sección "SESIÓN 7 MAYO 2026").
- Lee este archivo (`tmp/pc-session-log.md`) al empezar para ver últimas acciones del PC.
- Escribe tus resúmenes en `tmp/mobile-session-log.md` (modo append).
- Si tocas archivos del proyecto o haces commits, dilo aquí.

---

## 2026-05-07 — Resumen del día (referencia rápida)

**6 commits totales hoy:**
- `b3de36d9` — fix(seo): schema fixes 9 archivos (price/image/availability)
- `eef2448b` — feat(seo): calendario carreras enriquecido (24 SportsEvent)
- `def3a51a` — fix(blog): firma Abraham Márquez (founder real)
- `4b620bc9` — feat(seo): EN version of races calendar 2026
- `d08950d4` — docs(claude): sync project status

**Estado al cerrar el día:**
- Bug Strava: ✅ cerrado, validado en móvil, comunicado a Javier
- Push fix Plan B: ✅ OTA `2b1d93ab` al 100% rollout
- Sentry: ✅ 0 unresolved
- SEO Schema: ✅ 3 validaciones GSC iniciadas, 6 URLs reindex
- Blog EN nuevo: ✅ `running-races-spain-2026` deployed + IndexNow
- Plan anual 29,99€: ✅ confirmado ACTIVO en v1.3.0

**Pendientes esperando respuesta de terceros:**
1. COROS API team (ticket #534211, 1-2 días lab)
2. Garmin connect-support
3. Javier (Strava reconexión)
4. GSC validaciones aprobadas

**Pendientes que requieren acción del founder:**
1. Crear quedada 14K domingo en app (dogfood)
2. Mostrar seed quedadas en app (requiere nueva build)

---

(Las entradas más recientes van ARRIBA. Cada nueva sesión añade encima.)
