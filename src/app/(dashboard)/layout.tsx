import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/navigation/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 여부는 이메일로 직접 체크 (정확히 admin@gctour.com만)
  const isAdmin = user.email === 'admin@gctour.com'

  // 프로필 정보 가져오기 (에러 무시)
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, business_number')
    .eq('id', user.id)
    .single()
    .then(res => res)
    .catch(() => ({ data: null }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userEmail={user.email || ''}
        companyName={isAdmin ? '관리자' : (profile?.company_name || undefined)}
        isAdmin={isAdmin}
      />
      <main>{children}</main>
    </div>
  )
}
