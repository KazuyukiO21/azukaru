import { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
}

export default async function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-400 mb-8">最終更新日：2026年4月10日</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <p>
                アズカル（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
                本プライバシーポリシーは、当サービスが収集する情報の種類、利用目的、および管理方法について説明します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第1条　収集する情報</h2>
              <p className="mb-3">当サービスは、以下の情報を収集します。</p>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">① ご登録時にご提供いただく情報</p>
                  <ul className="list-disc list-inside mt-1 ml-2 space-y-1 text-sm">
                    <li>氏名・ニックネーム</li>
                    <li>メールアドレス</li>
                    <li>パスワード（ハッシュ化して保存）</li>
                    <li>プロフィール写真（任意）</li>
                    <li>居住地（都道府県・市区町村）</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">② シッター登録時に追加でご提供いただく情報</p>
                  <ul className="list-disc list-inside mt-1 ml-2 space-y-1 text-sm">
                    <li>本人確認書類（登録審査のみに使用）</li>
                    <li>対応サービス・料金・スケジュール</li>
                    <li>銀行口座情報（Stripe Connect 経由で管理）</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">③ サービス利用を通じて収集する情報</p>
                  <ul className="list-disc list-inside mt-1 ml-2 space-y-1 text-sm">
                    <li>予約・メッセージの履歴</li>
                    <li>レビュー・評価内容</li>
                    <li>決済情報（カード情報はStripeが管理し、当サービスは保持しません）</li>
                    <li>アクセスログ・IPアドレス・ブラウザ情報</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第2条　情報の利用目的</h2>
              <p className="mb-2">収集した情報は、以下の目的にのみ使用します。</p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li>会員登録・ログイン認証の管理</li>
                <li>シッターと飼い主のマッチング機能の提供</li>
                <li>予約・決済処理の実行</li>
                <li>カスタマーサポートへの対応</li>
                <li>サービスの改善および新機能の開発</li>
                <li>利用規約違反の調査・対応</li>
                <li>法令に基づく対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第3条　第三者への提供</h2>
              <p className="mb-3">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li>ユーザーご本人の同意がある場合</li>
                <li>法令に基づく開示が必要な場合</li>
                <li>人の生命・身体・財産の保護のために必要な場合</li>
              </ul>
              <p className="mt-3 text-sm">
                なお、決済処理には <strong>Stripe, Inc.</strong>、認証・データ管理には <strong>Supabase, Inc.</strong> のサービスを利用しており、
                これらのサービスに必要な範囲の情報が提供されます。各社のプライバシーポリシーもご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第4条　情報の保管・セキュリティ</h2>
              <p>
                当サービスは、収集した個人情報を適切なセキュリティ措置を講じて保管します。
                パスワードはハッシュ化して保存し、通信はSSL/TLSで暗号化されています。
                ただし、インターネット上での完全なセキュリティを保証することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第5条　Cookieの使用</h2>
              <p>
                当サービスは、セッション管理および利便性向上のためにCookieを使用します。
                ブラウザの設定によりCookieを無効にすることができますが、
                一部のサービス機能が利用できなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第6条　ユーザーの権利</h2>
              <p className="mb-2">ユーザーは以下の権利を有します。</p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li>ご自身の個人情報の開示・訂正・削除の請求</li>
                <li>個人情報の利用停止の請求</li>
                <li>アカウントの削除</li>
              </ul>
              <p className="mt-3 text-sm">
                これらのご要望は、<Link href="/contact" className="text-primary-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第7条　未成年者について</h2>
              <p>
                当サービスは18歳未満の方のご利用を想定しておりません。
                18歳未満の方が個人情報を提供した場合、当サービスはこれを削除します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第8条　ポリシーの変更</h2>
              <p>
                当サービスは、法令の変更やサービス内容の改善に伴い、本ポリシーを改定することがあります。
                重要な変更がある場合は、サービス内での通知またはメールでお知らせします。
                変更後も当サービスをご利用いただいた場合、変更後のポリシーに同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">第9条　お問い合わせ</h2>
              <p>
                本ポリシーに関するご質問・ご要望は、
                <Link href="/contact" className="text-primary-600 hover:underline ml-1">お問い合わせフォーム</Link>
                よりご連絡ください。
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-8 h-8" />
            <span className="font-bold text-gray-900">アズカル</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-700">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700 text-gray-900 font-medium">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-gray-700">お問い合わせ</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 アズカル. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
