# Home V13 — publicación con la 1.3.30 (127), 16 septiembre 2026

Estado: rama `claude/home-v13-publish-20260916` desde master (c70f87ae) con el commit V10 (28f98bde) y el trabajo V11–V13 sin commit del worktree `cj-home-v10-integration`. Sustituye las capturas de la 1.3.29 (123) por las de la **1.3.30 (127)**, la versión publicada en App Store (Ready for Sale desde el 16 sep) y Google Play (producción).

## Procedencia de las capturas

- Binario: AAB de tienda de la build 127 (EAS production, commit 38b883f1) convertido a APK universal con bundletool y firmado con la clave debug local para instalarlo en el emulador. Mismo código que la release pública; firma distinta.
- Emulador `CJ_Claude_QA_126` (emulator-5554), 1080 × 2340, interfaz en español. Cuenta QA F176C con Premium y datos de prueba previos.
- expo-updates respondió «No update available» en el primer arranque (canal production, runtime 1.3.30).
- Cinco másteres PNG en `C:\tmp\home-v13-captures-20260916` y diez WebP proporcionales (480 × 1040 y 720 × 1560), sin recortes ni retoques. Manifiesto `docs/home/native-captures-v13.json`.
- Fuerza se abre en la 1.3.30 desde Inicio → Otra actividad → Fuerza. No se inició ninguna sesión ni se hizo ninguna compra.

## Copia

- Todo «próxima versión / llegará / versión en pruebas» pasa a presente: barra superior, hero, tarjetas de precios, FAQ visible y JSON-LD, pie, visor y puente `/abrir-app`.
- Se mantiene la afirmación de la sesión de fuerza de muestra sin Premium, verificada en el código de la 1.3.30.

## Observación sobre la app (no bloquea la web)

- En la cuenta QA, el 16 sep el Inicio muestra «Hoy toca descansar» con puntos en martes y jueves, mientras que Mi semana muestra el plan Lun · Mié · Vie con la próxima sesión el mismo miércoles 16. Parece un desfase de un día en el Inicio. Se capturó tal cual.
