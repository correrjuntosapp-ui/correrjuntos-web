# Plan Improvements Report: Runna/NRC vs CorrerJuntos

**Fecha**: 2026-03-26
**Autor**: Agente Desarrollo Principal
**Objetivo**: Gap analysis y plan de mejoras del sistema de entrenamiento

---

## 1. Estado Actual de Nuestras Pantallas

### PlanScreen.tsx (~900 lineas)

**Funcionalidad implementada:**
- Vista lista + vista calendario (toggle)
- Selector horizontal de semanas (pills numeradas 1-N)
- Cards de workout con: fecha, tipo (badge color), titulo, distancia, ritmo, duracion, descripcion
- Progreso global: barra de progreso con porcentaje
- Analytics card: adherencia %, km totales, sesiones completadas, sesiones saltadas, barra de adherencia visual
- Semanas completadas X de Y
- Recalibracion de ritmo automatica (detecta si vas mas rapido/lento y sugiere ajuste)
- Estados de workout: pendiente, hoy (destacado naranja), completado (checkmark), saltado, pasado
- Vista calendario completa con react-native-calendars (dots de colores por estado)
- Leyenda del calendario
- Plan pausado: banner naranja con opcion de reanudar
- Settings: pausar, reanudar, abandonar plan
- Navegacion a WorkoutDetail con ritmo base

**Componentes UI:**
- Plan info card (nombre + barra progreso + semana actual)
- Analytics card (adherencia, km, hechos, saltados)
- Week pills (selector horizontal)
- Workout cards (tipo coloreado, metricas, acciones)
- Calendar con marked dates
- Empty state con icono clipboard + CTA

### PlanWizardScreen.tsx (~858 lineas)

**Flujo de 6 pasos:**
1. **Goal** - Seleccion de objetivo: 0-5K (gratis), 5K, 10K, 21K, Trail, 42K. Badges FREE/PRO.
2. **Level** - Principiante, Intermedio, Avanzado
3. **Pace** - 3 modos: auto (GPS historico), manual (tiempo 5K), percepcion (relajado/comodo/duro/rapido)
4. **Days** - Selector circular L-M-X-J-V-S-D con minimo de dias
5. **Date** - Tengo carrera (fecha) o No tengo carrera
6. **Summary** - Resumen con nombre, semanas, dias, ritmo base, fecha carrera

**Logica:**
- Progress dots animados
- Skip de Level/Pace para 0-5K (va directo a Days)
- Premium gate antes de generar (redirige a Paywall)
- Fecha inicio = proximo lunes
- Genera plan via RPC `generateUserPlan`
- Schedule push reminders post-generacion

### ActivityCompletionScreen.tsx

**Conexion con planes:**
- Recibe `planWorkout` en params (id, titulo, plan_id)
- Llama a `completeUserWorkout` y `updatePlanProgress` al guardar
- No tiene UI especifica para mostrar progreso del plan post-actividad

### Estructura Supabase (SQL)

**7 tablas principales:**

| Tabla | Descripcion |
|-------|-------------|
| `plan_templates` | Planes maestros (slug, nombre, objetivo, nivel, semanas, dias, km estimado, gratuito) |
| `plan_pace_zones` | Zonas de ritmo por template (zona, offset_seconds, color) |
| `plan_template_weeks` | Semanas por template (fase, km_target, es_descarga) |
| `plan_template_workouts` | Workouts por semana (tipo, titulo, distancia, duracion, zona_ritmo) |
| `plan_template_steps` | Steps dentro de workout (warmup, intervalos, cooldown) |
| `user_plans` | Planes generados por usuario (ritmo_base, dias_disponibles, fecha_inicio/fin, estado, progreso) |
| `user_workouts` | Workouts con fechas reales (target vs real: distancia, duracion, ritmo) |

**7 planes disponibles:**

| Plan | Semanas | Dias/sem | KM estimados | Gratis |
|------|---------|----------|-------------|--------|
| Empieza a Moverte | 6 | 3 | ~40 | Si |
| 0 a 5K | 8 | 3 | 60 | Si |
| Prep 5K | 8 | 4 | 150 | No |
| Prep 10K | 12 | 4 | 340 | No |
| Prep Trail | 10 | 4 | 280 | No |
| Prep 21K | 16 | 4 | 550 | No |
| Prep 42K | 18 | 5 | 850 | No |

**Zonas de ritmo implementadas** para cada plan con offsets en segundos respecto al ritmo base.

**Fases de periodizacion**: base, desarrollo, especifico, tapering, descarga.

---

## 2. Gap Analysis: Runna vs CorrerJuntos

| Feature | Runna | CorrerJuntos | Gap |
|---------|-------|-------------|-----|
| **WIZARD** | | | |
| Seleccion de objetivo | Si (5K-Ultra) | Si (0-5K a 42K) | OK |
| Seleccion de nivel | Si | Si (3 niveles) | OK |
| Seleccion de dias disponibles | Si (circulos dia) | Si (circulos L-D) | OK |
| Dia de carrera larga | Si (elegir cual) | No | FALTA |
| Fecha de carrera | Si | Si | OK |
| Carreras por semana (slider) | Si | No (se infiere del template) | MENOR |
| Ritmo / pace input | Si | Si (3 modos) | OK - MEJOR que Runna |
| **PLAN ACTIVO** | | | |
| Calendario horizontal dias semana | Si (Lun-Dom arriba) | No (pills semanas) | FALTA |
| Selector semanas con radio buttons | Si (Sem 1-8) | Si (pills horizontales) | SIMILAR |
| Progreso X/Y semanas | Si (visual) | Si (texto + barra) | OK |
| Distancia total plan (93.2 km) | Si (prominente) | Si (en analytics card) | OK pero menos visible |
| Tipo + distancia en cada sesion | Si (Caminata/Carrera 2.4km) | Si (badges + metricas) | OK |
| Iconos tab: Vision general/Plan/Apps/Guardar | Si (4 tabs) | No (solo toggle lista/calendario) | FALTA |
| Estado workout con colores | Si | Si (verde/rojo/naranja/gris) | OK |
| **CALENDARIO** | | | |
| Integrar Google/Apple Calendar | Si | No | FALTA |
| Exportar sesiones como eventos | Si | No | FALTA |
| Stat "300% mas probable terminar" | Si (social proof) | No | FALTA |
| **CARD COMPARTIBLE** | | | |
| Sticker/card con logo + plan + progreso | Si | No | FALTA |
| Guardar en dispositivo | Si | No | FALTA |
| Compartir en Stories | Si | No (solo post-actividad) | FALTA |
| **BIENVENIDA** | | | |
| Mensaje personalizado con nombre | Si | Si (en empty state) | PARCIAL |
| Equipo de coaches con foto | Si | No | FALTA |
| Tono motivacional post-generacion | Si | No (solo goBack) | FALTA |
| **INTEGRACIONES** | | | |
| Strava sync | Si | No | FALTA (en roadmap) |
| Apple Health | Si | No | FALTA |
| Garmin Connect | Si | No | FALTA (solicitud enviada) |
| COROS | Si | No | FALTA (solicitud enviada) |
| Fitbit/Suunto/Amazfit | Si | No | FALTA |
| **MULTI-DEPORTE** | | | |
| Tabs: Correr, Fuerza, Yoga, Pilates | Si | No (solo running) | FALTA |
| Sesiones de estiramiento | Si | No | FALTA |
| **EXTRA** | | | |
| Recalibracion automatica de ritmo | No visible | Si (auto-detecta) | MEJOR |
| Steps detallados (warmup/intervals) | Probable | Si (1025 steps) | OK |
| Push reminders por sesion | Si | Si (implementado) | OK |
| Plan completion celebration | Probable | Si (PlanCompletionScreen) | OK |

**Resumen del gap:**
- **Tenemos ventaja en**: recalibracion de pace, 3 modos de input de ritmo, steps estructurados detallados
- **Gaps criticos para retencion**: card compartible, calendario horizontal, bienvenida post-generacion, integracion calendario nativo
- **Gaps de largo plazo**: multi-deporte, Strava/Garmin/COROS, equipo de coaches

---

## 3. Plan de Implementacion Priorizado

### QUICK WINS (1-2 dias cada uno)

#### QW1: Progreso visual mejorado - "X/Y semanas, Z km"
**Impacto**: ALTO (gamificacion, motivacion diaria)
**Esfuerzo**: 0.5 dias

Hacer el progreso mas prominente en la parte superior de PlanScreen. Mostrar las metricas clave en formato grande, tipo hero stats.

```typescript
// Nuevo componente: PlanHeroStats
// Insertar justo despues del header en PlanScreen
const PlanHeroStats: React.FC<{
  plan: UserPlan;
  stats: PlanStats;
  totalWeeks: number;
}> = ({ plan, stats, totalWeeks }) => {
  const lang = getCurrentLanguage();

  return (
    <View style={heroStyles.container}>
      {/* Plan name + objective */}
      <Text style={heroStyles.planName}>{plan.nombre}</Text>

      {/* Hero stats row */}
      <View style={heroStyles.statsRow}>
        <View style={heroStyles.statBlock}>
          <Text style={heroStyles.statValue}>
            {stats?.weeksCompleted || 0}/{totalWeeks}
          </Text>
          <Text style={heroStyles.statLabel}>
            {lang === 'es' ? 'semanas' : 'weeks'}
          </Text>
        </View>

        <View style={heroStyles.statDivider} />

        <View style={heroStyles.statBlock}>
          <Text style={heroStyles.statValue}>
            {stats?.totalKmDone || 0}
          </Text>
          <Text style={heroStyles.statLabel}>km</Text>
        </View>

        <View style={heroStyles.statDivider} />

        <View style={heroStyles.statBlock}>
          <Text style={heroStyles.statValue}>
            {Math.round(plan.progreso_pct || 0)}%
          </Text>
          <Text style={heroStyles.statLabel}>
            {lang === 'es' ? 'completado' : 'completed'}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={heroStyles.progressBar}>
        <View
          style={[
            heroStyles.progressFill,
            { width: `${plan.progreso_pct || 0}%` },
          ]}
        />
      </View>
    </View>
  );
};

const heroStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
  },
  planName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#f97316',
    borderRadius: 3,
  },
});
```

#### QW2: Card compartible del plan
**Impacto**: ALTO (viralidad, social proof, retencion emocional)
**Esfuerzo**: 1.5 dias

Card tipo Runna con logo, nombre del plan, progreso, km, que se puede guardar y compartir en Stories.

```typescript
// Nuevo componente: PlanShareCard.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface PlanShareCardProps {
  planName: string;
  objective: string;
  weeksCompleted: number;
  totalWeeks: number;
  totalKm: number;
  progressPct: number;
  userName: string;
}

const PlanShareCard: React.FC<PlanShareCardProps> = ({
  planName,
  objective,
  weeksCompleted,
  totalWeeks,
  totalKm,
  progressPct,
  userName,
}) => {
  const cardRef = useRef<any>(null);

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your plan',
        });
      }
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  return (
    <View>
      <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }}>
        <View style={cardStyles.card}>
          {/* Logo */}
          <Text style={cardStyles.logo}>CORRERJUNTOS</Text>

          {/* Plan info */}
          <Text style={cardStyles.planName}>{planName}</Text>
          <Text style={cardStyles.objective}>{objective}</Text>

          {/* Progress ring placeholder - use SVG circle */}
          <View style={cardStyles.progressRow}>
            <View style={cardStyles.progressCircle}>
              <Text style={cardStyles.progressText}>
                {weeksCompleted}/{totalWeeks}
              </Text>
              <Text style={cardStyles.progressLabel}>semanas</Text>
            </View>
            <View style={cardStyles.statsCol}>
              <Text style={cardStyles.kmValue}>{totalKm} km</Text>
              <Text style={cardStyles.kmLabel}>distancia total</Text>
              <View style={cardStyles.miniBar}>
                <View
                  style={[
                    cardStyles.miniBarFill,
                    { width: `${progressPct}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* User name */}
          <Text style={cardStyles.userName}>{userName}</Text>

          {/* Watermark */}
          <Text style={cardStyles.watermark}>correrjuntos.com</Text>
        </View>
      </ViewShot>

      <TouchableOpacity style={cardStyles.shareBtn} onPress={handleShare}>
        <Text style={cardStyles.shareBtnText}>
          Guardar en dispositivo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    width: 340,
    padding: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  logo: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  planName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  objective: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  progressLabel: {
    color: '#9ca3af',
    fontSize: 10,
  },
  statsCol: {
    flex: 1,
  },
  kmValue: {
    color: '#f97316',
    fontSize: 28,
    fontWeight: '800',
  },
  kmLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  miniBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  miniBarFill: {
    height: 4,
    backgroundColor: '#f97316',
    borderRadius: 2,
  },
  userName: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 8,
  },
  watermark: {
    color: '#4b5563',
    fontSize: 10,
  },
  shareBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PlanShareCard;
```

#### QW3: Selector de dia de carrera larga en Wizard
**Impacto**: MEDIO (personalizacion, UX)
**Esfuerzo**: 0.5 dias

Anadir un paso intermedio tras seleccionar dias donde el usuario elige cual es su dia de carrera larga.

```typescript
// Anadir dentro del Step 4 (Days) de PlanWizardScreen, despues del grid de dias:
const [longRunDay, setLongRunDay] = useState<number | null>(null);

// Renderizar despues del daysGrid si hay dias seleccionados:
{selectedDays.length >= getMinDays() && (
  <View style={{ marginTop: 20 }}>
    <Text style={[styles.stepTitle, { color: theme.text, fontSize: 18 }]}>
      {lang === 'es' ? 'Dia de carrera larga' : 'Long run day'}
    </Text>
    <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 12 }}>
      {lang === 'es'
        ? 'Normalmente sabado o domingo'
        : 'Usually Saturday or Sunday'}
    </Text>
    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
      {selectedDays.sort((a, b) => a - b).map(day => (
        <TouchableOpacity
          key={day}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: longRunDay === day ? 2 : 1,
            borderColor: longRunDay === day ? '#f97316' : theme.border,
            backgroundColor: longRunDay === day
              ? (isDarkMode ? '#2a1a0e' : '#fff7ed')
              : (isDarkMode ? '#1a1a2e' : '#f3f4f6'),
          }}
          onPress={() => setLongRunDay(day)}
        >
          <Text style={{
            color: longRunDay === day ? '#f97316' : theme.text,
            fontWeight: longRunDay === day ? '700' : '500',
          }}>
            {dayLabels[day - 1]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}
```

### MEDIUM EFFORT (3-5 dias cada uno)

#### ME1: Bienvenida personalizada post-generacion del plan
**Impacto**: ALTO (primera impresion, engagement, retencion dia 1)
**Esfuerzo**: 2 dias

En vez de hacer `navigation.goBack()` tras generar el plan, mostrar una pantalla de bienvenida con:
- Nombre del usuario en grande
- Animacion de confeti (react-native-confetti-cannon)
- Resumen del plan generado
- "Tu plan empieza el lunes" con fecha
- Boton "Ver mi plan" que lleva a PlanScreen
- Social proof: "Unete a 390 runners entrenando con CorrerJuntos"

**Archivo**: `PlanWelcomeScreen.tsx` (nueva pantalla)

#### ME2: Integracion con calendario nativo (expo-calendar)
**Impacto**: ALTO (Runna dice 300% mas prob. de completar)
**Esfuerzo**: 3 dias

Componentes:
- Boton "Anadir al calendario" en PlanScreen
- Solicitar permiso con `expo-calendar`
- Crear eventos para cada workout con titulo, descripcion, hora
- Permitir elegir hora por defecto (ej: 7:00 AM)
- Actualizar eventos si se recalibra el plan

```typescript
// Servicio: src/services/calendarSync.ts
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export const requestCalendarPermission = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

export const getDefaultCalendarId = async (): Promise<string | null> => {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const defaultCal = calendars.find(
    c => c.allowsModifications && c.source.name === (
      Platform.OS === 'ios' ? 'iCloud' : 'Default'
    )
  );
  return defaultCal?.id || calendars[0]?.id || null;
};

export const syncPlanToCalendar = async (
  workouts: Array<{
    titulo: string;
    descripcion: string;
    fecha: string;
    duracion_min: number;
  }>,
  defaultHour: number = 7
): Promise<number> => {
  const calId = await getDefaultCalendarId();
  if (!calId) return 0;

  let count = 0;
  for (const w of workouts) {
    const start = new Date(`${w.fecha}T${String(defaultHour).padStart(2,'0')}:00:00`);
    const end = new Date(start.getTime() + (w.duracion_min || 30) * 60000);

    await Calendar.createEventAsync(calId, {
      title: `CorrerJuntos: ${w.titulo}`,
      notes: w.descripcion,
      startDate: start,
      endDate: end,
      alarms: [{ relativeOffset: -30 }], // 30 min antes
    });
    count++;
  }
  return count;
};
```

#### ME3: Calendario horizontal con dias de la semana (estilo Runna)
**Impacto**: MEDIO (mejor UX, navegacion rapida)
**Esfuerzo**: 3 dias

Reemplazar el toggle lista/calendario por una vista unificada:
- Fila superior: Lun-Dom con dots de colores indicando estado
- Contenido: workouts del dia seleccionado
- Swipe izq/derecha para cambiar semana
- Mas intuitivo que el calendar completo para uso diario

```typescript
// Componente: WeekDayStrip
const WeekDayStrip: React.FC<{
  workouts: UserWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weekStartDate: string;
}> = ({ workouts, selectedDate, onSelectDate, weekStartDate }) => {
  const lang = getCurrentLanguage();
  const dayLabels = lang === 'es'
    ? ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']
    : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Generate 7 dates from weekStartDate (Monday)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={stripStyles.container}>
      {dates.map((date, i) => {
        const dayWorkouts = workouts.filter(w => w.fecha === date);
        const hasWorkout = dayWorkouts.length > 0;
        const isCompleted = dayWorkouts.some(w => w.estado === 'completed');
        const isSkipped = dayWorkouts.some(w => w.estado === 'skipped');
        const isToday = date === todayStr;
        const isSelected = date === selectedDate;
        const dayNum = new Date(date).getDate();

        return (
          <TouchableOpacity
            key={date}
            style={[
              stripStyles.dayCol,
              isSelected && stripStyles.daySelected,
            ]}
            onPress={() => onSelectDate(date)}
          >
            <Text style={[
              stripStyles.dayLabel,
              isToday && { color: '#f97316', fontWeight: '700' },
            ]}>
              {dayLabels[i]}
            </Text>
            <Text style={[
              stripStyles.dayNum,
              isSelected && { color: '#f97316' },
              isToday && !isSelected && { color: '#f97316' },
            ]}>
              {dayNum}
            </Text>
            {/* Status dot */}
            {hasWorkout && (
              <View style={[
                stripStyles.dot,
                {
                  backgroundColor: isCompleted
                    ? '#22c55e'
                    : isSkipped
                      ? '#ef4444'
                      : isToday
                        ? '#f97316'
                        : '#d1d5db',
                },
              ]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const stripStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayCol: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    minWidth: 40,
  },
  daySelected: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  dayLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
```

### LARGE EFFORT (1-2 semanas cada uno)

#### LE1: Integraciones Strava/Garmin/COROS
**Impacto**: MUY ALTO (diferenciador clave, retencion power users)
**Esfuerzo**: 2-3 semanas (depende de aprobaciones API)

**Estado actual:**
- Garmin: solicitud enviada, esperando 2-4 semanas
- COROS: solicitud enviada, revision abril 2026
- Apple Watch: SDK publico, implementable cuando queramos

**Flujo propuesto:**
1. Usuario inicia plan
2. Conecta reloj (pantalla de conexion con logos)
3. Se pushean workouts estructurados al reloj
4. Reloj guia el entrenamiento (intervalos, zonas)
5. Datos vuelven a la app (distancia real, ritmo, FC)
6. Auto-complete del workout en el plan

#### LE2: Tabs multi-deporte (Fuerza, Yoga, Estiramientos)
**Impacto**: ALTO (diferenciador, valor percibido premium)
**Esfuerzo**: 2 semanas

Requiere:
- Nuevos templates de sesiones de fuerza para runners
- Videos o animaciones de ejercicios
- Nuevos tipos de workout en el schema (strength, yoga, stretch)
- Tab bar en la vista del plan para filtrar por tipo
- Posiblemente integracion con videos (expo-av ya integrado)

---

## 4. Roadmap Recomendado

### Fase 1 - Abril 2026 (con lanzamiento planes)
1. **QW1** - Hero stats mejorados (0.5 dias)
2. **QW3** - Dia de carrera larga en wizard (0.5 dias)
3. **ME1** - Bienvenida post-generacion (2 dias)

### Fase 2 - Abril-Mayo 2026
4. **QW2** - Card compartible (1.5 dias)
5. **ME2** - Integracion calendario nativo (3 dias)
6. **ME3** - Calendario horizontal semanal (3 dias)

### Fase 3 - Mayo-Junio 2026
7. **LE1** - Garmin/COROS/Apple Watch (cuando lleguen aprobaciones)
8. **LE2** - Multi-deporte (post-validacion con usuarios)

**Estimacion total Fase 1+2**: ~10.5 dias de desarrollo
**Impacto esperado en retencion**: De 2.6% D7 a 8-12% D7 (con planes activos + bienvenida + calendario)

---

## 5. Metricas de Exito

| Metrica | Actual | Target Fase 1 | Target Fase 2 |
|---------|--------|---------------|---------------|
| Planes iniciados | 0 | 50+ | 150+ |
| D7 retencion | 2.6% | 8% | 15% |
| Completion rate plan | N/A | 30% | 45% |
| Shares de card | N/A | N/A | 20/semana |
| Calendar syncs | N/A | N/A | 40% de planes |
| Conversion free->premium | 0.5% | 2% | 5% |
