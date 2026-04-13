import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { Calendar, MessageSquare, PawPrint, Star, ChevronRight, AlertCircle, Settings, User, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'ダッシュボード',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending: { label: '確認待ち', class: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確定', class: 'bg-green-100 text-green-700' },
  completed: { label: '完了', class: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'キャンセル', class: 'bg-red-100 text-red-700' },
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: sitterProfile } = await supabase
    .from('sitter_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 予約一覧
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      owner:profiles!owner_id(display_name, avatar_url),
      sitter:sitter_profiles!sitter_id(
        user_id,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(5)

  // 未読メッセージ数
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
    .neq('sender_id', user.id)

  const isSitter = profile?.role === 'sitter' || profile?.role === 'both'

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={{ id: user.id, display_name: profile?.display_name, avatar_url: profile?.avatar_url }} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ウェルカムメッセージ */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            こんにちは、{profile?.display_name}さん 👋
          </h1>
          <p className="text-gray-500 mt-1">今日も素敵な1日を</p>
        </div>

        {/* シッターのStripe警告 */}
        {isSitter && sitterProfile && !sitterProfile.stripe_onboarding_complete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">支払い設定が未完了です</p>
              <p className="text-yellow-700 text-sm mt-1">
                予約を受け付けるためにStripeの設定を完了してください
              </p>
              <Link href="/profile/sitter" className="text-yellow-700 font-semibold text-sm underline mt-2 inline-block">
                設定を完了する →
              </Link>
            </div>
          </div>
        )}

        {/* ステータスカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: '予約',
              value: bookings?.length || 0,
              icon: Calendar,
              href: '/dashboard/bookings',
              color: 'text-primary-500 bg-primary-50',
            },
            {
              label: '未読メッセージ',
              value: unreadCount || 0,
              icon: MessageSquare,
              href: '/messages',
              color: unreadCount ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-warm-100',
            },
            ...(isSitter ? [
              {
                label: 'レビュー',
                value: sitterProfile?.review_count || 0,
                icon: Star,
                href: `/sitters/${user.id}`,
                color: 'text-yellow-500 bg-yellow-50',
              },
              {
                label: '評価',
                value: sitterProfile?.rating ? Number(sitterProfile.rating).toFixed(1) : '-',
                icon: PawPrint,
                href: `/sitters/${user.id}`,
                color: 'text-green-500 bg-green-50',
              },
            ] : []),
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="card p-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/sitters" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
              <PawPrint className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">シッターを探す</div>
              <div className="text-sm text-gray-500">近くのシッターを検索</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/dashboard/bookings" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">予約管理</div>
              <div className="text-sm text-gray-500">予約の確認・承認・キャンセル</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/messages" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">メッセージ</div>
              <div className="text-sm text-gray-500">
                {unreadCount ? `${unreadCount}件の未読` : 'シッターと連絡'}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/dashboard/profile" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">プロフィール編集</div>
              <div className="text-sm text-gray-500">名前・居住地・自己紹介を更新</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/dashboard/sitter-profile" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">シッタープロフィール</div>
              <div className="text-sm text-gray-500">サービス・料金・対応ペットを編集</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/dashboard/verification" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">本人確認・資格証明</div>
              <div className="text-sm text-gray-500">身分証明書・資格の証明書を提出</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>
        </div>

        {/* 最近の予約 */}
        {bookings && bookings.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">最近の予約</h2>
              <Link href="/dashboard/bookings" className="text-sm text-primary-600 hover:underline">すべて見る</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {bookings.map((booking: any) => {
                const isMine = booking.owner_id === user.id
                const partner = isMine
                  ? booking.sitter?.profile
                  : booking.owner
                const status = STATUS_LABELS[booking.status]

                return (
                  <div key={booking.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <span className="text-primary-700 font-bold text-sm">
                        {partner?.display_name?.[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {isMine ? `${partner?.display_name}のシッター` : `${booking.pet_name}の依頼`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.start_date), 'M月d日', { locale: ja })}
                        {booking.end_date !== booking.start_date && ` 〜 ${format(new Date(booking.end_date), 'M月d日', { locale: ja })}`}
                      </p>
                    </div>
                    <span className={`badge ${status.class} text-xs shrink-0`}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
