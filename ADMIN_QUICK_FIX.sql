-- 관리자 기능을 위한 긴급 수정 SQL
-- Supabase SQL Editor에서 이 쿼리들을 순서대로 실행하세요

-- 1. profiles 테이블에 role 컬럼 추가 (이미 있으면 무시됨)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. role 체크 제약조건 추가
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user'));

-- 3. 기존 사용자들의 role을 'user'로 설정 (매우 중요!)
UPDATE profiles
SET role = 'user'
WHERE role IS NULL OR role = '';

-- 4. role 컬럼 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. 확인: 모든 프로필 조회
SELECT id, company_name, business_number, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- 실행 후 admin@gctour.com 계정으로 로그인하면 모든 랜드사와 가이드가 보입니다!
