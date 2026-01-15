-- 1단계: profiles 테이블의 모든 기존 정책 완전 삭제
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 2단계: guides 테이블의 모든 기존 정책 완전 삭제
DROP POLICY IF EXISTS "Admins can view all guides" ON guides;
DROP POLICY IF EXISTS "Users can view own guides" ON guides;
DROP POLICY IF EXISTS "Users can insert own guides" ON guides;
DROP POLICY IF EXISTS "Users can update own guides" ON guides;
DROP POLICY IF EXISTS "Users can delete own guides" ON guides;
DROP POLICY IF EXISTS "Enable read access for own guides" ON guides;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON guides;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON guides;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON guides;

-- 3단계: RLS 활성화 확인
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- 4단계: profiles 테이블 - 간단하고 안전한 정책만 생성
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5단계: guides 테이블 - 간단하고 안전한 정책만 생성
CREATE POLICY "guides_select_own"
  ON guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "guides_insert_own"
  ON guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guides_update_own"
  ON guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guides_delete_own"
  ON guides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 완료 메시지
SELECT 'RLS policies have been completely reset' as status;
