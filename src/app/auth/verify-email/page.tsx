'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resendVerificationEmail } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const result = await resendVerificationEmail()
      if (result.error) {
        setError(result.error)
      } else {
        setMessage('인증 이메일을 다시 발송했습니다. 이메일을 확인해주세요.')
      }
    } catch (err) {
      setError('이메일 발송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">이메일을 확인해주세요</CardTitle>
          <CardDescription>
            회원가입을 완료하려면 이메일 인증이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <p className="mb-2">
              가입하신 이메일 주소로 인증 링크를 발송했습니다.
            </p>
            <p className="text-xs">
              이메일을 확인하고 인증 링크를 클릭해주세요. 스팸 메일함도 확인해주세요.
            </p>
          </div>

          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-center text-sm text-gray-600">
              이메일을 받지 못하셨나요?
            </p>
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? '발송 중...' : '인증 이메일 재발송'}
            </Button>
          </div>

          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
