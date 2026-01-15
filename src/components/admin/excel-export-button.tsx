'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import * as XLSX from 'xlsx'

interface Guide {
  id: string
  name: string
  phone: string
  email: string
  qualification_number: string | null
  company_name: string
  business_number: string
}

interface Company {
  id: string
  company_name: string
  business_number: string
  email: string
  guideCount: number
}

interface ExcelExportButtonProps {
  companies: Company[]
  guides: Guide[]
}

export function ExcelExportButton({ companies, guides }: ExcelExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)

    try {
      // 워크북 생성
      const wb = XLSX.utils.book_new()

      // Sheet 1: 전체 가이드 목록
      const guidesData = guides.map((guide, index) => ({
        '번호': index + 1,
        '랜드사명': guide.company_name || '-',
        '사업자번호': guide.business_number || '-',
        '가이드명': guide.name,
        '전화번호': guide.phone,
        '이메일': guide.email,
        '자격증번호': guide.qualification_number || '-'
      }))

      const ws1 = XLSX.utils.json_to_sheet(guidesData)

      // 컬럼 너비 설정
      ws1['!cols'] = [
        { wch: 8 },  // 번호
        { wch: 25 }, // 랜드사명
        { wch: 15 }, // 사업자번호
        { wch: 12 }, // 가이드명
        { wch: 15 }, // 전화번호
        { wch: 30 }, // 이메일
        { wch: 15 }  // 자격증번호
      ]

      XLSX.utils.book_append_sheet(wb, ws1, '전체 가이드 목록')

      // Sheet 2: 랜드사별 통계
      const statsData = companies.map((company, index) => ({
        '번호': index + 1,
        '랜드사명': company.company_name || '-',
        '사업자번호': company.business_number || '-',
        '이메일': company.email || '-',
        '가이드 수': company.guideCount + '명'
      }))

      const ws2 = XLSX.utils.json_to_sheet(statsData)

      // 컬럼 너비 설정
      ws2['!cols'] = [
        { wch: 8 },  // 번호
        { wch: 25 }, // 랜드사명
        { wch: 15 }, // 사업자번호
        { wch: 30 }, // 이메일
        { wch: 12 }  // 가이드 수
      ]

      XLSX.utils.book_append_sheet(wb, ws2, '랜드사별 통계')

      // Sheet 3: 전체 통계 요약
      const summaryData = [
        { '항목': '총 랜드사 수', '값': companies.length + '개' },
        { '항목': '총 가이드 수', '값': guides.length + '명' },
        { '항목': '평균 가이드 수', '값': companies.length > 0 ? Math.round(guides.length / companies.length) + '명' : '0명' }
      ]

      const ws3 = XLSX.utils.json_to_sheet(summaryData)

      // 컬럼 너비 설정
      ws3['!cols'] = [
        { wch: 20 }, // 항목
        { wch: 15 }  // 값
      ]

      XLSX.utils.book_append_sheet(wb, ws3, '전체 통계')

      // 파일명 생성 (현재 날짜 포함)
      const date = new Date()
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
      const fileName = `가이드_관리_${dateStr}.xlsx`

      // 파일 다운로드
      XLSX.writeFile(wb, fileName)

    } catch (error) {
      alert('엑셀 파일 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          전체 엑셀 다운로드
        </>
      )}
    </Button>
  )
}
