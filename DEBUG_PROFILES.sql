-- ===================================
-- 프로필 문제 디버깅 및 수정
-- ===================================

-- 1단계: auth.users에 있는 모든 사용자 확인
SELECT id, email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 2단계: profiles에 있는 모든 프로필 확인
SELECT id, email, company_name, business_number, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- 3단계: auth.users에는 있지만 profiles에 없는 사용자 찾기
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4단계: 트리거 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5단계: 누락된 프로필 수동 생성 (위 3단계에서 찾은 사용자가 있다면)
-- 아래 쿼리의 주석을 해제하고 실행하세요
/*
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
*/

-- 6단계: 모든 기존 프로필에 role='user' 설정
UPDATE profiles
SET role = 'user'
WHERE role IS NULL AND email NOT LIKE 'admin@%';

-- 7단계: admin 이메일의 role='admin' 설정
UPDATE profiles
SET role = 'admin',
    company_name = '관리자',
    business_number = 'ADMIN'
WHERE email LIKE 'admin@%';

-- 8단계: 최종 확인
SELECT
  p.id,
  p.email,
  p.company_name,
  p.business_number,
  p.role,
  COUNT(g.id) as guide_count
FROM profiles p
LEFT JOIN guides g ON p.id = g.user_id
GROUP BY p.id, p.email, p.company_name, p.business_number, p.role
ORDER BY p.created_at DESC;
