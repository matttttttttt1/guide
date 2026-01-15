'use client'

import { useState } from 'react'
import { completeProfile } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 사업자등록번호 형식 자동 적용 (XXX-XX-XXXXX)
function formatBusinessNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '')

  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }
}

// 사업자등록번호 유효성 검사 (체크섬 알고리즘)
function validateBusinessNumber(value: string): boolean {
  const numbers = value.replace(/[^\d]/g, '')

  // 10자리 숫자여야 함
  if (numbers.length !== 10) {
    return false
  }

  // 체크섬 계산
  const checksum = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * checksum[i]
  }

  // 8번째 자리(인덱스 8)에 5를 곱한 값을 10으로 나눈 몫을 더함
  sum += Math.floor((parseInt(numbers[8]) * 5) / 10)

  // 10으로 나눈 나머지를 10에서 뺀 값의 1의 자리
  const lastDigit = (10 - (sum % 10)) % 10

  return lastDigit === parseInt(numbers[9])
}

export function CompleteProfileForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [businessNumber, setBusinessNumber] = useState('')
  const [businessNumberError, setBusinessNumberError] = useState<string | null>(null)

  function handleBusinessNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatBusinessNumber(e.target.value)
    setBusinessNumber(formatted)

    // 10자리 입력되면 유효성 검사
    const numbers = formatted.replace(/[^\d]/g, '')
    if (numbers.length === 10) {
      if (!validateBusinessNumber(formatted)) {
        setBusinessNumberError('유효하지 않은 사업자등록번호입니다')
      } else {
        setBusinessNumberError(null)
      }
    } else if (numbers.length > 0) {
      setBusinessNumberError(null)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // 최종 validation
    const businessNumberValue = formData.get('business_number') as string
    if (!validateBusinessNumber(businessNumberValue)) {
      setError('유효하지 않은 사업자등록번호입니다')
      setLoading(false)
      return
    }

    const result = await completeProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">프로필 완성</CardTitle>
          <CardDescription>
            여행사 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company_name">
                여행사명 (랜드사) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="여행사명을 입력하세요"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_number">
                사업자 번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="business_number"
                name="business_number"
                type="text"
                placeholder="123-45-67890"
                value={businessNumber}
                onChange={handleBusinessNumberChange}
                required
                disabled={loading}
                className={businessNumberError ? 'border-red-500' : ''}
              />
              {businessNumberError ? (
                <p className="text-xs text-red-500">
                  {businessNumberError}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  사업자등록번호 10자리를 입력하세요 (자동으로 하이픈 추가됨)
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!businessNumberError || businessNumber.replace(/[^\d]/g, '').length !== 10}
            >
              {loading ? '저장 중...' : '저장하고 시작하기'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
