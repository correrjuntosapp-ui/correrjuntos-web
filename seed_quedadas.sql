-- ============================================================
-- SEED: 35 quedadas realistas para llenar la plataforma
-- Ejecutar en Supabase SQL Editor
-- Todas son es_seed = true, se filtrarán cuando haya masa crítica
-- ============================================================

-- Necesitamos un creador_id seed. Primero creamos un usuario seed si no existe.
-- Usamos un UUID fijo para el organizador seed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        INSERT INTO profiles (id, nombre, apellidos, ciudad, pais, nivel, es_seed, created_at)
        VALUES ('00000000-0000-0000-0000-000000000001', 'Carlos', 'Martínez', 'Madrid', 'ES', 'intermedio', true, NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000002') THEN
        INSERT INTO profiles (id, nombre, apellidos, ciudad, pais, nivel, es_seed, created_at)
        VALUES ('00000000-0000-0000-0000-000000000002', 'Laura', 'Pérez', 'Barcelona', 'ES', 'avanzado', true, NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000003') THEN
        INSERT INTO profiles (id, nombre, apellidos, ciudad, pais, nivel, es_seed, created_at)
        VALUES ('00000000-0000-0000-0000-000000000003', 'James', 'Wilson', 'London', 'GB', 'intermedio', true, NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000004') THEN
        INSERT INTO profiles (id, nombre, apellidos, ciudad, pais, nivel, es_seed, created_at)
        VALUES ('00000000-0000-0000-0000-000000000004', 'Ana', 'García', 'México City', 'MX', 'principiante', true, NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000005') THEN
        INSERT INTO profiles (id, nombre, apellidos, ciudad, pais, nivel, es_seed, created_at)
        VALUES ('00000000-0000-0000-0000-000000000005', 'Marco', 'Rossi', 'Rome', 'IT', 'intermedio', true, NOW());
    END IF;
END $$;

-- Borrar quedadas seed anteriores para evitar duplicados
DELETE FROM quedadas WHERE es_seed = true;

-- ============================================================
-- MADRID (5 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Ruta Retiro 5K Matutina', 'Madrid', 'Puerta de Alcalá, entrada al Retiro', 40.4198, -3.6885, '2026-02-16', '08:00', 'todos', '5', '6:00', 'Rodaje suave por el Retiro. Salimos desde la Puerta de Alcalá, circuito por el Estanque y vuelta. Ideal para empezar la semana.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Carlos M.', '[{"nombre":"María","apellido":"L.","status":"confirmed"},{"nombre":"Pablo","apellido":"R.","status":"confirmed"},{"nombre":"Lucía","apellido":"S.","status":"confirmed"},{"nombre":"Javier","apellido":"D.","status":"confirmed"}]'::jsonb),
('Trail Casa de Campo', 'Madrid', 'Teleférico de Casa de Campo', 40.4225, -3.7494, '2026-02-18', '17:30', 'intermedio', '10', '5:30', 'Trail suave por los senderos de Casa de Campo. Desnivel moderado, terreno mixto. Traed agua y zapatillas de trail.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Carlos M.', '[{"nombre":"Elena","apellido":"G.","status":"confirmed"},{"nombre":"Raúl","apellido":"M.","status":"confirmed"},{"nombre":"Sara","apellido":"V.","status":"confirmed"}]'::jsonb),
('Series en Madrid Río', 'Madrid', 'Puente de Segovia, Madrid Río', 40.4130, -3.7170, '2026-02-20', '19:00', 'avanzado', '8', '4:45', 'Sesión de series: 6x1000m con 2 min recuperación. Calentamiento 2km + series + vuelta a la calma. Ritmo objetivo sub 4:30.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Daniel F.', '[{"nombre":"Marcos","apellido":"A.","status":"confirmed"},{"nombre":"Claudia","apellido":"P.","status":"confirmed"},{"nombre":"Iván","apellido":"R.","status":"confirmed"},{"nombre":"Teresa","apellido":"N.","status":"confirmed"},{"nombre":"Hugo","apellido":"L.","status":"confirmed"}]'::jsonb),
('Rodaje Dehesa de la Villa', 'Madrid', 'Entrada Dehesa de la Villa (metro Francos Rodríguez)', 40.4531, -3.7184, '2026-02-22', '09:00', 'principiante', '6', '6:30', 'Rodaje tranquilo por la Dehesa de la Villa. Terreno llano, sombra. Perfecto para principiantes. Nadie se queda atrás!', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Ana P.', '[{"nombre":"Sofía","apellido":"M.","status":"confirmed"},{"nombre":"Miguel","apellido":"A.","status":"confirmed"}]'::jsonb),
('Larga dominical - Anillo Verde', 'Madrid', 'Parque de El Capricho (metro El Capricho)', 40.4618, -3.6027, '2026-02-23', '08:30', 'intermedio', '18', '5:45', 'Tirada larga por el Anillo Verde Ciclista. Ritmo conversacional. Avituallamientos en km 8 y km 14. Grupo compacto.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Carlos M.', '[{"nombre":"Roberto","apellido":"C.","status":"confirmed"},{"nombre":"Inés","apellido":"H.","status":"confirmed"},{"nombre":"Diego","apellido":"V.","status":"confirmed"},{"nombre":"Alicia","apellido":"J.","status":"confirmed"},{"nombre":"Fernando","apellido":"S.","status":"confirmed"},{"nombre":"Marta","apellido":"B.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- BARCELONA (5 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Sunrise Run Barceloneta', 'Barcelona', 'Platja de la Barceloneta (W Hotel)', 41.3725, 2.1898, '2026-02-15', '07:00', 'todos', '6', '5:45', 'Carrera al amanecer por el paseo marítimo. Desde la Barceloneta hasta el Fórum y vuelta. Vista al mar durante todo el recorrido.', '00000000-0000-0000-0000-000000000002', 'ES', true, 'Laura P.', '[{"nombre":"Jordi","apellido":"B.","status":"confirmed"},{"nombre":"Mireia","apellido":"C.","status":"confirmed"},{"nombre":"Pau","apellido":"F.","status":"confirmed"},{"nombre":"Núria","apellido":"G.","status":"confirmed"},{"nombre":"Marc","apellido":"S.","status":"confirmed"}]'::jsonb),
('Trail Montjuïc', 'Barcelona', 'Jardins de Joan Brossa (Montjuïc)', 41.3681, 2.1658, '2026-02-17', '18:00', 'intermedio', '8', '5:30', 'Subida y bajada por Montjuïc. Senderos técnicos, escaleras, y vistas increíbles de Barcelona. Desnivel positivo ~200m.', '00000000-0000-0000-0000-000000000002', 'ES', true, 'Laura P.', '[{"nombre":"Laia","apellido":"M.","status":"confirmed"},{"nombre":"Arnau","apellido":"R.","status":"confirmed"},{"nombre":"Clara","apellido":"D.","status":"confirmed"}]'::jsonb),
('Intervals Diagonal Mar', 'Barcelona', 'Parc del Fòrum', 41.4108, 2.2264, '2026-02-19', '19:30', 'avanzado', '10', '4:30', 'Sesión de intervalos: 8x800m al 90%. Calentamiento por Diagonal Mar, series en la recta del Fórum. Grupo competitivo.', '00000000-0000-0000-0000-000000000002', 'ES', true, 'Alex R.', '[{"nombre":"Oriol","apellido":"V.","status":"confirmed"},{"nombre":"Carla","apellido":"T.","status":"confirmed"},{"nombre":"Sergi","apellido":"L.","status":"confirmed"},{"nombre":"Aina","apellido":"N.","status":"confirmed"}]'::jsonb),
('Ruta Carretera de les Aigües', 'Barcelona', 'Funicular de Vallvidrera (inicio camino)', 41.4103, 2.1179, '2026-02-21', '09:00', 'intermedio', '12', '5:45', 'Recorrido por la mítica Carretera de les Aigües en Collserola. Terreno llano, vistas panorámicas. Un must para runners de BCN.', '00000000-0000-0000-0000-000000000002', 'ES', true, 'Marta J.', '[{"nombre":"David","apellido":"C.","status":"confirmed"},{"nombre":"Gemma","apellido":"P.","status":"confirmed"},{"nombre":"Xavier","apellido":"R.","status":"confirmed"},{"nombre":"Anna","apellido":"S.","status":"confirmed"},{"nombre":"Pere","apellido":"B.","status":"confirmed"}]'::jsonb),
('Easy Run Ciutadella', 'Barcelona', 'Parc de la Ciutadella (Arc de Triomf)', 41.3887, 2.1816, '2026-02-23', '10:00', 'principiante', '4', '6:30', 'Rodaje suave por el parque de la Ciutadella. Perfecto para quien empieza a correr. Ritmo tranquilo, buen rollo garantizado.', '00000000-0000-0000-0000-000000000002', 'ES', true, 'Laura P.', '[{"nombre":"Marina","apellido":"L.","status":"confirmed"},{"nombre":"Adrià","apellido":"G.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- LONDON (4 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Hyde Park Morning Run', 'London', 'Hyde Park Corner (Wellington Arch)', 51.5028, -0.1507, '2026-02-16', '07:30', 'todos', '5', '5:45', 'Easy morning run around the Serpentine in Hyde Park. All paces welcome. Meet at Wellington Arch, we loop the lake and finish with stretches.', '00000000-0000-0000-0000-000000000003', 'GB', true, 'James W.', '[{"nombre":"Sarah","apellido":"K.","status":"confirmed"},{"nombre":"Tom","apellido":"R.","status":"confirmed"},{"nombre":"Emma","apellido":"B.","status":"confirmed"},{"nombre":"Oliver","apellido":"S.","status":"confirmed"}]'::jsonb),
('Thames Path 10K', 'London', 'Tower Bridge (South Bank side)', 51.5055, -0.0754, '2026-02-18', '18:30', 'intermedio', '10', '5:15', 'Evening run along the Thames Path. Tower Bridge to Westminster and back. Iconic views, flat route, well-lit. Pace groups available.', '00000000-0000-0000-0000-000000000003', 'GB', true, 'James W.', '[{"nombre":"Charlotte","apellido":"M.","status":"confirmed"},{"nombre":"Harry","apellido":"P.","status":"confirmed"},{"nombre":"Lucy","apellido":"T.","status":"confirmed"},{"nombre":"Ben","apellido":"W.","status":"confirmed"},{"nombre":"Amy","apellido":"D.","status":"confirmed"},{"nombre":"Jack","apellido":"N.","status":"confirmed"}]'::jsonb),
('Regent''s Park Tempo Run', 'London', 'Regent''s Park (Outer Circle, near Baker Street)', 51.5266, -0.1572, '2026-02-20', '06:45', 'avanzado', '8', '4:30', 'Tempo workout: 2km warm-up + 4km at threshold + 2km cool-down. Regent''s Park outer circle. Target sub 4:30/km for the tempo section.', '00000000-0000-0000-0000-000000000003', 'GB', true, 'Emma T.', '[{"nombre":"George","apellido":"C.","status":"confirmed"},{"nombre":"Sophia","apellido":"H.","status":"confirmed"},{"nombre":"Daniel","apellido":"F.","status":"confirmed"}]'::jsonb),
('Richmond Park Long Run', 'London', 'Richmond Gate (Richmond Park)', 51.4420, -0.2730, '2026-02-22', '08:00', 'intermedio', '15', '5:30', 'Sunday long run through Richmond Park. Expect deer! Rolling hills, beautiful scenery. We''ll do a big loop with water stop at Pembroke Lodge.', '00000000-0000-0000-0000-000000000003', 'GB', true, 'James W.', '[{"nombre":"Isabelle","apellido":"R.","status":"confirmed"},{"nombre":"William","apellido":"A.","status":"confirmed"},{"nombre":"Grace","apellido":"L.","status":"confirmed"},{"nombre":"Charlie","apellido":"E.","status":"confirmed"},{"nombre":"Mia","apellido":"J.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- VALENCIA (3 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Ruta Jardín del Turia', 'Valencia', 'Pont de les Flors (inicio Turia)', 39.4744, -0.3714, '2026-02-16', '08:30', 'todos', '8', '5:45', 'Recorrido por el antiguo cauce del río Turia. Ruta plana, sombreada, con fuentes. Desde el Pont de les Flors hasta la Ciudad de las Artes.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Elena V.', '[{"nombre":"Vicente","apellido":"M.","status":"confirmed"},{"nombre":"Amparo","apellido":"S.","status":"confirmed"},{"nombre":"Jordi","apellido":"L.","status":"confirmed"}]'::jsonb),
('Malvarrosa Beach Run', 'Valencia', 'Playa de la Malvarrosa (Paseo Marítimo)', 39.4760, -0.3259, '2026-02-19', '07:00', 'intermedio', '10', '5:15', 'Carrera por el paseo marítimo de la Malvarrosa. Ida y vuelta hasta el puerto. Brisa marina y amanecer valenciano incluidos.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Rafa G.', '[{"nombre":"Carmen","apellido":"A.","status":"confirmed"},{"nombre":"Pedro","apellido":"R.","status":"confirmed"},{"nombre":"Cristina","apellido":"F.","status":"confirmed"},{"nombre":"Alberto","apellido":"N.","status":"confirmed"}]'::jsonb),
('Albufera Trail Suave', 'Valencia', 'Centro de Interpretación Racó de l''Olla', 39.3533, -0.3515, '2026-02-22', '09:00', 'principiante', '5', '6:30', 'Trail suave por los caminos de la Albufera. Terreno llano, naturaleza pura. Veremos arrozales y aves. Apto para todos los niveles.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Elena V.', '[{"nombre":"Inma","apellido":"B.","status":"confirmed"},{"nombre":"Toni","apellido":"C.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- SEVILLA (3 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Ruta Parque María Luisa', 'Sevilla', 'Plaza de España, Sevilla', 37.3772, -5.9869, '2026-02-15', '08:00', 'todos', '6', '6:00', 'Rodaje por el Parque de María Luisa y la ribera del Guadalquivir. Ruta icónica sevillana. Salimos de Plaza de España.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Manolo R.', '[{"nombre":"Rocío","apellido":"F.","status":"confirmed"},{"nombre":"Antonio","apellido":"G.","status":"confirmed"},{"nombre":"Paco","apellido":"D.","status":"confirmed"}]'::jsonb),
('Guadalquivir Nocturno', 'Sevilla', 'Torre del Oro', 37.3824, -5.9965, '2026-02-18', '20:00', 'intermedio', '8', '5:30', 'Carrera nocturna por la ribera del Guadalquivir. Zona iluminada, ambiente genial. Desde Torre del Oro hasta el Puente de la Barqueta.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Manolo R.', '[{"nombre":"Lola","apellido":"M.","status":"confirmed"},{"nombre":"Juan","apellido":"P.","status":"confirmed"},{"nombre":"Isabel","apellido":"A.","status":"confirmed"},{"nombre":"Manuel","apellido":"S.","status":"confirmed"}]'::jsonb),
('Trail Itálica', 'Sevilla', 'Conjunto Arqueológico de Itálica, Santiponce', 37.4439, -6.0447, '2026-02-22', '09:30', 'avanzado', '12', '5:00', 'Trail por los alrededores de las ruinas de Itálica. Terreno mixto, desnivel moderado. Ruta histórica y paisajística.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Carmen L.', '[{"nombre":"Alejandro","apellido":"V.","status":"confirmed"},{"nombre":"Marga","apellido":"T.","status":"confirmed"},{"nombre":"Curro","apellido":"R.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- BILBAO (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Ría del Nervión 8K', 'Bilbao', 'Museo Guggenheim Bilbao', 43.2687, -2.9340, '2026-02-17', '18:00', 'intermedio', '8', '5:30', 'Ruta por la ría del Nervión. Desde el Guggenheim hasta el Puente Colgante y vuelta. Terreno llano, vistas industriales reconvertidas.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Iker A.', '[{"nombre":"Ainhoa","apellido":"E.","status":"confirmed"},{"nombre":"Gorka","apellido":"Z.","status":"confirmed"},{"nombre":"Leire","apellido":"U.","status":"confirmed"}]'::jsonb),
('Monte Artxanda Trail', 'Bilbao', 'Funicular de Artxanda (base)', 43.2665, -2.9357, '2026-02-21', '10:00', 'avanzado', '10', '5:00', 'Subida y trail por el Monte Artxanda. Desnivel positivo ~300m. Vistas panorámicas de Bilbao desde la cima. Bajada por senderos.', '00000000-0000-0000-0000-000000000001', 'ES', true, 'Iker A.', '[{"nombre":"Mikel","apellido":"S.","status":"confirmed"},{"nombre":"Nerea","apellido":"B.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- PARIS (3 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Jardin du Luxembourg Run', 'Paris', 'Jardin du Luxembourg (fontaine Médicis)', 48.8462, 2.3371, '2026-02-16', '08:00', 'todos', '5', '6:00', 'Rodaje matinal por el Jardin du Luxembourg. Circuito de 2.5km x2 vueltas. Ambiente tranquilo y parisino. Tous les niveaux bienvenus!', '00000000-0000-0000-0000-000000000005', 'FR', true, 'Marie D.', '[{"nombre":"Pierre","apellido":"L.","status":"confirmed"},{"nombre":"Julie","apellido":"M.","status":"confirmed"},{"nombre":"Thomas","apellido":"B.","status":"confirmed"}]'::jsonb),
('Seine River 10K', 'Paris', 'Pont d''Iéna (Tour Eiffel)', 48.8584, 2.2945, '2026-02-19', '18:30', 'intermedio', '10', '5:15', 'Course le long de la Seine. Du Trocadéro au Jardin des Tuileries et retour. Parcours plat, éclairé, iconique. Groupes de rythme.', '00000000-0000-0000-0000-000000000005', 'FR', true, 'Antoine R.', '[{"nombre":"Sophie","apellido":"G.","status":"confirmed"},{"nombre":"Nicolas","apellido":"P.","status":"confirmed"},{"nombre":"Camille","apellido":"V.","status":"confirmed"},{"nombre":"Maxime","apellido":"D.","status":"confirmed"}]'::jsonb),
('Bois de Boulogne Long Run', 'Paris', 'Porte Dauphine (entrée du Bois)', 48.8714, 2.2734, '2026-02-22', '08:30', 'intermedio', '16', '5:45', 'Sortie longue dans le Bois de Boulogne. Tour du lac inférieur + lac supérieur. Ravitaillement au km 10. Ambiance marathon prep.', '00000000-0000-0000-0000-000000000005', 'FR', true, 'Marie D.', '[{"nombre":"Léa","apellido":"C.","status":"confirmed"},{"nombre":"Hugo","apellido":"F.","status":"confirmed"},{"nombre":"Manon","apellido":"T.","status":"confirmed"},{"nombre":"Louis","apellido":"R.","status":"confirmed"},{"nombre":"Emma","apellido":"J.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- LISBON (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Corrida Ribeirinha Belém', 'Lisbon', 'Torre de Belém', 38.6916, -9.2160, '2026-02-17', '07:30', 'todos', '8', '5:45', 'Corrida pela zona ribeirinha de Belém. Da Torre de Belém ao Cais do Sodré. Percurso plano, vista do Tejo. Todos os níveis.', '00000000-0000-0000-0000-000000000005', 'PT', true, 'João S.', '[{"nombre":"Maria","apellido":"F.","status":"confirmed"},{"nombre":"Pedro","apellido":"C.","status":"confirmed"},{"nombre":"Ana","apellido":"R.","status":"confirmed"}]'::jsonb),
('Trail Monsanto', 'Lisbon', 'Parque Florestal de Monsanto (entrada Alvito)', 38.7233, -9.1886, '2026-02-21', '09:00', 'intermedio', '10', '5:30', 'Trail pelo pulmão verde de Lisboa. Trilhos de terra, sombra, desnível moderado. O melhor trail urbano de Portugal.', '00000000-0000-0000-0000-000000000005', 'PT', true, 'João S.', '[{"nombre":"Tiago","apellido":"M.","status":"confirmed"},{"nombre":"Catarina","apellido":"L.","status":"confirmed"},{"nombre":"Diogo","apellido":"P.","status":"confirmed"},{"nombre":"Inês","apellido":"A.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- MEXICO CITY (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Chapultepec 5K', 'Ciudad de México', 'Entrada principal Bosque de Chapultepec (metro Chapultepec)', 19.4204, -99.1826, '2026-02-16', '07:00', 'todos', '5', '6:00', 'Rodaje matutino por el Bosque de Chapultepec. Circuito por los lagos y senderos principales. Aire fresco en la CDMX.', '00000000-0000-0000-0000-000000000004', 'MX', true, 'Ana G.', '[{"nombre":"Diego","apellido":"H.","status":"confirmed"},{"nombre":"Fernanda","apellido":"L.","status":"confirmed"},{"nombre":"Roberto","apellido":"M.","status":"confirmed"}]'::jsonb),
('Reforma Night Run', 'Ciudad de México', 'Ángel de la Independencia, Paseo de la Reforma', 19.4270, -99.1676, '2026-02-20', '20:00', 'intermedio', '8', '5:30', 'Carrera nocturna por Paseo de la Reforma. Desde el Ángel hasta el Auditorio Nacional y regreso. Ruta emblemática, bien iluminada.', '00000000-0000-0000-0000-000000000004', 'MX', true, 'Ana G.', '[{"nombre":"Alejandra","apellido":"P.","status":"confirmed"},{"nombre":"Carlos","apellido":"V.","status":"confirmed"},{"nombre":"Daniela","apellido":"S.","status":"confirmed"},{"nombre":"Eduardo","apellido":"R.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- BUENOS AIRES (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Costanera Sur 8K', 'Buenos Aires', 'Reserva Ecológica Costanera Sur (entrada)', -34.6119, -58.3563, '2026-02-15', '08:00', 'todos', '8', '5:45', 'Recorrido por la Reserva Ecológica Costanera Sur. Naturaleza en plena Buenos Aires. Caminos de tierra, aves, y río. Grupo amigable.', '00000000-0000-0000-0000-000000000004', 'AR', true, 'Martín B.', '[{"nombre":"Valentina","apellido":"G.","status":"confirmed"},{"nombre":"Santiago","apellido":"M.","status":"confirmed"},{"nombre":"Camila","apellido":"R.","status":"confirmed"}]'::jsonb),
('Bosques de Palermo Run', 'Buenos Aires', 'Rosedal de Palermo (entrada principal)', -34.5700, -58.4116, '2026-02-19', '18:30', 'intermedio', '10', '5:15', 'Rodaje por los Bosques de Palermo. Desde el Rosedal hasta el Planetario y vuelta por los lagos. La ruta más popular de Buenos Aires.', '00000000-0000-0000-0000-000000000004', 'AR', true, 'Luciana T.', '[{"nombre":"Facundo","apellido":"L.","status":"confirmed"},{"nombre":"Julieta","apellido":"A.","status":"confirmed"},{"nombre":"Nicolás","apellido":"D.","status":"confirmed"},{"nombre":"Florencia","apellido":"S.","status":"confirmed"},{"nombre":"Matías","apellido":"P.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- NEW YORK (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Central Park Loop', 'New York', 'Columbus Circle (SW entrance Central Park)', 40.7680, -73.9819, '2026-02-17', '06:30', 'intermedio', '10', '5:15', 'Full loop of Central Park. Meet at Columbus Circle, run counter-clockwise. Rolling hills, iconic scenery. All paces, we regroup at the top.', '00000000-0000-0000-0000-000000000003', 'US', true, 'Sarah K.', '[{"nombre":"Michael","apellido":"J.","status":"confirmed"},{"nombre":"Rachel","apellido":"T.","status":"confirmed"},{"nombre":"David","apellido":"L.","status":"confirmed"},{"nombre":"Jennifer","apellido":"W.","status":"confirmed"},{"nombre":"Chris","apellido":"B.","status":"confirmed"},{"nombre":"Emily","apellido":"S.","status":"confirmed"}]'::jsonb),
('Brooklyn Bridge Sunrise', 'New York', 'Brooklyn Bridge Park (Pier 1)', 40.7003, -73.9967, '2026-02-21', '06:00', 'todos', '5', '6:00', 'Sunrise run across the Brooklyn Bridge and back. Meet at Pier 1 in DUMBO. Short but unforgettable. Great photo opportunities!', '00000000-0000-0000-0000-000000000003', 'US', true, 'Sarah K.', '[{"nombre":"Alex","apellido":"M.","status":"confirmed"},{"nombre":"Maria","apellido":"G.","status":"confirmed"},{"nombre":"Ryan","apellido":"P.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- BERLIN (2 quedadas)
-- ============================================================
INSERT INTO quedadas (titulo, ciudad, ubicacion, lat, lng, fecha, hora, nivel, distancia, ritmo, descripcion, creador_id, pais, es_seed, organizador_nombre, participantes_seed) VALUES
('Tiergarten Morning Lauf', 'Berlin', 'Brandenburger Tor', 52.5163, 13.3777, '2026-02-16', '08:00', 'todos', '7', '5:45', 'Morgenlauf durch den Tiergarten. Start am Brandenburger Tor, Schleife um den Großen Stern. Flach, schattig, entspannt. Alle willkommen!', '00000000-0000-0000-0000-000000000005', 'DE', true, 'Hans M.', '[{"nombre":"Lisa","apellido":"K.","status":"confirmed"},{"nombre":"Max","apellido":"W.","status":"confirmed"},{"nombre":"Julia","apellido":"S.","status":"confirmed"},{"nombre":"Felix","apellido":"B.","status":"confirmed"}]'::jsonb),
('Mauerweg Run', 'Berlin', 'East Side Gallery (Oberbaumbrücke)', 52.5018, 13.4411, '2026-02-20', '17:30', 'intermedio', '12', '5:15', 'Lauf entlang des Mauerwegs. Von der East Side Gallery durch Kreuzberg und Friedrichshain. Geschichte und Running kombiniert.', '00000000-0000-0000-0000-000000000005', 'DE', true, 'Hans M.', '[{"nombre":"Anna","apellido":"H.","status":"confirmed"},{"nombre":"Paul","apellido":"R.","status":"confirmed"},{"nombre":"Laura","apellido":"F.","status":"confirmed"}]'::jsonb);

-- ============================================================
-- Verificar
-- ============================================================
SELECT ciudad, COUNT(*) as total FROM quedadas WHERE es_seed = true GROUP BY ciudad ORDER BY total DESC;
