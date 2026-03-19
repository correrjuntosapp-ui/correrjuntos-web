'use strict';
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'tools', 'races-generator', 'races-data.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Photo assignments: unique, verified Pexels IDs per race
// Format: [heroID, secondID]
const photoMap = {
  // === Already set by user (keep as-is) ===
  // maraton-valencia: 14419183 / 8455978
  // maraton-barcelona: 256150 / 27623934
  // maraton-sevilla: 12200742 / 4040245
  // maraton-madrid: 35417776 / 10313669
  // maraton-san-sebastian: 12953133 / 2567028

  // === Medias (user provided) ===
  'media-maraton-valencia': [256150, 27623934], // already correct from user
  'media-maraton-madrid': [3254729, 29400389],
  'media-maraton-barcelona': [2524740, 819764],
  'media-maraton-sevilla': [21690899, 13987005],
  'media-maraton-malaga': [33118526, 5655109],

  // === 10K (user provided) ===
  'cursa-bombers-barcelona': [21282657, 15057325],
  'carrera-san-anton-madrid': [10417340, 3518952],
  '10k-valencia': [23120044, 8520628],
  'volta-a-peu-valencia': [10168167, 18457213],
  '10k-salida-del-sol-malaga': [256189, 5319579],

  // === Populares (user provided) ===
  'cursa-merce-barcelona': [2567025, 1556710],
  'carrera-ibercaja-zaragoza': [10430436, 12686195],

  // === Remaining 33: verified Pexels IDs from search ===

  // Urban races - Madrid
  'carrera-libertad-madrid': [11807412, 2168292],         // aerial Madrid + four men running
  'carrera-parques-madrid': [930595, 5038884],             // Madrid plaza + people jogging city
  'carrera-empresas-madrid': [14125122, 2530124],          // Madrid Vincci Capitol + people jogging road
  'zurich-rock-and-roll-running-series-madrid': [11284260, 4083911], // Madrid Metropolis + man running street
  'carrera-mujer-madrid': [35261924, 35261930],            // women pink charity race + joyful female finish
  'carrera-ponle-freno': [33703, 31308425],                // people running daytime + runner holding medal

  // Urban races - Bilbao
  '15k-nocturna-bilbao': [1720086, 68433],                 // aerial Bilbao + night running shoes
  '10k-bilbao': [6737, 32171231],                          // Bilbao Guggenheim + male runner 10K

  // Urban races - Barcelona
  'cursa-corte-ingles-barcelona': [33742995, 5319384],     // Barcelona aerial + people running road
  'jean-bouin-barcelona': [10801110, 2461982],             // Barcelona beach aerial + people running
  'cros-de-sants-barcelona': [4570834, 5319373],           // Barcelona cathedral + people jogging back
  'cursa-nassos-barcelona': [29719631, 35261935],          // Barcelona Torre Glories + joyful runner

  // Urban races - Other cities
  'san-silvestre-vallecana': [1571939, 2469773],           // group marathon + man finish line
  '10k-divina-pastora-valencia': [34605186, 35261939],     // group 10K race + male athlete outdoor
  'carrera-corte-ingles': [2526885, 618612],               // people running street + marathon
  'behobia-san-sebastian': [1072705, 10499987],            // people marathon + male runners marathon

  // Night races - Sevilla / Valencia
  'nocturna-guadalquivir-sevilla': [33942475, 845265],     // Sevilla Plaza Espana night + running signage
  '15k-nocturna-valencia': [1853542, 31633741],            // cold night + BW street runner

  // === Trail races ===
  'ccc-ultra-trail-mont-blanc': [1199590, 13158594],       // mountain running + man red shirt mountain
  'trail-costa-quebrada': [1822835, 1821694],              // coastal landscape + person running dirt road
  'trail-terres-ebre': [2873096, 8729008],                 // mountain path + man running forest
  'maraton-alpino-madrileno': [2803158, 551876],           // man running mountain + mountain path
  'trail-sierra-guadarrama': [4051232, 9790259],           // mountain path + sportsman backpack
  'ultra-trail-costa-brava': [2563389, 32798742],          // Costa Brava coast + trail runner hill
  'trail-aneto-posets': [4793423, 32798753],               // Pyrenees mountains + man jogging forest
  'zegama-aizkorri': [33874841, 35599349],                 // mountain running + mountain running 2
  'transvulcania': [3903947, 30932860],                    // Tenerife landscape + mountain running
  'ultra-pirineu': [14691230, 5928317],                    // Pyrenees landscape + mountain running
  'trail-cap-de-creus': [13776946, 4055570],               // Costa Brava coast + trail runner
  'marato-montserrat': [533923, 11598804],                 // mountain path + trail runner
  'gran-trail-penarroya': [1028225, 7880276],              // mountain path + trail runner
  'tenerife-bluetrail': [10255590, 3932700],               // Tenerife landscape + Tenerife landscape 2
  'travesera-picos-europa': [8762088, 13551533],           // Picos Europa green trees + Picos mountains
};

function buildUrl(id, w, h) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop&q=70`;
}

let updated = 0;
for (const [slug, [heroId, secondId]] of Object.entries(photoMap)) {
  if (data[slug]) {
    data[slug].heroImage = buildUrl(heroId, 1200, 600);
    data[slug].secondImage = buildUrl(secondId, 1200, 800);
    updated++;
  } else {
    console.warn(`WARNING: slug "${slug}" not found in data`);
  }
}

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Updated ${updated} races with verified Pexels photos.`);
console.log('Total races in data:', Object.keys(data).length);
