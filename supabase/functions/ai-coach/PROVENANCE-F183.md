# Fuente y límites F183

Se preserva la candidata web F182 (`596555d2`) como base de este archivo. Comparada con la descarga remota actual de solo lectura del 8 septiembre 2026, la candidata ya corregía columnas en chat/post-run (F118); no se sobrescribió por la versión remota anterior.

SHA-256 del index remoto descargado (no de este archivo modificado):
`0a1244a31e9048439e7a78f476787ad1896c697d7948051ca7a153f5b3ecb21b`.

F183 conserva chat freemium y sus límites. Post-run exige actividad propia canónica del usuario; no usa métricas ni agregados enviados por el cliente. Históricos de chat/proactivos y agregados sin linaje no van a modelos. Cada deporte mantiene su agregado separado. Se corrigen también columnas de weekly/smart-check. Los fallos de consulta no se anuncian como ausencia de entrenamiento.

El helper local `_provenance.ts` replica el contrato puro de la candidata app, y la batería debe mantener ambos iguales. No hay deployment, invocación externa ni verificación de respuestas reales.

Limitaciones: memoria de chat sin linaje omitida del contexto (no borrada); texto libre sin origen identificado no puede verificarse; consentimiento/retención y respuestas de modelo necesitan QA aparte. Las comparaciones contra ritmos/progreso de plan quedan fuera del contexto IA hasta demostrar su origen. No se declara revisión profesional de los prompts históricos.
