# Spec — Lead magnet ciclismo: «Checklist para tu primera salida en bicicleta»

> Estado: **ESPECIFICACIÓN, no existe el PDF todavía.** No anunciar en newsletter, popups ni artículos hasta que el archivo esté producido y el flujo de entrega funcione de punta a punta. Regla dura: cero promesas de descarga falsas.
> Fecha spec: 23 de agosto de 2026.

## 1. Por qué este lead magnet

- La newsletter en rutas `/blog/ciclismo*` ya no ofrece el Plan 0→5K (running) — desde los cambios de `newsletter.js` del 23 ago 2026 usa un copy neutral y honesto («La newsletter de CorrerJuntos: entrenamiento, equipamiento y comunidad», «un email a la semana como máximo»), sin prometer contenido ciclista segmentado que Brevo aún no entrega. Un lead magnet propio subiría la conversión de ese copy genérico.
- El contenido ya existe editorialmente: `blog/ciclismo/equipamiento-primera-salida-bicicleta` es la fuente de verdad. El PDF es una destilación, no contenido nuevo que mantener.
- Perfil capturado: principiante de ciclismo = el mismo perfil al que la app aporta más (registrar salidas, encontrar grupeta).

## 2. Contenido del PDF (1-2 páginas A4, imprimible)

1. **Antes de salir** (revisión de 2 minutos): presión de ruedas, frenos, cierre rápido/ejes, sillín a altura correcta, batería del móvil o GPS cargada.
2. **Obligatorio y de seguridad**: casco homologado EN 1078 bien ajustado, luces si hay riesgo de poca luz, timbre según normativa, documento identificativo.
3. **Esenciales**: bidón, cámara de repuesto + desmontables + inflador compatibles CON TU bici (probados antes), móvil cargado, algo de comer si la salida pasa de 90 minutos.
4. **Muy recomendable**: guantes, gafas, ropa por capas según temporada, cortavientos plegable.
5. **Puede esperar**: culotte técnico, zapatillas automáticas, ciclocomputador — con enlaces a las guías del blog para cuando llegue el momento.
6. **Antes de arrancar**: decir a alguien por dónde vas, o registrar la salida en CorrerJuntos y compartirla.

Regla editorial: mismo estándar que el blog — sin marcas obligatorias, sin afirmaciones de seguridad no respaldadas, tono honesto («puede esperar» es una sección real, no todo es imprescindible).

## 3. Formato y producción

- PDF A4, 1-2 páginas, diseño con paleta de la vertical (naranja #f97316 sobre crema/blanco), tipografía del sistema, checkboxes imprimibles.
- Producción: HTML → PDF (mismo pipeline que otros materiales del repo, p. ej. render con Chrome headless) para poder versionarlo en git como fuente HTML.
- Archivo servido desde `/public/downloads/checklist-primera-salida-bicicleta.pdf` (crear carpeta si no existe).
- Sin datos personales dentro del PDF; enlace a la app y al hub `/blog/ciclismo` como únicos CTA.

## 4. Flujo de entrega

1. Usuario se suscribe desde una ruta `/blog/ciclismo*` (los 4 puntos de captura de `newsletter.js` con source tags actuales `blog-newsletter-*`).
2. Opción A (mínima): el email de bienvenida de Brevo para suscriptores de ciclismo incluye el enlace directo al PDF. Requiere: o bien un template Brevo específico, o bien lógica en `/api/brevo-subscribe` que asigne una lista/atributo «ciclismo» según el `source` o un nuevo parámetro.
3. Opción B (mejor atribución): página de gracias `/blog/ciclismo/gracias` con el enlace de descarga + tracking GA4 (consent-gated) del evento de descarga.
4. Actualizar los textos de `newsletter.js` para rutas ciclismo SOLO cuando 1-3 estén operativos: p. ej. «Checklist de tu primera salida en PDF + consejos cada lunes».

## 5. Criterios de "hecho" (antes de anunciar nada)

- [ ] PDF producido y revisado (contenido = artículo fuente, sin claims nuevos).
- [ ] Archivo accesible en producción con 200 OK y peso < 1 MB.
- [ ] Suscriptor de prueba recibe el email con el enlace y descarga el PDF de punta a punta.
- [ ] Segmentación Brevo: suscriptores ciclismo identificables (lista o atributo) para no enviarles el drip de running 0→5K.
- [ ] Copy de `newsletter.js` (rutas ciclismo) actualizado a la promesa concreta.
- [ ] Evento de descarga medible (consent-gated, sin PII).

## 6. Fuera de alcance de esta spec

- Traducción EN (la vertical ciclismo es solo ES por ahora).
- Otros lead magnets (plan primeros 50 km, etc.) — evaluar tras medir este.
