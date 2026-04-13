'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import SocialAuthButtons from '@/components/ui/SocialAuthButtons'

interface LoginFormProps {
  redirectTo?: string
  errorMsg?: string
}

export default function LoginForm({ redirectTo, errorMsg }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    await loginAction(formData)
    setPending(false)
  }

  return (
    <div className="space-y-5">
      {/* ソーシャルログイン */}
      <SocialAuthButtons />

      {/* 区切り線 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">またはメールでログイン</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo || '/dashboard'} />

      <div>
        <label htmlFor="email" className="label">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="example@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="label mb-0">パスワード</label>
          <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
            パスワードを忘れた方
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="input pr-12"
            placeholder="パスワードを入力"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            ログイン中...
          </>
        ) : (
          'ログイン'
        )}
      </button>
    </form>
    </div>
  )
}
