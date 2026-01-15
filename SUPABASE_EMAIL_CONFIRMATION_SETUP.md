# Supabase 이메일 인증 설정 가이드

회원가입 시 이메일 인증을 필수로 만드는 방법입니다.

## 1. Supabase Dashboard 설정

### 단계 1: 이메일 인증 활성화

1. **Supabase Dashboard** 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **Providers** 탭 클릭
5. **Email** 섹션에서 다음 설정:
   - **Enable Email provider**: ✅ 체크
   - **Confirm email**: ✅ 체크 (중요!)
   - **Secure email change**: ✅ 체크 (권장)
6. **Save** 클릭

### 단계 2: 이메일 템플릿 설정 (선택사항)

**Authentication** → **Email Templates** → **Confirm signup**에서:

**제목:**
```
이메일 인증을 완료해주세요
```

**본문:**
```html
<h2>가이드 관리 시스템 회원가입</h2>

<p>안녕하세요,</p>

<p>가입해 주셔서 감사합니다! 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="background-color: #0070f3;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;">
    이메일 인증하기
  </a>
</p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>이 링크는 24시간 동안 유효합니다.</p>

<p>감사합니다.</p>
```

### 단계 3: Redirect URL 설정 (중요!)

**Authentication** → **URL Configuration** → **Redirect URLs**에 추가:

로컬 개발:
```
http://localhost:3000/auth/confirm
```

프로덕션:
```
https://yourdomain.com/auth/confirm
```

**⚠️ 중요**: 이 설정을 하지 않으면 이메일 인증 링크 클릭 시 "Email link is invalid or has expired" 에러가 발생합니다!

## 2. 작동 방식

### 이메일 인증 활성화 후:

1. **회원가입** → 이메일 인증 대기 메시지 표시
2. **이메일 확인** → 인증 링크 클릭
3. **자동 로그인** → `/profile/complete`로 이동
4. **프로필 완성** → 가이드 관리 시작

### 인증되지 않은 사용자:

- 로그인 시도 시 "이메일을 인증해주세요" 메시지
- 대시보드 접근 제한
- 재인증 이메일 요청 가능

## 3. 테스트

### 새 계정으로 회원가입:

1. http://localhost:3000/auth/signup 접속
2. 이메일과 비밀번호 입력
3. **"이메일 인증 메일을 보냈습니다"** 메시지 확인
4. 이메일 확인 (스팸함도 체크)
5. "이메일 인증하기" 링크 클릭
6. 자동 로그인 후 프로필 완성 페이지로 이동

### 이메일이 오지 않는 경우:

1. 스팸 메일함 확인
2. Supabase Dashboard → Settings → API에서 이메일 발송 제한 확인
3. 개발 중에는 무료 플랜의 이메일 발송 제한 있음 (시간당 3-4개)
4. 로컬 테스트용으로 Inbucket 사용 고려

## 4. 개발 환경에서 빠른 테스트

이메일 인증을 일시적으로 비활성화하고 싶다면:

**Authentication** → **Providers** → **Email** → **Confirm email** 체크 해제

이렇게 하면 회원가입 즉시 로그인되어 프로필 완성 페이지로 이동합니다.

## 5. 보안 권장사항

### 프로덕션 환경:
- ✅ **Confirm email**: 반드시 활성화
- ✅ **Secure email change**: 활성화
- ✅ HTTPS 사용
- ✅ 이메일 템플릿 한글화
- ✅ 재인증 이메일 발송 기능

### 개발 환경:
- 테스트 편의를 위해 Confirm email 비활성화 가능
- 또는 Inbucket 같은 로컬 SMTP 서버 사용

## 6. 문제 해결

### "이메일을 인증해주세요" 계속 표시

**원인**: 이메일 인증을 완료하지 않음

**해결**:
1. 이메일 확인 (스팸함 포함)
2. 링크 클릭
3. 링크 만료 시 재발송 요청

### 인증 링크 클릭 후 "Email link is invalid or has expired" 오류

**URL 예시**:
```
http://localhost:3000/auth/login#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

**원인**:
1. Redirect URL이 설정되지 않음 (가장 흔한 원인)
2. 이메일 인증 링크가 만료됨 (24시간 후)
3. 이미 사용된 인증 링크를 다시 클릭

**해결**:
1. **먼저 Redirect URL 설정 확인**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs에 `http://localhost:3000/auth/confirm` 추가
   - Save 클릭

2. **기존 계정 삭제 후 재가입**:
   - Supabase Dashboard → Authentication → Users
   - 해당 이메일 계정 삭제
   - 회원가입 다시 진행

3. **또는 새 인증 이메일 요청**:
   - `/auth/verify-email` 페이지에서 "인증 이메일 재발송" 클릭

### 이메일이 발송되지 않음

**원인**:
- 무료 플랜 제한
- SMTP 설정 오류
- 차단된 도메인

**해결**:
1. Supabase Dashboard → Logs에서 이메일 발송 로그 확인
2. 유료 플랜으로 업그레이드 고려
3. Custom SMTP 설정 (유료 플랜)

## 완료!

이메일 인증 설정이 완료되었습니다. 새로 가입하는 사용자는 이메일 인증 후 서비스를 이용할 수 있습니다.
