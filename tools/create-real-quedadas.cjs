const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://waihiwdbtcbdazmaxdor.supabase.co',
  'sb_publishable_JjURpz9jAqM4S9r4ofknAg_GW4Es97N'
);

async function main() {
  // 1. Update seed profiles with real photos + realistic stats
  const profiles = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Carlos',
      apellidos: 'Ruiz',
      ciudad: 'Madrid',
      nivel: 'Intermedio',
      bio: 'Corredor habitual por el Retiro. Preparando mi primera media maratón. Ritmo cómodo 5:30-6:00.',
      photo_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop&crop=face',
      total_runs: 87,
      total_distancia_km: 624.5,
      total_duracion_segundos: 198720,
      ritmo_min: '5:15',
      ritmo_max: '6:00',
      dias_preferidos: ['Martes', 'Jueves', 'Sábado'],
      horario_preferido: 'Mañana',
      objetivo: 'Media maratón',
      racha_dias: 3,
      racha_semanal: 12,
      quedadas_asistidas: 14,
      quedadas_creadas: 6,
      matching_visible: true,
      puntos_totales: 1250,
      nivel_gamificacion: 'Corredor'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'Laura',
      apellidos: 'Martínez',
      ciudad: 'Barcelona',
      nivel: 'Avanzado',
      bio: 'Maratoniana. 3h28 en Valencia 2025. Entreno por Ciutadella y Montjuïc.',
      photo_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&crop=face',
      total_runs: 203,
      total_distancia_km: 2156.8,
      total_duracion_segundos: 612000,
      ritmo_min: '4:30',
      ritmo_max: '5:20',
      dias_preferidos: ['Lunes', 'Miércoles', 'Viernes', 'Domingo'],
      horario_preferido: 'Mañana',
      objetivo: 'Maratón sub-3:20',
      racha_dias: 5,
      racha_semanal: 34,
      quedadas_asistidas: 28,
      quedadas_creadas: 12,
      matching_visible: true,
      puntos_totales: 3800,
      nivel_gamificacion: 'Experto'
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      nombre: 'Sergio',
      apellidos: 'García',
      ciudad: 'Valencia',
      nivel: 'Principiante',
      bio: 'Empecé a correr hace 4 meses. El Turia es mi ruta favorita. Buscando grupo.',
      photo_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=400&fit=crop&crop=face',
      total_runs: 23,
      total_distancia_km: 112.3,
      total_duracion_segundos: 45360,
      ritmo_min: '6:00',
      ritmo_max: '7:00',
      dias_preferidos: ['Martes', 'Jueves', 'Sábado'],
      horario_preferido: 'Tarde',
      objetivo: 'Completar 10K',
      racha_dias: 1,
      racha_semanal: 4,
      quedadas_asistidas: 5,
      quedadas_creadas: 3,
      matching_visible: true,
      puntos_totales: 340,
      nivel_gamificacion: 'Novato'
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      nombre: 'Ana',
      apellidos: 'López',
      ciudad: 'Sevilla',
      nivel: 'Intermedio',
      bio: 'Corredora de fondo. María Luisa y Alamillo son mis parques. Preparando Sevilla 10K.',
      photo_url: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&h=400&fit=crop&crop=face',
      total_runs: 134,
      total_distancia_km: 965.2,
      total_duracion_segundos: 318600,
      ritmo_min: '5:00',
      ritmo_max: '5:45',
      dias_preferidos: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
      horario_preferido: 'Mañana',
      objetivo: '10K sub-50',
      racha_dias: 2,
      racha_semanal: 18,
      quedadas_asistidas: 22,
      quedadas_creadas: 8,
      matching_visible: true,
      puntos_totales: 2100,
      nivel_gamificacion: 'Corredor'
    }
  ];

  for (const p of profiles) {
    const { error } = await supabase.from('profiles').update(p).eq('id', p.id);
    if (error) console.error('Profile error:', p.nombre, error.message);
    else console.log('Updated profile:', p.nombre, p.ciudad);
  }

  // 2. Create 4 quedadas for this weekend
  const quedadas = [
    {
      titulo: 'Tirada larga Retiro + Madrid Río',
      ciudad: 'Madrid',
      ubicacion: 'Parque del Retiro - Puerta de Alcalá',
      direccion: 'Puerta de Alcalá, Plaza de la Independencia, Madrid',
      lat: 40.4200,
      lng: -3.6883,
      fecha: '2026-03-22',
      hora: '08:30',
      nivel: 'Intermedio',
      distancia: '14K',
      ritmo: '5:30-6:00 min/km',
      descripcion: 'Tirada larga de fin de semana: Retiro → Atocha → Madrid Río → vuelta por Paseo del Prado. Ritmo cómodo, nadie se queda atrás. Llevad agua.',
      creador_id: '00000000-0000-0000-0000-000000000001',
      max_participantes: 15,
      pais: 'ES',
      organizador_nombre: 'Carlos Ruiz',
      organizador_foto: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop&crop=face'
    },
    {
      titulo: 'Series 400m en pista Montjuïc',
      ciudad: 'Barcelona',
      ubicacion: 'Estadi Olímpic Lluís Companys',
      direccion: 'Passeig Olímpic, 17, Barcelona',
      lat: 41.3648,
      lng: 2.1554,
      fecha: '2026-03-22',
      hora: '09:00',
      nivel: 'Avanzado',
      distancia: '8K (con series)',
      ritmo: '4:30-5:00 min/km',
      descripcion: 'Sesión de calidad: calentamiento 2K + 10x400m rec 90" + vuelta a la calma 2K. Pista del Olímpic de Montjuïc.',
      creador_id: '00000000-0000-0000-0000-000000000002',
      max_participantes: 12,
      pais: 'ES',
      organizador_nombre: 'Laura Martínez',
      organizador_foto: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&crop=face'
    },
    {
      titulo: 'Rodaje suave Jardín del Turia',
      ciudad: 'Valencia',
      ubicacion: 'Jardín del Turia - Puente de las Flores',
      direccion: 'Pont de les Flors, Valencia',
      lat: 39.4785,
      lng: -0.3665,
      fecha: '2026-03-22',
      hora: '19:30',
      nivel: 'Principiante',
      distancia: '6K',
      ritmo: '6:30-7:00 min/km',
      descripcion: 'Rodaje suave por el Turia, perfecto para empezar. Del Puente de las Flores a la Ciudad de las Artes. Ritmo conversacional, todos bienvenidos!',
      creador_id: '00000000-0000-0000-0000-000000000006',
      max_participantes: 20,
      pais: 'ES',
      organizador_nombre: 'Sergio García',
      organizador_foto: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=400&fit=crop&crop=face'
    },
    {
      titulo: 'Entreno 10K Parque María Luisa',
      ciudad: 'Sevilla',
      ubicacion: 'Plaza de España',
      direccion: 'Plaza de España, Sevilla',
      lat: 37.3772,
      lng: -5.9869,
      fecha: '2026-03-23',
      hora: '08:00',
      nivel: 'Intermedio',
      distancia: '10K',
      ritmo: '5:15-5:45 min/km',
      descripcion: 'Circuito por María Luisa: Plaza de España → glorietas → Av. de la Palmera → vuelta. Buen ritmo pero sin forzar. Quedamos en la fuente.',
      creador_id: '00000000-0000-0000-0000-000000000007',
      max_participantes: 15,
      pais: 'ES',
      organizador_nombre: 'Ana López',
      organizador_foto: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&h=400&fit=crop&crop=face'
    }
  ];

  const { data, error } = await supabase.from('quedadas').insert(quedadas).select('id, titulo, ciudad');
  if (error) console.error('Quedadas error:', error.message);
  else console.log('\nQuedadas creadas:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
