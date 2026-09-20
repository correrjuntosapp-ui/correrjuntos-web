# Dos artículos de ciclismo · integración local para revisión

## Preparación de publicación · 20 sep 2026

El titular ha pedido publicar ambos artículos. Se han retirado los avisos editoriales de borrador y preparado los metadatos indexables y la fecha de publicación del 20 de septiembre. Si la publicación se hace otro día, ajustar la fecha real antes del commit. La protección X-Robots-Tag noindex/nofollow del servidor local sigue activa.

- Ubicación: Blog → Ciclismo. La guía de cadena es la primera tarjeta de «Equipamiento y mantenimiento»; la de diez marchas, la primera de «Entrenamiento y comunidad».
- Corregida la referencia antigua a «siete» marchas en los relacionados de la guía de cadena; ahora son diez.
- Tablas, fuentes oficiales, imágenes, URL, FAQ e ItemList conservados frente a las copias previas. Sin nuevas promesas, autor personal inventado ni datos pendientes rellenados por estimación.
- Pruebas: 7/7 contratos unitarios; JSON-LD 1.035 ficheros, cero hallazgos; 886 tarjetas correctas; 12/12 combinaciones de navegador, 36 destinos internos HTTP 200, cero errores, overflow, imágenes rotas o peticiones externas previas al consentimiento. Lint: cero errores y 966 avisos preexistentes. Build y diff-check correctos.
- Una primera aplicación del parche quedó truncada por el límite de salida de la herramienta y fue detectada por las pruebas. Se corrigió desde las copias previas completas, aplicando cada fichero por separado. La comprobación final verifica tablas y fuentes idénticas, esquema idéntico salvo fecha/estado y los seis hashes de imágenes.
- Evidencia: `C:/tmp/cj-ciclismo-borradores-20260920/validacion-publicacion-local.json`; copias previas en `antes-publicacion/`; verificador `verify-publicacion.cjs`.
- El titular autorizó explícitamente crear la rama y publicar ambos. Rama `codex/ciclismo-guias-publicacion-20260920`. Sitemap ES: dos URL nuevas y fecha del hub; índice de sitemaps: solo fecha del hijo ES. Sin regeneración global ni petición a IndexNow. La publicación queda sujeta a CI correcto y comprobación del despliegue; este documento registra la preparación anterior al merge.

## Historial del borrador (estado anterior)

Fecha: 20 de septiembre de 2026. Base: origin/master `1dd0e0738bbe1170ecd5f1688d9e6ed1996ac817`, worktree detached independiente. Sin commit, push, PR, merge ni despliegue.

## Vista local

- Portada: http://127.0.0.1:4183/blog/ciclismo
- Marchas: http://127.0.0.1:4183/blog/ciclismo/mejores-marchas-cicloturistas-espana
- Mecánica: http://127.0.0.1:4183/blog/ciclismo/como-limpiar-lubricar-cadena-bicicleta

Servidor estático `serve`, limitado a 127.0.0.1. Configuración externa en `C:/tmp/cj-ciclismo-borradores-20260920/serve-config.json`; añade X-Robots-Tag noindex/nofollow y Cache-Control no-store a la vista local. Los dos HTML nuevos y el hub local también llevan meta noindex. No se han modificado sitemaps ni robots.txt.

## Alcance

- Dos artículos completos con la misma cabecera, paleta, clases, índice, FAQ, sidebar, relacionados y footer del blog de ciclismo existente.
- Reutilizados sin modificar `blog/ciclismo/ciclismo.css`, `blog/ciclismo/ciclismo.js` y `blog/newsletter.js`.
- Hoja `borradores-sep2026.css` limitada a avisos de revisión, adaptación de los títulos largos, tabla y lateral de estos borradores.
- Una tarjeta nueva en Equipamiento y mantenimiento; otra en Entrenamiento y comunidad. No se crea una categoría vacía ni se añaden tarjetas a Running.
- ItemList del hub ampliado con las dos URLs nuevas. Fuentes, enlaces internos y 4 FAQ por artículo conservados desde los borradores.
- Dos imágenes conceptuales nuevas, herramienta integrada image_gen, con variantes WebP 480/828/1600. No sustituyen imágenes anteriores. No representan una marcha concreta ni demuestran un procedimiento o prueba propios.

## Procedencia editorial y visual

Textos originales y fuentes en `C:/tmp/cj-ciclismo-borradores-20260920/01-marchas-cicloturistas-espana.md` y `02-limpiar-lubricar-cadena.md`. Investigación realizada el 20 de septiembre de 2026. La selección distingue datos de 2026 y convocatorias anunciadas de 2027.

Manifiesto de imágenes, prompts de generación y corrección, rutas de másteres y SHA-256 por variante en `public/blog-images/ciclismo/borradores-sep2026/manifest.json`. Primera propuesta de marchas descartada por posición inadecuada de los ciclistas; usada la corrección con dos ciclistas en el carril derecho. Las imágenes se identifican como IA en ambos pies y en sus alt. Son recursos conceptuales, no fotos documentales autorizadas por los organizadores.

La firma está marcada como redacción/borrador pendiente de revisión. No se copia el nombre ni credenciales de un autor de otro artículo, ni se inventa una traducción EN para hreflang.

## Validación

- Navegador Chromium: hub y dos artículos × 320/390/768/1440 = 12/12 combinaciones correctas.
- HTTP 200, H1 único, noindex, cero overflow de página, cero errores de JavaScript y respuestas de carga fallidas, cero imágenes rotas y cero peticiones externas antes de consentimiento.
- 36 destinos internos comprobados, todos HTTP 200.
- En los artículos: canonical propio, title/OG/Twitter coherentes, description coherente, hero/og:image idéntica en origen, JSON-LD parseable y FAQ visible idéntica a la estructurada.
- FAQ abre y cierra; índice móvil funciona con clic y con teclado.
- Comprobación del repositorio: 886 tarjetas revisadas sin duplicados, categorías huérfanas ni destinos rotos. Este test no cubre por sí solo el hub de ciclismo; la batería específica sí verifica sus dos tarjetas nuevas.
- Verificador JSON-LD: 1.035 ficheros, **dos avisos esperados** por ausencia de datePublished en los nuevos borradores. Se usa creativeWorkStatus Draft y no se inventa fecha de publicación. El JSON es válido; estos avisos se cerrarán con la fecha real al autorizar publicación. No presentar esta comprobación como cero hallazgos.
- Evidencias y capturas: `C:/tmp/cj-ciclismo-borradores-20260920/validacion-integracion.json` y PNG de escritorio/móvil en la misma carpeta.

## Cierre de la auditoría de marchas · 20 sep 2026

Aplicado por Codex con lease propio `custom:ciclismo-preview-articulos`, sin escribir en otras sesiones ni tocar el borrador de cadena. Copias previas de artículo, hub, CSS y Markdown en `C:/tmp/cj-ciclismo-borradores-20260920/antes-datos-oficiales/`.

- Título, H1, OG/Twitter, schema y tarjeta del hub: «10 marchas cicloturistas de España: fechas y recorridos»; marca conservada en title. Fecha visible etiquetada como «Actualizado el 20 de septiembre de 2026».
- Separación explícita de cuatro fechas anunciadas de 2027 frente a seis referencias de 2026; navegación por seis zonas y diez anclas a las fichas, sin reordenar la selección.
- Tabla de distancias/D+ por modalidad y edición, con fuentes junto a cada fila. No se suman altitudes para estimar desnivel. Detectada la diferencia entre nombre comercial 60K/100K de Larra-Larrau y distancia publicada 54,8/99,5 km.
- Tabla adicional con tarifas, suplementos, cupos y estado por edición. Tarifas verificadas de ocho marchas; Mussara y La Perico pendientes. Cupos numéricos documentados de cuatro ediciones históricas, sin afirmar plazas disponibles hoy.
- Discrepancia de Mussara explicada con los dos pares de cifras oficiales. D+ de Quebrantahuesos y Alberto Contador pendiente. Sierra Nevada toma el reglamento explícito de 2027 y avisa de sus rutómetros divergentes. Mallorca separa precio/cupo/perfil 2026 de fecha 2027. La Indomable avisa de las fechas 2025 remanentes en el PDF enlazado como 2026.
- No se modifica la estructura de plantilla, la selección de marchas, las imágenes, FAQ, seguimiento ni afiliación. Enlaces de preparación, equipamiento y nutrición existentes conservados.

Trazabilidad y pendientes: `docs/ciclismo-marchas-fuentes-20260920.md`. La lectura autónoma de la carpeta de entrega también se sincroniza con el nuevo Markdown.

Validación tras la revisión:

- `verify-integracion.cjs`: 12/12 combinaciones (hub + dos borradores × 320/390/768/1440), 36 destinos internos HTTP 200, cero overflow de página, errores JS, imágenes rotas o peticiones externas; noindex intacto.
- `verify-datos-oficiales.cjs`: contrato de diez filas de recorridos y diez de inscripción en cuatro anchuras; cuatro fechas, diez enlaces por zonas, etiquetas, reservas y cifras de las tablas; tablas desplazables en móvil y ajustadas al ancho de lectura en escritorio; texto del hero dentro de su contenedor.
- 34 URLs externas citadas en el artículo comprobadas con GET: todas HTTP 200. El HTTP comprueba acceso, no vigencia futura ni disponibilidad de dorsales.
- Seis WebP idénticos a los hashes del manifiesto; HTML de cadena conserva el SHA-256 registrado en la ampliación anterior.
- Test de tarjetas: 886 revisadas sin hallazgos. `git diff --check` limpio.
- Verificador general JSON-LD: siguen los dos hallazgos deliberados de datePublished ausente en borradores, no cero hallazgos. No se inventa fecha para pasar CI; se completará solo al publicar.

No se han ejecutado commit, push, PR, merge, deploy, IndexNow ni cambios de sitemap. La build y el lint de módulos JS no se repiten porque no se modifica JavaScript de producto; las pruebas se concentran en los HTML, el CSS específico y sus contratos.

## Antes de publicar, con autorización expresa

### Ampliación solicitada: diez marchas y enlaces oficiales

La selección incorpora Gran Fondo Alberto Contador, Larra-Larrau y La Indomable. Las diez marchas tienen enlace desde el nombre de la tabla y un acceso destacado a la web oficial en su ficha. Las tres adiciones conservan la referencia de 2026: no se inventan fechas de 2027 ni se anuncian inscripciones abiertas.

Fuentes de las adiciones, consultadas el 20 de septiembre de 2026:

- https://granfondoalbertocontador.com/reglamento/ — Oliva, 19 de septiembre de 2026, un recorrido de 139,5 km y controles intermedios.
- https://larralarrau.com/larra-larrau-2026-isaba-epicentro-del-ciclismo-navarro-en-septiembre/ — Isaba, 5 de septiembre de 2026, 60/100/146 km.
- https://www.rockthesport.com/es/evento/la-indomable-2026 — Berja, 6 de junio de 2026, 101/178 km en la convocatoria del organizador. No se reutilizan cifras antiguas de 145/188 km.
- https://laindomable.es/la-prueba/ — final de Medio Fondo en Válor y traslado a Berja; no confundir con Gravel & MTB.

Título, descripción, cabecera, tabla, índice, ItemList y tarjeta del hub se actualizan a diez. El artículo de cadena y los seis WebP existentes permanecen intactos. No hay cambios en producción.

Revalidación tras ampliar: 12/12 combinaciones en Chromium (hub y dos artículos × 320/390/768/1440), 36 destinos internos HTTP 200, cero errores de página, desbordamientos, imágenes rotas o peticiones externas. En las cuatro anchuras se comprueban diez filas, diez fichas, diez botones oficiales de al menos 44 px, mismos destinos en tabla y botones y diez elementos sincronizados en ItemList. FAQ e índices siguen funcionando. SHA-256 del artículo de cadena sin cambios: `99eee1229f741c3eec4c4a5f10323ea41ddbd2c99363a1dbeedbaf5fad884932`. Capturas de la ampliación y detalle en la carpeta de entrega.

### Puertas de publicación

Los diez destinos oficiales destacados responden HTTP 200 en la comprobación del 20 de septiembre de 2026, sin redirecciones. Evidencia: `C:/tmp/cj-ciclismo-borradores-20260920/enlaces-oficiales-diez.json`. Esto valida accesibilidad, no confirma inscripciones abiertas ni próximas fechas.

1. Aprobar texto e imágenes; si se prefieren fotos reales de eventos, obtenerlas con derechos y atribución verificables.
2. Reconfirmar fechas y reglamentos; registrar la revisión editorial y firma reales.
3. Quitar los avisos de borrador y noindex únicamente de estos documentos y del hub de esta propuesta; poner datePublished real y actualizar el estado de BlogPosting.
4. Revisar la integración contra el master vigente y cualquier trabajo paralelo de Claude; no aplicar este hub completo encima de cambios ajenos.
5. Añadir las dos entradas de sitemap solo cuando se autorice publicar y validar otra vez. No hacer IndexNow por inferencia.

La app nativa, la home, los artículos existentes, el piloto anterior de imágenes en otro worktree, tracking, newsletter y configuración de producción no se han cambiado.
