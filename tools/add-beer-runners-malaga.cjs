#!/usr/bin/env node
/**
 * tools/add-beer-runners-malaga.cjs
 *
 * Crea (o reusa) el perfil partner "Beer Runners Málaga" y publica las
 * próximas N quedadas recurrentes (martes 20:30, Letras de La Malagueta).
 *
 * Uso:
 *   node tools/add-beer-runners-malaga.cjs               → publica próximos 8 martes
 *   node tools/add-beer-runners-malaga.cjs --weeks 12    → publica 12 martes
 *   node tools/add-beer-runners-malaga.cjs --dry-run     → muestra qué haría, no escribe
 *
 * Requiere SUPABASE_SERVICE_KEY en env o .env (mismo patrón que create-quedadas.cjs).
 *
 * Idempotente: si la quedada (fecha + ciudad + organizador) ya existe, la salta.
 *
 * Logo del club esperado en:
 *   public/quedadas/beer-runners-malaga/logo.png
 *
 * URL pública del logo (Vercel sirve /public/ literal):
 *   https://www.correrjuntos.com/public/quedadas/beer-runners-malaga/logo.png
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIG
// ============================================================

const SUPABASE_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co';
function readKeyFromEnvFile(filename, keys) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    for (const k of keys) {
      const m = content.match(new RegExp('^' + k + '=(.+)$', 'm'));
      if (m && m[1].trim()) {
        // Strip surrounding quotes (single or double) commonly used in .env files
        return m[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
  return null;
}
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  readKeyFromEnvFile('.env',       ['SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) ||
  readKeyFromEnvFile('.env.local', ['SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY']);

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in env or .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const weeksIdx = args.indexOf('--weeks');
const WEEKS = weeksIdx >= 0 ? parseInt(args[weeksIdx + 1], 10) : 8;

// ============================================================
// DATOS DEL CLUB PARTNER
// ============================================================

const CLUB = {
  // Email único para crear el auth.user. Marcado como partner.
  email: 'beerrunners-malaga@partners.correrjuntos.app',
  // Random password generated each run — this account never logs in,
  // it only exists as a foreign key target for partner quedadas.
  password: require('crypto').randomBytes(32).toString('base64url') + '_PartnerSysOnly!',
  // Datos del profile
  nombre: 'Beer Runners',
  apellidos: 'Málaga',
  ciudad: 'Málaga',
  pais: 'ES',
  nivel: 'Todos los niveles',
  bio: 'Grupo abierto. Corremos juntos cada martes, brindamos juntos después. Run · Beer · Repeat 🍻',
  // Logo público
  photo: 'https://www.correrjuntos.com/public/quedadas/beer-runners-malaga/logo.png',
  // Instagram para referencia (no se guarda en BD ahora mismo)
  instagram: 'https://instagram.com/beerrunnersmalaga'
};

const QUEDADA_TEMPLATE = {
  titulo: 'Beer Runners Málaga — quedada semanal',
  descripcion: 'Grupo abierto, buen ambiente, cada uno corre a su ritmo. Después, cervezas en la zona 🍻\n\nTodos los niveles bienvenidos. Punto de encuentro: las Letras de La Malagueta (Plaza General Torrijos, junto al Paseo de la Farola).',
  ciudad: 'Málaga',
  ubicacion: 'Letras de La Malagueta',
  direccion: 'Plaza General Torrijos, 29016 Málaga',
  punto_encuentro: 'Junto al monumento "Las Letras de La Malagueta"',
  lat: 36.7186,
  lng: -4.4117,
  hora: '20:30:00',
  nivel: 'Todos los niveles',
  tipo: 'casual',
  distancia: '6-8',
  ritmo: '5:30-7:00 min/km',
  pais: 'ES'
};

// ============================================================
// HELPERS
// ============================================================

/** Format a local Date as YYYY-MM-DD (avoids UTC shift from toISOString). */
function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns the next N Tuesdays starting from today (skips today if Tuesday). */
function nextNTuesdays(n) {
  const tuesdays = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0); // noon local — immune to DST edges
  const today = d.getDay(); // 0=Sun..6=Sat, 2=Tuesday
  const daysUntilTuesday = (2 - today + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilTuesday);
  for (let i = 0; i < n; i++) {
    tuesdays.push(localDateStr(d));
    d.setDate(d.getDate() + 7);
  }
  return tuesdays;
}

// ============================================================
// MAIN
// ============================================================

async function getOrCreatePartnerProfile() {
  console.log(`\n1. Perfil partner "${CLUB.nombre} ${CLUB.apellidos}"`);

  // Try by ciudad + nombre first
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nombre, photo_url')
    .eq('nombre', CLUB.nombre)
    .eq('apellidos', CLUB.apellidos)
    .eq('ciudad', CLUB.ciudad)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`  ✓ Ya existe: ${existing[0].id.substring(0, 8)}`);
    // Update photo + bio (idempotent refresh)
    if (!DRY_RUN) {
      await supabase.from('profiles').update({
        photo_url: CLUB.photo,
        avatar_url: CLUB.photo,
        bio: CLUB.bio,
        nivel: CLUB.nivel
      }).eq('id', existing[0].id);
      console.log('  ✓ Photo + bio refreshed');
    }
    return existing[0].id;
  }

  if (DRY_RUN) {
    console.log('  [DRY-RUN] Would create auth.user + profile');
    return '00000000-0000-0000-0000-000000000beer';
  }

  // Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: CLUB.email,
    password: CLUB.password,
    email_confirm: true,
    user_metadata: { full_name: `${CLUB.nombre} ${CLUB.apellidos}`, is_partner_club: true }
  });
  if (authErr) {
    console.error('  ✗ auth.admin.createUser error:', authErr.message);
    process.exit(1);
  }
  const userId = authData.user.id;

  // Create profile
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    nombre: CLUB.nombre,
    apellidos: CLUB.apellidos,
    ciudad: CLUB.ciudad,
    pais: CLUB.pais,
    nivel: CLUB.nivel,
    bio: CLUB.bio,
    photo_url: CLUB.photo,
    avatar_url: CLUB.photo
  });
  if (profErr) {
    console.error('  ✗ profile upsert error:', profErr.message);
    process.exit(1);
  }

  console.log(`  ✓ Created partner profile ${userId.substring(0, 8)}`);
  return userId;
}

async function publishQuedadas(creadorId) {
  console.log(`\n2. Publicando próximos ${WEEKS} martes (20:30, Letras de La Malagueta)`);

  const tuesdays = nextNTuesdays(WEEKS);
  let inserted = 0;
  let skipped = 0;

  for (const fecha of tuesdays) {
    // Check idempotency: skip if same creador + fecha + hora already exists
    const { data: existing } = await supabase
      .from('quedadas')
      .select('id')
      .eq('creador_id', creadorId)
      .eq('fecha', fecha)
      .eq('hora', QUEDADA_TEMPLATE.hora)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  · ${fecha} — ya existe, saltando`);
      skipped++;
      continue;
    }

    // Compute fecha_hora in UTC from local Europe/Madrid (UTC+2 summer).
    // The app filters with `fecha_hora >= now` — leaving it NULL hides the quedada.
    const [hh, mm, ss] = QUEDADA_TEMPLATE.hora.split(':').map(Number);
    const [y, mo, d] = fecha.split('-').map(Number);
    // Madrid is UTC+2 May-Oct (CEST), UTC+1 Nov-Apr (CET). Compute correctly using Intl.
    const localDate = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss || 0));
    const offsetHours = (() => {
      // Get the offset string for Europe/Madrid at this date
      const f = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Madrid',
        timeZoneName: 'shortOffset',
      });
      const parts = f.formatToParts(localDate);
      const tz = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+2';
      const m = tz.match(/GMT([+-]\d+)/);
      return m ? parseInt(m[1], 10) : 2;
    })();
    const fechaHoraUtc = new Date(localDate.getTime() - offsetHours * 3600 * 1000).toISOString();

    const quedada = {
      ...QUEDADA_TEMPLATE,
      fecha,
      fecha_hora: fechaHoraUtc,
      creador_id: creadorId,
      organizador_nombre: `${CLUB.nombre} ${CLUB.apellidos}`,
      organizador_foto: CLUB.photo,
      es_seed: false
    };

    if (DRY_RUN) {
      console.log(`  [DRY-RUN] ${fecha} → "${quedada.titulo}"`);
      inserted++;
      continue;
    }

    const { error } = await supabase.from('quedadas').insert([quedada]).select('id').single();
    if (error) {
      console.error(`  ✗ ${fecha} error:`, error.message);
    } else {
      console.log(`  ✓ ${fecha} — publicada`);
      inserted++;
    }
  }

  console.log(`\n   Resumen: ${inserted} nuevas · ${skipped} ya existían`);
}

async function main() {
  console.log('🍻 Beer Runners Málaga — publicación de quedadas semanales');
  if (DRY_RUN) console.log('   ⚠️  MODO DRY-RUN — no se escribirá nada en BD\n');

  const creadorId = await getOrCreatePartnerProfile();
  await publishQuedadas(creadorId);

  console.log('\n✅ Hecho.\n');
  console.log('Próximo paso: tira la app o haz pull-to-refresh en Feed/Map.');
  console.log('La quedada debe aparecer filtrando por Málaga o "España" (lat 36.7186).\n');
}

main().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
