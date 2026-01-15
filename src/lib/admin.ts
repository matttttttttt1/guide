import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 이메일로 직접 체크 (정확히 admin@gctour.com만)
  if (user.email !== 'admin@gctour.com') {
    redirect('/guides')
  }

  return { user }
}

export async function isAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // 이메일로 직접 체크 (정확히 admin@gctour.com만)
  return user.email === 'admin@gctour.com'
}
