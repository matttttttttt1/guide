-- Supabase Database Function: 이메일 중복 체크
-- 이 함수는 auth.users 테이블에서 이메일이 존재하는지 확인합니다

-- 1. 함수 생성
CREATE OR REPLACE FUNCTION check_email_exists(email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- 관리자 권한으로 실행 (auth.users 테이블 접근 가능)
AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- auth.users 테이블에서 이메일 검색
  SELECT COUNT(*)
  INTO email_count
  FROM auth.users
  WHERE email = email_param;

  -- 이메일이 존재하면 TRUE, 아니면 FALSE 반환
  RETURN email_count > 0;
END;
$$;

-- 2. 함수 권한 설정 (authenticated 사용자가 호출 가능)
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon;

-- 3. 테스트 쿼리
-- SELECT check_email_exists('test@example.com');
-- TRUE면 이메일 존재, FALSE면 사용 가능

-- 참고:
-- - SECURITY DEFINER를 사용하여 일반 사용자가 auth.users에 접근할 수 있도록 함
-- - auth.users는 기본적으로 서비스 롤만 접근 가능
-- - 이 함수는 이메일 존재 여부만 반환하고 다른 정보는 노출하지 않음
