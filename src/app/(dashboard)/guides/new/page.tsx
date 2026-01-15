'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createGuide } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CalendarIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewGuidePage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateInput, setBirthDateInput] = useState('')
  const [birthDateError, setBirthDateError] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function handleBirthDateInputChange(value: string) {
    setBirthDateError(null)
    setBirthDateInput(value)

    // 숫자만 추출
    const numbers = value.replace(/\D/g, '')

    // 8자리 숫자인 경우 자동 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
    if (numbers.length === 8) {
      const year = numbers.substring(0, 4)
      const month = numbers.substring(4, 6)
      const day = numbers.substring(6, 8)

      // 날짜 유효성 검증
      const date = new Date(`${year}-${month}-${day}`)
      if (isNaN(date.getTime())) {
        setBirthDateError('올바른 날짜 형식이 아닙니다')
        return
      }

      // 년도 범위 검증 (1900 ~ 현재)
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      if (yearNum < 1900 || yearNum > currentYear) {
        setBirthDateError(`년도는 1900년부터 ${currentYear}년 사이여야 합니다`)
        return
      }

      // 월 범위 검증
      const monthNum = parseInt(month)
      if (monthNum < 1 || monthNum > 12) {
        setBirthDateError('월은 01부터 12 사이여야 합니다')
        return
      }

      // 일 범위 검증
      const dayNum = parseInt(day)
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
      if (dayNum < 1 || dayNum > daysInMonth) {
        setBirthDateError(`일은 01부터 ${daysInMonth} 사이여야 합니다`)
        return
      }

      // 성공 - Date 객체와 포맷팅된 문자열 저장
      const formattedDate = `${year}-${month}-${day}`
      setBirthDate(date)
      setBirthDateInput(formattedDate)
    }
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (date) {
      setBirthDate(date)
      setBirthDateInput(format(date, 'yyyy-MM-dd'))
      setBirthDateError(null)
      setCalendarOpen(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError('파일 크기는 5MB 이하여야 합니다')
      e.target.value = '' // input 초기화
      return
    }

    // MIME 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('JPG, PNG, WEBP 형식의 이미지만 업로드 가능합니다')
      e.target.value = '' // input 초기화
      return
    }

    setError(null)
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`


      const { data, error: uploadError } = await supabase.storage
        .from('guide-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        setError(`업로드 실패: ${uploadError.message}`)
        return null
      }


      // Private bucket이므로 파일 경로만 반환 (signed URL은 조회 시 생성)
      return fileName
    } catch (error) {
      setError(`업로드 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return null
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // 생년월일 에러 체크
    if (birthDateError) {
      setError('생년월일 형식을 확인해주세요')
      return
    }

    setLoading(true)
    setUploading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // 프로필 사진 업로드
    if (photoFile) {
      const photoUrl = await uploadPhoto(photoFile)
      if (photoUrl) {
        formData.append('photo_url', photoUrl)
      } else {
        setError('프로필 사진 업로드에 실패했습니다')
        setLoading(false)
        setUploading(false)
        return
      }
    }

    // 생년월일 추가 (YYYY-MM-DD 형식)
    if (birthDateInput) {
      formData.append('birth_date', birthDateInput)
    }

    const result = await createGuide(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/guides" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          가이드 목록으로
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">가이드 등록</CardTitle>
            <CardDescription>
              새로운 가이드 또는 인솔자를 등록합니다
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">기본 정보</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      구분 <span className="text-red-500">*</span>
                    </Label>
                    <Select id="type" name="type" required disabled={loading}>
                      <option value="">선택하세요</option>
                      <option value="guide">가이드</option>
                      <option value="tour_conductor">인솔자</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name_ko">
                      한글명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name_ko"
                      name="name_ko"
                      placeholder="홍길동"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name_en_last">
                      영문성 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name_en_last"
                      name="name_en_last"
                      placeholder="HONG"
                      required
                      disabled={loading}
                      className="uppercase"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase()
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name_en_first">
                      영문명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name_en_first"
                      name="name_en_first"
                      placeholder="GILDONG"
                      required
                      disabled={loading}
                      className="uppercase"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase()
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select id="gender" name="gender" disabled={loading}>
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">생년월일</Label>
                    <div className="flex gap-2">
                      <Input
                        id="birth_date"
                        name="birth_date"
                        placeholder="19910801 또는 1991-08-01"
                        value={birthDateInput}
                        onChange={(e) => handleBirthDateInputChange(e.target.value)}
                        disabled={loading}
                        className={cn("flex-1", birthDateError && 'border-red-500')}
                      />
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={loading}
                            className="px-3"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={birthDate}
                            captionLayout="dropdown"
                            onSelect={handleCalendarSelect}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            locale={ko}
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {birthDateError ? (
                      <p className="text-xs text-red-500">{birthDateError}</p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        직접 입력 (예: 19910801) 또는 캘린더 아이콘 클릭
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">프로필 사진</Label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="프로필 미리보기"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={loading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="photo"
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50",
                          loading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">사진 선택</span>
                        <input
                          id="photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          disabled={loading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP 형식, 최대 5MB
                  </p>
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">연락처 정보</h3>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="messenger_type">메신저 유형</Label>
                    <Select id="messenger_type" name="messenger_type" disabled={loading}>
                      <option value="">선택하세요</option>
                      <option value="kakao">카카오톡</option>
                      <option value="line">라인</option>
                      <option value="whatsapp">와츠앱</option>
                      <option value="telegram">텔레그램</option>
                      <option value="wechat">위챗</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messenger_id">메신저 ID</Label>
                    <Input
                      id="messenger_id"
                      name="messenger_id"
                      placeholder="메신저 ID"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-6">
                <Link href="/guides" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
    </div>
  )
}
