-- Supabase Storage 버킷 생성 및 설정

-- guide-photos 버킷 생성 (Private - 보안 강화)
-- 파일 크기 제한: 5MB (5242880 bytes)
-- 허용된 MIME 타입: image/jpeg, image/png, image/webp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-photos',
  'guide-photos',
  false,  -- Private bucket으로 설정
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 인증된 사용자만 guide-photos 버킷에 파일 업로드 가능
-- 파일 크기와 MIME 타입은 버킷 설정에서 자동 검증됨
CREATE POLICY "Authenticated users can upload guide photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guide-photos');

-- 인증된 사용자만 guide-photos 버킷의 파일을 읽을 수 있도록 설정 (보안 강화)
CREATE POLICY "Authenticated users can view guide photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'guide-photos');

-- 파일 소유자만 삭제 가능하도록 설정
CREATE POLICY "Users can delete own guide photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  auth.uid() = owner
);

-- 파일 소유자만 업데이트 가능하도록 설정
CREATE POLICY "Users can update own guide photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  auth.uid() = owner
);
