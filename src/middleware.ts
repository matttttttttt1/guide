import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // /auth/confirm은 route handler가 직접 처리하도록 skip
  if (request.nextUrl.pathname === '/auth/confirm') {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProfileCompletePage = request.nextUrl.pathname.startsWith('/profile/complete')
  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/guides') ||
    request.nextUrl.pathname.startsWith('/profile')

  // 인증되지 않은 사용자가 보호된 페이지 접근 시도
  if (!user && isProtectedPage && !isProfileCompletePage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 인증된 사용자가 auth 페이지 접근 시도
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/guides', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
