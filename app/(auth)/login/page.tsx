import { Metadata } from 'next'
import LoginForm from './LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ログイン',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; redirectTo?: string; error?: string; message?: string }
}) {
  const redirectTo = searchParams.redirect || searchParams.redirectTo || '/dashboard'
  const errorMsg = searchParams.error === 'invalid_credentials'
    ? 'メールアドレスまたはパスワードが正しくありません'
    : undefined

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-14 h-14" />
            <span className="text-2xl font-bold text-gray-900">アズカル</span>
          </Link>
          <p className="text-gray-500 mt-2">おかえりなさい</p>
        </div>

        {/* フォームカード */}
        <div className="card p-8">
          {searchParams.message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
              {searchParams.message}
            </div>
          )}
          <LoginForm redirectTo={redirectTo} errorMsg={errorMsg} />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
            無料登録
          </Link>
        </p>
      </div>
    </div>
  )
}
