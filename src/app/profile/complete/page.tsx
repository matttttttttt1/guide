import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompleteProfileForm } from './complete-profile-form'

export default async function CompleteProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 이메일이면 무조건 관리자 대시보드로 (정확히 admin@gctour.com만)
  if (user.email === 'admin@gctour.com') {
    // 프로필 업데이트 시도
    await supabase
      .from('profiles')
      .update({
        company_name: '관리자',
        business_number: 'ADMIN',
        role: 'admin'
      })
      .eq('id', user.id)

    redirect('/admin')
  }

  // 프로필 정보 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, business_number, role')
    .eq('id', user.id)
    .single()

  // 이미 프로필이 완성된 일반 사용자는 가이드 페이지로
  if (profile?.company_name && profile?.business_number) {
    redirect('/guides')
  }

  // 일반 사용자는 프로필 완성 폼 표시
  return <CompleteProfileForm />
}
