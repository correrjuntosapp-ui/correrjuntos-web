const fs = require('fs');
const f = 'blog/en/best-resistance-bands-for-runners.html';
let h = fs.readFileSync(f, 'utf8');

const reps = [
  // Breadcrumb
  ['Bandas Elásticas y Accesorios de Fuerza', 'Resistance Bands & Strength Accessories'],

  // Schema ItemList names
  ['"Bandas Elásticas Musculación Tela Set de 5"', '"Fabric Resistance Bands Set of 5"'],
  ['"Bandas de Resistencia Set de 8 (208cm, 50-125LB)"', '"Resistance Bands Set of 8 (208cm, 50-125LB)"'],
  ['"TOMSHOO Bandas de Resistencia con ancla de puerta"', '"TOMSHOO Resistance Bands Kit with Door Anchor"'],
  ['"Sistema de Entrenamiento en Suspensión tipo TRX"', '"Suspension Training System TRX-style"'],
  ['"Amonax Rueda Abdominal doble con alfombrilla"', '"Amonax Dual Ab Wheel with Knee Pad"'],
  ['"Pelota de Pilates 55/65/75 cm con hinchador"', '"Pilates Ball 55/65/75 cm with Pump"'],
  ['"Amazon Basics Disco de Estabilidad y Equilibrio"', '"Amazon Basics Balance & Stability Disc"'],
  ['"Rodillo Masajes Musculares 33×14 cm"', '"Muscle Massage Roller 33×14 cm"'],
  ['"Pistola de Masaje Muscular 30 velocidades"', '"Massage Gun 30 Speeds"'],
  ['"Nutabevr 3 pcs Pelota Masaje Muscular con Pinchos"', '"Nutabevr 3 pcs Spiky Massage Balls"'],
  ['"Pesas para Tobillos/Muñecas ajustables"', '"Adjustable Ankle/Wrist Weights"'],
  ['"ProsourceFit Esterilla Extra Gruesa 13mm"', '"ProsourceFit Extra Thick Mat 13mm"'],

  // H3 product titles
  ['<h3>1. Bandas Elásticas Musculación Tela Set de 5</h3>', '<h3>1. Fabric Resistance Bands Set of 5</h3>'],
  ['<h3>2. Bandas de Resistencia Set de 8 (208 cm, 50-125 LB)</h3>', '<h3>2. Resistance Bands Set of 8 (208 cm, 50-125 LB)</h3>'],
  ['<h3>3. TOMSHOO Bandas de Resistencia con ancla de puerta</h3>', '<h3>3. TOMSHOO Resistance Bands Kit with Door Anchor</h3>'],
  ['<h3>4. Sistema de Entrenamiento en Suspensión (tipo TRX)</h3>', '<h3>4. Suspension Training System (TRX-style)</h3>'],
  ['<h3>5. Amonax Rueda Abdominal doble con alfombrilla</h3>', '<h3>5. Amonax Dual Ab Wheel with Knee Pad</h3>'],
  ['<h3>6. Pelota de Pilates 55/65/75 cm con hinchador</h3>', '<h3>6. Pilates Ball 55/65/75 cm with Pump</h3>'],
  ['<h3>7. Amazon Basics Disco de Estabilidad y Equilibrio</h3>', '<h3>7. Amazon Basics Balance & Stability Disc</h3>'],
  ['<h3>8. Rodillo Masajes Musculares 33×14 cm (130 kg)</h3>', '<h3>8. Muscle Massage Roller 33×14 cm (130 kg)</h3>'],
  ['<h3>9. Pistola de Masaje Muscular 30 velocidades, 10 cabezales</h3>', '<h3>9. Massage Gun 30 Speeds, 10 Heads</h3>'],
  ['<h3>10. Nutabevr 3 pcs Pelota Masaje Muscular con Pinchos</h3>', '<h3>10. Nutabevr 3 pcs Spiky Massage Balls</h3>'],
  ['<h3>11. Pesas para Tobillos/Muñecas ajustables (pack 2)</h3>', '<h3>11. Adjustable Ankle/Wrist Weights (Pack of 2)</h3>'],
  ['<h3>12. ProsourceFit Esterilla Extra Gruesa (13 mm)</h3>', '<h3>12. ProsourceFit Extra Thick Mat (13 mm)</h3>'],

  // Alt text
  ['alt="Bandas Elásticas Musculación Tela Set de 5"', 'alt="Fabric Resistance Bands Set of 5"'],
  ['alt="Bandas de Resistencia Set de 8 bandas largas"', 'alt="Resistance Bands Set of 8 long bands"'],
  ['alt="TOMSHOO kit de bandas de resistencia con ancla de puerta"', 'alt="TOMSHOO resistance bands kit with door anchor"'],
  ['alt="Sistema de entrenamiento en suspensión tipo TRX"', 'alt="Suspension training system TRX-style"'],
  ['alt="Amonax rueda abdominal doble con alfombrilla"', 'alt="Amonax dual ab wheel with knee pad"'],
  ['alt="Pelota de Pilates con hinchador"', 'alt="Pilates ball with pump"'],
  ['alt="Amazon Basics disco de estabilidad y equilibrio"', 'alt="Amazon Basics balance and stability disc"'],
  ['alt="Rodillo de masaje muscular foam roller"', 'alt="Muscle massage foam roller"'],
  ['alt="Pistola de masaje muscular percusión"', 'alt="Percussion muscle massage gun"'],
  ['alt="Nutabevr pelotas de masaje muscular con pinchos"', 'alt="Nutabevr spiky massage balls"'],
  ['alt="Pesas ajustables para tobillos y muñecas"', 'alt="Adjustable ankle and wrist weights"'],
  ['alt="ProsourceFit esterilla extra gruesa 13mm"', 'alt="ProsourceFit extra thick mat 13mm"'],
];

let count = 0;
for (const [old, nw] of reps) {
  if (h.includes(old)) { h = h.replace(old, nw); count++; }
}
fs.writeFileSync(f, h);
console.log(`Replaced ${count} product name patterns`);
