# Home V13 — capturas actuales, 11 septiembre 2026

Preview: http://127.0.0.1:4174/?preview=home-v13-capturas-actuales

Estado: revisión local, sin commit, push, merge, OTA ni deploy. Conserva el trabajo V11/V12 y el aviso de próximo lanzamiento. Esta actualización sustituye las capturas, no certifica la publicación de la app.

## Corrección

La V12 aún mostraba Android 1.3.25 (110). Se sustituyen todas las referencias activas de la home y de `/abrir-app`, no solo los textos de versión:

- Hero: Inicio actual, con las imágenes nuevas de Running y Fuerza, y catálogo actual de Fuerza.
- Galería: Inicio, Mi Plan, sesión real de running, Fuerza y mapa de carreras.
- Visor: las mismas cinco pantallas, con alt, dimensiones, contador y navegación sincronizados.
- Puente de descarga: sesión real Caminar/Correr 5x2min, 25 minutos, semana 2.
- Preload, enlaces de ampliación, recorrido guiado y caché actualizados.
- La clasificación de eventos acepta los nuevos identificadores de galería; `home_version` pasa a `v13`. No se cambian el consentimiento ni los destinos de las tiendas.

## Procedencia demostrada

- Paquete instalado: `com.correrjuntos.app`, Android **1.3.29 (123)**, verificado mediante ADB.
- APK SHA-256: `fcd591593fb34f92dd3c4e269a2b311f612c97a5d19e7d3655070bbed4c6f807`.
- Emulador existente `emulator-5554`, capturas completas de 1080 × 2340.
- Cuenta existente **QA F176C**, con datos de prueba previos. No es la cuenta Demo web de las capturas antiguas. No se ha cambiado el perfil remoto ni inventado actividad.
- Controles en español. Un mensaje previo de José conserva texto en inglés; se muestra sin alterarlo y se advierte en la nota visible.
- Diez WebP proporcionales, 480 × 1040 y 720 × 1560. Sin recortes, retoques de UI ni imágenes sintéticas de pantallas.
- Manifiesto vigente: `native-captures-v13.json`, con hashes de los cinco másteres, diez derivados y APK instalado.
- Másteres y navegación de evidencia: `C:\tmp\home-v13-captures-20260911`.
- Los archivos y el manifiesto de la 1.3.25 se conservan como archivo histórico, sin referencias activas en la home o el puente.

## Límites que siguen vigentes

La versión y el APK instalado están verificados, pero no se ha identificado la OTA aplicada ni certificado su correspondencia con todos los cambios sin commit del worktree nativo. No se afirma que sea el binario final aprobado por las tiendas.

La cuenta deja ver el catálogo de Fuerza, pero abrir una sesión conduce al control Premium. Se cerró sin comprar ni saltarse permisos. No se muestra un reproductor de Fuerza ficticio. No se iniciaron ni completaron entrenamientos y no se probó GPS físico o pagos.

El único ajuste de captura fue el idioma local del emulador: inglés → español → inglés. Se restauró el idioma original y se dejó la pantalla de Fuerza como al inicio. Ningún código nativo, feature flag, perfil o configuración de producción fue modificado.

## Validación ejecutada

- Unitarios de home y embudo: **28/28 PASS**, incluida una regresión que rechaza referencias a capturas antiguas y comprueba hashes y dimensiones del manifiesto actual.
- Navegador: **320 / 390 / 768 / 1440**, HTTP 200, un H1, cero overflow, errores o imágenes rotas; cero solicitudes externas antes de consentimiento.
- Cinco pantallas actuales verificadas por URL y dimensiones, también en el visor; vuelta circular, foco, Escape y retorno del foco correctos.
- FAQ visible y JSON-LD coinciden; Running/Ciclismo continúan separados; formulario simulado 201/409/500 y fallback sin JavaScript correctos.
- Embudo simulado con origen de producción: **17/17 PASS**, sin eventos, suscripciones ni compras reales.
- ESLint de los tres scripts locales: cero errores y advertencias. Build minify OK. `git diff --check` limpio.
- Evidencias de navegador: `C:\tmp\home-v13-qa-20260911`, incluido `browser-report.json` y capturas de las cuatro anchuras.

Antes de publicar: contrastar este material con el binario realmente aprobado. Si su UI cambia, recapturar; no cambiar solo la etiqueta de versión. Esta tarea no autoriza publicación.
