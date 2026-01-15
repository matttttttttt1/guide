# 관리자 계정 설정 가이드

관리자 계정을 생성하고 관리자 대시보드에 접근하는 방법입니다.

## 1단계: 데이터베이스 스키마 업데이트

Supabase SQL Editor에서 다음 쿼리를 실행하여 role 컬럼을 추가합니다:

```sql
-- 1. profiles 테이블에 role 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. role에 체크 제약조건 추가
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user'));

-- 3. role 컬럼 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

## 2단계: 관리자 계정 생성

### 방법 1: Supabase Dashboard에서 직접 생성 (추천)

1. Supabase Dashboard 접속
2. **Authentication** > **Users** 클릭
3. **Add user** 버튼 클릭
4. 다음 정보 입력:
   - **Email**: `admin@gctour.com`
   - **Password**: `onlinetour1!`
   - **Auto Confirm User**: 체크 (이메일 인증 건너뛰기)
5. **Create user** 클릭

### 방법 2: 애플리케이션에서 회원가입

1. 로그아웃 상태에서 회원가입 페이지 접속
2. 다음 정보로 가입:
   - Email: `admin@gctour.com`
   - Password: `onlinetour1!`
3. 회원가입 후 **자동으로 관리자 프로필이 완성**되어 관리자 대시보드로 이동합니다
   - **정확히 `admin@gctour.com` 이메일만** 자동으로 관리자 권한이 부여됩니다
   - 회사명/사업자번호 입력 불필요

## 3단계: 관리자 권한 부여 (방법 1을 사용한 경우만 필요)

**방법 2로 회원가입한 경우 이 단계는 건너뛰세요 (자동 완성됨)**

방법 1 (Supabase Dashboard)로 계정을 생성한 경우, Supabase SQL Editor에서 다음 쿼리를 실행하여 관리자 권한을 부여합니다:

```sql
-- email로 찾아서 관리자 권한 부여
UPDATE profiles
SET
  role = 'admin',
  company_name = '관리자',
  business_number = 'ADMIN'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gctour.com'
);
```

## 4단계: 관리자 로그인 및 확인

1. 애플리케이션에 `admin@gctour.com` / `onlinetour1!`로 로그인
2. 상단 네비게이션에 **관리자 대시보드** 메뉴가 표시되는지 확인
3. 관리자 대시보드 클릭하여 다음 기능 확인:
   - 등록된 모든 랜드사 목록
   - 각 랜드사별 가이드 수 통계
   - 랜드사 클릭 시 해당 랜드사의 가이드 목록

## 관리자 기능

### 관리자 대시보드 (`/admin`)
- 전체 랜드사 목록
- 총 랜드사 수, 총 가이드 수, 평균 가이드 수 통계
- 랜드사별 가이드 수 확인

### 랜드사별 가이드 목록 (`/admin/companies/[id]`)
- 특정 랜드사의 모든 가이드 조회
- 가이드 상세 정보 확인
- 활성/비활성 상태 확인

## 권한 체크

관리자 페이지는 자동으로 권한을 체크합니다:
- 로그인하지 않은 경우 → 로그인 페이지로 리다이렉트
- 일반 사용자인 경우 → 가이드 관리 페이지로 리다이렉트
- 관리자인 경우 → 정상적으로 페이지 표시

## 추가 관리자 계정 생성

추가 관리자가 필요한 경우:

1. 일반 계정으로 회원가입
2. SQL로 해당 계정에 관리자 권한 부여:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '새로운_관리자@example.com'
);
```

## 문제 해결

### "관리자 대시보드" 메뉴가 보이지 않는 경우

1. SQL로 role 확인:
```sql
SELECT p.*, u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@gctour.com';
```

2. role이 'admin'이 아니면 다시 설정:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gctour.com'
);
```

3. 브라우저 새로고침 또는 로그아웃 후 다시 로그인

### 관리자 페이지 접근 시 리다이렉트되는 경우

- role 컬럼이 올바르게 추가되었는지 확인
- 캐시 문제일 수 있으니 하드 리프레시 (Cmd+Shift+R)
