import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, PawPrint, Calendar, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export const metadata: Metadata = { title: '概要' }

export default async function AdminPage() {
  await requireAdmin()
  const db = createAdminClient()

  // ─── 集計クエリ（並列実行）────────────────────────────────
  const [
    { count: totalUsers },
    { count: totalSitters },
    { count: totalBookings },
    { count: pendingBookings },
    { data: revenueData },
    { data: recentBookings },
    { data: recentUsers },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('sitter_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('bookings').select('*', { count: 'exact', head: true }),
    db.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('bookings').select('platform_fee').eq('payment_status', 'paid'),
    db.from('bookings')
      .select(`*, owner:profiles!owner_id(display_name), sitter:sitter_profiles!sitter_id(profile:profiles!user_id(display_name))`)
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('profiles')
      .select('display_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueData ?? []).reduce((sum, b) => sum + (b.platform_fee ?? 0), 0)

  const STATUS: Record<string, { label: string; cls: string }> = {
    pending:   { label: '確認待ち', cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: '確定',     cls: 'bg-green-100  text-green-700'  },
    completed: { label: '完了',     cls: 'bg-blue-100   text-blue-700'   },
    cancelled: { label: 'キャンセル', cls: 'bg-red-100  text-red-600'    },
  }

  const stats = [
    { label: '総ユーザー数',      value: totalUsers ?? 0,    icon: Users,       color: 'bg-blue-50   text-blue-500'   },
    { label: '公開中シッター',    value: totalSitters ?? 0,  icon: PawPrint,    color: 'bg-green-50  text-green-500'  },
    { label: '総予約数',          value: totalBookings ?? 0, icon: Calendar,    color: 'bg-purple-50 text-purple-500' },
    { label: '累計プラットフォーム収益', value: `¥${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-50 text-orange-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">概要ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'yyyy年M月d日(E)', { locale: ja })} 時点</p>
      </div>

      {/* 確認待ちアラート */}
      {(pendingBookings ?? 0) > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5 mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
          <p className="text-yellow-800 text-sm font-medium">
            承認待ちの予約が <strong>{pendingBookings}件</strong> あります
          </p>
          <a href="/admin/bookings" className="ml-auto text-sm text-yellow-700 underline">確認する →</a>
        </div>
      )}

      {/* KPIカード */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 最近の予約 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">最近の予約</h2>
            <a href="/admin/bookings" className="text-xs text-primary-600 hover:underline">すべて見る</a>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentBookings ?? []).map((b: any) => {
              const st = STATUS[b.status] ?? STATUS.pending
              return (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {b.owner?.display_name} → {b.sitter?.profile?.display_name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(b.created_at), 'M/d HH:mm')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    <p className="text-xs text-gray-500 mt-1">¥{b.total_amount?.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
            {(!recentBookings || recentBookings.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-8">予約はまだありません</p>
            )}
          </div>
        </div>

        {/* 最近の登録ユーザー */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">最近の登録</h2>
            <a href="/admin/users" className="text-xs text-primary-600 hover:underline">すべて見る</a>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentUsers ?? []).map((u: any) => (
              <div key={u.created_at + u.display_name} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {u.display_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{u.display_name}</p>
                  <p className="text-xs text-gray-400">{format(new Date(u.created_at), 'M/d HH:mm')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'sitter' ? 'bg-green-50 text-green-700' :
                  u.role === 'both'   ? 'bg-purple-50 text-purple-700' :
                                        'bg-gray-100 text-gray-500'
                }`}>
                  {u.role === 'sitter' ? 'シッター' : u.role === 'both' ? '両方' : '飼い主'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
