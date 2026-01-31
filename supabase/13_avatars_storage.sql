-- ============================================
-- CONFIGURACION DE STORAGE PARA AVATARS
-- Para subida de fotos de perfil desde la app
-- ============================================

-- ⚠️ IMPORTANTE: PRIMERO CREAR EL BUCKET MANUALMENTE
-- 1. Ve a Supabase Dashboard > Storage
-- 2. Haz clic en "New bucket"
-- 3. Nombre: avatars
-- 4. ✅ Marca "Public bucket" (IMPORTANTE)
-- 5. Haz clic en "Create bucket"
-- 6. Luego ejecuta este script SQL

-- ============================================
-- POLITICAS RLS PARA STORAGE DE AVATARS
-- ============================================

-- Primero eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public Access for Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

-- Política: Cualquiera puede ver avatars (lectura pública)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política: Usuarios autenticados pueden subir avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
);

-- Política: Usuarios pueden actualizar avatars
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
);

-- Política: Usuarios pueden eliminar avatars
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICAR QUE EL BUCKET EXISTE
-- ============================================
-- Ejecuta esto para verificar:
-- SELECT * FROM storage.buckets WHERE id = 'avatars';
