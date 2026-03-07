-- Verification Requests table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  id_photo_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Only one active request per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_active_user
  ON verification_requests(user_id)
  WHERE status = 'pending';

-- RLS policies
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own verification request
CREATE POLICY "Users can insert own verification"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own verification requests
CREATE POLICY "Users can read own verification"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Create storage bucket for verification photos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users can upload verification photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own verification photos
CREATE POLICY "Users can read own verification photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
