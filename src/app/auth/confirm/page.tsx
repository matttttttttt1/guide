'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // URL에서 에러 체크
        const queryParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const errorCode = queryParams.get('error_code') || hashParams.get('error_code')
        const errorDesc = queryParams.get('error_description') || hashParams.get('error_description')

        if (errorCode === 'otp_expired') {
          setStatus('error')
          setMessage('이메일 인증 링크가 만료되었습니다. 새로운 인증 이메일을 요청해주세요.')
          return
        }

        if (errorCode) {
          setStatus('error')
          setMessage(errorDesc ? decodeURIComponent(errorDesc) : '이메일 인증에 실패했습니다.')
          return
        }

        const supabase = createClient()

        // Implicit flow: hash에서 토큰 확인
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && type === 'signup') {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            setStatus('error')
            setMessage('이메일 인증에 실패했습니다.')
            return
          }

          setStatus('success')
          setMessage('이메일 인증이 완료되었습니다!')

          // URL 정리
          window.history.replaceState({}, '', '/auth/confirm')

          // 2초 후 프로필 완성 페이지로 이동
          setTimeout(() => {
            router.push('/profile/complete')
          }, 2000)
          return
        }

        // 토큰이 없으면 에러
        setStatus('error')
        setMessage('유효하지 않은 인증 링크입니다.')
      } catch (error) {
        setStatus('error')
        setMessage('이메일 인증 처리 중 오류가 발생했습니다.')
      }
    }

    confirmEmail()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && '이메일 인증 중...'}
            {status === 'success' && '인증 완료'}
            {status === 'error' && '인증 실패'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              <p className="mb-2">
                이메일 인증이 성공적으로 완료되었습니다.
              </p>
              <p className="text-xs">
                잠시 후 프로필 완성 페이지로 이동합니다...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                <p className="mb-2">
                  {message}
                </p>
                <p className="text-xs">
                  회원가입을 다시 시도하거나 고객센터에 문의해주세요.
                </p>
              </div>

              <div className="flex gap-2">
                <Link href="/auth/signup" className="flex-1">
                  <Button variant="outline" className="w-full">
                    회원가입 다시 하기
                  </Button>
                </Link>
                <Link href="/auth/login" className="flex-1">
                  <Button className="w-full">
                    로그인하기
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p>이메일 인증을 처리하고 있습니다. 잠시만 기다려주세요...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
