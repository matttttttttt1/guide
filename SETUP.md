# 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력 후 생성 대기

## 2. 데이터베이스 설정

Supabase Dashboard → SQL Editor에서 다음 SQL 실행:

### profiles 테이블 생성

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  company_name text,
  business_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### guides 테이블 생성

```sql
create table guides (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name_ko text,
  name_en_first text,
  name_en_last text,
  type text,
  gender text,
  profile_image_url text,
  birth_date date,
  email text,
  languages text[],
  messenger_type text,
  messenger_id text,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table guides enable row level security;

create policy "Users can view own guides"
  on guides for select
  using (auth.uid() = user_id);

create policy "Users can insert own guides"
  on guides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own guides"
  on guides for update
  using (auth.uid() = user_id);

create policy "Users can delete own guides"
  on guides for delete
  using (auth.uid() = user_id);

create index guides_user_id_idx on guides(user_id);
create index guides_is_active_idx on guides(is_active);
```

### updated_at 트리거 생성

```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute procedure update_updated_at_column();

create trigger update_guides_updated_at
  before update on guides
  for each row
  execute procedure update_updated_at_column();
```

## 3. 환경 변수 설정

1. Supabase Dashboard → Settings → API에서 정보 확인
2. `.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

3. `.env.local` 파일에 다음 정보 입력:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 완료!

이제 다음 기능을 테스트할 수 있습니다:

- ✅ 회원가입 (이메일/비밀번호)
- ✅ 로그인
- ✅ 프로필 완성 (여행사명, 사업자번호)
- ⏳ 가이드 등록 및 관리 (다음 단계)
- ⏳ 프로필 페이지 (다음 단계)
- ⏳ 로그아웃 (다음 단계)
