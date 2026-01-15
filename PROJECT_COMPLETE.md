# 가이드 관리 시스템 - 프로젝트 완료 ✅

## 완성된 기능

### 1. 인증 시스템
- ✅ **로그인** (`/auth/login`)
  - 이메일/비밀번호 로그인
  - 에러 처리 및 유효성 검증

- ✅ **회원가입** (`/auth/signup`)
  - 이메일/비밀번호 가입
  - 비밀번호 확인 (최소 6자)
  - 자동 프로필 생성

- ✅ **프로필 완성** (`/profile/complete`)
  - 회원가입 후 필수 입력
  - 여행사명 (랜드사)
  - 사업자 번호

### 2. 가이드 관리
- ✅ **가이드 목록** (`/guides`)
  - 카드 형태 목록 표시
  - 활성/비활성 상태 뱃지
  - 빈 상태 처리
  - 반응형 그리드 레이아웃

- ✅ **가이드 등록** (`/guides/new`)
  - **필수 필드**: 한글명, 영문성, 영문명
  - **선택 필드**:
    - 구분 (가이드/인솔자)
    - 성별
    - 생년월일
    - 이메일
    - 가능 언어 (11개 언어 다중 선택)
    - 메신저 유형 (카카오톡, 라인, 와츠앱, 텔레그램, 위챗)
    - 메신저 ID
    - 메모

- ✅ **가이드 상세/수정** (`/guides/[id]`)
  - 모든 정보 수정 가능
  - 활성/비활성 토글
  - 가이드 삭제 (확인 다이얼로그)
  - 실시간 상태 업데이트

### 3. 네비게이션
- ✅ **헤더**
  - 로고 및 제목
  - 메뉴 (가이드 관리, 내 프로필)
  - 사용자 정보 표시 (여행사명, 이메일)
  - 활성 메뉴 하이라이트
  - 모바일 반응형 메뉴

- ✅ **로그아웃**
  - 확인 다이얼로그
  - 세션 종료 및 리다이렉트

### 4. 프로필 관리
- ✅ **내 프로필** (`/profile`)
  - 계정 정보 조회 (이메일)
  - 여행사 정보 수정
  - 가이드 통계 (전체/활성)

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks

## 프로젝트 구조

```
src/
├── app/
│   ├── auth/
│   │   ├── actions.ts              # 로그인/회원가입/로그아웃
│   │   ├── login/page.tsx          # 로그인 페이지
│   │   └── signup/page.tsx         # 회원가입 페이지
│   ├── profile/
│   │   ├── actions.ts              # 프로필 업데이트
│   │   ├── complete/page.tsx       # 프로필 완성 페이지
│   │   └── ...
│   ├── (dashboard)/
│   │   ├── layout.tsx              # 대시보드 레이아웃 (헤더 포함)
│   │   ├── guides/
│   │   │   ├── actions.ts          # 가이드 CRUD
│   │   │   ├── page.tsx            # 가이드 목록
│   │   │   ├── new/page.tsx        # 가이드 등록
│   │   │   └── [id]/page.tsx       # 가이드 상세/수정
│   │   └── profile/
│   │       └── page.tsx            # 내 프로필
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 홈 (→ /auth/login)
│   └── globals.css
├── components/
│   ├── navigation/
│   │   └── header.tsx              # 헤더 컴포넌트
│   └── ui/                         # Shadcn UI 컴포넌트
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── badge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # 클라이언트 사이드
│   │   └── server.ts               # 서버 사이드
│   └── utils.ts
├── types/
│   └── database.types.ts           # DB 타입 정의
└── middleware.ts                   # 인증 미들웨어
```

## 데이터베이스 구조

### profiles 테이블
```sql
- id (uuid, PK, FK to auth.users)
- email (text, unique)
- company_name (text)
- business_number (text)
- created_at, updated_at
```

### guides 테이블
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- name_ko (text)
- name_en_first (text)
- name_en_last (text)
- type (text) - guide/tour_conductor
- gender (text) - male/female/other
- profile_image_url (text)
- birth_date (date)
- email (text)
- languages (text[])
- messenger_type (text) - kakao/line/whatsapp/telegram/wechat
- messenger_id (text)
- notes (text)
- is_active (boolean)
- created_at, updated_at
```

## 보안 및 권한

- ✅ Row Level Security (RLS) 활성화
- ✅ 사용자는 자신의 데이터만 접근 가능
- ✅ 미들웨어를 통한 라우트 보호
- ✅ Server Actions를 통한 안전한 데이터 처리
- ✅ 프로필 완성 전 다른 페이지 접근 차단

## 사용자 플로우

```
1. 회원가입 → 2. 프로필 완성 → 3. 가이드 관리
                                    ↓
                              4. 프로필 수정
                                    ↓
                              5. 로그아웃
```

## 실행 방법

1. **환경 변수 설정**:
   ```bash
   cp .env.local.example .env.local
   # Supabase URL과 ANON KEY 입력
   ```

2. **Supabase 데이터베이스 설정**:
   - SETUP.md 파일의 SQL 실행

3. **개발 서버 실행**:
   ```bash
   npm install
   npm run dev
   ```

4. **브라우저 접속**:
   ```
   http://localhost:3000
   ```

## 주요 기능 상세

### 가이드 등록 필드
- **필수**: 한글명, 영문성, 영문명
- **선택**: 구분, 성별, 생년월일, 이메일, 언어, 메신저, 메모

### 가능 언어
한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 이탈리아어, 러시아어, 태국어, 베트남어

### 메신저 유형
카카오톡, 라인, 와츠앱, 텔레그램, 위챗

## 반응형 디자인

- ✅ 모바일: 싱글 컬럼
- ✅ 태블릿: 2컬럼 그리드
- ✅ 데스크톱: 3컬럼 그리드
- ✅ 모바일 메뉴: 햄버거 메뉴

## 다음 개선 사항 (선택)

1. **프로필 사진 업로드**: Supabase Storage 연동
2. **검색 기능**: 가이드 이름/언어로 검색
3. **필터링**: 구분, 언어, 상태로 필터
4. **정렬**: 이름, 등록일 등으로 정렬
5. **가이드 상세 보기**: 프로필 이미지, 더 많은 정보
6. **CSV 내보내기**: 가이드 목록 엑셀 다운로드
7. **다국어 지원**: i18n
8. **다크 모드**: 테마 토글

## 완료 ✅

모든 요구사항이 구현되었습니다:
- ✅ Supabase Auth 회원가입
- ✅ 회원가입 후 랜드사/사업자번호 입력
- ✅ 가이드/인솔자 등록
- ✅ 메뉴 (가이드 등록, 내 프로필)
- ✅ 로그아웃 기능
- ✅ Shadcn + React + Next.js
