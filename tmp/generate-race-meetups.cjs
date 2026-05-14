// Generates SQL INSERT statements for race-day meetups
// from carreras-2026.json. Filters next 90 days, top popularidad.
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../correr-juntos-app/src/data/carreras-2026.json'),
  'utf8'
));

// City centroid coordinates for top Spanish cities (Plaza/center).
// Used for the meetup point. If a race's city isn't here, we skip it
// (better than wrong coords).
const CITY_COORDS = {
  'Madrid':         { lat: 40.4168, lng: -3.7038 },
  'Barcelona':      { lat: 41.3851, lng:  2.1734 },
  'Valencia':       { lat: 39.4699, lng: -0.3763 },
  'Sevilla':        { lat: 37.3886, lng: -5.9952 },
  'Zaragoza':       { lat: 41.6488, lng: -0.8891 },
  'Málaga':         { lat: 36.7213, lng: -4.4214 },
  'Murcia':         { lat: 37.9922, lng: -1.1307 },
  'Palma':          { lat: 39.5696, lng:  2.6502 },
  'Las Palmas de Gran Canaria': { lat: 28.1235, lng: -15.4363 },
  'Bilbao':         { lat: 43.2630, lng: -2.9350 },
  'Alicante':       { lat: 38.3452, lng: -0.4810 },
  'Córdoba':        { lat: 37.8882, lng: -4.7794 },
  'Valladolid':     { lat: 41.6523, lng: -4.7245 },
  'Vigo':           { lat: 42.2406, lng: -8.7207 },
  'Gijón':          { lat: 43.5322, lng: -5.6611 },
  'Granada':        { lat: 37.1773, lng: -3.5986 },
  'A Coruña':       { lat: 43.3623, lng: -8.4115 },
  'Vitoria-Gasteiz':{ lat: 42.8467, lng: -2.6727 },
  'Pamplona':       { lat: 42.8125, lng: -1.6458 },
  'Almería':        { lat: 36.8340, lng: -2.4637 },
  'San Sebastián':  { lat: 43.3183, lng: -1.9812 },
  'Donostia':       { lat: 43.3183, lng: -1.9812 },
  'Donostia-San Sebastián': { lat: 43.3183, lng: -1.9812 },
  'Santander':      { lat: 43.4623, lng: -3.8099 },
  'Castellón':      { lat: 39.9864, lng: -0.0513 },
  'Castellón de la Plana': { lat: 39.9864, lng: -0.0513 },
  'Burgos':         { lat: 42.3439, lng: -3.6969 },
  'Albacete':       { lat: 38.9943, lng: -1.8585 },
  'Salamanca':      { lat: 40.9701, lng: -5.6635 },
  'Huelva':         { lat: 37.2614, lng: -6.9447 },
  'Logroño':        { lat: 42.4627, lng: -2.4449 },
  'Badajoz':        { lat: 38.8794, lng: -6.9707 },
  'León':           { lat: 42.5987, lng: -5.5671 },
  'Tarragona':      { lat: 41.1189, lng:  1.2445 },
  'Cádiz':          { lat: 36.5298, lng: -6.2924 },
  'Lleida':         { lat: 41.6176, lng:  0.6200 },
  'Marbella':       { lat: 36.5101, lng: -4.8825 },
  'Mataró':         { lat: 41.5396, lng:  2.4456 },
  'Algeciras':      { lat: 36.1408, lng: -5.4562 },
  'Girona':         { lat: 41.9794, lng:  2.8214 },
  'Cáceres':        { lat: 39.4753, lng: -6.3724 },
  'Toledo':         { lat: 39.8628, lng: -4.0273 },
  'Ourense':        { lat: 42.3367, lng: -7.8639 },
  'Pontevedra':     { lat: 42.4310, lng: -8.6444 },
  'Lugo':           { lat: 43.0125, lng: -7.5559 },
  'Ávila':          { lat: 40.6566, lng: -4.6818 },
  'Avilés':         { lat: 43.5550, lng: -5.9244 },
  'Cuenca':         { lat: 40.0703, lng: -2.1374 },
  'Soria':          { lat: 41.7665, lng: -2.4790 },
  'Teruel':         { lat: 40.3456, lng: -1.1065 },
  'Mérida':         { lat: 38.9165, lng: -6.3437 },
  'Zamora':         { lat: 41.5036, lng: -5.7440 },
  'Talavera de la Reina': { lat: 39.9637, lng: -4.8307 },
  'Santiago de Compostela': { lat: 42.8782, lng: -8.5448 },
  'Ferrol':         { lat: 43.4830, lng: -8.2370 },
  'Eivissa':        { lat: 38.9067, lng:  1.4206 },
  'Ibiza':          { lat: 38.9067, lng:  1.4206 },
  'Santa Eulària des Riu': { lat: 38.9849, lng:  1.5350 },
  'La Palma':       { lat: 28.6835, lng: -17.7642 },
  'Tenerife':       { lat: 28.2916, lng: -16.6291 },
  'Adeje':          { lat: 28.1224, lng: -16.7263 },
  'Sant Cugat del Vallès': { lat: 41.4720, lng:  2.0851 },
  'Sant Cugat':     { lat: 41.4720, lng:  2.0851 },
  'Penyagolosa':    { lat: 40.2367, lng: -0.3553 },
  'Vielha e Mijaran': { lat: 42.7027, lng: 0.7945 },
  'Vielha':         { lat: 42.7027, lng:  0.7945 },
  'Mont-roig del Camp': { lat: 41.0867, lng: 0.9569 },
  'Roses':          { lat: 42.2647, lng:  3.1772 },
  'Cangas del Narcea': { lat: 43.1791, lng: -6.5491 },
  'Aranjuez':       { lat: 40.0317, lng: -3.6028 },
  'Dénia':          { lat: 38.8410, lng:  0.1058 },
  'Calp':           { lat: 38.6446, lng:  0.0445 },
};

// Pace zone defaults by distance (used for the quedada filter UI)
const NIVEL_BY_DIST = {
  '5K':   'principiante',
  '10K':  'intermedio',
  '21K':  'avanzado',
  '42K':  'avanzado',
  'Trail':'avanzado',
};

// Typical race start hour offsets (we set the meetup 1h before)
function meetupHour(distPrincipal, fecha) {
  // Marathons start very early (8-9am), 5/10K 9-10am, trails 7-8am
  if (distPrincipal === '42K')   return '07:30:00';
  if (distPrincipal === 'Trail') return '07:00:00';
  if (distPrincipal === '21K')   return '08:00:00';
  if (distPrincipal === '10K')   return '08:30:00';
  return '08:30:00';
}

function plazasFor(participantes_aprox) {
  // Bigger races → more meetup slots (still capped at 100 to feel intimate)
  if (!participantes_aprox || participantes_aprox < 1000) return 12;
  if (participantes_aprox < 5000) return 25;
  if (participantes_aprox < 15000) return 50;
  return 100;
}

function description(race) {
  return `Meeting point antes de la salida de ${race.nombre}. Calentamiento juntos, foto grupal y nos animamos durante la carrera. Apúntate y coordinamos por chat el día anterior.`;
}

function escape(s) {
  return s.replace(/'/g, "''");
}

const today = new Date().toISOString().slice(0, 10);
const horizon = new Date();
horizon.setDate(horizon.getDate() + 90);
const horizonIso = horizon.toISOString().slice(0, 10);

const SYSTEM_ID = '00000000-0000-0000-0000-000000000c01';
const SYSTEM_NAME = 'Comunidad CorrerJuntos';
const SYSTEM_PHOTO = 'https://www.correrjuntos.com/icons/icon-192.png';

const filtered = data.carreras
  .filter(r => r.fecha >= today && r.fecha <= horizonIso)
  .filter(r => CITY_COORDS[r.ciudad])
  .filter(r => ['ES', undefined].includes(r.pais)); // mainly ES

const skipped = data.carreras
  .filter(r => r.fecha >= today && r.fecha <= horizonIso)
  .filter(r => !CITY_COORDS[r.ciudad]);

console.error(`Carreras en ventana 90d: ${data.carreras.filter(r => r.fecha >= today && r.fecha <= horizonIso).length}`);
console.error(`Con coords (incluidas): ${filtered.length}`);
console.error(`Sin coords (saltadas): ${skipped.length}`);
if (skipped.length) {
  console.error('Skipped cities:', [...new Set(skipped.map(r => r.ciudad))].sort().join(', '));
}

const inserts = [];
for (const race of filtered) {
  const { lat, lng } = CITY_COORDS[race.ciudad];
  const dist = race.distancia_principal;
  const distKm = race.distancias_km?.[0] || (dist === '42K' ? 42.195 : dist === '21K' ? 21.097 : dist === '10K' ? 10 : 5);
  const hora = meetupHour(dist, race.fecha);
  const nivel = NIVEL_BY_DIST[dist] || 'intermedio';
  const plazas = plazasFor(race.participantes_aprox);
  const titulo = `Vamos juntos · ${race.nombre}`;
  const descr = description(race);
  const ubicacion = `Punto de salida · ${race.ciudad}`;
  const fechaHora = `${race.fecha} ${hora}+02:00`;

  inserts.push(`(
    '${escape(titulo)}',
    '${escape(race.ciudad)}',
    '${escape(ubicacion)}',
    '${escape(ubicacion)}',
    ${lat}, ${lng},
    '${race.fecha}', '${hora}', '${fechaHora}'::TIMESTAMPTZ,
    '${nivel}', '${dist}', ${distKm}, NULL,
    ${plazas}, ${plazas},
    '${escape(descr)}',
    '${SYSTEM_ID}',
    '${SYSTEM_NAME}', '${SYSTEM_PHOTO}',
    false, 'ES',
    'race_meetup'
  )`);
}

const sql =
`-- Generated ${new Date().toISOString()} from carreras-2026.json
-- ${filtered.length} race-day meetups for next 90 days

INSERT INTO quedadas (
  titulo, ciudad, ubicacion, direccion, lat, lng,
  fecha, hora, fecha_hora,
  nivel, distancia, distancia_km, ritmo,
  max_participantes, plazas, descripcion,
  creador_id, organizador_nombre, organizador_foto,
  es_seed, pais, tipo
) VALUES
${inserts.join(',\n')};
`;

const outFile = path.resolve(__dirname, 'race-meetups-insert.sql');
fs.writeFileSync(outFile, sql);
console.error(`\n✓ ${filtered.length} INSERT rows → ${outFile}`);
console.error(`Sample race: ${filtered[0]?.nombre} · ${filtered[0]?.fecha} · ${filtered[0]?.ciudad}`);
