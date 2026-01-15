'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createGuide(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const guideData = {
    user_id: user.id,
    name_ko: formData.get('name_ko') as string,
    name_en_first: formData.get('name_en_first') as string,
    name_en_last: formData.get('name_en_last') as string,
    type: formData.get('type') as string || null,
    gender: formData.get('gender') as string || null,
    photo_url: formData.get('photo_url') as string || null,
    birth_date: formData.get('birth_date') as string || null,
    email: formData.get('email') as string || null,
    messenger_type: formData.get('messenger_type') as string || null,
    messenger_id: formData.get('messenger_id') as string || null,
  }

  const { error } = await supabase
    .from('guides')
    .insert(guideData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/guides')
  redirect('/guides')
}

export async function updateGuide(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const guideData = {
    name_ko: formData.get('name_ko') as string,
    name_en_first: formData.get('name_en_first') as string,
    name_en_last: formData.get('name_en_last') as string,
    type: formData.get('type') as string || null,
    gender: formData.get('gender') as string || null,
    photo_url: formData.get('photo_url') as string || null,
    birth_date: formData.get('birth_date') as string || null,
    email: formData.get('email') as string || null,
    messenger_type: formData.get('messenger_type') as string || null,
    messenger_id: formData.get('messenger_id') as string || null,
  }

  const { error } = await supabase
    .from('guides')
    .update(guideData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/guides')
  revalidatePath(`/guides/${id}`)
  redirect('/guides')
}

export async function deleteGuide(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { error } = await supabase
    .from('guides')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/guides')
  return { success: true }
}

export async function toggleGuideStatus(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { error } = await supabase
    .from('guides')
    .update({ is_active: !isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/guides')
  return { success: true }
}

export async function bulkCreateGuides(guidesData: Array<{
  type: string
  name_ko: string
  name_en_first: string
  name_en_last: string
  gender: string | null
  birth_date: string | null
  email: string | null
  messenger_type: string | null
  messenger_id: string | null
  photo_url: string | null
}>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // user_id 추가
  const guidesWithUserId = guidesData.map(guide => ({
    ...guide,
    user_id: user.id
  }))

  const { error } = await supabase
    .from('guides')
    .insert(guidesWithUserId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/guides')
  return { success: true }
}
