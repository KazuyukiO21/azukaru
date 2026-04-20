'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  '利用方法について',
  'シッターへの連絡・トラブル',
  '予約・決済について',
  'アカウント・ログインについて',
  'プライバシー・個人情報について',
  'サービス改善のご提案',
  'その他',
]

export default function ContactForm() {
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      setError('お問い合わせの種類を選択してください')
      return
    }
    setLoading(true)
    setError(null)

    // Simulate async submission (replace with actual API call when ready)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">送信が完了しました</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
          お問い合わせありがとうございます。<br />
          通常2〜3営業日以内に、ご登録のメールアドレスへご返信いたします。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">お問い合わせの種類 <span className="text-red-500">*</span></label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
          required
        >
          <option value="">選択してください</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">お名前 <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="例：田中 花子"
          required
        />
      </div>

      <div>
        <label className="label">メールアドレス <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="example@email.com"
          required
        />
      </div>

      <div>
        <label className="label">お問い合わせ内容 <span className="text-red-500">*</span></label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input min-h-[140px] resize-y"
          placeholder="ご質問・ご要望をできるだけ詳しくご記入ください"
          required
          minLength={10}
        />
        <p className="text-xs text-gray-400 mt-1">{message.length} 文字</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            送信中...
          </>
        ) : (
          '送信する'
        )}
      </button>
    </form>
  )
}
