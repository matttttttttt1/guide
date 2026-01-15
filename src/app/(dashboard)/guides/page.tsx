import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload } from 'lucide-react'

export default async function GuidesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const isAdmin = user.email === 'admin@gctour.com'

  // 일반 사용자는 프로필 완성 확인
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, business_number')
      .eq('id', user.id)
      .single()

    // 프로필이 완성되지 않았으면 완성 페이지로 리다이렉트
    if (!profile?.company_name || !profile?.business_number) {
      redirect('/profile/complete')
    }
  }

  // 가이드 목록 조회
  const { data: guides } = await supabase
    .from('guides')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Private storage를 위한 signed URL 생성 (24시간 유효)
  const guidesWithSignedUrls = guides ? await Promise.all(
    guides.map(async (guide) => {
      if (guide.photo_url) {
        try {
          // photo_url에서 파일명 추출
          const fileName = guide.photo_url.split('/').pop()
          const { data } = await supabase.storage
            .from('guide-photos')
            .createSignedUrl(fileName, 60 * 60 * 24) // 24시간

          return {
            ...guide,
            photo_url: data?.signedUrl || guide.photo_url
          }
        } catch (error) {
          return guide
        }
      }
      return guide
    })
  ) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">가이드/인솔자 관리</h1>
              {guidesWithSignedUrls && guidesWithSignedUrls.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  총 {guidesWithSignedUrls.length}명
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              가이드 및 인솔자를 관리합니다
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/guides/bulk-upload">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                일괄 등록
              </Button>
            </Link>
            <Link href="/guides/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                가이드 등록
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {!guidesWithSignedUrls || guidesWithSignedUrls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 mb-4">등록된 가이드가 없습니다</p>
                <Link href="/guides/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    첫 가이드 등록하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guidesWithSignedUrls.map((guide) => (
                <Link key={guide.id} href={`/guides/${guide.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {guide.photo_url ? (
                          <img
                            src={guide.photo_url}
                            alt={guide.name_ko || '프로필'}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xl">
                              {guide.name_ko?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                {guide.name_ko || '이름 없음'}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {guide.name_en_first} {guide.name_en_last}
                              </CardDescription>
                            </div>
                            <Badge variant={guide.is_active ? 'default' : 'secondary'}>
                              {guide.is_active ? '활성' : '비활성'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {guide.type && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">구분:</span>
                            <span>
                              {guide.type === 'guide' ? '가이드' : '인솔자'}
                            </span>
                          </div>
                        )}
                        {guide.email && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">이메일:</span>
                            <span className="truncate">{guide.email}</span>
                          </div>
                        )}
                        {guide.messenger_type && guide.messenger_id && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">메신저:</span>
                            <span className="truncate">
                              {guide.messenger_type}: {guide.messenger_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
