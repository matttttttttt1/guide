'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { signup, checkEmailExists } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)

  // 이메일 중복 체크 (debounce)
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    const timer = setTimeout(async () => {
      setEmailChecking(true)
      try {
        const result = await checkEmailExists(email)
        if (!result.error) {
          setEmailExists(result.exists)
        }
      } catch (err) {
      } finally {
        setEmailChecking(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [email])

  function validatePassword(password: string, confirmPassword: string) {
    if (password.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다')
      return false
    }
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다')
      return false
    }
    setPasswordError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPasswordError(null)

    // 이메일 중복 체크
    if (emailExists) {
      setError('이미 가입된 이메일입니다')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!validatePassword(password, confirmPassword)) {
      setLoading(false)
      return
    }

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            가이드 관리 시스템에 가입하세요
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {passwordError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {passwordError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={`pr-10 ${emailExists === true ? 'border-red-500' : emailExists === false ? 'border-green-500' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailChecking && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {!emailChecking && emailExists === true && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {!emailChecking && emailExists === false && email.includes('@') && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              {emailExists === true && (
                <p className="text-xs text-red-500">이미 가입된 이메일입니다</p>
              )}
              {emailExists === false && email.includes('@') && (
                <p className="text-xs text-green-600">사용 가능한 이메일입니다</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">최소 6자 이상</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || emailExists === true || emailChecking}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
