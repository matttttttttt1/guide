'use client'

import { useState } from 'react'
import Link from 'next/link'
import { read, utils, writeFile } from 'xlsx'
import { bulkCreateGuides } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

type GuideRow = {
  구분: string
  한글명: string
  영문성: string
  영문명: string
  성별?: string
  생년월일?: string
  이메일?: string
  메신저유형?: string
  메신저ID?: string
}

type ValidationError = {
  row: number
  field: string
  message: string
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<GuideRow[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // 샘플 엑셀 파일 다운로드
  function downloadSample() {
    // 안내 메시지와 샘플 데이터를 배열로 구성
    const data = [
      // 안내 메시지 행 (병합될 셀)
      {
        '구분': '※ 아래 샘플 데이터는 예시입니다. 실제 사용 시 이 행과 샘플 데이터를 모두 삭제하고 본인의 데이터를 입력하세요.',
        '한글명': '',
        '영문성': '',
        '영문명': '',
        '성별': '',
        '생년월일': '',
        '이메일': '',
        '메신저유형': '',
        '메신저ID': ''
      },
      // 빈 행
      {
        '구분': '',
        '한글명': '',
        '영문성': '',
        '영문명': '',
        '성별': '',
        '생년월일': '',
        '이메일': '',
        '메신저유형': '',
        '메신저ID': ''
      },
      // 샘플 데이터
      {
        '구분': 'guide',
        '한글명': '홍길동',
        '영문성': 'HONG',
        '영문명': 'GILDONG',
        '성별': 'male',
        '생년월일': '1990-01-01',
        '이메일': 'hong@example.com',
        '메신저유형': 'kakao',
        '메신저ID': 'hong123'
      },
      {
        '구분': 'tour_conductor',
        '한글명': '김영희',
        '영문성': 'KIM',
        '영문명': 'YOUNGHEE',
        '성별': 'female',
        '생년월일': '1992-05-15',
        '이메일': 'kim@example.com',
        '메신저유형': 'line',
        '메신저ID': 'kim_line'
      }
    ]

    const ws = utils.json_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, '가이드목록')

    // 컬럼 너비 설정
    ws['!cols'] = [
      { wch: 15 }, // 구분
      { wch: 12 }, // 한글명
      { wch: 12 }, // 영문성
      { wch: 12 }, // 영문명
      { wch: 10 }, // 성별
      { wch: 15 }, // 생년월일
      { wch: 25 }, // 이메일
      { wch: 12 }, // 메신저유형
      { wch: 15 }  // 메신저ID
    ]

    writeFile(wb, 'guide_sample.xlsx')
  }

  // 엑셀 파일 파싱 및 검증
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setParsedData([])
    setErrors([])
    setSuccess(false)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = utils.sheet_to_json<GuideRow>(worksheet)

        // 안내 메시지 행과 빈 행 필터링
        const filteredData = jsonData.filter(row => {
          // 안내 메시지 행 제거 (※로 시작)
          if (row['구분']?.toString().startsWith('※')) {
            return false
          }
          // 완전히 빈 행 제거
          const hasData = Object.values(row).some(value => value !== '' && value !== null && value !== undefined)
          return hasData
        })

        // Validation
        const validationErrors: ValidationError[] = []

        filteredData.forEach((row, index) => {
          const rowNumber = index + 2 // Excel row number (1-based + header)

          // 필수 필드 체크
          if (!row['구분']) {
            validationErrors.push({ row: rowNumber, field: '구분', message: '필수 항목입니다' })
          } else if (!['guide', 'tour_conductor'].includes(row['구분'])) {
            validationErrors.push({ row: rowNumber, field: '구분', message: 'guide 또는 tour_conductor만 가능합니다' })
          }

          if (!row['한글명']) {
            validationErrors.push({ row: rowNumber, field: '한글명', message: '필수 항목입니다' })
          }

          if (!row['영문성']) {
            validationErrors.push({ row: rowNumber, field: '영문성', message: '필수 항목입니다' })
          }

          if (!row['영문명']) {
            validationErrors.push({ row: rowNumber, field: '영문명', message: '필수 항목입니다' })
          }

          // 선택 필드 검증
          if (row['성별'] && !['male', 'female'].includes(row['성별'])) {
            validationErrors.push({ row: rowNumber, field: '성별', message: 'male 또는 female만 가능합니다' })
          }

          if (row['생년월일']) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(row['생년월일'])) {
              validationErrors.push({ row: rowNumber, field: '생년월일', message: 'YYYY-MM-DD 형식이어야 합니다' })
            }
          }

          if (row['이메일']) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(row['이메일'])) {
              validationErrors.push({ row: rowNumber, field: '이메일', message: '올바른 이메일 형식이 아닙니다' })
            }
          }

          if (row['메신저유형'] && !['kakao', 'line', 'whatsapp', 'telegram', 'wechat'].includes(row['메신저유형'])) {
            validationErrors.push({ row: rowNumber, field: '메신저유형', message: 'kakao, line, whatsapp, telegram, wechat 중 하나여야 합니다' })
          }
        })

        setErrors(validationErrors)
        if (validationErrors.length === 0) {
          setParsedData(filteredData)
        }
      } catch (error) {
        setErrors([{ row: 0, field: '파일', message: '엑셀 파일을 읽을 수 없습니다' }])
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  // 일괄 등록
  async function handleBulkUpload() {
    if (parsedData.length === 0) return

    setLoading(true)

    const guidesData = parsedData.map(row => ({
      type: row['구분'],
      name_ko: row['한글명'],
      name_en_last: row['영문성']?.toUpperCase() || '',
      name_en_first: row['영문명']?.toUpperCase() || '',
      gender: row['성별'] || null,
      birth_date: row['생년월일'] || null,
      email: row['이메일'] || null,
      messenger_type: row['메신저유형'] || null,
      messenger_id: row['메신저ID'] || null,
      photo_url: null
    }))

    const result = await bulkCreateGuides(guidesData)

    if (result?.error) {
      setErrors([{ row: 0, field: '등록', message: result.error }])
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // 3초 후 목록 페이지로 이동
      setTimeout(() => {
        window.location.href = '/guides'
      }, 3000)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/guides" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        가이드 목록으로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">가이드 일괄 등록</CardTitle>
          <CardDescription>
            엑셀 파일로 여러 가이드를 한 번에 등록할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 샘플 다운로드 */}
          <div className="space-y-2">
            <Label>1단계: 샘플 파일 다운로드</Label>
            <Button onClick={downloadSample} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              샘플 엑셀 파일 다운로드
            </Button>
            <div className="text-xs text-gray-600 space-y-1">
              <p>샘플 파일을 다운로드하여 형식을 확인하고 데이터를 입력하세요</p>
              <p className="text-amber-600 font-medium">
                ⚠️ 샘플 파일의 안내 문구와 예시 데이터는 반드시 삭제 후 사용하세요
              </p>
            </div>
          </div>

          {/* 파일 업로드 */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">2단계: 엑셀 파일 업로드</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              작성한 엑셀 파일을 업로드하세요 (.xlsx, .xls)
            </p>
          </div>

          {/* 에러 표시 */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">다음 오류를 수정해주세요:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>
                      {error.row > 0 ? `${error.row}행` : ''} {error.field}: {error.message}
                    </li>
                  ))}
                  {errors.length > 10 && (
                    <li className="text-gray-600">외 {errors.length - 10}개의 오류...</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 성공 메시지 */}
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {parsedData.length}명의 가이드가 성공적으로 등록되었습니다. 목록 페이지로 이동합니다...
              </AlertDescription>
            </Alert>
          )}

          {/* 미리보기 */}
          {parsedData.length > 0 && errors.length === 0 && !success && (
            <div className="space-y-4">
              <div>
                <Label>3단계: 데이터 확인</Label>
                <p className="text-sm text-gray-500 mt-1">
                  총 {parsedData.length}명의 가이드가 등록됩니다
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">구분</th>
                        <th className="px-4 py-2 text-left">한글명</th>
                        <th className="px-4 py-2 text-left">영문명</th>
                        <th className="px-4 py-2 text-left">성별</th>
                        <th className="px-4 py-2 text-left">생년월일</th>
                        <th className="px-4 py-2 text-left">이메일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {row['구분'] === 'guide' ? '가이드' : '인솔자'}
                          </td>
                          <td className="px-4 py-2">{row['한글명']}</td>
                          <td className="px-4 py-2">
                            {row['영문명']} {row['영문성']}
                          </td>
                          <td className="px-4 py-2">
                            {row['성별'] === 'male' ? '남성' : row['성별'] === 'female' ? '여성' : '-'}
                          </td>
                          <td className="px-4 py-2">{row['생년월일'] || '-'}</td>
                          <td className="px-4 py-2">{row['이메일'] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button
                onClick={handleBulkUpload}
                disabled={loading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {loading ? '등록 중...' : `${parsedData.length}명 일괄 등록`}
              </Button>
            </div>
          )}

          {/* 필드 설명 */}
          <div className="space-y-2 pt-4 border-t">
            <Label>엑셀 파일 형식 안내</Label>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>필수 필드:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>구분: guide (가이드) 또는 tour_conductor (인솔자)</li>
                <li>한글명: 한글 이름</li>
                <li>영문성: 영문 성 - <strong className="text-primary">대문자만 입력</strong> (예: HONG)</li>
                <li>영문명: 영문 이름 - <strong className="text-primary">대문자만 입력</strong> (예: GILDONG)</li>
              </ul>
              <p className="mt-2"><strong>선택 필드:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>성별: male (남성) 또는 female (여성)</li>
                <li>생년월일: <strong className="text-primary">YYYY-MM-DD 형식 필수</strong> (예: 1990-01-01)</li>
                <li>이메일: 유효한 이메일 주소</li>
                <li>메신저유형: kakao, line, whatsapp, telegram, wechat</li>
                <li>메신저ID: 메신저 아이디</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
