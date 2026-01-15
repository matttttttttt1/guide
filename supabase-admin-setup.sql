-- 1. profiles 테이블에 role 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. role에 체크 제약조건 추가
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user'));

-- 3. role 컬럼 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. 기존 사용자들의 role을 'user'로 설정 (중요!)
UPDATE profiles
SET role = 'user'
WHERE role IS NULL OR role = '';

-- 5. 관리자 계정 생성
-- 먼저 Supabase Dashboard에서 다음과 같이 관리자 계정을 생성해야 합니다:
-- Email: admin@gctour.com (정확히 이 이메일만 관리자로 인식됩니다)
-- Password: onlinetour1!

-- 5. 생성된 관리자 계정의 UUID를 확인한 후 아래 쿼리 실행
-- (Supabase Dashboard > Authentication > Users에서 UUID 확인)

-- 예시: 관리자 계정의 profile에 role을 'admin'으로 설정
-- UPDATE profiles
-- SET role = 'admin',
--     company_name = '관리자',
--     business_number = 'ADMIN'
-- WHERE id = '여기에-관리자-UUID-입력';

-- 또는 email로 찾아서 업데이트 (auth.users에서 조회)
-- UPDATE profiles
-- SET role = 'admin',
--     company_name = '관리자',
--     business_number = 'ADMIN'
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'admin@gctour.com'
-- );
