# CorrerJuntos - Resumen de Mejoras Web para Implementar en iOS

**Fecha:** Febrero 2025
**Última actualización:** 1 Febrero 2026
**Objetivo:** Replicar todas las mejoras de UX/UI de la web en la app iOS

---

## 🆕 CAMBIOS DE ESTA SESIÓN (1 Feb 2026)

### 1. Layout Desktop 70/30
- **Mapa:** 70% del ancho en desktop (>1024px)
- **Filtros:** Sidebar lateral 30% con scroll independiente
- **Sticky:** Ambos elementos son sticky (top: 100px)
- En tablet/mobile: Layout vertical tradicional

### 2. Toast Mejorado (Material Design)
- Animación slide-in desde la derecha
- Contenedor fijo en esquina inferior derecha
- Botón de cerrar (X)
- Iconos por tipo: ✅ success, ❌ error, ℹ️ info, ⚠️ warning
- Auto-dismiss después de 4 segundos
- En mobile: slide-up desde abajo

### 3. Filtros Desktop Sidebar
- Filtros verticales en cards
- Contador de resultados en tiempo real
- Botón "Ver resultados" con scroll suave
- Teaser de filtros Premium para usuarios gratis
- Sincronización con filtros móviles

### 4. Terreno, Desnivel y Amenities (NUEVO)
- **En formulario de crear quedada (Sección 5):**
  - Tipo de terreno: 🛣️ Asfalto, 🌲 Tierra/Trail, 🔀 Mixto
  - Desnivel: ⬜ Llano, 📐 Suave, ⛰️ Moderado, 🏔️ Fuerte
  - Amenities (multi-select): 💧 Fuentes, 🚻 Baños, 🅿️ Parking, 🚿 Vestuarios, 💡 Luz, 🌳 Sombra, ☕ Café, 🚇 Metro

- **En tarjetas de quedadas:**
  - Tags visuales para terreno y desnivel
  - Iconos de amenities con tooltip
  - Colores diferenciados: naranja para terreno/desnivel, azul para amenities

- **Campos en base de datos:**
  - `terreno`: VARCHAR (asfalto, tierra, mixto)
  - `desnivel`: VARCHAR (llano, suave, moderado, fuerte)
  - `amenities`: JSONB array (["fuentes", "banos", "parking", ...])

### 5. Fix: Contador de Filtros
- El contador del sidebar ahora se actualiza al cargar quedadas
- Se llama a `updateFilterUI()` después de `loadQuedadas()`

---

## ÍNDICE
1. [Landing Page y Onboarding](#1-landing-page-y-onboarding)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Mapa de Quedadas](#3-mapa-de-quedadas)
4. [Tarjetas de Quedadas](#4-tarjetas-de-quedadas)
5. [Sistema de Filtros](#5-sistema-de-filtros)
6. [Crear Nueva Quedada](#6-crear-nueva-quedada)
7. [Sistema de Confirmación (Unirse)](#7-sistema-de-confirmación-unirse)
8. [Perfil de Usuario](#8-perfil-de-usuario)
9. [Sistema de Badges y Gamificación](#9-sistema-de-badges-y-gamificación)
10. [Light Mode](#10-light-mode)
11. [Componentes UI Reutilizables](#11-componentes-ui-reutilizables)
12. [Detalles Técnicos](#12-detalles-técnicos)

---

## 1. LANDING PAGE Y ONBOARDING

### Hero Section
- Título grande con gradiente naranja: "Corre en grupo, nunca solo"
- Subtítulo: "Encuentra runners cerca de ti y únete a quedadas de running"
- CTA principal: "Explorar quedadas" (botón naranja con sombra)
- CTA secundario: "Crear cuenta gratis"
- Estadísticas animadas: "X runners activos", "X quedadas este mes"

### Testimonios
- Cards con foto, nombre, ciudad y quote
- Diseño: fondo slate-800/50 con borde sutil
- En light mode: fondo beige cálido (#fef9f3)

### Pricing (Premium)
- 3 planes: Gratis, Premium Mensual (4.99€), Premium Anual (39.99€)
- Badges "Popular" en el plan recomendado
- Lista de features con checkmarks verdes/grises
- Cards con hover effect y borde naranja en el destacado

---

## 2. DASHBOARD PRINCIPAL

### Banner de Quedadas Disponibles
```
┌─────────────────────────────────────────────────────┐
│ 📍 [X] quedadas disponibles                         │
│ Filtra por nivel, hora y ubicación para encontrar   │
│ tu grupo                              [Ver quedadas]│
└─────────────────────────────────────────────────────┘
```
- Fondo: gradiente naranja/amber con 15% opacidad
- Borde: naranja con 30% opacidad
- Icono grande en círculo naranja
- Botón CTA naranja sólido

### Mensaje de Bienvenida (Usuarios Nuevos)
Si el usuario no tiene quedadas:
```
"👋 ¡Bienvenido a CorrerJuntos!"
"Hay [X] quedadas esperándote. ¡Únete a tu primera!"
[Botón: Explorar quedadas]
```

### Organización del Dashboard
1. Banner de quedadas
2. Mapa (toggle minimizar/expandir)
3. Filtros
4. Lista de quedadas agrupadas por fecha:
   - "Hoy"
   - "Mañana"
   - "Esta semana"
   - "Próximamente"

---

## 3. MAPA DE QUEDADAS

### Tamaños Responsivos
```swift
// iOS equivalentes
iPhone SE/Mini: 280pt
iPhone Standard: 320pt
iPhone Pro Max: 380pt
iPad: 450pt
iPad Pro: 520pt
```

### Estados del Mapa
1. **Normal:** Altura estándar según dispositivo
2. **Minimizado:** 120pt (solo para ver ubicación general)
3. **Expandido:** +40% del tamaño normal
4. **Fullscreen:** Ocupa toda la pantalla (Premium)

### Botones del Mapa
- **Ubicación:** Icono ⌖ en esquina inferior izquierda
- **Expandir:** Icono de flechas en esquina inferior derecha
- **Toggle tamaño:** "Minimizar/Expandir" arriba del mapa

### Marcadores (Pins)
```swift
// Pin de quedada en el mapa
struct QuedadaPin {
    let icon = "🏃"
    let size = CGSize(width: 36, height: 36)
    let backgroundColor = LinearGradient(
        colors: [.orange, .orange.darker],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    let borderColor = Color.white
    let borderWidth: CGFloat = 3
    let shadowColor = Color.orange.opacity(0.3)
    let shadowRadius: CGFloat = 12
}
```

### Popup del Marcador
Al tocar un pin:
```
┌─────────────────────┐
│ Título de quedada   │
│ 📍 Ubicación        │
│ 📅 Fecha            │
└─────────────────────┘
```

---

## 4. TARJETAS DE QUEDADAS

### Estructura de la Tarjeta
```
┌─────────────────────────────────────────────────────┐
│ [HORA]  [FECHA]   [🔴 En vivo]  [Tu quedada]  [NIVEL]│
│  10:00   Sáb 15                                     │
├─────────────────────────────────────────────────────┤
│ Título de la Quedada                                │
│                                                     │
│ 📍 Madrid  │  📈 10km  │  👥 5 🔥                   │
│                                                     │
│ 📍 Parque del Retiro, entrada principal             │
│ "Ruta suave por el parque, ideal para principiantes"│
│                                                     │
│ [⏱️ 5:30/km] [🌱 Corta] [👋 Principiantes OK]       │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔥 5 runners ya apuntados        ¡Popular!     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Avatar] Organiza: Juan P. ⭐4.8 (12) 🏅           │
│                                                     │
│ [Avatares participantes]           [Unirme] 🟠     │
└─────────────────────────────────────────────────────┘
```

### Estados de la Tarjeta

#### Usuario NO unido:
- Botón "Unirme" naranja sólido con gradiente

#### Usuario UNIDO (según estado):
- **Confirmado:** Badge verde "✅ Confirmado" + botón abandonar
- **Quizás:** Badge amarillo "🤔 Quizás" + botón abandonar
- **Interesado:** Badge azul "👀 Interesado" + botón abandonar

#### Es CREADOR:
- Badge ámbar "👑 Tu quedada"
- Sin botón de unirse

### Tags Automáticos
```swift
// Lógica para mostrar tags
func getQuedadaTags(quedada: Quedada) -> [Tag] {
    var tags: [Tag] = []

    // Ritmo (si existe)
    if let ritmo = quedada.ritmo {
        tags.append(Tag(icon: "⏱️", text: ritmo, style: .neutral))
    }

    // Distancia corta
    if let dist = quedada.distanciaKm, dist < 8 {
        tags.append(Tag(icon: "🌱", text: "Corta", style: .green))
    }

    // Distancia larga
    if let dist = quedada.distanciaKm, dist > 15 {
        tags.append(Tag(icon: "🔥", text: "Larga", style: .red))
    }

    // Apto principiantes
    if quedada.nivel == "Principiante" {
        tags.append(Tag(icon: "👋", text: "Principiantes OK", style: .blue))
    }

    return tags
}
```

### FOMO Element (Social Proof)
Mostrar si hay 3+ runners confirmados:
```swift
// Mensajes según cantidad
switch confirmedCount {
case 3...4: "👥 \(count) runners ya apuntados"
case 5...7: "⚡ \(count) runners ya apuntados"
case 8...: "🔥 \(count) runners ya apuntados - ¡Popular!"
default: nil // No mostrar
}
```

### Badges del Organizador
```swift
enum OrganizerBadge {
    case premium      // ⭐ Premium
    case verified     // ✓ Verificado
    case expert       // 🏆 Experto (20+ quedadas)
    case elite        // 🏅 Elite (10+ quedadas)
    case active       // ⭐ Activo (5+ quedadas)
    case topRated     // 💫 Top (4.5+ rating)
    case recommended  // 👍 Recomendado (4.0+ rating)
    case new          // 🆕 Nuevo
}
```

---

## 5. SISTEMA DE FILTROS

### Filtros Gratuitos

#### Horario
```swift
enum HorarioFilter: String, CaseIterable {
    case manana = "🌅 Mañana"      // 6:00 - 12:00
    case tarde = "🌆 Tarde"        // 12:00 - 20:00
    case noche = "🌙 Noche"        // 20:00 - 6:00
}
```

#### Nivel
```swift
enum NivelFilter: String, CaseIterable {
    case principiante = "🟢 Principiante"
    case intermedio = "🟡 Intermedio"
    case avanzado = "🔴 Avanzado"
    case elite = "🟣 Elite"
}
```

#### Distancia (NUEVO)
```swift
enum DistanciaFilter: String, CaseIterable {
    case corta = "🌱 Corta (<8km)"
    case media = "🏃 Media (8-15km)"
    case larga = "🔥 Larga (>15km)"
}
```

### Filtros Premium

#### Ritmo
```swift
enum RitmoFilter: String, CaseIterable {
    case lento = "🐢 Lento (>6:00/km)"
    case moderado = "🚶 Moderado (5:00-6:00/km)"
    case rapido = "🏃 Rápido (<5:00/km)"
}
```

#### Organizador
```swift
enum OrganizerFilter {
    case verified    // ✅ Organizador verificado
    case premium     // ⭐ Organizador Premium
}
```

### UI de Filtros
- Pills/Chips seleccionables
- Múltiple selección dentro de cada categoría: NO (solo uno)
- Contador de filtros activos en badge
- Botón "Limpiar filtros" cuando hay filtros activos

### Lógica de Filtrado
```swift
func applyFilters(quedadas: [Quedada], filters: ActiveFilters) -> [Quedada] {
    return quedadas.filter { q in
        // Nivel
        if let nivel = filters.nivel, q.nivel != nivel {
            return false
        }

        // Horario
        if let horario = filters.horario, let hora = q.hora {
            let hour = Calendar.current.component(.hour, from: hora)
            switch horario {
            case .manana: if hour < 6 || hour >= 12 { return false }
            case .tarde: if hour < 12 || hour >= 20 { return false }
            case .noche: if hour >= 6 && hour < 20 { return false }
            }
        }

        // Distancia
        if let distancia = filters.distancia, let km = q.distanciaKm {
            switch distancia {
            case .corta: if km >= 8 { return false }
            case .media: if km < 8 || km > 15 { return false }
            case .larga: if km <= 15 { return false }
            }
        }

        // Premium: Ritmo
        if let ritmo = filters.ritmo, let qRitmo = q.ritmoMinutos {
            switch ritmo {
            case .lento: if qRitmo < 6 { return false }
            case .moderado: if qRitmo < 5 || qRitmo >= 6 { return false }
            case .rapido: if qRitmo >= 5 { return false }
            }
        }

        return true
    }
}
```

---

## 6. CREAR NUEVA QUEDADA

### Formulario con Progress Bar

#### Campos y Pesos para Progreso
```swift
struct FormField {
    let id: String
    let weight: Int
    let isRequired: Bool
}

let formFields = [
    // Obligatorios (75%)
    FormField(id: "titulo", weight: 15, isRequired: true),
    FormField(id: "ubicacion", weight: 15, isRequired: true),
    FormField(id: "fecha", weight: 15, isRequired: true),
    FormField(id: "hora", weight: 15, isRequired: true),
    FormField(id: "distancia", weight: 15, isRequired: true),

    // Opcionales (25%)
    FormField(id: "nivel", weight: 5, isRequired: false),
    FormField(id: "ritmo", weight: 5, isRequired: false),
    FormField(id: "descripcion", weight: 10, isRequired: false),
    FormField(id: "referencia", weight: 5, isRequired: false)
]
```

#### Progress Bar Visual
```
0-30%:   Rojo     (#ef4444)
31-60%:  Amarillo (#eab308)
61-99%:  Azul     (#3b82f6)
100%:    Verde    (#22c55e)
```

### Selector de Ubicación en Mapa

#### Componentes
1. **Campo de búsqueda:** Autocompletado de ciudades/lugares
2. **Mapa interactivo:** Click para marcar punto exacto
3. **Pin central:** Icono 🏃 (runner) en lugar de 📍
4. **Badge de ubicación:** Muestra dirección detectada
5. **Botón "Usar mi ubicación"**

#### Reverse Geocoding (Nominatim)
```swift
struct LocationDetails {
    let calle: String?        // road, pedestrian, footway
    let numero: String?       // house_number
    let barrio: String?       // suburb, neighbourhood
    let ciudad: String?       // city, town, village
    let provincia: String?    // province, state
    let nombreLugar: String?  // amenity, tourism, leisure
}

// Formato de visualización
func formatLocationBadge(loc: LocationDetails) -> String {
    var parts: [String] = []

    // Prioridad: lugar específico > calle > barrio
    if let lugar = loc.nombreLugar, lugar != loc.ciudad {
        parts.append(lugar)
    } else if let calle = loc.calle {
        let calleCompleta = loc.numero != nil ? "\(calle) \(loc.numero!)" : calle
        parts.append(calleCompleta)
    }

    if let barrio = loc.barrio, !parts.contains(barrio) {
        parts.append(barrio)
    }

    if let ciudad = loc.ciudad {
        if let provincia = loc.provincia, provincia != ciudad {
            parts.append("\(ciudad), \(provincia)")
        } else {
            parts.append(ciudad)
        }
    }

    // Formato: "Calle Mayor 15, Centro · Madrid, Madrid"
    let firstTwo = parts.prefix(2).joined(separator: ", ")
    let rest = parts.dropFirst(2).joined(separator: " · ")
    return rest.isEmpty ? firstTwo : "\(firstTwo) · \(rest)"
}
```

### Inputs Especiales

#### Hora (Dual Pickers)
```swift
// NO usar DatePicker de hora completo
// Usar dos pickers separados:
HStack {
    Picker("Hora", selection: $selectedHour) {
        ForEach(6...22, id: \.self) { hour in
            Text(String(format: "%02d", hour))
        }
    }
    Text(":")
    Picker("Minutos", selection: $selectedMinute) {
        ForEach([0, 15, 30, 45], id: \.self) { min in
            Text(String(format: "%02d", min))
        }
    }
}
```

#### Distancia (Number Input con Validación)
```swift
TextField("Distancia", value: $distancia, format: .number)
    .keyboardType(.decimalPad)
    .onChange(of: distancia) { newValue in
        // Validar 1-100 km
        if newValue < 1 { distancia = 1 }
        if newValue > 100 { distancia = 100 }
    }
// Sufijo: "km"
```

#### Ritmo (Dual Inputs min:seg)
```swift
HStack {
    TextField("Min", value: $ritmoMin, format: .number)
        .frame(width: 50)
    Text(":")
    TextField("Seg", value: $ritmoSeg, format: .number)
        .frame(width: 50)
    Text("/km")
}
// Feedback: mostrar equivalencia verbal
// "5:30/km → Ritmo moderado"
```

#### Descripción (con Snippets)
```swift
let descriptionSnippets = [
    "🌳 Ruta por parque",
    "🏃 Ritmo constante",
    "☕ Quedamos después",
    "🚰 Hay fuentes",
    "🅿️ Parking cerca",
    "🐕 Se admiten perros"
]

// Contador de caracteres: X/300
```

### Preview antes de Publicar
Modal/Sheet que muestra cómo se verá la tarjeta antes de publicar.

---

## 7. SISTEMA DE CONFIRMACIÓN (UNIRSE)

### Modal de Asistencia
```
┌─────────────────────────────────────────┐
│              🏃                         │
│    ¿Cómo de seguro estás?              │
│  Ayuda al organizador a planificar      │
│                                         │
│  [✅ Voy seguro]        ← Verde         │
│  [🤔 Posiblemente]      ← Amarillo      │
│  [👀 Me interesa]       ← Azul          │
│                                         │
│  [Cancelar]                             │
└─────────────────────────────────────────┘
```

### Si ya está unido:
```
┌─────────────────────────────────────────┐
│              ✅                         │
│         Ya estás apuntado              │
│    Estado actual: Confirmado            │
│                                         │
│  [Cambiar a Posiblemente]               │
│  [Cambiar a Interesado]                 │
│                                         │
│  [🚪 Abandonar quedada]  ← Rojo         │
│  [Cerrar]                               │
└─────────────────────────────────────────┘
```

### Feedback al Unirse
```swift
func onJoinSuccess(status: AttendanceStatus, quedada: Quedada) {
    // 1. Toast informativo
    let runnerCount = quedada.confirmedCount + 1
    let message: String
    switch status {
    case .confirmed:
        message = "🎉 ¡Confirmado! Te esperamos (\(runnerCount) runners confirmados)"
    case .maybe:
        message = "🤔 Apuntado como 'Posiblemente' - Confirma cuando puedas"
    case .interested:
        message = "👀 Marcado como interesado - Te avisaremos de novedades"
    }
    showToast(message, type: .success)

    // 2. Confetti animation (solo en confirmed)
    if status == .confirmed {
        showConfetti()
    }

    // 3. Haptic feedback
    let generator = UINotificationFeedbackGenerator()
    generator.notificationOccurred(.success)
}
```

### Modal de Abandonar
```
┌─────────────────────────────────────────┐
│              👋                         │
│      ¿Abandonar quedada?               │
│                                         │
│  ¿Seguro que quieres abandonar         │
│  esta quedada?                          │
│                                         │
│  [🚪 Sí, abandonar]     ← Rojo          │
│  [No, quedarme]                         │
└─────────────────────────────────────────┘
```

Si es el creador:
```
⚠️ Eres el creador de esta quedada.
Si la abandonas y no queda nadie,
se eliminará automáticamente.
```

---

## 8. PERFIL DE USUARIO

### Header del Perfil
```
┌─────────────────────────────────────────┐
│  [Foto]   Nombre Apellido               │
│  🏅 Nivel: Intermedio                   │
│  📍 Madrid                              │
│                                         │
│  [X siguiendo]  [X seguidores]          │
│                                         │
│  [📊 Ranking] [🏅 Logros]               │
└─────────────────────────────────────────┘
```

### Stats Grid (4 cards)
```
┌──────────┬──────────┐
│ Quedadas │    Km    │
│   12     │   156    │
│ totales  │ corridos │
├──────────┼──────────┤
│ Runners  │ Próximas │
│   34     │    2     │
│conocidos │ quedadas │
└──────────┴──────────┘
```

### Stats Premium (usuarios premium)
```
┌─────────────────────────────────────────┐
│ ⭐ Estadísticas Premium                 │
├──────────┬──────────┬──────────┬────────┤
│ 🔥 Racha │ 📊 Media │ 👑 Creadas│🏆 Badges│
│ 4 semanas│ 8.5 km  │    5     │   8    │
├──────────┴──────────┴──────────┴────────┤
│ 📈 Actividad últimas 8 semanas          │
│ [▁▂▃▅▂▄▆▃] (mini gráfico de barras)     │
└─────────────────────────────────────────┘
```

### Sección "Mis Quedadas"
```
┌─────────────────────────────────────────┐
│ 🏃 Mis Quedadas          [Actualizar]   │
├─────────────────────────────────────────┤
│ [📅 Próximas]  [✅ Completadas]         │
├─────────────────────────────────────────┤
│ Lista de quedadas...                    │
│ (max-height con scroll)                 │
└─────────────────────────────────────────┘
```

### Estado Vacío "Mis Quedadas"
```
┌─────────────────────────────────────────┐
│              📍                         │
│   [X] quedadas te esperan              │
│ Únete a una y conoce tu grupo          │
│                                         │
│  [📍 Descubrir quedadas]                │
└─────────────────────────────────────────┘
```

### Mi Progreso (Goal-Oriented)
En lugar de mostrar "0 Puntos, 0 Creadas, 0 Asistidas":
```
┌─────────────────────────────────────────┐
│ 🎯 Tu objetivo: Primera quedada         │
│ ████████░░░░░░░░░░░░ 40%               │
│                                         │
│ Próximos badges a desbloquear:          │
│ [🏃 Primera carrera] [👥 Social runner] │
└─────────────────────────────────────────┘
```

---

## 9. SISTEMA DE BADGES Y GAMIFICACIÓN

### Badges Disponibles
```swift
enum Badge: String, CaseIterable {
    // Participación
    case primeraQuedada = "🏃 Primera Carrera"
    case cincoQuedadas = "⭐ Runner Activo"
    case diezQuedadas = "🏅 Runner Dedicado"
    case veinteQuedadas = "🏆 Runner Experto"
    case cincuentaQuedadas = "👑 Leyenda"

    // Creación
    case primerOrganizador = "📣 Primer Organizador"
    case cincoOrganizadas = "🎯 Organizador Activo"
    case diezOrganizadas = "⭐ Organizador Elite"

    // Social
    case socialRunner = "👥 Social Runner" // 10 runners diferentes
    case influencer = "📢 Influencer" // 5 seguidores

    // Distancia
    case cienKm = "💯 Club 100km"
    case quinientosKm = "🚀 Club 500km"
    case milKm = "🌟 Club 1000km"

    // Constancia
    case rachaUno = "🔥 En racha" // 2 semanas seguidas
    case rachaDos = "🔥🔥 Imparable" // 4 semanas
    case rachaTres = "🔥🔥🔥 Leyenda" // 8 semanas

    // Especiales
    case madrugador = "🌅 Madrugador" // 5 quedadas antes de 8am
    case noctambulo = "🌙 Noctámbulo" // 5 quedadas después de 20h
    case findelSemana = "📅 Runner de Finde" // 10 en fin de semana
}
```

### Progreso de Badge
```swift
struct BadgeProgress {
    let badge: Badge
    let current: Int
    let required: Int
    let isUnlocked: Bool

    var progress: Double {
        Double(current) / Double(required)
    }
}
```

### Modal de Badges
```
┌─────────────────────────────────────────┐
│ 🏅 Tus Logros                           │
│ 8 de 20 desbloqueados                   │
├─────────────────────────────────────────┤
│ ✅ Desbloqueados                        │
│ [🏃] [⭐] [📣] [👥] [💯] [🔥] [🌅] [📅] │
├─────────────────────────────────────────┤
│ 🔒 Por desbloquear                      │
│ [🏅 Runner Dedicado - 7/10]             │
│ [████████░░] 70%                        │
│                                         │
│ [🚀 Club 500km - 156/500]               │
│ [███░░░░░░░] 31%                        │
└─────────────────────────────────────────┘
```

---

## 10. LIGHT MODE

### Paleta de Colores Light Mode
```swift
struct LightModeColors {
    // Fondos
    static let background = Color(hex: "#fffcf9")      // Beige muy claro
    static let cardBackground = Color(hex: "#fef9f3")  // Beige cálido
    static let inputBackground = Color(hex: "#fef7ed") // Beige input

    // Bordes
    static let border = Color(hex: "#efe6db")          // Beige borde
    static let borderHover = Color(hex: "#fcd9b8")     // Naranja suave

    // Textos
    static let textPrimary = Color(hex: "#3d3229")     // Marrón oscuro
    static let textSecondary = Color(hex: "#5c4d3d")   // Marrón medio
    static let textMuted = Color(hex: "#8b7355")       // Marrón claro

    // Acentos
    static let accent = Color(hex: "#f97316")          // Naranja
    static let accentLight = Color(hex: "#fff4e6")     // Naranja muy claro
}
```

### Componentes que cambian en Light Mode
1. **Cards:** Fondo beige, bordes sutiles
2. **Inputs:** Fondo beige claro, texto marrón
3. **Modals:** Fondo beige con sombra suave
4. **Chips/Pills:** Fondo beige con borde
5. **Avatars:** Borde beige en lugar de slate
6. **Testimonials:** Fondo beige cálido

### Toggle de Tema
- Icono: 🌙 (dark) / ☀️ (light)
- Transición suave (0.3s)
- Guardar preferencia en UserDefaults

---

## 11. COMPONENTES UI REUTILIZABLES

### Toast/Snackbar
```swift
struct ToastView: View {
    enum ToastType {
        case success // Verde
        case error   // Rojo
        case info    // Azul
        case warning // Amarillo
    }

    let message: String
    let type: ToastType

    // Duración: 3 segundos
    // Posición: Bottom con safe area
    // Animación: Slide up + fade
}
```

### Confetti Animation
```swift
// Usar librería como ConfettiSwiftUI
// Disparar en:
// - Primera quedada creada
// - Unirse a quedada (status: confirmed)
// - Desbloquear badge
// - Alcanzar milestone
```

### Loading States
```swift
// Skeleton loading para:
// - Lista de quedadas
// - Perfil
// - Stats

// Spinner para:
// - Botones de acción
// - Carga de mapa
```

### Empty States
Siempre con:
1. Icono/Emoji grande
2. Título explicativo
3. Subtítulo con contexto
4. CTA principal

---

## 12. DETALLES TÉCNICOS

### Supabase Queries

#### Cargar Quedadas
```swift
let quedadas = try await supabase
    .from("quedadas")
    .select("""
        *,
        creador:profiles!creador_id(
            id, nombre, apellidos, photo_url,
            es_premium, verification_badge,
            organizer_rating, total_reviews, total_organized
        ),
        participantes(
            user_id, status,
            profiles(id, nombre, apellidos, photo_url)
        )
    """)
    .gte("fecha", today)
    .order("fecha", ascending: true)
    .execute()
```

#### Unirse a Quedada
```swift
// Verificar si ya existe
let existing = try await supabase
    .from("participantes")
    .select("id, status")
    .eq("quedada_id", quedadaId)
    .eq("user_id", userId)
    .maybeSingle()
    .execute()

if let existing = existing {
    // Actualizar
    try await supabase
        .from("participantes")
        .update(["status": status])
        .eq("id", existing.id)
        .execute()
} else {
    // Insertar
    try await supabase
        .from("participantes")
        .insert([
            "quedada_id": quedadaId,
            "user_id": userId,
            "status": status
        ])
        .execute()
}
```

### Reverse Geocoding (Nominatim)
```swift
func reverseGeocode(lat: Double, lng: Double) async throws -> LocationDetails {
    let url = URL(string: """
        https://nominatim.openstreetmap.org/reverse?\
        format=json&lat=\(lat)&lon=\(lng)&zoom=18&\
        addressdetails=1&accept-language=es
    """)!

    var request = URLRequest(url: url)
    request.setValue("CorrerJuntos/1.0", forHTTPHeaderField: "User-Agent")

    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(NominatimResponse.self, from: data)

    return LocationDetails(
        calle: response.address.road ?? response.address.pedestrian,
        numero: response.address.houseNumber,
        barrio: response.address.suburb ?? response.address.neighbourhood,
        ciudad: response.address.city ?? response.address.town ?? response.address.village,
        provincia: response.address.province ?? response.address.state,
        nombreLugar: response.address.amenity ?? response.address.tourism
    )
}
```

### Haptic Feedback
```swift
// Success (unirse, crear quedada)
UINotificationFeedbackGenerator().notificationOccurred(.success)

// Selection (cambiar filtro, tap en pill)
UISelectionFeedbackGenerator().selectionChanged()

// Impact (abrir modal, confirmar acción)
UIImpactFeedbackGenerator(style: .medium).impactOccurred()
```

---

## CHECKLIST DE IMPLEMENTACIÓN iOS

### Fase 1: Core Features
- [ ] Dashboard con mapa responsivo
- [ ] Lista de quedadas con agrupación por fecha
- [ ] Tarjetas con toda la información
- [ ] Sistema de filtros (horario, nivel, distancia)
- [ ] Detalle de quedada

### Fase 2: Interacción
- [ ] Modal de asistencia (3 estados)
- [ ] Feedback visual al unirse (toast, confetti, haptic)
- [ ] Abandonar quedada con confirmación
- [ ] Crear quedada con progress bar

### Fase 3: Perfil y Gamificación
- [ ] Perfil con stats
- [ ] Sección "Mis Quedadas"
- [ ] Sistema de badges
- [ ] Progress hacia badges

### Fase 4: Polish
- [ ] Light mode completo
- [ ] Empty states
- [ ] Loading states
- [ ] Animaciones y transiciones

---

## NOTAS ADICIONALES

1. **Performance:** Usar lazy loading para lista de quedadas
2. **Offline:** Cachear quedadas para acceso offline
3. **Push Notifications:** Implementar para recordatorios
4. **Deep Links:** Abrir quedada específica desde URL
5. **Share:** Compartir quedada con preview rico

---

*Documento generado para el equipo de desarrollo iOS de CorrerJuntos*
*Última actualización: Febrero 2025*
