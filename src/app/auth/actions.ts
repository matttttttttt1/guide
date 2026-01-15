'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // 에러 메시지를 한글로 번역
    if (error.message.includes('Email not confirmed')) {
      return { error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.' }
    }
    if (error.message.includes('Invalid login credentials')) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  // 관리자 이메일인지 확인 (정확히 admin@gctour.com만)
  if (authData.user?.email === 'admin@gctour.com') {
    redirect('/admin')
  }

  redirect('/guides')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Production URL 직접 사용 (환경변수 문제 해결)
  const isProduction = process.env.NODE_ENV === 'production'
  const redirectUrl = isProduction
    ? 'https://guide-management.vercel.app/auth/confirm'
    : 'http://localhost:3000/auth/confirm'

  console.log('=== Signup Debug ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isProduction:', isProduction)
  console.log('redirectUrl:', redirectUrl)

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: redirectUrl,
    }
  })

  if (error) {
    // 에러 메시지를 한글로 번역
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      return { error: '이미 가입된 이메일입니다' }
    }
    if (error.message.includes('Invalid email')) {
      return { error: '유효하지 않은 이메일 주소입니다' }
    }
    if (error.message.includes('Password')) {
      return { error: '비밀번호는 최소 6자 이상이어야 합니다' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  })

  if (error) {
    return { error: '이메일 전송에 실패했습니다. 다시 시도해주세요.' }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string

  // 현재 세션 확인
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: '세션이 만료되었습니다. 비밀번호 찾기를 다시 시도해주세요.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: `비밀번호 변경 실패: ${error.message}` }
  }

  return { success: true }
}

export async function checkEmailExists(email: string) {
  const supabase = await createClient()

  // Supabase Database Function 사용
  // 이 함수는 Supabase SQL Editor에서 미리 생성되어야 합니다
  // 파일: CHECK_EMAIL_FUNCTION.sql 참조
  const { data, error } = await supabase.rpc('check_email_exists', { email_param: email })

  if (error) {
    // 함수가 없으면 중복 체크 건너뛰기
    return { exists: false, error: 'Database function not found' }
  }

  return { exists: !!data }
}

export async function resendVerificationEmail() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email!
  })

  if (error) {
    return { error: '이메일 발송에 실패했습니다' }
  }

  return { success: true }
}
