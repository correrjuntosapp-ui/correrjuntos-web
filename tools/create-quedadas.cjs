#!/usr/bin/env node
/**
 * Script para crear quedadas ficticias con perfiles realistas.
 *
 * Uso:
 *   node tools/create-quedadas.cjs
 *
 * Requisitos:
 *   - SUPABASE_SERVICE_KEY en .env.local o como variable de entorno
 *   - Los perfiles se crean automáticamente en auth.users + profiles
 *
 * Para añadir más quedadas, edita el array QUEDADAS abajo.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
// Read from env only — NEVER hardcode service_role keys (they bypass RLS)
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  (() => {
    try {
      return require('fs').readFileSync(require('path').join(__dirname, '..', '.env'), 'utf8')
        .match(/SUPABASE_SERVICE_KEY=(.+)/)?.[1]?.trim();
    } catch { return null; }
  })();

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY in env or .env file');
  console.error('This script needs a service_role key to bypass RLS.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ============================================================
// CONFIGURACIÓN DE QUEDADAS — Edita aquí para añadir/cambiar
// ============================================================

// Helper: fecha relativa (días desde hoy)
function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

const PERFILES = [
  {
    email: 'carlos.seed@correrjuntos.test',
    nombre: 'Carlos',
    apellidos: 'Martin',
    ciudad: 'Madrid',
    pais: 'ES',
    nivel: 'Intermedio',
    photo: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=200&h=200&fit=crop'
  },
  {
    email: 'sergio.seed@correrjuntos.test',
    nombre: 'Sergio',
    apellidos: 'Lopez',
    ciudad: 'Valencia',
    pais: 'ES',
    nivel: 'Intermedio',
    photo: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=200&h=200&fit=crop'
  },
  {
    email: 'ana.seed@correrjuntos.test',
    nombre: 'Ana',
    apellidos: 'Moreno',
    ciudad: 'Sevilla',
    pais: 'ES',
    nivel: 'Principiante',
    photo: 'https://images.unsplash.com/photo-1517931524326-bdd55a541177?w=200&h=200&fit=crop'
  },
  {
    email: 'laura.seed@correrjuntos.test',
    nombre: 'Laura',
    apellidos: 'Vidal',
    ciudad: 'Barcelona',
    pais: 'ES',
    nivel: 'Avanzado',
    photo: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=200&h=200&fit=crop'
  }
];

const QUEDADAS = [
  {
    perfilIndex: 0, // Carlos - Madrid
    titulo: 'Rodaje suave por El Retiro',
    ciudad: 'Madrid',
    ubicacion: 'Puerta de Alcalá, entrada Retiro',
    lat: 40.4200,
    lng: -3.6883,
    fecha: futureDate(5),
    hora: '08:00:00',
    nivel: 'Intermedio',
    distancia: '8',
    ritmo: '5:30 min/km',
    descripcion: 'Rodaje tranquilo por los caminos del Retiro. Ritmo conversacional, ideal para empezar la semana.',
    pais: 'ES'
  },
  {
    perfilIndex: 1, // Sergio - Valencia
    titulo: 'Rodaje fácil por el río Turia',
    ciudad: 'Valencia',
    ubicacion: 'Jardín del Turia, junto Palau de la Música',
    lat: 39.4735,
    lng: -0.3756,
    fecha: futureDate(3),
    hora: '19:30:00',
    nivel: 'Intermedio',
    distancia: '6',
    ritmo: '5:45 min/km',
    descripcion: 'Rodaje suave por el antiguo cauce del Turia al atardecer. Terreno llano, ideal para todos.',
    pais: 'ES'
  },
  {
    perfilIndex: 2, // Ana - Sevilla
    titulo: 'Ruta por María Luisa y Plaza España',
    ciudad: 'Sevilla',
    ubicacion: 'Plaza de España, entrada principal',
    lat: 37.3772,
    lng: -5.9869,
    fecha: futureDate(6),
    hora: '09:00:00',
    nivel: 'Principiante',
    distancia: '5',
    ritmo: '6:30 min/km',
    descripcion: 'Ruta fácil por el Parque de María Luisa y alrededores de Plaza de España. Ritmo tranquilo.',
    pais: 'ES'
  },
  {
    perfilIndex: 3, // Laura - Barcelona
    titulo: 'Series en la Barceloneta',
    ciudad: 'Barcelona',
    ubicacion: 'Paseo Marítimo de la Barceloneta',
    lat: 41.3784,
    lng: 2.1925,
    fecha: futureDate(7),
    hora: '07:30:00',
    nivel: 'Avanzado',
    distancia: '10',
    ritmo: '4:45 min/km',
    descripcion: 'Series de 400m en el paseo marítimo. Calentamiento 2km + 8x400 rec 200 + vuelta a la calma.',
    pais: 'ES'
  }
];

// ============================================================
// EJECUCIÓN
// ============================================================

async function getOrCreateProfile(perfil) {
  // Check if profile exists by email pattern
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nombre')
    .eq('nombre', perfil.nombre)
    .eq('ciudad', perfil.ciudad)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`  ✓ Perfil existente: ${perfil.nombre} (${existing[0].id.substring(0, 8)})`);
    // Update photo
    await supabase.from('profiles')
      .update({ photo_url: perfil.photo, avatar_url: perfil.photo })
      .eq('id', existing[0].id);
    return existing[0].id;
  }

  // Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: perfil.email,
    password: 'CJseed2026!',
    email_confirm: true,
    user_metadata: { full_name: `${perfil.nombre} ${perfil.apellidos}` }
  });

  if (authErr) {
    console.error(`  ✗ Error creando auth user ${perfil.email}:`, authErr.message);
    return null;
  }

  const userId = authData.user.id;

  // Create profile
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    nombre: perfil.nombre,
    apellidos: perfil.apellidos,
    ciudad: perfil.ciudad,
    pais: perfil.pais,
    nivel: perfil.nivel,
    photo_url: perfil.photo,
    avatar_url: perfil.photo
  });

  if (profErr) {
    console.error(`  ✗ Error creando perfil:`, profErr.message);
    return null;
  }

  console.log(`  ✓ Perfil creado: ${perfil.nombre} ${perfil.apellidos} (${userId.substring(0, 8)})`);
  return userId;
}

async function main() {
  console.log('🏃 Creando quedadas para Correr Juntos\n');

  // 1. Crear/obtener perfiles
  console.log('1. Perfiles:');
  const userIds = [];
  for (const perfil of PERFILES) {
    const id = await getOrCreateProfile(perfil);
    userIds.push(id);
  }

  // 2. Eliminar quedadas antiguas de estos usuarios
  console.log('\n2. Limpiando quedadas anteriores...');
  for (const id of userIds) {
    if (!id) continue;
    const { data: old } = await supabase.from('quedadas')
      .select('id')
      .eq('creador_id', id);
    if (old && old.length > 0) {
      for (const q of old) {
        await supabase.from('participantes').delete().eq('quedada_id', q.id);
        await supabase.from('quedadas').delete().eq('id', q.id);
      }
      console.log(`  ✓ Eliminadas ${old.length} quedadas de ${id.substring(0, 8)}`);
    }
  }

  // 3. Crear nuevas quedadas
  console.log('\n3. Creando quedadas:');
  for (const q of QUEDADAS) {
    const creadorId = userIds[q.perfilIndex];
    if (!creadorId) {
      console.log(`  ✗ Saltando "${q.titulo}" — perfil no disponible`);
      continue;
    }

    const perfil = PERFILES[q.perfilIndex];
    const quedadaData = {
      titulo: q.titulo,
      ciudad: q.ciudad,
      ubicacion: q.ubicacion,
      lat: q.lat,
      lng: q.lng,
      fecha: q.fecha,
      hora: q.hora,
      nivel: q.nivel,
      distancia: q.distancia,
      ritmo: q.ritmo,
      descripcion: q.descripcion,
      creador_id: creadorId,
      pais: q.pais,
      organizador_nombre: `${perfil.nombre} ${perfil.apellidos}`,
      organizador_foto: perfil.photo,
      es_seed: false
    };

    const { data, error } = await supabase
      .from('quedadas')
      .insert([quedadaData])
      .select('id')
      .single();

    if (error) {
      console.log(`  ✗ Error en "${q.titulo}":`, error.message);
    } else {
      console.log(`  ✓ ${q.titulo} — ${q.ciudad} — ${q.fecha} ${q.hora}`);
    }
  }

  console.log('\n✅ Completado!');
}

main().catch(console.error);
