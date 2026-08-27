# Fase 7 · Progresión sin falsa IA

> Motor **determinista**. Sin modelo de recuperación muscular, sin porcentajes
> inventados, sin "IA". Se puede explicar entero en una frase al usuario, y eso es una
> ventaja, no una limitación.

## 1. Principios

1. **Doble progresión**: primero se sube en repeticiones dentro del rango; solo al
   llegar arriba del rango en todas las series se sube la carga.
2. **Nunca subir dos cosas a la vez**: peso, series y frecuencia **nunca** aumentan en
   la misma semana.
3. **El fallo baja, no castiga**: fallar un rango mantiene; fallarlo dos veces reduce.
4. **La carrera manda**: si sube la carga de running, la fuerza descarga.
5. **Sin historial no hay progresión**: la primera sesión de un ejercicio **no propone
   carga**. Pide al usuario que elija un peso con el que pueda hacer el rango a RPE 7,
   y lo registra como referencia.

## 2. Pseudocódigo

```
CONSTANTES
  INCREMENTO = { tren_inferior: 2.5 kg, tren_superior: 1.25 kg, banda: siguiente_nivel }
  REDUCCION  = 10 %                       // redondeado al incremento disponible
  RPE_TECHO  = 8.5
  RPE_SUELO  = 6.0

progresion_para(ejercicio, historial, contexto_running):

  ult = ultima_ejecucion(ejercicio, historial)

  // — Caso 0: sin historial —
  si ult == null:
      devolver { carga: null, reps: rango.min,
                 nota: "Elige un peso con el que llegues al rango sin apretar (RPE 7)." }

  // — Veto 1: la carrera sube → la fuerza no —
  si contexto_running.semana_descarga
     o contexto_running.carga_7d > contexto_running.carga_7d_previa * 1.15:
      devolver { carga: ult.carga, reps: ult.reps, volumen: -1_serie,
                 motivo: "Tu carga de carrera ha subido. Mantenemos la fuerza." }

  // — Veto 2: fatiga declarada —
  si ult.rpe != null y ult.rpe >= RPE_TECHO:
      si fallo_previo(ejercicio, historial):                       // 2ª vez seguida
          devolver { carga: ult.carga * (1 - REDUCCION), reps: rango.min,
                     motivo: "Bajamos un poco para que puedas completarlo." }
      devolver { carga: ult.carga, reps: ult.reps,
                 motivo: "Repetimos: la última se te hizo dura." }

  // — Progresión normal (doble progresión) —
  si ult.todas_las_series_completadas:
      si ult.reps >= rango.max:
          si ult.rpe == null o ult.rpe <= RPE_SUELO + 1.5:          // margen real
              devolver { carga: ult.carga + INCREMENTO[grupo], reps: rango.min,
                         motivo: "Has cerrado el rango. Subimos peso." }
          devolver { carga: ult.carga, reps: rango.max,
                     motivo: "Consolidamos antes de subir." }
      devolver { carga: ult.carga, reps: ult.reps + 1,
                 motivo: "Una repetición más que la última vez." }

  // — No completó —
  devolver { carga: ult.carga, reps: ult.reps,
             motivo: "Repetimos lo mismo hasta cerrarlo." }


sustitucion_por_omision(ejercicio, historial):
  si veces_saltado(ejercicio, ultimas_3_sesiones) >= 2:
      motivo = motivo_mas_frecuente(ejercicio)           // material | molestia | preferencia
      si motivo == "material":  devolver sustituto_por_material(ejercicio)
      si motivo == "molestia":  devolver { sustituto: sustituto_mismo_patron(ejercicio),
                                           aviso: "Lo cambiamos. Si la molestia sigue, consulta con un profesional." }
      si motivo == "preferencia": devolver sustituto_mismo_patron(ejercicio)
```

**Sobre las unidades**: todo se calcula y almacena en **gramos enteros** internamente.
La conversión kg/lb es solo de presentación. Así `2.5 kg` y `5 lb` no acumulan error
de redondeo entre sesiones (ver `07-modelo-datos.md`).

## 3. Casos de prueba

| # | Situación | Entrada | Salida esperada |
|---|---|---|---|
| 1 | Primera vez | `ult=null`, rango 8–10 | `carga=null`, `reps=8`, nota de elección de peso |
| 2 | Progresa en reps | `12 kg × 8`, rango 8–10, completado | `12 kg × 9` |
| 3 | Cierra el rango | `12 kg × 10`, RPE 7, completado | `14.5 kg × 8` («Has cerrado el rango») |
| 4 | Cierra el rango pero al límite | `12 kg × 10`, RPE 9 | `12 kg × 10` («Consolidamos antes de subir») |
| 5 | RPE muy alto una vez | `12 kg × 8`, RPE 9 | `12 kg × 8` («Repetimos») |
| 6 | RPE muy alto dos veces | `12 kg × 8`, RPE 9, tras fallo previo | `11 kg × 8` (−10 % redondeado) |
| 7 | No completó las series | `12 kg × 8` previstas, hizo 6 | `12 kg × 8` («Repetimos lo mismo») |
| 8 | Semana de descarga | Cualquiera + `semana_descarga` | Misma carga, **−1 serie** |
| 9 | La carga de carrera sube 20 % | Cualquiera | Misma carga, −1 serie, motivo de carrera |
| 10 | Saltado 2 de 3 veces por material | `row` con mancuernas, sin mancuernas | Sustituto con banda |
| 11 | Saltado 2 de 3 veces por molestia | `split_squat` | Sustituto del mismo patrón + aviso de consultar profesional |
| 12 | Sin RPE registrado nunca | `12 kg × 10`, sin RPE, completado | `14.5 kg × 8` (el RPE nulo no bloquea) |
| 13 | Ejercicio de tiempo | `side_plank 25 s`, rango 20–30 | `30 s`, luego progresa a variante más difícil, no a "peso" |
| 14 | Peso corporal sin lastre | `push × 12`, rango 8–12 | Progresa a variante más difícil de la familia, no a carga |
| 15 | Vuelve tras 3 semanas parado | `hist` con hueco > 21 días | Retoma al **90 %** de la última carga, rango bajo. Motivo: «Retomamos suave.» |

## 4. Lo que este motor NO hace, deliberadamente

- No estima porcentajes de recuperación muscular.
- No calcula 1RM ni lo pide.
- No promete resultados ni previene lesiones.
- No usa modelos entrenados ni llamadas a un LLM. Si algún día Coach José comenta la
  sesión, comenta **sobre la salida de este motor**; no la sustituye.
