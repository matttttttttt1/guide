import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/profile/complete'

  // 디버깅: 받은 파라미터 확인
  console.log('=== Email Confirmation Debug ===')
  console.log('token_hash:', token_hash)
  console.log('type:', type)
  console.log('All params:', Object.fromEntries(searchParams))

  if (token_hash && type) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('Cookie setting error:', error)
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    console.log('verifyOtp result:', { data: !!data, error: error?.message })

    if (!error) {
      // 성공 - 쿠키가 설정된 상태로 리다이렉트
      console.log('Success! Redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('verifyOtp error:', error)
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  console.log('Failed - redirecting to login')
  return NextResponse.redirect(new URL('/auth/login?error=인증에 실패했습니다', request.url))
}
