import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'

export default async function CompanyGuidesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 관리자 권한 체크
  await checkAdminAccess()

  // 관리자 전용 클라이언트 사용 (RLS 바이패스)
  const supabase = createAdminClient()

  // Next.js 15에서 params는 Promise입니다
  const { id } = await params

  // 랜드사 정보 조회
  const { data: company } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!company) {
    redirect('/admin')
  }

  // 해당 랜드사의 가이드 목록 조회
  const { data: guides } = await supabase
    .from('guides')
    .select('*')
    .eq('user_id', id)
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
          console.error('Error creating signed URL:', error)
          return guide
        }
      }
      return guide
    })
  ) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        관리자 대시보드로
      </Link>

      {/* 랜드사 정보 */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{company.company_name || '회사명 없음'}</h1>
              <Badge variant="outline">랜드사</Badge>
            </div>
            <p className="text-gray-600 mt-1">
              사업자번호: {company.business_number || '-'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">총 가이드/인솔자</div>
            <div className="text-3xl font-bold text-primary">
              {guidesWithSignedUrls?.length || 0}명
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 가이드 목록 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">가이드 및 인솔자 목록</h2>
            <p className="text-sm text-gray-600 mt-1">
              이 랜드사에 소속된 모든 가이드와 인솔자입니다
            </p>
          </div>
        </div>

        {!guidesWithSignedUrls || guidesWithSignedUrls.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-500">등록된 가이드가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guidesWithSignedUrls.map((guide) => (
              <Card key={guide.id} className="hover:shadow-lg transition-shadow">
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
