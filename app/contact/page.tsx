import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Clock, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'お問い合わせ',
}

export default async function ContactPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={profile ? { id: user!.id, display_name: profile.display_name, avatar_url: profile.avatar_url } : null} />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* ページタイトル */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">お問い合わせ</h1>
          <p className="text-gray-500">ご質問・ご要望はこちらからお気軽にどうぞ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左：サポート情報 */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">返信までの目安</p>
                  <p className="text-gray-500 text-sm mt-0.5">2〜3営業日以内</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">返信方法</p>
                  <p className="text-gray-500 text-sm mt-0.5">ご登録のメールアドレス宛にご返信します</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">シッターとのトラブル</p>
                  <p className="text-gray-500 text-sm mt-0.5">予約・取引に関するトラブルは優先対応いたします</p>
                </div>
              </div>
            </div>

            <div className="bg-warm-100 rounded-2xl p-5">
              <p className="text-sm text-warm-800 font-semibold mb-1">よくあるご質問</p>
              <p className="text-xs text-warm-700 leading-relaxed">
                多くのご質問は FAQ で解決できます。まずはこちらをご確認ください。
              </p>
              <Link href="/faq" className="inline-block mt-3 text-xs font-medium text-primary-600 hover:underline">
                FAQ を見る →
              </Link>
            </div>
          </div>

          {/* 右：フォーム */}
          <div className="lg:col-span-2">
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">お問い合わせフォーム</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-8 h-8" />
            <span className="font-bold text-gray-900">アズカル</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-700">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-gray-700 text-gray-900 font-medium">お問い合わせ</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 アズカル. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
