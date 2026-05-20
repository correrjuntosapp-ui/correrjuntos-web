-- ─────────────────────────────────────────────────────────────────────
-- Seed data módulo Fuerza — 30 ejercicios + variantes + 9 sesiones
-- 20 may 2026
--
-- URLs MuscleWiki: usamos slugs canonical. La app RN compone la URL
-- final via función `getMuscleWikiUrl(slug)` con cache local.
-- Patrón: https://media.musclewiki.com/media/uploads/videos/branded/{slug}-front.gif
--
-- (Si decides migrar a ExerciseDB API: solo cambias gif_source + URLs)
-- ─────────────────────────────────────────────────────────────────────

-- ════════════════════════════
-- 30 EJERCICIOS MAESTROS
-- ════════════════════════════

-- ──────── TREN INFERIOR (7) ────────
INSERT INTO public.strength_exercises (slug, name_es, name_en, category, muscles_primary, muscles_secondary, difficulty, is_unilateral, instructions_es, instructions_en, tip_es, tip_en) VALUES
('sentadilla', 'Sentadilla', 'Squat', 'tren_inferior',
 ARRAY['cuadriceps', 'gluteos'], ARRAY['core', 'isquios'], 1, FALSE,
 ARRAY['Pies anchura caderas, puntas ligeramente hacia fuera', 'Baja como si te sentaras en una silla, rodillas alineadas con los pies', 'Pecho arriba, peso en talones. Sube empujando con los talones'],
 ARRAY['Feet hip-width apart, toes slightly out', 'Sit back as if into a chair, knees aligned with feet', 'Chest up, weight on heels. Push through heels to stand'],
 'Si te molestan las rodillas en la bajada, abre un poco más los pies. Baja solo hasta donde aguantes con espalda recta — la profundidad llega con semanas.',
 'If knees bother you on the way down, widen your stance a bit. Only go as deep as your back stays straight — depth comes with weeks.'
),

('zancadas-caminando', 'Zancadas caminando', 'Walking lunges', 'tren_inferior',
 ARRAY['cuadriceps', 'gluteos'], ARRAY['isquios', 'core'], 2, TRUE,
 ARRAY['Da un paso largo hacia adelante', 'Baja hasta que la rodilla trasera casi toque el suelo', 'Empuja con el talón de la pierna delantera para subir y dar el siguiente paso'],
 ARRAY['Take a long step forward', 'Lower until your back knee almost touches the floor', 'Push through the front heel to rise and take the next step'],
 'Rodilla delantera NO se pasa de la punta del pie. Si te tambaleas, ralentiza — vale más controlado que rápido.',
 'Front knee should NOT go past your toes. If you wobble, slow down — controlled beats fast.'
),

('peso-muerto-unilateral', 'Peso muerto unilateral', 'Single-leg deadlift', 'tren_inferior',
 ARRAY['isquios', 'gluteo_medio'], ARRAY['core', 'lumbar'], 2, TRUE,
 ARRAY['De pie sobre una pierna, ligera flexión de rodilla', 'Inclina el torso hacia adelante mientras la pierna libre se eleva detrás', 'Forma una T con tu cuerpo. Vuelve activando glúteo'],
 ARRAY['Stand on one leg, slight bend in knee', 'Tip torso forward while back leg lifts behind', 'Form a T with your body. Return by squeezing your glute'],
 'Si pierdes equilibrio mira a un punto fijo en el suelo. Mejor 8 reps perfectas que 12 a trompicones.',
 'Lose balance? Stare at a fixed point on the floor. 8 perfect reps beats 12 wobbly ones.'
),

('sentadilla-bulgara', 'Sentadilla búlgara', 'Bulgarian split squat', 'tren_inferior',
 ARRAY['cuadriceps', 'gluteos'], ARRAY['core', 'isquios'], 3, TRUE,
 ARRAY['Pie trasero apoyado en silla/sofá a la altura de tu rodilla', 'Baja la rodilla trasera hacia el suelo, peso en el talón delantero', 'Sube empujando con el talón delantero. NO uses la pierna de atrás'],
 ARRAY['Back foot on a chair/sofa at knee height', 'Lower back knee toward floor, weight on front heel', 'Push up through front heel. DO NOT push off the back leg'],
 'La estrella anti-asimetrías. Tu pierna débil te lo dirá rápido — trabaja primero la mala.',
 'The anti-asymmetry star. Your weak leg will tell you fast — work the weak one first.'
),

('step-ups', 'Step-ups en cajón', 'Box step-ups', 'tren_inferior',
 ARRAY['cuadriceps', 'gluteos'], ARRAY['core', 'gemelos'], 1, TRUE,
 ARRAY['Apoya pie completo sobre cajón o escalón firme (30-40cm)', 'Sube empujando con el talón apoyado', 'Baja despacio controlando el movimiento'],
 ARRAY['Place full foot on a sturdy box or step (30-40cm)', 'Push up through the heel on the box', 'Lower slowly under control'],
 'No empujes con la pierna de abajo — toda la fuerza viene del pie en el cajón. Si saltas, baja la altura.',
 'Do not push off with the bottom leg — all force comes from the foot on the box. If you''re jumping up, lower the box.'
),

('puente-gluteo', 'Puente glúteo', 'Glute bridge', 'tren_inferior',
 ARRAY['gluteos', 'isquios'], ARRAY['core'], 1, FALSE,
 ARRAY['Tumbado boca arriba, rodillas dobladas, pies plantados', 'Levanta caderas apretando glúteos hasta formar línea recta hombros-rodillas', 'Mantén 1-2 segundos arriba, baja despacio'],
 ARRAY['Lie on back, knees bent, feet flat on floor', 'Lift hips by squeezing glutes until you form a straight line from shoulders to knees', 'Hold 1-2 seconds at top, lower slowly'],
 'Aprieta glúteos arriba como si pellizcaras una moneda. Si te duele la espalda baja, no estás usando glúteos — bájate.',
 'Squeeze glutes at top like pinching a coin. If lower back hurts, you''re not using glutes — lower yourself.'
),

('calf-raises', 'Elevaciones de gemelos', 'Calf raises', 'tren_inferior',
 ARRAY['gemelos'], ARRAY['soleo', 'tobillos'], 1, FALSE,
 ARRAY['De pie, pies anchura caderas', 'Sube sobre las puntas de los pies tan alto como puedas', 'Baja despacio, deja que los talones queden ligeramente más abajo del nivel del suelo si estás en escalón'],
 ARRAY['Stand with feet hip-width apart', 'Rise up onto the balls of your feet as high as possible', 'Lower slowly, let heels drop slightly below floor level if on a step'],
 'Esencial para runners — gemelos fuertes = menos fascitis plantar. Hazlas también una pierna cuando puedas.',
 'Essential for runners — strong calves = less plantar fasciitis. Switch to single-leg when you can.'
),

-- ──────── CORE (7) ────────
('plancha-frontal', 'Plancha frontal', 'Front plank', 'core',
 ARRAY['recto_abdominal'], ARRAY['core_estabilizador', 'hombros'], 1, FALSE,
 ARRAY['Posición boca abajo apoyado en antebrazos', 'Codos bajo los hombros, cuerpo recto desde cabeza hasta talones', 'Aprieta glúteos y abdomen. Respira normal'],
 ARRAY['Face-down position on forearms', 'Elbows under shoulders, body straight from head to heels', 'Squeeze glutes and abs. Breathe normally'],
 'Cadera caída = abdomen apagado. Si te tiembla todo a los 20 segundos, baja a rodillas — mejor 30 segundos buenos que 60 a medias.',
 'Sagging hips = abs off. If you''re shaking at 20 seconds, drop to knees — 30 good seconds beats 60 half-assed.'
),

('plancha-lateral', 'Plancha lateral', 'Side plank', 'core',
 ARRAY['oblicuos', 'gluteo_medio'], ARRAY['hombros', 'core_estabilizador'], 2, TRUE,
 ARRAY['De lado apoyado en un antebrazo, codo bajo hombro', 'Cuerpo recto desde cabeza hasta pies, caderas elevadas', 'Aprieta glúteo medio y oblicuos'],
 ARRAY['Side position on one forearm, elbow under shoulder', 'Body straight from head to feet, hips elevated', 'Squeeze glute medius and obliques'],
 'Si es muy duro, apoya la rodilla de abajo. Anti-síndrome banda IT — clave para corredores con dolor lateral rodilla.',
 'Too hard? Drop the bottom knee. Anti-IT band syndrome — key for runners with lateral knee pain.'
),

('dead-bug', 'Dead bug', 'Dead bug', 'core',
 ARRAY['core_profundo', 'transverso'], ARRAY['recto_abdominal'], 1, FALSE,
 ARRAY['Tumbado boca arriba, brazos hacia el techo, rodillas a 90°', 'Extiende brazo derecho atrás y pierna izquierda hacia adelante simultáneamente', 'Vuelve al centro y alterna lados. Mantén lumbar pegada al suelo'],
 ARRAY['Lie on back, arms up, knees at 90°', 'Extend right arm back and left leg forward simultaneously', 'Return to center and alternate. Keep lower back pressed to floor'],
 'Lo que más importa: la lumbar NO se despega del suelo. Si lo hace, no extiendas tanto la pierna.',
 'What matters most: lower back does NOT lift off the floor. If it does, don''t extend the leg as much.'
),

('bird-dog', 'Bird dog', 'Bird dog', 'core',
 ARRAY['core_profundo', 'erectores'], ARRAY['gluteos', 'hombros'], 1, FALSE,
 ARRAY['Cuadrupedia, manos bajo hombros, rodillas bajo caderas', 'Extiende brazo derecho hacia adelante y pierna izquierda hacia atrás', 'Mantén 2 segundos. Vuelve y alterna'],
 ARRAY['Quadruped position, hands under shoulders, knees under hips', 'Extend right arm forward and left leg back', 'Hold 2 seconds. Return and alternate'],
 'Imagina un vaso de agua en la zona lumbar — que no se caiga. Anti-rotación es lo que entrena, no fuerza bruta.',
 'Imagine a glass of water on your lower back — don''t let it tip. Anti-rotation is what this trains, not raw strength.'
),

('mountain-climbers', 'Mountain climbers', 'Mountain climbers', 'core',
 ARRAY['core', 'flexores_cadera'], ARRAY['hombros', 'cuadriceps'], 2, FALSE,
 ARRAY['Posición plancha alta (manos en el suelo, brazos extendidos)', 'Lleva una rodilla al pecho rápidamente, vuelve y alterna la otra', 'Mantén caderas estables, no las balancees'],
 ARRAY['High plank position (hands on floor, arms extended)', 'Drive one knee to chest quickly, return and alternate', 'Keep hips stable, don''t bounce'],
 'Si las caderas se bambolean, vas demasiado rápido. Mejor 30 segundos controlados que 60 alocados.',
 'If hips are bouncing, you''re going too fast. 30 controlled seconds beats 60 wild ones.'
),

('hollow-hold', 'Hollow hold', 'Hollow hold', 'core',
 ARRAY['recto_abdominal'], ARRAY['core_profundo', 'flexores_cadera'], 3, FALSE,
 ARRAY['Tumbado boca arriba, brazos extendidos detrás de la cabeza', 'Levanta piernas y hombros del suelo formando una "C" invertida', 'Lumbar PEGADA al suelo. Mantén la posición'],
 ARRAY['Lie on back, arms extended overhead', 'Lift legs and shoulders off floor forming an inverted "C"', 'Lower back STAYS on floor. Hold position'],
 'El más duro del lote. Si la lumbar se separa del suelo, dobla rodillas o baja brazos al pecho — y sube de ahí.',
 'The hardest in the set. If lower back lifts off, bend knees or drop arms to chest — and progress from there.'
),

('russian-twist', 'Russian twist', 'Russian twist', 'core',
 ARRAY['oblicuos'], ARRAY['recto_abdominal', 'flexores_cadera'], 2, FALSE,
 ARRAY['Sentado, rodillas dobladas, talones en el suelo (o levantados para más reto)', 'Inclina torso hacia atrás 45°', 'Gira el torso de lado a lado tocando suelo a ambos lados'],
 ARRAY['Seated, knees bent, heels on floor (or lifted for more challenge)', 'Lean torso back 45°', 'Rotate torso side-to-side touching floor on each side'],
 'La rotación viene del torso, no de los brazos. Si solo mueves los brazos no entrenas oblicuos.',
 'Rotation comes from the torso, not the arms. If you''re just moving arms, you''re not training obliques.'
),

-- ──────── GLÚTEOS (6) ────────
('clamshells', 'Clamshells (almejas)', 'Clamshells', 'gluteos',
 ARRAY['gluteo_medio'], ARRAY['rotadores_cadera'], 1, TRUE,
 ARRAY['Tumbado de lado, rodillas dobladas a 45°, pies juntos', 'Abre la rodilla de arriba sin separar los pies', 'Aprieta glúteo medio arriba. Baja despacio'],
 ARRAY['Lie on side, knees bent at 45°, feet together', 'Open top knee without separating feet', 'Squeeze glute medius at top. Lower slowly'],
 'Si la cadera de arriba rota hacia atrás, no estás activando glúteo medio — la cadera debe mantenerse vertical.',
 'If top hip rotates back, you''re not activating glute medius — the hip should stay vertical.'
),

('hip-thrust', 'Hip thrust', 'Hip thrust', 'gluteos',
 ARRAY['gluteo_mayor'], ARRAY['isquios', 'core'], 2, FALSE,
 ARRAY['Hombros apoyados en sofá/banco, pies plantados en el suelo', 'Empuja con talones para elevar caderas hasta línea recta', 'Aprieta glúteos arriba 1-2 segundos. Baja controlado'],
 ARRAY['Shoulders on sofa/bench, feet planted on floor', 'Push through heels to lift hips into a straight line', 'Squeeze glutes at top for 1-2 seconds. Lower controlled'],
 'El rey del glúteo. Si lo cargas con peso, ponlo sobre la cadera (no en el pecho). Te va a destrozar el glúteo en el buen sentido.',
 'King of glutes. If you load it, put weight on hips (not chest). It''ll destroy your glutes in the good way.'
),

('monster-walks', 'Monster walks con banda', 'Monster walks with band', 'gluteos',
 ARRAY['gluteo_medio', 'gluteo_mayor'], ARRAY['abductores'], 2, FALSE,
 ARRAY['Banda elástica alrededor de los tobillos o muslos', 'Sentadilla parcial, da pasos laterales manteniendo tensión en la banda', 'Da 8-10 pasos a un lado y luego al otro'],
 ARRAY['Resistance band around ankles or thighs', 'Quarter squat, take lateral steps keeping tension on band', 'Take 8-10 steps to one side, then the other'],
 'Posición de sentadilla parcial todo el rato — si te enderezas, pierdes la activación.',
 'Stay in partial squat the whole time — if you stand up, you lose the activation.'
),

('donkey-kicks', 'Donkey kicks', 'Donkey kicks', 'gluteos',
 ARRAY['gluteo_mayor'], ARRAY['isquios', 'core'], 1, TRUE,
 ARRAY['Cuadrupedia, manos bajo hombros, rodillas bajo caderas', 'Manteniendo la rodilla doblada a 90°, eleva una pierna hasta que el muslo quede paralelo al suelo', 'Aprieta glúteo arriba. Baja controlado sin dejar caer la pierna'],
 ARRAY['Quadruped position, hands under shoulders, knees under hips', 'Keeping knee bent at 90°, lift one leg until thigh is parallel to floor', 'Squeeze glute at top. Lower controlled without dropping leg'],
 'No arquees la lumbar para "elevar más" — el movimiento viene del glúteo, no de la espalda.',
 'Don''t arch your lower back to "lift higher" — movement comes from the glute, not the back.'
),

('single-leg-glute-bridge', 'Puente glúteo unilateral', 'Single-leg glute bridge', 'gluteos',
 ARRAY['gluteo_mayor', 'isquios'], ARRAY['core', 'gluteo_medio'], 2, TRUE,
 ARRAY['Tumbado boca arriba, una rodilla doblada con pie plantado, la otra pierna extendida o cruzada', 'Empuja con el talón para elevar caderas', 'Mantén las dos caderas alineadas (no inclines pelvis)'],
 ARRAY['Lie on back, one knee bent with foot planted, other leg extended or crossed', 'Push through heel to lift hips', 'Keep both hips aligned (no pelvis tilt)'],
 'Si una cadera cae más que la otra, baja la dificultad o usa una pared como referencia visual.',
 'If one hip drops more than the other, scale back or use a wall as visual reference.'
),

('fire-hydrants', 'Fire hydrants', 'Fire hydrants', 'gluteos',
 ARRAY['gluteo_medio', 'rotadores_cadera'], ARRAY['core'], 1, TRUE,
 ARRAY['Cuadrupedia, manos bajo hombros, rodillas bajo caderas', 'Eleva una pierna lateralmente manteniendo la rodilla doblada a 90°', 'Sube hasta paralelo con el suelo. Baja despacio'],
 ARRAY['Quadruped position, hands under shoulders, knees under hips', 'Lift one leg out to the side keeping knee bent at 90°', 'Raise until parallel to floor. Lower slowly'],
 'Mantén el torso quieto — si rotas el cuerpo, estás compensando. La cadera debe trabajar sola.',
 'Keep torso still — if you''re rotating, you''re compensating. The hip should work alone.'
),

-- ──────── MOVILIDAD (6) ────────
('worlds-greatest-stretch', 'World''s greatest stretch', 'World''s greatest stretch', 'movilidad',
 ARRAY['cadera', 'columna_toracica'], ARRAY['isquios', 'flexores_cadera'], 1, TRUE,
 ARRAY['Desde plancha alta, lleva pie derecho fuera de la mano derecha', 'Apoya codo derecho cerca del pie y luego gira el torso abriendo el brazo hacia el techo', 'Mantén 2 segundos, vuelve y cambia de lado'],
 ARRAY['From high plank, bring right foot outside right hand', 'Drop right elbow near the foot, then rotate torso opening arm to ceiling', 'Hold 2 seconds, return and switch sides'],
 'Lo mejor que puedes hacer pre-run para abrir caderas y columna. 4-5 cada lado y listo para salir.',
 'The best pre-run move to open hips and spine. 4-5 each side and you''re ready to run.'
),

('hip-mobility-90-90', '90/90 hip mobility', '90/90 hip mobility', 'movilidad',
 ARRAY['cadera_interna', 'cadera_externa'], ARRAY['gluteos'], 1, FALSE,
 ARRAY['Sentado en el suelo con una pierna delante doblada a 90° y la otra detrás también a 90°', 'Inclina el torso hacia adelante sobre la pierna delantera', 'Cambia de lado girando ambas piernas a la vez'],
 ARRAY['Seated with one leg in front bent at 90° and the other behind also at 90°', 'Lean torso forward over front leg', 'Switch sides by rotating both legs together'],
 'Si te cuesta sentarte así, pon una almohada bajo el glúteo de apoyo. Movilidad de cadera es libertad para correr.',
 'If sitting like that is hard, put a cushion under your supporting glute. Hip mobility is freedom to run.'
),

('cat-cow', 'Cat-cow', 'Cat-cow', 'movilidad',
 ARRAY['columna', 'core'], ARRAY['hombros'], 1, FALSE,
 ARRAY['Cuadrupedia, manos bajo hombros, rodillas bajo caderas', 'Inhala arqueando columna hacia abajo (cow), mirada arriba', 'Exhala redondeando columna hacia arriba (cat), barbilla al pecho'],
 ARRAY['Quadruped position, hands under shoulders, knees under hips', 'Inhale arching spine down (cow), gaze up', 'Exhale rounding spine up (cat), chin to chest'],
 'Si pasas mucho tiempo sentado por trabajo, esto te salva la espalda. 10 ciclos despacio = oro.',
 'If you sit a lot for work, this saves your back. 10 slow cycles = gold.'
),

('pigeon-pose', 'Pigeon pose', 'Pigeon pose', 'movilidad',
 ARRAY['gluteo_profundo', 'piriforme'], ARRAY['flexores_cadera'], 2, TRUE,
 ARRAY['Desde plancha alta, lleva la rodilla derecha hacia la mano derecha', 'Extiende la pierna izquierda detrás de ti', 'Apoya antebrazos en el suelo o vete bajando torso. Mantén 30-60 segundos'],
 ARRAY['From high plank, bring right knee toward right hand', 'Extend left leg behind you', 'Rest on forearms or lower torso gradually. Hold 30-60 seconds'],
 'Si te duele la rodilla, ajusta el ángulo o pon un cojín bajo la cadera. El estiramiento debe sentirse en el glúteo, no en la rodilla.',
 'If your knee hurts, adjust the angle or put a cushion under your hip. The stretch should feel in the glute, not the knee.'
),

('hip-flexor-stretch', 'Estiramiento flexor de cadera', 'Hip flexor stretch', 'movilidad',
 ARRAY['flexores_cadera', 'psoas'], ARRAY['cuadriceps'], 1, TRUE,
 ARRAY['Posición de zancada con la rodilla trasera apoyada en el suelo', 'Empuja la cadera hacia adelante manteniendo el torso vertical', 'Para más intensidad, eleva el brazo del mismo lado de la rodilla apoyada'],
 ARRAY['Lunge position with back knee on floor', 'Push hip forward keeping torso vertical', 'For more intensity, raise arm on same side as back knee'],
 'Si trabajas sentado, el psoas está acortado. Esto destensa lo que el running comprime más. 30 seg cada lado, todos los días.',
 'If you sit at work, your psoas is tight. This releases what running compresses. 30 seconds each side, every day.'
),

('calf-stretch', 'Estiramiento gemelos', 'Calf stretch', 'movilidad',
 ARRAY['gemelos', 'soleo'], ARRAY['tendon_aquiles'], 1, TRUE,
 ARRAY['Apoya las manos en la pared, pierna trasera estirada con talón en el suelo', 'Empuja la cadera hacia la pared sintiendo el estiramiento en el gemelo', 'Repite con rodilla trasera ligeramente doblada para estirar el sóleo'],
 ARRAY['Hands on wall, back leg straight with heel on floor', 'Push hip toward wall feeling stretch in calf', 'Repeat with back knee slightly bent to stretch the soleus'],
 'Dos estiramientos en uno: pierna recta = gemelo, pierna ligeramente flexionada = sóleo. Ambos previenen fascitis plantar.',
 'Two stretches in one: straight leg = calf, slightly bent = soleus. Both prevent plantar fasciitis.'
),

-- ──────── TREN SUPERIOR (4) ────────
('push-ups', 'Flexiones', 'Push-ups', 'tren_superior',
 ARRAY['pectoral', 'triceps'], ARRAY['core', 'hombros'], 1, FALSE,
 ARRAY['Posición plancha alta, manos un poco más anchas que hombros', 'Baja el pecho hacia el suelo manteniendo cuerpo recto', 'Empuja con palmas para subir. Mantén abdomen apretado'],
 ARRAY['High plank position, hands slightly wider than shoulders', 'Lower chest to floor keeping body straight', 'Push through palms to rise. Keep core engaged'],
 'Si no te salen completas, baja a rodillas — mejor 8 buenas que 3 con cadera caída. Estás trabajando core y pectoral a la vez.',
 'Can''t do full ones? Drop to knees — 8 good beats 3 with sagging hips. You''re training core and chest together.'
),

('inverted-row', 'Remo invertido', 'Inverted row', 'tren_superior',
 ARRAY['espalda_media', 'biceps'], ARRAY['core', 'romboides'], 2, FALSE,
 ARRAY['Bajo una mesa baja o barra fija a altura cintura, agarra con palmas hacia ti o hacia fuera', 'Cuerpo recto, talones en el suelo', 'Empuja codos atrás llevando el pecho hacia la barra/mesa'],
 ARRAY['Under a low table or fixed bar at waist height, grip palms toward you or away', 'Body straight, heels on floor', 'Pull elbows back bringing chest toward bar/table'],
 'El antídoto contra la postura de runner encorvado. Pecho a la barra, hombros atrás. Si es muy duro, dobla rodillas.',
 'The antidote to runner''s slumped posture. Chest to bar, shoulders back. Too hard? Bend knees.'
),

('pike-push-ups', 'Pike push-ups', 'Pike push-ups', 'tren_superior',
 ARRAY['deltoides', 'triceps'], ARRAY['core', 'trapecio'], 2, FALSE,
 ARRAY['Posición de V invertida (caderas elevadas, manos y pies en el suelo)', 'Baja la cabeza hacia el suelo flexionando codos', 'Empuja para volver. Es como una flexión pero con énfasis en hombros'],
 ARRAY['Inverted V position (hips up, hands and feet on floor)', 'Lower head toward floor by bending elbows', 'Push back up. Like a push-up but focused on shoulders'],
 'Los hombros débiles dan postura mala corriendo. Esto los entrena sin gym. 6-8 reps al principio es suficiente.',
 'Weak shoulders give bad running posture. This trains them with no gym. 6-8 reps starting out is enough.'
),

('band-pull-apart', 'Resistance band pull-apart', 'Resistance band pull-apart', 'tren_superior',
 ARRAY['trapecio', 'romboides'], ARRAY['deltoides_posterior'], 1, FALSE,
 ARRAY['De pie, banda elástica sujeta con ambas manos a la altura del pecho, brazos extendidos', 'Abre los brazos llevando las manos hacia afuera y hacia atrás', 'Aprieta omóplatos. Vuelve controlado'],
 ARRAY['Standing, band held with both hands at chest height, arms extended', 'Open arms wide bringing hands out and back', 'Squeeze shoulder blades. Return controlled'],
 'Esto + remo invertido = postura corriendo arreglada. Banda elástica de 5€ Amazon, no necesitas más.',
 'This + inverted row = running posture fixed. €5 Amazon resistance band, that''s all you need.'
);

-- ════════════════════════════
-- VARIANTES por equipo
-- Patrón URL MuscleWiki: https://media.musclewiki.com/media/uploads/videos/branded/{slug}-front.gif
-- (placeholders por ahora, dev RN compone la URL final con cache)
-- ════════════════════════════

-- Sentadilla — bodyweight, mancuerna (goblet), barra (gym)
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 'sentadilla-bodyweight', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/sentadilla.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 'sentadilla-goblet', 'Goblet (mancuerna)', 'Goblet (dumbbell)', 'mancuerna', 'ambos', '/public/exercises/sentadilla.gif', FALSE),
  ((SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 'sentadilla-barra', 'Con barra (back squat)', 'Barbell back squat', 'barra', 'gym', '/public/exercises/sentadilla.gif', FALSE);

-- Zancadas — bodyweight, mancuerna
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='zancadas-caminando'), 'zancadas-bodyweight', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/zancadas-caminando.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='zancadas-caminando'), 'zancadas-mancuernas', 'Con mancuernas', 'With dumbbells', 'mancuerna', 'ambos', '/public/exercises/zancadas-caminando.gif', FALSE);

-- Peso muerto unilateral — bodyweight, mancuerna, kettlebell
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='peso-muerto-unilateral'), 'rdl-unilateral-bodyweight', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/peso-muerto-unilateral.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='peso-muerto-unilateral'), 'rdl-unilateral-mancuerna', 'Con mancuerna', 'With dumbbell', 'mancuerna', 'ambos', '/public/exercises/peso-muerto-unilateral.gif', FALSE),
  ((SELECT id FROM public.strength_exercises WHERE slug='peso-muerto-unilateral'), 'rdl-unilateral-kettlebell', 'Con kettlebell', 'With kettlebell', 'kettlebell', 'gym', '/public/exercises/peso-muerto-unilateral.gif', FALSE);

-- Sentadilla búlgara — silla, mancuerna
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='sentadilla-bulgara'), 'bulgara-silla', 'Con silla/sofá', 'With chair/sofa', 'silla_sofa', 'casa', '/public/exercises/sentadilla-bulgara.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='sentadilla-bulgara'), 'bulgara-mancuernas', 'Con mancuernas', 'With dumbbells', 'mancuerna', 'ambos', '/public/exercises/sentadilla-bulgara.gif', FALSE);

-- Step-ups — cajón, escalón
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='step-ups'), 'step-ups-bodyweight', 'Sin peso', 'Bodyweight', 'cajon', 'ambos', '/public/exercises/step-ups.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='step-ups'), 'step-ups-mancuernas', 'Con mancuernas', 'With dumbbells', 'mancuerna', 'ambos', '/public/exercises/step-ups.gif', FALSE);

-- Puente glúteo — bodyweight, mancuerna (peso en cadera)
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 'puente-bodyweight', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/puente-gluteo.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 'puente-mancuerna', 'Con peso en cadera', 'With weight on hips', 'mancuerna', 'ambos', '/public/exercises/puente-gluteo.gif', FALSE);

-- Calf raises — bodyweight, mancuernas
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='calf-raises'), 'calf-bodyweight', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/calf-raises.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='calf-raises'), 'calf-mancuernas', 'Con mancuernas', 'With dumbbells', 'mancuerna', 'ambos', '/public/exercises/calf-raises.gif', FALSE);

-- Core: planchas, dead bug, bird dog, mountain climbers, hollow hold (todos bodyweight)
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='plancha-frontal'), 'plancha-frontal-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/plancha-frontal.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='plancha-lateral'), 'plancha-lateral-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/plancha-lateral.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='dead-bug'), 'dead-bug-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/dead-bug.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='bird-dog'), 'bird-dog-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/bird-dog.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='mountain-climbers'), 'mountain-climbers-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/mountain-climbers.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='hollow-hold'), 'hollow-hold-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/hollow-hold.gif', TRUE);

-- Russian twist — bodyweight, mancuerna
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='russian-twist'), 'russian-twist-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/russian-twist.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='russian-twist'), 'russian-twist-mancuerna', 'Con mancuerna o medicine ball', 'With dumbbell or medicine ball', 'mancuerna', 'ambos', '/public/exercises/russian-twist.gif', FALSE);

-- Glúteos: clamshells, hip thrust, monster walks, donkey kicks, SLGB, fire hydrants
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='clamshells'), 'clamshells-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/clamshells.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='clamshells'), 'clamshells-banda', 'Con banda', 'With band', 'banda', 'ambos', '/public/exercises/clamshells.gif', FALSE),

  ((SELECT id FROM public.strength_exercises WHERE slug='hip-thrust'), 'hip-thrust-bw', 'Sin peso (en sofá)', 'Bodyweight (on sofa)', 'silla_sofa', 'casa', '/public/exercises/hip-thrust.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='hip-thrust'), 'hip-thrust-mancuerna', 'Con mancuerna en cadera', 'With dumbbell on hips', 'mancuerna', 'ambos', '/public/exercises/hip-thrust.gif', FALSE),
  ((SELECT id FROM public.strength_exercises WHERE slug='hip-thrust'), 'hip-thrust-barra', 'Con barra (gym)', 'With barbell (gym)', 'barra', 'gym', '/public/exercises/hip-thrust.gif', FALSE),

  ((SELECT id FROM public.strength_exercises WHERE slug='monster-walks'), 'monster-walks-banda', 'Con banda elástica', 'With resistance band', 'banda', 'ambos', '/public/exercises/monster-walks.gif', TRUE),

  ((SELECT id FROM public.strength_exercises WHERE slug='donkey-kicks'), 'donkey-kicks-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/donkey-kicks.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='donkey-kicks'), 'donkey-kicks-banda', 'Con banda en muslos', 'With band on thighs', 'banda', 'ambos', '/public/exercises/donkey-kicks.gif', FALSE),

  ((SELECT id FROM public.strength_exercises WHERE slug='single-leg-glute-bridge'), 'slgb-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/single-leg-glute-bridge.gif', TRUE),

  ((SELECT id FROM public.strength_exercises WHERE slug='fire-hydrants'), 'fire-hydrants-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/fire-hydrants.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='fire-hydrants'), 'fire-hydrants-banda', 'Con banda', 'With band', 'banda', 'ambos', '/public/exercises/fire-hydrants.gif', FALSE);

-- Movilidad (todos bodyweight)
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='worlds-greatest-stretch'), 'wgs-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/worlds-greatest-stretch.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='hip-mobility-90-90'), 'hip-90-90-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/hip-mobility-90-90.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='cat-cow'), 'cat-cow-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/cat-cow.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='pigeon-pose'), 'pigeon-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/pigeon-pose.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='hip-flexor-stretch'), 'hip-flexor-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'ambos', '/public/exercises/hip-flexor-stretch.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='calf-stretch'), 'calf-stretch-pared', 'Apoyado en pared', 'Wall-supported', 'pared', 'ambos', '/public/exercises/calf-stretch.gif', TRUE);

-- Tren superior
INSERT INTO public.strength_exercise_variants (exercise_id, slug, variant_name_es, variant_name_en, equipment, location, gif_url, is_default) VALUES
  ((SELECT id FROM public.strength_exercises WHERE slug='push-ups'), 'push-ups-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/push-ups.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='push-ups'), 'push-ups-knees', 'Apoyado en rodillas (más fácil)', 'On knees (easier)', 'bodyweight', 'casa', '/public/exercises/push-ups.gif', FALSE),

  ((SELECT id FROM public.strength_exercises WHERE slug='inverted-row'), 'inverted-row-mesa', 'Bajo mesa', 'Under a table', 'silla_sofa', 'casa', '/public/exercises/inverted-row.gif', TRUE),
  ((SELECT id FROM public.strength_exercises WHERE slug='inverted-row'), 'inverted-row-barra', 'Con barra TRX o smith bajo', 'TRX or low Smith bar', 'barra', 'gym', '/public/exercises/inverted-row.gif', FALSE),

  ((SELECT id FROM public.strength_exercises WHERE slug='pike-push-ups'), 'pike-push-ups-bw', 'Sin peso', 'Bodyweight', 'bodyweight', 'casa', '/public/exercises/pike-push-ups.gif', TRUE),

  ((SELECT id FROM public.strength_exercises WHERE slug='band-pull-apart'), 'band-pull-apart-banda', 'Con banda elástica', 'With resistance band', 'banda', 'ambos', '/public/exercises/band-pull-apart.gif', TRUE);

-- ════════════════════════════
-- 9 SESIONES PRE-CARGADAS
-- ════════════════════════════

INSERT INTO public.strength_sessions (slug, name_es, name_en, description_es, description_en, category, duration_min, difficulty, ok_pre_long_run, ok_post_long_run, ok_post_intervals, ok_any_day, recommended_when) VALUES
  ('anti-lesion-piernas-a', 'Anti-lesión piernas · Express', 'Anti-injury legs · Express', 'Sesión rápida de 15 min para fortalecer lo básico: glúteos + estabilidad. Ideal principiantes.', 'Quick 15-min session for basics: glutes + stability. Beginners.', 'anti_lesion_piernas', 15, 1, FALSE, FALSE, FALSE, FALSE, 'martes_o_jueves'),

  ('anti-lesion-piernas-b', 'Anti-lesión piernas · Standard', 'Anti-injury legs · Standard', '25 min completos cubriendo cuádriceps, glúteos, isquios y gemelos. Para runners regulares.', '25 full minutes covering quads, glutes, hamstrings, calves. For regular runners.', 'anti_lesion_piernas', 25, 2, FALSE, FALSE, FALSE, FALSE, 'martes_o_jueves'),

  ('anti-lesion-piernas-c', 'Anti-lesión piernas · Pro', 'Anti-injury legs · Pro', '35 min para corredores avanzados. Incluye unilaterales (búlgara) y trabajo específico anti-asimetrías.', '35 min for advanced runners. Includes unilateral work (Bulgarian) and anti-asymmetry focus.', 'anti_lesion_piernas', 35, 3, FALSE, FALSE, FALSE, FALSE, 'martes_o_jueves'),

  ('core-express', 'Core express', 'Core express', '15 min de core esencial. Compatible con cualquier día, incluso pre-larga.', '15 min of essential core. Compatible with any day, even pre-long run.', 'core', 15, 1, TRUE, TRUE, TRUE, TRUE, 'cualquier_dia'),

  ('core-completo', 'Core completo', 'Core full', '25 min cubriendo recto abdominal, oblicuos y core profundo. Anti-rotación incluida.', '25 min covering rectus abdominis, obliques and deep core. Anti-rotation included.', 'core', 25, 2, TRUE, TRUE, TRUE, TRUE, 'cualquier_dia'),

  ('gluteos-clave', 'Glúteos clave', 'Key glutes', 'La sesión más diferenciadora — glúteo medio + mayor. Anti-síndrome banda IT.', 'The most differentiating session — glute medius + maximus. Anti-IT band syndrome.', 'gluteos', 20, 2, TRUE, FALSE, TRUE, FALSE, 'cualquier_dia'),

  ('cuerpo-entero-ligero', 'Cuerpo entero ligero', 'Light full-body', 'Sesión suave 20 min cubriendo lo justo. Apta antes de tirada larga (sábado mañana).', 'Gentle 20-min session covering essentials. OK before long run (Saturday morning).', 'cuerpo_entero', 20, 1, TRUE, FALSE, TRUE, FALSE, 'sabado'),

  ('compensacion-post-larga', 'Compensación post-larga', 'Post-long-run compensation', 'Movilidad pura para el domingo después de tirada larga. Recuperación activa.', 'Pure mobility for Sunday after long run. Active recovery.', 'compensacion', 20, 1, FALSE, TRUE, TRUE, FALSE, 'domingo'),

  ('warm-up-runner', 'Warm-up runner', 'Runner warm-up', '8 min para activar antes de cualquier run. Movilidad cadera + columna + activación.', '8 min to activate before any run. Hip + spine mobility + activation.', 'warm_up', 8, 1, TRUE, TRUE, TRUE, TRUE, 'cualquier_dia');

-- ════════════════════════════
-- ITEMS de cada sesión (qué ejercicios)
-- ════════════════════════════

-- ── Anti-lesión piernas A (express · 4 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-a'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 1, 3, '12', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-a'), (SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 2, 3, '15', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-a'), (SELECT id FROM public.strength_exercises WHERE slug='zancadas-caminando'), 3, 2, '10 cada pierna', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-a'), (SELECT id FROM public.strength_exercises WHERE slug='calf-raises'), 4, 3, '15', 30);

-- ── Anti-lesión piernas B (standard · 5 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-b'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 1, 3, '12', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-b'), (SELECT id FROM public.strength_exercises WHERE slug='peso-muerto-unilateral'), 2, 3, '8 cada pierna', 90),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-b'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla-bulgara'), 3, 3, '10 cada pierna', 75),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-b'), (SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 4, 3, '15', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-b'), (SELECT id FROM public.strength_exercises WHERE slug='calf-raises'), 5, 3, '15', 45);

-- ── Anti-lesión piernas C (pro · 6 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 1, 4, '12', 75),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='peso-muerto-unilateral'), 2, 4, '8 cada pierna', 90),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla-bulgara'), 3, 4, '10 cada pierna', 90),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='step-ups'), 4, 3, '10 cada pierna', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 5, 3, '15', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='anti-lesion-piernas-c'), (SELECT id FROM public.strength_exercises WHERE slug='calf-raises'), 6, 3, '20', 45);

-- ── Core express (4 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='core-express'), (SELECT id FROM public.strength_exercises WHERE slug='plancha-frontal'), 1, 3, '30s', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-express'), (SELECT id FROM public.strength_exercises WHERE slug='dead-bug'), 2, 3, '10 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-express'), (SELECT id FROM public.strength_exercises WHERE slug='bird-dog'), 3, 3, '10 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-express'), (SELECT id FROM public.strength_exercises WHERE slug='mountain-climbers'), 4, 3, '30s', 30);

-- ── Core completo (6 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='plancha-frontal'), 1, 3, '45s', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='plancha-lateral'), 2, 3, '30s cada lado', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='dead-bug'), 3, 3, '10 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='bird-dog'), 4, 3, '10 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='hollow-hold'), 5, 3, '20s', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='core-completo'), (SELECT id FROM public.strength_exercises WHERE slug='russian-twist'), 6, 3, '20 (10 cada lado)', 30);

-- ── Glúteos clave (5 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='gluteos-clave'), (SELECT id FROM public.strength_exercises WHERE slug='clamshells'), 1, 3, '15 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='gluteos-clave'), (SELECT id FROM public.strength_exercises WHERE slug='hip-thrust'), 2, 3, '12', 60),
  ((SELECT id FROM public.strength_sessions WHERE slug='gluteos-clave'), (SELECT id FROM public.strength_exercises WHERE slug='monster-walks'), 3, 3, '10 cada lado', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='gluteos-clave'), (SELECT id FROM public.strength_exercises WHERE slug='single-leg-glute-bridge'), 4, 3, '10 cada lado', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='gluteos-clave'), (SELECT id FROM public.strength_exercises WHERE slug='fire-hydrants'), 5, 3, '12 cada lado', 30);

-- ── Cuerpo entero ligero (5 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='cuerpo-entero-ligero'), (SELECT id FROM public.strength_exercises WHERE slug='sentadilla'), 1, 2, '12', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='cuerpo-entero-ligero'), (SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 2, 2, '15', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='cuerpo-entero-ligero'), (SELECT id FROM public.strength_exercises WHERE slug='plancha-frontal'), 3, 2, '30s', 45),
  ((SELECT id FROM public.strength_sessions WHERE slug='cuerpo-entero-ligero'), (SELECT id FROM public.strength_exercises WHERE slug='clamshells'), 4, 2, '12 cada lado', 30),
  ((SELECT id FROM public.strength_sessions WHERE slug='cuerpo-entero-ligero'), (SELECT id FROM public.strength_exercises WHERE slug='push-ups'), 5, 2, '8-12', 60);

-- ── Compensación post-larga (6 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='worlds-greatest-stretch'), 1, 2, '4 cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='hip-mobility-90-90'), 2, 2, '30s cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='cat-cow'), 3, 1, '10 ciclos', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='pigeon-pose'), 4, 1, '45s cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='hip-flexor-stretch'), 5, 1, '30s cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='compensacion-post-larga'), (SELECT id FROM public.strength_exercises WHERE slug='calf-stretch'), 6, 1, '30s cada lado', 0);

-- ── Warm-up runner (4 ejercicios)
INSERT INTO public.strength_session_items (session_id, exercise_id, order_idx, sets, reps, rest_seconds) VALUES
  ((SELECT id FROM public.strength_sessions WHERE slug='warm-up-runner'), (SELECT id FROM public.strength_exercises WHERE slug='worlds-greatest-stretch'), 1, 1, '4 cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='warm-up-runner'), (SELECT id FROM public.strength_exercises WHERE slug='hip-flexor-stretch'), 2, 1, '20s cada lado', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='warm-up-runner'), (SELECT id FROM public.strength_exercises WHERE slug='cat-cow'), 3, 1, '8 ciclos', 0),
  ((SELECT id FROM public.strength_sessions WHERE slug='warm-up-runner'), (SELECT id FROM public.strength_exercises WHERE slug='puente-gluteo'), 4, 2, '12', 20);
