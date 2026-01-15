'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Building2 } from 'lucide-react'

type Profile = {
  email: string
  company_name: string | null
  business_number: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        setError('프로필을 불러올 수 없습니다')
        setLoading(false)
        return
      }

      setProfile({
        email: user.email || '',
        company_name: data.company_name,
        business_number: data.business_number,
      })
      setLoading(false)
    }

    fetchProfile()
  }, [])

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
      setSaving(false)
    } else {
      setSuccess(true)
      setSaving(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-center text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">프로필을 불러올 수 없습니다</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">내 프로필</h1>
        <p className="mt-2 text-gray-600">
          계정 정보 및 여행사 정보를 확인하고 수정할 수 있습니다
        </p>
      </div>

      <div className="space-y-6">
        {/* 계정 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>계정 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                이메일은 변경할 수 없습니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 여행사 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>여행사 정보</span>
            </CardTitle>
            <CardDescription>
              여행사 정보를 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  프로필이 성공적으로 업데이트되었습니다
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="company_name">
                  여행사명 (랜드사) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={profile.company_name || ''}
                  required
                  disabled={saving}
                  placeholder="여행사명을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_number">
                  사업자 번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business_number"
                  name="business_number"
                  defaultValue={profile.business_number || ''}
                  required
                  disabled={saving}
                  placeholder="123-45-67890"
                />
                <p className="text-xs text-gray-500">
                  하이픈(-)을 포함하여 입력해주세요
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
