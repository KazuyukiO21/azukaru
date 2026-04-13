import { Metadata } from 'next'
import SignupForm from './SignupForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '新規登録',
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMsg = searchParams.error === 'already_registered'
    ? 'このメールアドレスは既に登録されています'
    : searchParams.error === 'signup_failed'
    ? '登録に失敗しました。もう一度お試しください'
    : undefined

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-14 h-14" />
            <span className="text-2xl font-bold text-gray-900">アズカル</span>
          </Link>
          <p className="text-gray-500 mt-2">無料で始めましょう</p>
        </div>

        <div className="card p-8">
          <SignupForm errorMsg={errorMsg} />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
