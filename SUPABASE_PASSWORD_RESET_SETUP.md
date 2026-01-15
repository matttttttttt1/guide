# Supabase 비밀번호 재설정 설정 가이드

비밀번호 재설정 기능이 제대로 작동하도록 Supabase를 설정하는 방법입니다.

## 1. Redirect URL 설정

Supabase Dashboard에서 비밀번호 재설정 후 리다이렉트할 URL을 허용해야 합니다.

### 단계:

1. **Supabase Dashboard** 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **URL Configuration** 탭 클릭
5. **Redirect URLs** 섹션에서 다음 URL 추가:

```
http://localhost:3000/auth/reset-password
```

**프로덕션 배포 시**:
```
https://yourdomain.com/auth/reset-password
```

6. **Save** 클릭

## 2. Site URL 설정

1. 같은 **URL Configuration** 페이지에서
2. **Site URL** 항목을 확인:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://yourdomain.com`

## 3. 환경 변수 설정 (선택사항)

프로덕션 배포 시 `.env.production` 파일에 추가:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 4. 비밀번호 재설정 플로우 테스트

### 테스트 단계:

1. **비밀번호 찾기**:
   - http://localhost:3000/auth/login 접속
   - "비밀번호 찾기" 클릭
   - 이메일 입력 후 전송

2. **이메일 확인**:
   - 이메일 확인 (스팸함도 체크)
   - "비밀번호 재설정하기" 링크 클릭

3. **새 비밀번호 설정**:
   - `/auth/reset-password` 페이지로 이동
   - 새 비밀번호 입력 (최소 6자)
   - 비밀번호 확인 입력
   - "비밀번호 변경" 버튼 클릭

4. **로그인 테스트**:
   - 로그인 페이지로 자동 이동
   - 새 비밀번호로 로그인 시도

## 5. 문제 해결

### "세션이 만료되었습니다" 오류

**원인**: 이메일 링크가 만료되었거나 Redirect URL이 설정되지 않음

**해결**:
1. Redirect URL이 Supabase Dashboard에 추가되었는지 확인
2. 비밀번호 찾기를 다시 시도
3. 이메일 링크는 60분 내에 클릭해야 함

### "비밀번호 변경 실패" 오류

**원인**: URL에 access_token이 없거나 유효하지 않음

**해결**:
1. 브라우저 개발자 도구 (F12) 열기
2. Console 탭에서 오류 메시지 확인
3. URL에 `#access_token=...`이 있는지 확인
4. 없다면 Redirect URL 설정 재확인

### 이메일이 오지 않음

**해결**:
1. 스팸 메일함 확인
2. Supabase Dashboard → Settings → API에서 이메일 발송 제한 확인
3. 개발 중에는 Supabase의 무료 이메일 발송 제한이 있을 수 있음

## 6. 이메일 템플릿 한글화

`EMAIL_TEMPLATE_KOREAN_GUIDE.md` 파일 참조

비밀번호 재설정 이메일 템플릿:
- **제목**: `비밀번호 재설정 요청`
- **본문**: 한글로 친절한 안내 메시지 포함

## 7. 보안 고려사항

- 비밀번호 재설정 링크는 60분 후 자동 만료
- 링크는 1회만 사용 가능
- HTTPS 사용 권장 (프로덕션)
- 비밀번호는 최소 6자 이상 (Supabase 기본값)

## 8. 추가 기능 (선택사항)

### 비밀번호 강도 검증 강화

`src/app/auth/actions.ts`에서 비밀번호 정책 강화:

```typescript
// 비밀번호 강도 검증 예시
function validatePasswordStrength(password: string) {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)

  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다'
  }

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
  }

  return null
}
```

### 이메일 재발송 기능

비밀번호 찾기 페이지에 "이메일 재발송" 버튼 추가 가능

## 완료!

모든 설정이 완료되었습니다. 비밀번호 재설정 기능을 테스트해보세요.
