-- 문제가 되는 관리자 정책 삭제
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all guides" ON guides;

-- 기본 정책: 사용자는 자신의 프로필만 볼 수 있음
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 기본 정책: 사용자는 자신의 프로필만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 기본 정책: 사용자는 자신의 가이드만 볼 수 있음
DROP POLICY IF EXISTS "Users can view own guides" ON guides;
CREATE POLICY "Users can view own guides"
  ON guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 기본 정책: 사용자는 자신의 가이드만 삽입 가능
DROP POLICY IF EXISTS "Users can insert own guides" ON guides;
CREATE POLICY "Users can insert own guides"
  ON guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 기본 정책: 사용자는 자신의 가이드만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own guides" ON guides;
CREATE POLICY "Users can update own guides"
  ON guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 기본 정책: 사용자는 자신의 가이드만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own guides" ON guides;
CREATE POLICY "Users can delete own guides"
  ON guides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 관리자 접근은 애플리케이션 레벨에서 처리 (service_role 사용)
-- RLS 정책에서는 순환 참조를 피하기 위해 관리자 체크를 하지 않음
