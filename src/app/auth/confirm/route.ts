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
  console.log('Full URL:', request.url)
  console.log('token_hash:', token_hash)
  console.log('type:', type)
  console.log('next:', next)
  console.log('All params:', Object.fromEntries(searchParams))

  if (!token_hash) {
    console.error('ERROR: token_hash is missing!')
    return NextResponse.redirect(new URL('/auth/login?error=토큰이 없습니다', request.url))
  }

  if (!type) {
    console.error('ERROR: type is missing!')
    return NextResponse.redirect(new URL('/auth/login?error=타입이 없습니다', request.url))
  }

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

  console.log('Calling verifyOtp with:', { type, token_hash: token_hash.substring(0, 20) + '...' })

  const { data, error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash,
  })

  console.log('verifyOtp result:', {
    success: !!data?.user,
    userId: data?.user?.id,
    error: error?.message,
    errorCode: error?.code
  })

  if (!error && data?.user) {
    // 성공 - 쿠키가 설정된 상태로 리다이렉트
    console.log('✅ Success! User authenticated:', data.user.email)
    console.log('Redirecting to:', next)
    return NextResponse.redirect(new URL(next, request.url))
  }

  // 에러 발생
  console.error('❌ verifyOtp failed:', {
    error: error?.message,
    code: error?.code,
    status: error?.status
  })

  return NextResponse.redirect(new URL('/auth/login?error=인증에 실패했습니다: ' + (error?.message || '알 수 없는 오류'), request.url))
}
