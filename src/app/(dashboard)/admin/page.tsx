import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  // 관리자 권한 체크
  await checkAdminAccess()

  // 관리자 전용 클라이언트 사용 (RLS 바이패스)
  const supabase = createAdminClient()

  // 모든 랜드사(일반 사용자) 조회 - admin 계정 제외
  const { data: companies } = await supabase
    .from('profiles')
    .select('*')
    .or('role.is.null,role.neq.admin')
    .order('created_at', { ascending: false })

  // 각 랜드사별 가이드 수 조회
  const companiesWithGuideCount = companies && companies.length > 0 ? await Promise.all(
    companies.map(async (company) => {
      const { count } = await supabase
        .from('guides')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', company.id)

      return {
        ...company,
        guideCount: count || 0
      }
    })
  ) : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <Badge variant="default" className="bg-red-600">
            관리자
          </Badge>
        </div>
        <p className="mt-2 text-gray-600">
          등록된 모든 랜드사와 가이드를 관리합니다
        </p>
      </div>

      {/* 통계 요약 */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 랜드사 수
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companiesWithGuideCount.length}개</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 가이드 수
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companiesWithGuideCount.reduce((sum, c) => sum + c.guideCount, 0)}명
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              평균 가이드 수
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companiesWithGuideCount.length > 0
                ? Math.round(companiesWithGuideCount.reduce((sum, c) => sum + c.guideCount, 0) / companiesWithGuideCount.length)
                : 0}명
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 랜드사 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 랜드사 목록</CardTitle>
          <CardDescription>
            각 랜드사를 클릭하면 소속 가이드 목록을 볼 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!companiesWithGuideCount || companiesWithGuideCount.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 랜드사가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {companiesWithGuideCount.map((company) => (
                <Link
                  key={company.id}
                  href={`/admin/companies/${company.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {company.company_name || '회사명 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            사업자번호: {company.business_number || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">가이드/인솔자</div>
                          <div className="text-2xl font-bold text-primary">
                            {company.guideCount}명
                          </div>
                        </div>
                        <div className="text-gray-400">
                          →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
