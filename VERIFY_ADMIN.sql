-- ===================================
-- 관리자 설정 최종 확인
-- ===================================

-- 1. 현재 RLS 정책 확인
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'guides')
ORDER BY tablename, policyname;

-- 2. 프로필 확인
SELECT id, email, company_name, business_number, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. 각 랜드사별 가이드 수 확인
SELECT
  p.email,
  p.company_name,
  p.role,
  COUNT(g.id) as guide_count
FROM profiles p
LEFT JOIN guides g ON p.id = g.user_id
GROUP BY p.id, p.email, p.company_name, p.role
ORDER BY p.created_at DESC;

-- 4. 모든 가이드 확인
SELECT
  g.id,
  g.name_ko,
  g.name_en_first,
  g.name_en_last,
  g.type,
  p.email as owner_email,
  p.company_name
FROM guides g
JOIN profiles p ON g.user_id = p.id
ORDER BY g.created_at DESC;
