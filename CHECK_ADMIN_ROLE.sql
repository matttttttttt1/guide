-- admin 계정의 role 확인
SELECT id, email, company_name, business_number, role, created_at
FROM profiles
WHERE email = 'admin@gctour.com';

-- 만약 role이 NULL이거나 'admin'이 아니면 수정
UPDATE profiles
SET role = 'admin',
    company_name = '관리자',
    business_number = 'ADMIN'
WHERE email = 'admin@gctour.com'
AND (role IS NULL OR role != 'admin');

-- 다시 확인
SELECT id, email, company_name, business_number, role
FROM profiles
WHERE email = 'admin@gctour.com';
