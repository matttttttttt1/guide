# Supabase Storage 설정 가이드

## 1단계: Storage 버킷 생성 확인

### Supabase Dashboard에서 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. `guide-photos` 버킷이 있는지 확인

### 버킷이 없는 경우 생성

#### 방법 1: Dashboard에서 직접 생성

1. "New bucket" 버튼 클릭
2. 설정:
   - **Name**: `guide-photos`
   - **Public bucket**: ✅ 체크
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
3. "Create bucket" 클릭

#### 방법 2: SQL Editor에서 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase-storage-setup.sql` 파일 내용 복사하여 붙여넣기
4. "Run" 버튼 클릭

## 2단계: Storage 정책 확인

### SQL Editor에서 정책 확인

```sql
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- 정책이 없거나 잘못된 경우 삭제 후 재생성
DROP POLICY IF EXISTS "Authenticated users can upload guide photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view guide photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own guide photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own guide photos" ON storage.objects;

-- 정책 생성
CREATE POLICY "Authenticated users can upload guide photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guide-photos');

CREATE POLICY "Anyone can view guide photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guide-photos');

CREATE POLICY "Users can delete own guide photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  auth.uid()::text = owner
);

CREATE POLICY "Users can update own guide photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  auth.uid()::text = owner
);
```

## 3단계: 브라우저에서 에러 확인

1. 브라우저에서 개발자 도구 열기 (F12 또는 Cmd+Option+I)
2. **Console** 탭 선택
3. 가이드 등록 페이지에서 사진 업로드 시도
4. 콘솔에 표시되는 에러 메시지 확인

### 일반적인 에러 메시지

**"new row violates row-level security policy"**
- 원인: Storage 정책이 올바르게 설정되지 않음
- 해결: 위의 SQL로 정책 재생성

**"Bucket not found"**
- 원인: guide-photos 버킷이 존재하지 않음
- 해결: 1단계에서 버킷 생성

**"File size exceeds limit"**
- 원인: 5MB를 초과하는 파일 업로드 시도
- 해결: 더 작은 파일 사용

**"Invalid mime type"**
- 원인: JPG, PNG, WEBP가 아닌 파일 업로드 시도
- 해결: 허용된 형식의 이미지 파일 사용

## 4단계: 테스트

1. 5MB 이하의 JPG 또는 PNG 이미지 준비
2. 가이드 등록 페이지에서 "사진 선택" 클릭
3. 이미지 선택
4. 미리보기가 표시되는지 확인
5. "등록하기" 버튼 클릭
6. 업로드 성공 여부 확인

## 문제 해결

### 여전히 업로드 실패 시

1. Supabase Dashboard > Settings > API
2. Project URL과 anon key 확인
3. `.env.local` 파일의 값과 일치하는지 확인

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. 개발 서버 재시작
```bash
npm run dev
```

### 추가 도움이 필요한 경우

- 콘솔에 표시되는 정확한 에러 메시지를 확인
- Supabase Dashboard > Logs에서 Storage 로그 확인
