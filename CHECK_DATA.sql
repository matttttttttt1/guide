-- 1. profiles 테이블에 어떤 데이터가 있는지 확인
SELECT id, email, company_name, business_number, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. guides 테이블에 어떤 데이터가 있는지 확인
SELECT id, user_id, name_ko, name_en_first, name_en_last, created_at
FROM guides
ORDER BY created_at DESC;

-- 3. 현재 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'guides')
ORDER BY tablename, policyname;
