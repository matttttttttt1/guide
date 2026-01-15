import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/profile/complete'

  console.log('=== Email Confirmation (PKCE Flow) ===')
  console.log('Full URL:', request.url)
  console.log('Target redirect:', next)

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

  // PKCE flow에서는 Supabase가 이미 세션을 설정했으므로
  // 현재 사용자를 확인하기만 하면 됨
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('Current user check:', {
    authenticated: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message
  })

  if (user) {
    // 성공 - 이미 인증된 사용자
    console.log('✅ User authenticated via PKCE flow:', user.email)
    console.log('Redirecting to:', next)
    return NextResponse.redirect(new URL(next, request.url))
  }

  // 인증 실패
  console.error('❌ No authenticated user found')
  return NextResponse.redirect(
    new URL('/auth/login?error=이메일 인증에 실패했습니다', request.url)
  )
}
