# Supabase 이메일 템플릿 한글화 가이드

Supabase Dashboard에서 이메일 템플릿을 한글로 변경하는 방법입니다.

## 1. Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **Email Templates** 탭 클릭

## 2. 회원가입 인증 이메일 (Confirm signup)

**Template 선택**: `Confirm signup`

### Subject (제목):
```
이메일 인증을 완료해주세요
```

### Message Body (본문):
```html
<h2>가이드 관리 시스템 회원가입</h2>

<p>안녕하세요,</p>

<p>가입해 주셔서 감사합니다! 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>감사합니다.</p>
```

## 3. 비밀번호 재설정 이메일 (Reset Password)

**Template 선택**: `Reset Password`

### Subject (제목):
```
비밀번호 재설정 요청
```

### Message Body (본문):
```html
<h2>비밀번호 재설정</h2>

<p>안녕하세요,</p>

<p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.</p>

<p>이 링크는 60분 동안 유효합니다.</p>

<p>감사합니다.</p>
```

## 4. 이메일 주소 변경 확인 (Change Email Address)

**Template 선택**: `Change Email Address`

### Subject (제목):
```
이메일 주소 변경 확인
```

### Message Body (본문):
```html
<h2>이메일 주소 변경</h2>

<p>안녕하세요,</p>

<p>이메일 주소 변경을 요청하셨습니다. 아래 버튼을 클릭하여 변경을 확인해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">이메일 변경 확인하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.</p>

<p>감사합니다.</p>
```

## 5. 매직 링크 (Magic Link)

**Template 선택**: `Magic Link`

### Subject (제목):
```
로그인 링크
```

### Message Body (본문):
```html
<h2>로그인 링크</h2>

<p>안녕하세요,</p>

<p>아래 버튼을 클릭하여 로그인해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">로그인하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>이 링크는 60분 동안 유효합니다.</p>

<p>감사합니다.</p>
```

## 6. 초대 이메일 (Invite User)

**Template 선택**: `Invite User`

### Subject (제목):
```
초대장이 도착했습니다
```

### Message Body (본문):
```html
<h2>가이드 관리 시스템 초대</h2>

<p>안녕하세요,</p>

<p>가이드 관리 시스템에 초대되셨습니다. 아래 버튼을 클릭하여 계정을 설정해주세요.</p>

<p><a href="{{ .ConfirmationURL }}">계정 설정하기</a></p>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>

<p>감사합니다.</p>
```

## 7. 저장 및 테스트

1. 각 템플릿 수정 후 **Save** 버튼 클릭
2. 테스트 이메일을 본인에게 전송하여 확인
3. 스팸 메일함도 확인

## 주요 변수

Supabase 이메일 템플릿에서 사용 가능한 변수:

- `{{ .ConfirmationURL }}` - 인증/재설정 링크
- `{{ .Token }}` - 인증 토큰
- `{{ .TokenHash }}` - 토큰 해시
- `{{ .SiteURL }}` - 사이트 URL
- `{{ .Email }}` - 사용자 이메일

## 참고사항

- 이메일은 HTML 형식으로 작성됩니다
- 링크 스타일은 CSS inline 스타일로 추가 가능합니다
- 이메일 전송 실패 시 Supabase Dashboard의 Logs에서 확인 가능합니다

## 스타일링 예시 (선택사항)

버튼 스타일을 추가하려면:

```html
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
```

이렇게 하면 파란색 버튼 형태로 링크가 표시됩니다.
