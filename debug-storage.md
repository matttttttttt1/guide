# Storage 이미지 로딩 문제 디버깅

## 1단계: 브라우저 개발자 도구에서 확인

1. F12 또는 Cmd+Option+I로 개발자 도구 열기
2. **Console** 탭에서 에러 확인
3. **Network** 탭에서 이미지 요청 확인
   - 이미지 URL 우클릭 → "Copy link address"
   - 새 탭에서 해당 URL 직접 열어보기

## 2단계: 데이터베이스에서 URL 확인

Supabase SQL Editor에서:
```sql
SELECT id, name_ko, photo_url FROM guides WHERE photo_url IS NOT NULL;
```

photo_url이 어떻게 저장되어 있는지 확인하세요.

## 3단계: Storage 버킷 Public 설정 확인

1. Supabase Dashboard → **Storage** 클릭
2. `guide-photos` 버킷 클릭
3. 오른쪽 상단 설정 아이콘(⚙️) 클릭
4. **"Public bucket"** 체크박스가 활성화되어 있는지 확인
5. 체크되어 있지 않다면 체크 후 저장

## 4단계: 업로드된 파일 확인

1. Storage → `guide-photos` 버킷 클릭
2. 업로드된 파일이 보이는지 확인
3. 파일 클릭 → "Get URL" → 브라우저에서 URL 직접 열어보기

## 5단계: Storage 정책 재확인

SQL Editor에서:
```sql
-- 조회 정책 재생성
DROP POLICY IF EXISTS "Anyone can view guide photos" ON storage.objects;

CREATE POLICY "Anyone can view guide photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guide-photos');
```

## 일반적인 문제와 해결방법

### 문제 1: "Access Denied" 또는 403 에러
**원인**: Public bucket이 아니거나 조회 정책 없음
**해결**: 3단계와 5단계 실행

### 문제 2: 404 Not Found
**원인**: 잘못된 URL이 저장됨
**해결**: 2단계에서 URL 확인 후 올바른 형식으로 재업로드

### 문제 3: CORS 에러
**원인**: Storage CORS 설정 문제
**해결**:
1. Supabase Dashboard → Settings → API
2. CORS에 localhost:3000 추가되어 있는지 확인

## 올바른 URL 형식

```
https://[project-ref].supabase.co/storage/v1/object/public/guide-photos/[filename]
```

예시:
```
https://abcdefgh.supabase.co/storage/v1/object/public/guide-photos/1234567890-abc123.jpg
```
