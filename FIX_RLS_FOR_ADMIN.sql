-- ===================================
-- 관리자가 모든 프로필을 볼 수 있도록 RLS 정책 추가
-- ===================================

-- 1. 기존 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. 관리자용 SELECT 정책 추가
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. 관리자가 모든 가이드를 볼 수 있도록 guides 테이블에도 정책 추가
CREATE POLICY "Admins can view all guides"
  ON guides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. 최종 확인: 정책 목록
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'guides')
ORDER BY tablename, policyname;
