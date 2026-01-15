import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/profile/complete'

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
            // Cookie setting error - silently ignore
          }
        },
      },
    }
  )

  // PKCE flow에서는 Supabase가 이미 세션을 설정했으므로
  // 현재 사용자를 확인하기만 하면 됨
  const { data: { user }, error } = await supabase.auth.getUser()

  if (user) {
    // 성공 - 이미 인증된 사용자
    return NextResponse.redirect(new URL(next, request.url))
  }

  // 인증 실패
  return NextResponse.redirect(
    new URL('/auth/login?error=이메일 인증에 실패했습니다', request.url)
  )
}
