# 가이드 관리 시스템

Next.js 15 + Supabase로 구축된 가이드 및 인솔자 관리 시스템

## 주요 기능

- 🔐 이메일 기반 인증 (회원가입/로그인/비밀번호 찾기)
- 👤 프로필 관리 (회사명, 사업자번호)
- 📋 가이드/인솔자 등록 및 관리
- 📊 관리자 대시보드 (전체 랜드사 및 가이드 현황)
- 📤 Excel 일괄 등록
- 🔒 역할 기반 접근 제어 (Admin/User)

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel

## 시작하기

### 환경 변수 설정

`.env.local` 파일 생성:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 설치 및 실행

\`\`\`bash
npm install
npm run dev
\`\`\`

http://localhost:3000 에서 애플리케이션 확인

## 배포

Vercel로 배포:

\`\`\`bash
vercel
\`\`\`

## 관리자 계정

기본 관리자: \`admin@gctour.com\`
