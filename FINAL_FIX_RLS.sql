-- ========================================
-- 단계 1: 모든 기존 RLS 정책 완전 삭제
-- ========================================

-- profiles 테이블의 모든 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- guides 테이블의 모든 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'guides') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON guides';
    END LOOP;
END $$;

-- ========================================
-- 단계 2: RLS 활성화 확인
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 단계 3: 간단하고 안전한 정책만 생성
-- ========================================

-- profiles: 사용자는 자신의 프로필만 SELECT 가능
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- profiles: 사용자는 자신의 프로필만 UPDATE 가능
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- profiles: 사용자는 자신의 프로필만 INSERT 가능
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- guides: 사용자는 자신의 가이드만 SELECT 가능
CREATE POLICY "guides_select_own"
  ON guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- guides: 사용자는 자신의 가이드만 INSERT 가능
CREATE POLICY "guides_insert_own"
  ON guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- guides: 사용자는 자신의 가이드만 UPDATE 가능
CREATE POLICY "guides_update_own"
  ON guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- guides: 사용자는 자신의 가이드만 DELETE 가능
CREATE POLICY "guides_delete_own"
  ON guides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- 완료 확인
-- ========================================
SELECT 'RLS policies completely reset - DONE!' as status;
