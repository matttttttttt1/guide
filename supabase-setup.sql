-- ===================================
-- 가이드 관리 시스템 - Supabase 설정
-- ===================================

-- 1. profiles 테이블 생성
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  company_name text,
  business_number text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. 새 사용자 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. guides 테이블 생성
CREATE TABLE guides (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name_ko text,
  name_en_first text,
  name_en_last text,
  type text,
  gender text,
  photo_url text,
  birth_date date,
  email text,
  messenger_type text,
  messenger_id text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own guides"
  ON guides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guides"
  ON guides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guides"
  ON guides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own guides"
  ON guides FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX guides_user_id_idx ON guides(user_id);
CREATE INDEX guides_is_active_idx ON guides(is_active);

-- 4. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- guides 테이블 트리거
CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- 완료!
