'use client'

import { useState } from 'react'
import { signupAction } from './actions'
import { Eye, EyeOff, Loader2, PawPrint, Home } from 'lucide-react'
import SocialAuthButtons from '@/components/ui/SocialAuthButtons'

interface SignupFormProps {
  errorMsg?: string
}

export default function SignupForm({ errorMsg }: SignupFormProps) {
  const [role, setRole] = useState<'owner' | 'sitter'>('owner')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [pending, setPending] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    if (password.length < 8) {
      setClientError('パスワードは8文字以上で設定してください')
      return
    }
    if (!agreedToTerms) {
      setClientError('利用規約とプライバシーポリシーへの同意が必要です')
      return
    }

    setClientError(null)
    setPending(true)
    const formData = new FormData(form)
    formData.set('role', role)
    await signupAction(formData)
    setPending(false)
  }

  const displayError = clientError || errorMsg

  return (
    <div className="space-y-5">
      {/* ソーシャルログイン */}
      <SocialAuthButtons />

      {/* 区切り線 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">またはメールで登録</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 役割選択 */}
      <div>
        <label className="label">どちらとして登録しますか？</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              role === 'owner'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Home className="w-6 h-6 mx-auto mb-1" />
            <div className="font-semibold text-sm">飼い主</div>
            <div className="text-xs text-gray-500 mt-0.5">ペットを預けたい</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('sitter')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              role === 'sitter'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <PawPrint className="w-6 h-6 mx-auto mb-1" />
            <div className="font-semibold text-sm">シッター</div>
            <div className="text-xs text-gray-500 mt-0.5">ペットを預かりたい</div>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="label">ニックネーム</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          className="input"
          placeholder="例：田中 花子"
          required
        />
      </div>

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
        <label htmlFor="password" className="label">パスワード</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="input pr-12"
            placeholder="8文字以上"
            required
            minLength={8}
            autoComplete="new-password"
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

      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {displayError}
        </div>
      )}

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary-500 shrink-0"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          <a href="/terms" className="text-primary-600 hover:underline">利用規約</a>
          および
          <a href="/privacy" className="text-primary-600 hover:underline">プライバシーポリシー</a>
          を読み、内容に同意します。アズカルはマッチングプラットフォームであり、シッターは独立した個人事業主です。
        </span>
      </label>

      <button
        type="submit"
        disabled={pending || !agreedToTerms}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            登録中...
          </>
        ) : (
          '無料で登録する'
        )}
      </button>
    </form>
    </div>
  )
}
