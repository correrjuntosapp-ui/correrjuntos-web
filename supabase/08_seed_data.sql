-- ============================================
-- SEED DATA - CorrerJuntos
-- Datos ficticios para poblar la aplicación
-- EJECUTAR DESPUÉS DE 07_seeding_system.sql
-- ============================================

-- ============================================
-- IMPORTANTE: Ejecutar este script SOLO una vez
-- Para re-ejecutar, primero eliminar seed existente:
-- DELETE FROM participantes WHERE es_seed = TRUE;
-- DELETE FROM quedadas WHERE es_seed = TRUE;
-- DELETE FROM profiles WHERE es_seed = TRUE;
-- ============================================

-- ============================================
-- PASO 1: Crear perfiles seed (usuarios ficticios)
-- Nota: Estos perfiles usan UUIDs generados
-- Los avatares se generan con DiceBear API
-- ============================================

DO $$
DECLARE
    -- UUIDs predefinidos para usuarios seed (para poder referenciarlos)
    seed_user_ids UUID[] := ARRAY[
        '11111111-seed-0001-0001-000000000001'::UUID,
        '11111111-seed-0001-0002-000000000002'::UUID,
        '11111111-seed-0001-0003-000000000003'::UUID,
        '11111111-seed-0001-0004-000000000004'::UUID,
        '11111111-seed-0001-0005-000000000005'::UUID,
        '11111111-seed-0001-0006-000000000006'::UUID,
        '11111111-seed-0001-0007-000000000007'::UUID,
        '11111111-seed-0001-0008-000000000008'::UUID,
        '11111111-seed-0001-0009-000000000009'::UUID,
        '11111111-seed-0001-0010-000000000010'::UUID,
        '11111111-seed-0001-0011-000000000011'::UUID,
        '11111111-seed-0001-0012-000000000012'::UUID,
        '11111111-seed-0001-0013-000000000013'::UUID,
        '11111111-seed-0001-0014-000000000014'::UUID,
        '11111111-seed-0001-0015-000000000015'::UUID,
        '11111111-seed-0001-0016-000000000016'::UUID,
        '11111111-seed-0001-0017-000000000017'::UUID,
        '11111111-seed-0001-0018-000000000018'::UUID,
        '11111111-seed-0001-0019-000000000019'::UUID,
        '11111111-seed-0001-0020-000000000020'::UUID,
        '11111111-seed-0001-0021-000000000021'::UUID,
        '11111111-seed-0001-0022-000000000022'::UUID,
        '11111111-seed-0001-0023-000000000023'::UUID,
        '11111111-seed-0001-0024-000000000024'::UUID,
        '11111111-seed-0001-0025-000000000025'::UUID,
        '11111111-seed-0001-0026-000000000026'::UUID,
        '11111111-seed-0001-0027-000000000027'::UUID,
        '11111111-seed-0001-0028-000000000028'::UUID,
        '11111111-seed-0001-0029-000000000029'::UUID,
        '11111111-seed-0001-0030-000000000030'::UUID,
        '11111111-seed-0001-0031-000000000031'::UUID,
        '11111111-seed-0001-0032-000000000032'::UUID,
        '11111111-seed-0001-0033-000000000033'::UUID,
        '11111111-seed-0001-0034-000000000034'::UUID,
        '11111111-seed-0001-0035-000000000035'::UUID,
        '11111111-seed-0001-0036-000000000036'::UUID,
        '11111111-seed-0001-0037-000000000037'::UUID,
        '11111111-seed-0001-0038-000000000038'::UUID,
        '11111111-seed-0001-0039-000000000039'::UUID,
        '11111111-seed-0001-0040-000000000040'::UUID
    ];
BEGIN
    -- Insertar perfiles seed
    INSERT INTO profiles (id, nombre, apellidos, ciudad, nivel, bio, photo_url, es_seed, created_at) VALUES
    -- Madrid (15 usuarios)
    (seed_user_ids[1], 'Carlos', 'García López', 'Madrid', 'Intermedio', 'Corredor desde hace 3 años. Me encanta el Retiro.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '30 days'),
    (seed_user_ids[2], 'Laura', 'Martínez Ruiz', 'Madrid', 'Avanzado', 'Maratoniana. 3:15 en Valencia 2024.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '45 days'),
    (seed_user_ids[3], 'Miguel', 'Fernández Castro', 'Madrid', 'Principiante', 'Empezando a correr este año. Buscando grupo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=miguel_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '15 days'),
    (seed_user_ids[4], 'Ana', 'Rodríguez Sánchez', 'Madrid', 'Intermedio', 'Trail runner. Casa de Campo es mi casa.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '60 days'),
    (seed_user_ids[5], 'Pablo', 'López Hernández', 'Madrid', 'Avanzado', 'Entrenador certificado. Ritmos sub-4.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pablo_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '90 days'),
    (seed_user_ids[6], 'María', 'González Torres', 'Madrid', 'Principiante', 'Objetivo: terminar mi primera 10K.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '10 days'),
    (seed_user_ids[7], 'Javier', 'Díaz Moreno', 'Madrid', 'Intermedio', 'Runner nocturno. Trabajo de oficina.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=javier_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '25 days'),
    (seed_user_ids[8], 'Carmen', 'Muñoz Jiménez', 'Madrid', 'Avanzado', 'Ultratrail. 100km del Sahara 2023.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carmen_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '120 days'),
    (seed_user_ids[9], 'David', 'Romero Gil', 'Madrid', 'Principiante', 'De ciclista a runner. Aprendiendo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '5 days'),
    (seed_user_ids[10], 'Elena', 'Navarro Flores', 'Madrid', 'Intermedio', 'Mamá runner. Entreno cuando puedo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '40 days'),
    (seed_user_ids[34], 'Silvia', 'Calvo Bravo', 'Madrid', 'Principiante', 'Runner principiante con ganas de mejorar.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=silvia_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '8 days'),
    (seed_user_ids[35], 'Jorge', 'Caballero Luna', 'Madrid', 'Avanzado', 'Competidor de trail. 50K es mi distancia.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jorge_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '75 days'),

    -- Barcelona (10 usuarios)
    (seed_user_ids[11], 'Sergio', 'Alonso Herrera', 'Barcelona', 'Avanzado', 'Triatleta. Ironman 2024.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergio_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '50 days'),
    (seed_user_ids[12], 'Lucía', 'Molina Ortega', 'Barcelona', 'Intermedio', 'Corredora de montaña. Collserola lover.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '35 days'),
    (seed_user_ids[13], 'Raúl', 'Rubio Castro', 'Barcelona', 'Principiante', 'Nuevo en esto. Primera carrera en marzo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=raul_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '7 days'),
    (seed_user_ids[14], 'Sofía', 'Domínguez Vega', 'Barcelona', 'Avanzado', 'Sub-3 maratón. Preparando Boston.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '80 days'),
    (seed_user_ids[15], 'Adrián', 'Torres Méndez', 'Barcelona', 'Intermedio', 'Runner de fin de semana. Barceloneta.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=adrian_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '20 days'),
    (seed_user_ids[16], 'Paula', 'Vargas León', 'Barcelona', 'Principiante', 'Empezando el hábito. Busco motivación.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=paula_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '3 days'),
    (seed_user_ids[36], 'Patricia', 'Giménez Pastor', 'Barcelona', 'Intermedio', 'Corredora social. Me gusta entrenar en grupo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '28 days'),
    (seed_user_ids[37], 'Alejandro', 'Ibáñez Crespo', 'Barcelona', 'Principiante', 'Ex-futbolista reconvertido a runner.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alejandro_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '12 days'),

    -- Valencia (6 usuarios)
    (seed_user_ids[17], 'Daniel', 'Ramos Prieto', 'Valencia', 'Avanzado', 'Velocista. 100m en 11.5s.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '55 days'),
    (seed_user_ids[18], 'Marta', 'Castro Blanco', 'Valencia', 'Intermedio', 'Runner playera. Malvarrosa.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marta_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '30 days'),
    (seed_user_ids[19], 'Álvaro', 'Ortiz Serrano', 'Valencia', 'Principiante', 'Objetivo: media maratón Valencia.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alvaro_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '14 days'),
    (seed_user_ids[20], 'Nuria', 'Delgado Pascual', 'Valencia', 'Avanzado', 'Campeona regional 10K.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nuria_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '100 days'),
    (seed_user_ids[38], 'Sara', 'Lorenzo Parra', 'Valencia', 'Avanzado', 'Trail runner. Preparando UTMB.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '65 days'),
    (seed_user_ids[39], 'Roberto', 'Sanz Gallego', 'Valencia', 'Intermedio', 'Corredor matutino. 6AM club.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '22 days'),

    -- Sevilla (4 usuarios)
    (seed_user_ids[21], 'Hugo', 'Iglesias Fuentes', 'Sevilla', 'Intermedio', 'Runner del Guadalquivir.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hugo_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '25 days'),
    (seed_user_ids[22], 'Irene', 'Santos Cabrera', 'Sevilla', 'Principiante', 'Empezando con C25K.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=irene_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '6 days'),
    (seed_user_ids[23], 'Marcos', 'Medina Rojas', 'Sevilla', 'Avanzado', 'Ultramaratoniano. 24h Sevilla.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcos_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '70 days'),
    (seed_user_ids[40], 'Andrea', 'Carrasco Rivas', 'Sevilla', 'Principiante', 'Nueva en el running. Me encanta la comunidad.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrea_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '4 days'),

    -- Bilbao (2 usuarios)
    (seed_user_ids[24], 'Clara', 'Herrera Suárez', 'Bilbao', 'Intermedio', 'Corredora de montaña vasca.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=clara_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '40 days'),
    (seed_user_ids[25], 'Iván', 'Cortés Aguilar', 'Bilbao', 'Principiante', 'Primer año corriendo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '11 days'),

    -- Málaga (2 usuarios)
    (seed_user_ids[26], 'Teresa', 'Vidal Guerrero', 'Málaga', 'Avanzado', 'Maratoniana de élite amateur.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=teresa_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '85 days'),
    (seed_user_ids[27], 'Rubén', 'Cano Montero', 'Málaga', 'Intermedio', 'Runner costero. Paseo marítimo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruben_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '33 days'),

    -- Zaragoza (2 usuarios)
    (seed_user_ids[28], 'Cristina', 'Prieto Nieto', 'Zaragoza', 'Principiante', 'Comenzando mi aventura runner.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cristina_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '9 days'),
    (seed_user_ids[29], 'Óscar', 'Márquez Pascual', 'Zaragoza', 'Avanzado', 'Fondista. 100 maratones completados.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=oscar_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '150 days'),

    -- Lisboa (2 usuarios)
    (seed_user_ids[30], 'Rocío', 'Peña Campos', 'Lisboa', 'Intermedio', 'Española en Lisboa. Running groups.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rocio_runner&backgroundColor=c0aede', TRUE, NOW() - INTERVAL '45 days'),
    (seed_user_ids[31], 'Alberto', 'Lozano Reyes', 'Lisboa', 'Principiante', 'Nuevo en la ciudad y en el running.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alberto_runner&backgroundColor=d1d4f9', TRUE, NOW() - INTERVAL '18 days'),

    -- Porto (2 usuarios)
    (seed_user_ids[32], 'Beatriz', 'Guerrero Soto', 'Porto', 'Avanzado', 'Trail running por el Duero.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatriz_runner&backgroundColor=ffd5dc', TRUE, NOW() - INTERVAL '60 days'),
    (seed_user_ids[33], 'Fernando', 'Mora Esteban', 'Porto', 'Intermedio', 'Corredor nocturno de Ribeira.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fernando_runner&backgroundColor=b6e3f4', TRUE, NOW() - INTERVAL '27 days')

    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Perfiles seed insertados correctamente';
END $$;

-- ============================================
-- PASO 2: Crear quedadas seed (60 quedadas)
-- ============================================

DO $$
DECLARE
    seed_user_ids UUID[] := ARRAY[
        '11111111-seed-0001-0001-000000000001'::UUID,
        '11111111-seed-0001-0002-000000000002'::UUID,
        '11111111-seed-0001-0003-000000000003'::UUID,
        '11111111-seed-0001-0004-000000000004'::UUID,
        '11111111-seed-0001-0005-000000000005'::UUID,
        '11111111-seed-0001-0006-000000000006'::UUID,
        '11111111-seed-0001-0007-000000000007'::UUID,
        '11111111-seed-0001-0008-000000000008'::UUID,
        '11111111-seed-0001-0009-000000000009'::UUID,
        '11111111-seed-0001-0010-000000000010'::UUID,
        '11111111-seed-0001-0011-000000000011'::UUID,
        '11111111-seed-0001-0012-000000000012'::UUID,
        '11111111-seed-0001-0013-000000000013'::UUID,
        '11111111-seed-0001-0014-000000000014'::UUID,
        '11111111-seed-0001-0015-000000000015'::UUID,
        '11111111-seed-0001-0016-000000000016'::UUID,
        '11111111-seed-0001-0017-000000000017'::UUID,
        '11111111-seed-0001-0018-000000000018'::UUID,
        '11111111-seed-0001-0019-000000000019'::UUID,
        '11111111-seed-0001-0020-000000000020'::UUID,
        '11111111-seed-0001-0021-000000000021'::UUID,
        '11111111-seed-0001-0022-000000000022'::UUID,
        '11111111-seed-0001-0023-000000000023'::UUID,
        '11111111-seed-0001-0024-000000000024'::UUID,
        '11111111-seed-0001-0025-000000000025'::UUID,
        '11111111-seed-0001-0026-000000000026'::UUID,
        '11111111-seed-0001-0027-000000000027'::UUID,
        '11111111-seed-0001-0028-000000000028'::UUID,
        '11111111-seed-0001-0029-000000000029'::UUID,
        '11111111-seed-0001-0030-000000000030'::UUID,
        '11111111-seed-0001-0031-000000000031'::UUID,
        '11111111-seed-0001-0032-000000000032'::UUID,
        '11111111-seed-0001-0033-000000000033'::UUID,
        '11111111-seed-0001-0034-000000000034'::UUID,
        '11111111-seed-0001-0035-000000000035'::UUID,
        '11111111-seed-0001-0036-000000000036'::UUID,
        '11111111-seed-0001-0037-000000000037'::UUID,
        '11111111-seed-0001-0038-000000000038'::UUID,
        '11111111-seed-0001-0039-000000000039'::UUID,
        '11111111-seed-0001-0040-000000000040'::UUID
    ];
    base_date DATE := CURRENT_DATE;
BEGIN
    -- ========== MADRID (20 quedadas) ==========
    INSERT INTO quedadas (titulo, descripcion, ubicacion, direccion, ciudad, lat, lng, fecha, hora, nivel, distancia, ritmo, creador_id, es_seed, created_at) VALUES
    ('Rodaje matutino Casa de Campo', 'Rodaje tranquilo por las mejores sendas de Casa de Campo. Ideal para empezar el día con energía. Punto de encuentro en el lago.', 'Casa de Campo', 'Lago Casa de Campo, Madrid', 'Madrid', 40.4168, -3.7508, base_date + 1, '07:00', 'Intermedio', '10 km', '5:30/km', seed_user_ids[1], TRUE, NOW() - INTERVAL '2 days'),
    ('Series en el Retiro', 'Sesión de series 10x400m con recuperación activa. Calentamiento y vuelta a la calma incluidos.', 'Parque del Retiro', 'Estanque del Retiro, Madrid', 'Madrid', 40.4153, -3.6845, base_date + 1, '19:00', 'Avanzado', '8 km', '4:00/km', seed_user_ids[2], TRUE, NOW() - INTERVAL '3 days'),
    ('Running social Malasaña', 'Ruta urbana por el barrio más alternativo de Madrid. Perfecto para conocer gente nueva mientras corres.', 'Plaza del Dos de Mayo', 'Plaza del Dos de Mayo, Madrid', 'Madrid', 40.4264, -3.7025, base_date + 2, '20:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[3], TRUE, NOW() - INTERVAL '1 day'),
    ('Tirada larga domingo', 'Entrenamiento de fondo para preparar maratón. Ritmo conversacional. Avituallamiento en km 15.', 'Madrid Río', 'Puente de Segovia, Madrid', 'Madrid', 40.4130, -3.7142, base_date + 4, '08:00', 'Avanzado', '25 km', '5:15/km', seed_user_ids[5], TRUE, NOW() - INTERVAL '4 days'),
    ('Trail Casa de Campo', 'Ruta técnica por los senderos menos conocidos. Desnivel acumulado 300m. Llevar agua.', 'Casa de Campo Norte', 'Teleférico Casa de Campo, Madrid', 'Madrid', 40.4234, -3.7456, base_date + 2, '09:00', 'Intermedio', '15 km', '6:00/km', seed_user_ids[4], TRUE, NOW() - INTERVAL '2 days'),
    ('Corre con tu perro', 'Quedada especial para correr con nuestros amigos de 4 patas. Ritmo adaptado. Agua para perros incluida.', 'Parque Juan Carlos I', 'Entrada Principal Parque JC1, Madrid', 'Madrid', 40.4652, -3.6167, base_date + 3, '10:00', 'Principiante', '6 km', '6:00/km', seed_user_ids[6], TRUE, NOW() - INTERVAL '1 day'),
    ('Night runners Madrid', 'Ruta nocturna con frontales. Recorrido por el centro histórico iluminado. Experiencia única.', 'Puerta del Sol', 'Km 0, Puerta del Sol, Madrid', 'Madrid', 40.4169, -3.7035, base_date + 3, '21:30', 'Intermedio', '8 km', '5:45/km', seed_user_ids[7], TRUE, NOW() - INTERVAL '3 days'),
    ('Fartlek en Dehesa de la Villa', 'Entrenamiento de cambios de ritmo en terreno variado. Ideal para mejorar velocidad.', 'Dehesa de la Villa', 'Dehesa de la Villa, Madrid', 'Madrid', 40.4567, -3.7234, base_date + 4, '18:00', 'Avanzado', '10 km', '4:45/km', seed_user_ids[8], TRUE, NOW() - INTERVAL '2 days'),
    ('Iniciación al running', 'Para los que empiezan. Aprende técnica de carrera, respiración y planificación. Sin presión.', 'Parque de Berlín', 'Parque de Berlín, Madrid', 'Madrid', 40.4432, -3.6789, base_date + 5, '11:00', 'Principiante', '4 km', '7:00/km', seed_user_ids[9], TRUE, NOW() - INTERVAL '1 day'),
    ('Mamás runners', 'Grupo de madres que aprovechan la mañana para entrenar. Niños bienvenidos en carrito.', 'Parque del Oeste', 'Templo de Debod, Madrid', 'Madrid', 40.4245, -3.7178, base_date + 5, '09:30', 'Intermedio', '7 km', '6:00/km', seed_user_ids[10], TRUE, NOW() - INTERVAL '2 days'),
    ('Cuestas en Vallecas', 'Entrenamiento de fuerza en cuestas. 8 repeticiones de 200m. Mejora tu potencia.', 'Parque del Cerro del Tío Pío', 'Cerro del Tío Pío, Madrid', 'Madrid', 40.3912, -3.6523, base_date + 6, '18:30', 'Avanzado', '6 km', '5:00/km', seed_user_ids[35], TRUE, NOW() - INTERVAL '3 days'),
    ('Ruta Anillo Verde', 'Descubre el Anillo Verde Ciclista corriendo. Tramo norte. Paisajes increíbles.', 'Anillo Verde Norte', 'Valdebebas, Madrid', 'Madrid', 40.4856, -3.6234, base_date + 6, '08:00', 'Intermedio', '18 km', '5:30/km', seed_user_ids[1], TRUE, NOW() - INTERVAL '4 days'),
    ('Tempo run Madrid Río', 'Entrenamiento de ritmo controlado. 5km a ritmo de competición 10K. Grupo motivador.', 'Madrid Río', 'Matadero Madrid, Madrid', 'Madrid', 40.3912, -3.6978, base_date + 7, '19:00', 'Avanzado', '10 km', '4:30/km', seed_user_ids[2], TRUE, NOW() - INTERVAL '2 days'),
    ('Rodaje regenerativo', 'Recuperación activa post-competición. Ritmo muy suave. Estiramientos al final.', 'Parque Lineal del Manzanares', 'Parque Lineal, Madrid', 'Madrid', 40.3567, -3.6789, base_date + 7, '10:00', 'Principiante', '8 km', '6:30/km', seed_user_ids[4], TRUE, NOW() - INTERVAL '1 day'),
    ('Running fotográfico', 'Combinamos running con fotografía urbana. Paradas en spots icónicos. Cámara/móvil recomendado.', 'Gran Vía', 'Plaza de Callao, Madrid', 'Madrid', 40.4200, -3.7056, base_date + 8, '08:30', 'Principiante', '6 km', '7:00/km', seed_user_ids[6], TRUE, NOW() - INTERVAL '3 days'),
    ('Intervalos en pista', 'Sesión de velocidad en pista de atletismo. 6x1000m. Cronometraje incluido.', 'Pista Vallehermoso', 'Estadio Vallehermoso, Madrid', 'Madrid', 40.4456, -3.7123, base_date + 8, '19:30', 'Avanzado', '8 km', '4:15/km', seed_user_ids[5], TRUE, NOW() - INTERVAL '2 days'),
    ('Ruta histórica centro', 'Conoce la historia de Madrid mientras corres. Guía runner. Paradas interpretativas.', 'Plaza Mayor', 'Plaza Mayor, Madrid', 'Madrid', 40.4155, -3.7074, base_date + 9, '10:00', 'Intermedio', '9 km', '6:00/km', seed_user_ids[7], TRUE, NOW() - INTERVAL '4 days'),
    ('Sunrise run Cuatro Torres', 'Amanecer junto a las torres más altas de España. Vistas espectaculares. Café después.', 'CTBA', 'Paseo de la Castellana 259, Madrid', 'Madrid', 40.4789, -3.6867, base_date + 9, '06:45', 'Intermedio', '10 km', '5:30/km', seed_user_ids[8], TRUE, NOW() - INTERVAL '1 day'),
    ('Reto 21K preparación', 'Entrenamiento específico media maratón. Combinación de ritmos. Grupo reducido.', 'Casa de Campo', 'Puerta del Ángel Casa de Campo, Madrid', 'Madrid', 40.4089, -3.7456, base_date + 10, '08:00', 'Avanzado', '21 km', '5:00/km', seed_user_ids[2], TRUE, NOW() - INTERVAL '3 days'),
    ('Yoga + Running', 'Sesión combinada: 45min yoga + 30min running suave. Cuerpo y mente en equilibrio.', 'Parque del Retiro', 'Rosaleda del Retiro, Madrid', 'Madrid', 40.4134, -3.6789, base_date + 10, '09:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[10], TRUE, NOW() - INTERVAL '2 days'),

    -- ========== BARCELONA (15 quedadas) ==========
    ('Amanecer en Barceloneta', 'Corre junto al mar mientras amanece. La mejor forma de empezar el día en Barcelona.', 'Playa Barceloneta', 'Passeig Marítim de la Barceloneta, Barcelona', 'Barcelona', 41.3784, 2.1925, base_date + 1, '06:30', 'Intermedio', '8 km', '5:30/km', seed_user_ids[11], TRUE, NOW() - INTERVAL '2 days'),
    ('Trail Collserola', 'Ruta por la sierra de Collserola. Senderos técnicos con vistas a toda Barcelona.', 'Collserola', 'Carretera de les Aigües, Barcelona', 'Barcelona', 41.4234, 2.1234, base_date + 2, '09:00', 'Avanzado', '18 km', '6:00/km', seed_user_ids[12], TRUE, NOW() - INTERVAL '3 days'),
    ('C25K Grupo principiantes', 'Programa Couch to 5K. Semana 5. Intervalos de 8 minutos. Ánimo al grupo.', 'Parc de la Ciutadella', 'Arc de Triomf, Barcelona', 'Barcelona', 41.3917, 2.1806, base_date + 1, '19:00', 'Principiante', '4 km', '7:00/km', seed_user_ids[13], TRUE, NOW() - INTERVAL '1 day'),
    ('Series playa', 'Entrenamiento de velocidad en la arena compacta. 8x200m. Trabaja fuerza de pies.', 'Playa de la Mar Bella', 'Platja de la Mar Bella, Barcelona', 'Barcelona', 41.3912, 2.2134, base_date + 3, '07:30', 'Avanzado', '6 km', '4:30/km', seed_user_ids[14], TRUE, NOW() - INTERVAL '2 days'),
    ('Ruta Gaudí corriendo', 'Descubre las obras de Gaudí a ritmo de trote. Sagrada Familia, Pedrera, Park Güell.', 'Sagrada Familia', 'Sagrada Familia, Barcelona', 'Barcelona', 41.4036, 2.1744, base_date + 4, '10:00', 'Intermedio', '12 km', '6:00/km', seed_user_ids[15], TRUE, NOW() - INTERVAL '4 days'),
    ('Running después del trabajo', 'Desconecta de la oficina corriendo. Punto de encuentro céntrico. Ritmo adaptado.', 'Plaça Catalunya', 'Plaça de Catalunya, Barcelona', 'Barcelona', 41.3870, 2.1700, base_date + 2, '19:30', 'Principiante', '5 km', '6:30/km', seed_user_ids[16], TRUE, NOW() - INTERVAL '1 day'),
    ('Long run domingo BCN', 'Tirada larga por el litoral barcelonés. De Barceloneta a Badalona. Grupo compacto.', 'Barceloneta', 'W Barcelona, Barcelona', 'Barcelona', 41.3689, 2.1897, base_date + 4, '08:00', 'Avanzado', '22 km', '5:15/km', seed_user_ids[11], TRUE, NOW() - INTERVAL '3 days'),
    ('Montjuïc challenge', 'Subida a Montjuïc por diferentes rutas. 400m desnivel. Vistas increíbles arriba.', 'Montjuïc', 'Plaça Espanya, Barcelona', 'Barcelona', 41.3750, 2.1489, base_date + 5, '09:30', 'Intermedio', '10 km', '6:15/km', seed_user_ids[12], TRUE, NOW() - INTERVAL '2 days'),
    ('Fartlek Diagonal', 'Cambios de ritmo por la Diagonal. Farolas como referencias. Entrenamiento dinámico.', 'Avinguda Diagonal', 'L\'Illa Diagonal, Barcelona', 'Barcelona', 41.3923, 2.1367, base_date + 5, '18:30', 'Avanzado', '8 km', '4:45/km', seed_user_ids[14], TRUE, NOW() - INTERVAL '1 day'),
    ('Night run Poblenou', 'Ruta nocturna por el distrito de la innovación. Street art y arquitectura moderna.', 'Poblenou', 'Rambla del Poblenou, Barcelona', 'Barcelona', 41.4023, 2.2056, base_date + 6, '21:00', 'Intermedio', '7 km', '5:45/km', seed_user_ids[36], TRUE, NOW() - INTERVAL '3 days'),
    ('Rodaje recuperación', 'Post-carrera recuperación. Ritmo muy suave. Estiramientos y charla al final.', 'Parc del Forum', 'Parc del Fòrum, Barcelona', 'Barcelona', 41.4112, 2.2234, base_date + 6, '10:00', 'Principiante', '6 km', '6:45/km', seed_user_ids[37], TRUE, NOW() - INTERVAL '2 days'),
    ('Preparación Cursa Bombers', 'Entrenamiento específico para la carrera más popular de Barcelona. Simulacro de ritmo.', 'Montjuïc', 'Estadi Olímpic, Barcelona', 'Barcelona', 41.3645, 2.1556, base_date + 7, '09:00', 'Intermedio', '10 km', '5:30/km', seed_user_ids[11], TRUE, NOW() - INTERVAL '4 days'),
    ('Tempo Passeig de Gràcia', 'Entrenamiento de ritmo por la avenida más elegante. 8km a ritmo de media maratón.', 'Passeig de Gràcia', 'Casa Batlló, Barcelona', 'Barcelona', 41.3917, 2.1650, base_date + 8, '07:00', 'Avanzado', '8 km', '4:45/km', seed_user_ids[14], TRUE, NOW() - INTERVAL '2 days'),
    ('Running social Gràcia', 'Conoce runners del barrio de Gràcia. Ruta por plazas y calles con encanto.', 'Gràcia', 'Plaça del Sol, Barcelona', 'Barcelona', 41.4023, 2.1567, base_date + 8, '19:30', 'Principiante', '5 km', '6:30/km', seed_user_ids[16], TRUE, NOW() - INTERVAL '1 day'),
    ('Ultra training BCN', 'Entrenamiento largo para ultratraileros. Collserola travesía. Autonomía necesaria.', 'Collserola', 'Tibidabo, Barcelona', 'Barcelona', 41.4178, 2.1189, base_date + 11, '07:00', 'Avanzado', '35 km', '6:30/km', seed_user_ids[12], TRUE, NOW() - INTERVAL '3 days'),

    -- ========== VALENCIA (10 quedadas) ==========
    ('Sunrise Malvarrosa', 'Amanecer corriendo por la playa de la Malvarrosa. Arena compacta. Brisa marina.', 'Playa Malvarrosa', 'Paseo Marítimo Malvarrosa, Valencia', 'Valencia', 39.4789, -0.3234, base_date + 1, '07:00', 'Intermedio', '10 km', '5:30/km', seed_user_ids[17], TRUE, NOW() - INTERVAL '2 days'),
    ('Jardín del Turia completo', 'Recorre los 9km del antiguo cauce del río. Parques, puentes y Ciudad de las Artes.', 'Jardín del Turia', 'Parque de Cabecera, Valencia', 'Valencia', 39.4789, -0.4012, base_date + 2, '09:00', 'Principiante', '9 km', '6:00/km', seed_user_ids[18], TRUE, NOW() - INTERVAL '1 day'),
    ('Preparación Maratón Valencia', 'Entrenamiento específico para el maratón más rápido de España. Ritmo objetivo.', 'Ciudad de las Artes', 'Ciutat de les Arts i les Ciències, Valencia', 'Valencia', 39.4534, -0.3478, base_date + 4, '08:00', 'Avanzado', '28 km', '5:00/km', seed_user_ids[20], TRUE, NOW() - INTERVAL '3 days'),
    ('Running principiantes Viveros', 'Grupo de iniciación en los jardines de Viveros. Ambiente tranquilo. Sin presión.', 'Jardines de Viveros', 'Jardins del Real, Valencia', 'Valencia', 39.4789, -0.3612, base_date + 2, '18:30', 'Principiante', '4 km', '7:00/km', seed_user_ids[19], TRUE, NOW() - INTERVAL '2 days'),
    ('Series Ciudad de las Artes', 'Intervalos 6x1km alrededor del complejo. Terreno llano y vistas espectaculares.', 'Ciudad de las Artes', 'Hemisfèric, Valencia', 'Valencia', 39.4545, -0.3512, base_date + 3, '19:00', 'Avanzado', '10 km', '4:30/km', seed_user_ids[17], TRUE, NOW() - INTERVAL '4 days'),
    ('Ruta Albufera runners', 'Descubre el parque natural de la Albufera corriendo. Arrozales y naturaleza.', 'Albufera', 'El Palmar, Valencia', 'Valencia', 39.3345, -0.3234, base_date + 4, '08:30', 'Intermedio', '15 km', '5:45/km', seed_user_ids[38], TRUE, NOW() - INTERVAL '2 days'),
    ('Fartlek puerto', 'Cambios de ritmo por la zona del puerto. Ambiente marinero. Grupo mixto.', 'Puerto de Valencia', 'Marina Real Juan Carlos I, Valencia', 'Valencia', 39.4523, -0.3156, base_date + 5, '19:30', 'Intermedio', '8 km', '5:15/km', seed_user_ids[39], TRUE, NOW() - INTERVAL '1 day'),
    ('Long run costa', 'Tirada larga por la costa valenciana. De Malvarrosa a Port Saplaya. Vistas al mar.', 'Playa Malvarrosa', 'Paseo Neptuno, Valencia', 'Valencia', 39.4678, -0.3234, base_date + 11, '07:30', 'Avanzado', '20 km', '5:30/km', seed_user_ids[20], TRUE, NOW() - INTERVAL '3 days'),
    ('Yoga running Turia', 'Combinamos yoga y running en el jardín del Turia. Cuerpo equilibrado. Todos bienvenidos.', 'Jardín del Turia', 'Puente de las Flores, Valencia', 'Valencia', 39.4712, -0.3756, base_date + 6, '10:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[18], TRUE, NOW() - INTERVAL '2 days'),
    ('Rodaje nocturno centro', 'Ruta nocturna por el centro histórico de Valencia. Lonja, Catedral, Plaza del Ayuntamiento.', 'Centro Valencia', 'Plaza de la Virgen, Valencia', 'Valencia', 39.4756, -0.3756, base_date + 7, '21:00', 'Intermedio', '7 km', '5:45/km', seed_user_ids[39], TRUE, NOW() - INTERVAL '1 day'),

    -- ========== SEVILLA (6 quedadas) ==========
    ('Running Guadalquivir', 'Ruta por las orillas del río. Desde Triana hasta el Parque del Alamillo.', 'Triana', 'Puente de Triana, Sevilla', 'Sevilla', 37.3856, -6.0034, base_date + 1, '08:00', 'Intermedio', '12 km', '5:30/km', seed_user_ids[21], TRUE, NOW() - INTERVAL '2 days'),
    ('Iniciación María Luisa', 'Grupo de principiantes en el parque más bonito de Sevilla. Sombra y fuentes.', 'Parque María Luisa', 'Plaza de España, Sevilla', 'Sevilla', 37.3772, -5.9867, base_date + 2, '19:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[22], TRUE, NOW() - INTERVAL '1 day'),
    ('Tirada larga Alamillo', 'Entrenamiento de fondo por el Parque del Alamillo. Terreno variado. Grupo reducido.', 'Parque del Alamillo', 'Parque del Alamillo, Sevilla', 'Sevilla', 37.4134, -5.9912, base_date + 4, '07:30', 'Avanzado', '22 km', '5:15/km', seed_user_ids[23], TRUE, NOW() - INTERVAL '3 days'),
    ('Night run centro histórico', 'Descubre Sevilla de noche corriendo. Catedral, Alcázar, barrio de Santa Cruz.', 'Centro Sevilla', 'Catedral de Sevilla, Sevilla', 'Sevilla', 37.3861, -5.9926, base_date + 3, '21:00', 'Intermedio', '8 km', '5:45/km', seed_user_ids[21], TRUE, NOW() - INTERVAL '2 days'),
    ('Series Cartuja', 'Intervalos en la Isla de la Cartuja. Terreno llano y rápido. 8x500m.', 'Isla de la Cartuja', 'CAAC, Sevilla', 'Sevilla', 37.4023, -6.0078, base_date + 5, '18:30', 'Avanzado', '8 km', '4:45/km', seed_user_ids[23], TRUE, NOW() - INTERVAL '4 days'),
    ('Running social Triana', 'Conoce runners del barrio de Triana. Ambiente cercano. Cerveza después.', 'Triana', 'Calle Betis, Sevilla', 'Sevilla', 37.3823, -6.0045, base_date + 6, '20:00', 'Principiante', '6 km', '6:00/km', seed_user_ids[40], TRUE, NOW() - INTERVAL '1 day'),

    -- ========== OTRAS CIUDADES (9 quedadas) ==========
    -- Bilbao
    ('Running ría Bilbao', 'Recorre la ría de Bilbao corriendo. Desde Abandoibarra hasta Zorrozaurre.', 'Abandoibarra', 'Museo Guggenheim, Bilbao', 'Bilbao', 43.2687, -2.9345, base_date + 2, '08:30', 'Intermedio', '10 km', '5:30/km', seed_user_ids[24], TRUE, NOW() - INTERVAL '2 days'),
    ('Cuestas Artxanda', 'Subida al monte Artxanda. Entrenamiento de fuerza. Vistas de Bilbao desde arriba.', 'Artxanda', 'Funicular de Artxanda, Bilbao', 'Bilbao', 43.2789, -2.9234, base_date + 4, '10:00', 'Avanzado', '8 km', '6:30/km', seed_user_ids[25], TRUE, NOW() - INTERVAL '3 days'),

    -- Málaga
    ('Running paseo marítimo', 'Desde la Malagueta hasta Pedregalejo. Brisa marina y ambiente mediterráneo.', 'Malagueta', 'Playa de la Malagueta, Málaga', 'Málaga', 36.7178, -4.4089, base_date + 1, '07:30', 'Intermedio', '12 km', '5:30/km', seed_user_ids[26], TRUE, NOW() - INTERVAL '1 day'),
    ('Principiantes Parque', 'Grupo de iniciación en el Parque de Málaga. Sombra de ficus centenarios.', 'Parque de Málaga', 'Parque de Málaga, Málaga', 'Málaga', 36.7189, -4.4134, base_date + 3, '19:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[27], TRUE, NOW() - INTERVAL '2 days'),

    -- Zaragoza
    ('Ribera del Ebro', 'Ruta por el parque del Agua y riberas del Ebro. Entorno natural en la ciudad.', 'Parque del Agua', 'Parque del Agua Luis Buñuel, Zaragoza', 'Zaragoza', 41.6856, -0.9012, base_date + 2, '09:00', 'Intermedio', '10 km', '5:45/km', seed_user_ids[29], TRUE, NOW() - INTERVAL '3 days'),
    ('Running principiantes Expo', 'Grupo de iniciación en la zona Expo. Terreno llano y accesible.', 'Expo Zaragoza', 'Torre del Agua, Zaragoza', 'Zaragoza', 41.6734, -0.9123, base_date + 5, '18:30', 'Principiante', '4 km', '7:00/km', seed_user_ids[28], TRUE, NOW() - INTERVAL '1 day'),

    -- Lisboa
    ('Running Belém', 'Desde la Torre de Belém hasta el MAAT. Monumentos y río Tajo.', 'Belém', 'Torre de Belém, Lisboa', 'Lisboa', 38.6916, -9.2160, base_date + 1, '08:00', 'Intermedio', '10 km', '5:30/km', seed_user_ids[30], TRUE, NOW() - INTERVAL '2 days'),
    ('Iniciación Parque das Nações', 'Grupo principiantes en la zona más moderna de Lisboa. Terreno llano.', 'Parque das Nações', 'Oceanário de Lisboa, Lisboa', 'Lisboa', 38.7634, -9.0934, base_date + 3, '19:00', 'Principiante', '5 km', '6:30/km', seed_user_ids[31], TRUE, NOW() - INTERVAL '1 day'),

    -- Porto
    ('Trail Serra do Pilar', 'Subida al mirador más famoso de Porto. Vistas del Duero y la Ribeira.', 'Vila Nova de Gaia', 'Serra do Pilar, Porto', 'Porto', 41.1378, -8.6067, base_date + 2, '09:30', 'Avanzado', '12 km', '6:00/km', seed_user_ids[32], TRUE, NOW() - INTERVAL '3 days'),
    ('Running Foz do Douro', 'Ruta costera desde la desembocadura del Duero. Océano Atlántico y puesta de sol.', 'Foz do Douro', 'Farol da Foz, Porto', 'Porto', 41.1512, -8.6789, base_date + 4, '18:00', 'Intermedio', '8 km', '5:45/km', seed_user_ids[33], TRUE, NOW() - INTERVAL '2 days');

    RAISE NOTICE 'Quedadas seed insertadas correctamente';
END $$;

-- ============================================
-- PASO 3: Crear participaciones seed
-- (Cada quedada tendrá entre 3-8 participantes)
-- ============================================

DO $$
DECLARE
    quedada_record RECORD;
    seed_user_ids UUID[] := ARRAY[
        '11111111-seed-0001-0001-000000000001'::UUID,
        '11111111-seed-0001-0002-000000000002'::UUID,
        '11111111-seed-0001-0003-000000000003'::UUID,
        '11111111-seed-0001-0004-000000000004'::UUID,
        '11111111-seed-0001-0005-000000000005'::UUID,
        '11111111-seed-0001-0006-000000000006'::UUID,
        '11111111-seed-0001-0007-000000000007'::UUID,
        '11111111-seed-0001-0008-000000000008'::UUID,
        '11111111-seed-0001-0009-000000000009'::UUID,
        '11111111-seed-0001-0010-000000000010'::UUID,
        '11111111-seed-0001-0011-000000000011'::UUID,
        '11111111-seed-0001-0012-000000000012'::UUID,
        '11111111-seed-0001-0013-000000000013'::UUID,
        '11111111-seed-0001-0014-000000000014'::UUID,
        '11111111-seed-0001-0015-000000000015'::UUID,
        '11111111-seed-0001-0016-000000000016'::UUID,
        '11111111-seed-0001-0017-000000000017'::UUID,
        '11111111-seed-0001-0018-000000000018'::UUID,
        '11111111-seed-0001-0019-000000000019'::UUID,
        '11111111-seed-0001-0020-000000000020'::UUID,
        '11111111-seed-0001-0021-000000000021'::UUID,
        '11111111-seed-0001-0022-000000000022'::UUID,
        '11111111-seed-0001-0023-000000000023'::UUID,
        '11111111-seed-0001-0024-000000000024'::UUID,
        '11111111-seed-0001-0025-000000000025'::UUID,
        '11111111-seed-0001-0026-000000000026'::UUID,
        '11111111-seed-0001-0027-000000000027'::UUID,
        '11111111-seed-0001-0028-000000000028'::UUID,
        '11111111-seed-0001-0029-000000000029'::UUID,
        '11111111-seed-0001-0030-000000000030'::UUID,
        '11111111-seed-0001-0031-000000000031'::UUID,
        '11111111-seed-0001-0032-000000000032'::UUID,
        '11111111-seed-0001-0033-000000000033'::UUID,
        '11111111-seed-0001-0034-000000000034'::UUID,
        '11111111-seed-0001-0035-000000000035'::UUID,
        '11111111-seed-0001-0036-000000000036'::UUID,
        '11111111-seed-0001-0037-000000000037'::UUID,
        '11111111-seed-0001-0038-000000000038'::UUID,
        '11111111-seed-0001-0039-000000000039'::UUID,
        '11111111-seed-0001-0040-000000000040'::UUID
    ];
    madrid_users UUID[];
    barcelona_users UUID[];
    valencia_users UUID[];
    sevilla_users UUID[];
    bilbao_users UUID[];
    malaga_users UUID[];
    zaragoza_users UUID[];
    lisboa_users UUID[];
    porto_users UUID[];
    city_users UUID[];
    num_participants INTEGER;
    selected_users UUID[];
    i INTEGER;
    status_options TEXT[] := ARRAY['confirmed', 'confirmed', 'confirmed', 'maybe', 'interested'];
BEGIN
    -- Definir usuarios por ciudad
    madrid_users := ARRAY[seed_user_ids[1], seed_user_ids[2], seed_user_ids[3], seed_user_ids[4], seed_user_ids[5], seed_user_ids[6], seed_user_ids[7], seed_user_ids[8], seed_user_ids[9], seed_user_ids[10], seed_user_ids[34], seed_user_ids[35]];
    barcelona_users := ARRAY[seed_user_ids[11], seed_user_ids[12], seed_user_ids[13], seed_user_ids[14], seed_user_ids[15], seed_user_ids[16], seed_user_ids[36], seed_user_ids[37]];
    valencia_users := ARRAY[seed_user_ids[17], seed_user_ids[18], seed_user_ids[19], seed_user_ids[20], seed_user_ids[38], seed_user_ids[39]];
    sevilla_users := ARRAY[seed_user_ids[21], seed_user_ids[22], seed_user_ids[23], seed_user_ids[40]];
    bilbao_users := ARRAY[seed_user_ids[24], seed_user_ids[25]];
    malaga_users := ARRAY[seed_user_ids[26], seed_user_ids[27]];
    zaragoza_users := ARRAY[seed_user_ids[28], seed_user_ids[29]];
    lisboa_users := ARRAY[seed_user_ids[30], seed_user_ids[31]];
    porto_users := ARRAY[seed_user_ids[32], seed_user_ids[33]];

    -- Iterar sobre cada quedada seed
    FOR quedada_record IN
        SELECT id, ciudad, creador_id FROM quedadas WHERE es_seed = TRUE
    LOOP
        -- Seleccionar usuarios de la misma ciudad
        CASE quedada_record.ciudad
            WHEN 'Madrid' THEN city_users := madrid_users;
            WHEN 'Barcelona' THEN city_users := barcelona_users;
            WHEN 'Valencia' THEN city_users := valencia_users;
            WHEN 'Sevilla' THEN city_users := sevilla_users;
            WHEN 'Bilbao' THEN city_users := bilbao_users;
            WHEN 'Málaga' THEN city_users := malaga_users;
            WHEN 'Zaragoza' THEN city_users := zaragoza_users;
            WHEN 'Lisboa' THEN city_users := lisboa_users;
            WHEN 'Porto' THEN city_users := porto_users;
            ELSE city_users := ARRAY[]::UUID[];
        END CASE;

        -- Número aleatorio de participantes (entre 3 y tamaño del array de usuarios)
        num_participants := LEAST(3 + floor(random() * 5)::INTEGER, array_length(city_users, 1));

        -- Siempre añadir al creador primero
        INSERT INTO participantes (quedada_id, user_id, status, es_seed, created_at)
        VALUES (quedada_record.id, quedada_record.creador_id, 'confirmed', TRUE, NOW() - INTERVAL '1 day')
        ON CONFLICT (quedada_id, user_id) DO NOTHING;

        -- Añadir participantes adicionales aleatorios
        FOR i IN 1..num_participants LOOP
            IF city_users[i] IS NOT NULL AND city_users[i] != quedada_record.creador_id THEN
                INSERT INTO participantes (quedada_id, user_id, status, es_seed, created_at)
                VALUES (
                    quedada_record.id,
                    city_users[i],
                    status_options[1 + floor(random() * array_length(status_options, 1))::INTEGER],
                    TRUE,
                    NOW() - INTERVAL '1 day' * random()
                )
                ON CONFLICT (quedada_id, user_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Participaciones seed insertadas correctamente';
END $$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT
    'Perfiles seed' as tipo,
    COUNT(*) as cantidad
FROM profiles WHERE es_seed = TRUE
UNION ALL
SELECT
    'Quedadas seed' as tipo,
    COUNT(*) as cantidad
FROM quedadas WHERE es_seed = TRUE
UNION ALL
SELECT
    'Participaciones seed' as tipo,
    COUNT(*) as cantidad
FROM participantes WHERE es_seed = TRUE;

-- Ver distribución por ciudad
SELECT
    ciudad,
    COUNT(*) as quedadas_seed
FROM quedadas
WHERE es_seed = TRUE
GROUP BY ciudad
ORDER BY quedadas_seed DESC;
