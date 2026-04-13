import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: '予約・売上管理' }

const STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: '確認待ち', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確定',     cls: 'bg-green-100  text-green-700'  },
  completed: { label: '完了',     cls: 'bg-blue-100   text-blue-700'   },
  cancelled: { label: 'キャンセル', cls: 'bg-red-100  text-red-600'    },
}

const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: '未払い', cls: 'bg-gray-100 text-gray-500'   },
  paid:     { label: '支払済', cls: 'bg-green-50 text-green-700'  },
  refunded: { label: '返金済', cls: 'bg-blue-50  text-blue-700'   },
  failed:   { label: '失敗',   cls: 'bg-red-50   text-red-600'    },
}

const SERVICE_LABEL: Record<string, string> = {
  boarding: '宿泊', daycare: '日中預かり', walking: '散歩', drop_in: '訪問', grooming: 'トリミング',
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  await requireAdmin()
  const db = createAdminClient()

  let query = db
    .from('bookings')
    .select(`
      *,
      owner:profiles!owner_id(display_name),
      sitter:sitter_profiles!sitter_id(profile:profiles!user_id(display_name))
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: bookings } = await query

  // 売上集計
  const { data: allBookings } = await db
    .from('bookings')
    .select('total_amount, platform_fee, payment_status, status')

  const totalGMV = (allBookings ?? []).filter((b) => b.payment_status === 'paid')
    .reduce((s, b) => s + b.total_amount, 0)
  const totalRevenue = (allBookings ?? []).filter((b) => b.payment_status === 'paid')
    .reduce((s, b) => s + b.platform_fee, 0)
  const pendingCount = (allBookings ?? []).filter((b) => b.status === 'pending').length
  const completedCount = (allBookings ?? []).filter((b) => b.status === 'completed').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">予約・売上管理</h1>
        <p className="text-gray-500 text-sm mt-1">全予約の一覧と売上集計</p>
      </div>

      {/* 売上サマリー */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: '総GMV（決済額合計）', value: `¥${totalGMV.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
          { label: 'プラットフォーム収益', value: `¥${totalRevenue.toLocaleString()}`, color: 'bg-primary-50 text-primary-600' },
          { label: '承認待ち', value: `${pendingCount}件`, color: 'bg-yellow-50 text-yellow-600' },
          { label: '完了済み', value: `${completedCount}件`, color: 'bg-blue-50 text-blue-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`text-2xl font-bold ${item.color.split(' ')[1]}`}>{item.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-5">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <a
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (searchParams.status ?? 'all') === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s === 'all' ? 'すべて' : STATUS[s]?.label ?? s}
          </a>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['飼い主 → シッター', 'サービス', '日程', '金額', 'ステータス', '支払い', '登録日'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(bookings ?? []).map((b: any) => {
              const st = STATUS[b.status] ?? STATUS.pending
              const ps = PAY_STATUS[b.payment_status] ?? PAY_STATUS.pending
              return (
                <tr key={b.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-gray-800">
                      {b.owner?.display_name} <span className="text-gray-400">→</span> {b.sitter?.profile?.display_name}
                    </p>
                    <p className="text-xs text-gray-400">{b.pet_name}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">
                    {SERVICE_LABEL[b.service_type] ?? b.service_type}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(b.start_date), 'M/d', { locale: ja })}
                    {b.end_date !== b.start_date && ` 〜 ${format(new Date(b.end_date), 'M/d', { locale: ja })}`}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="font-semibold text-gray-900">¥{b.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">手数料 ¥{b.platform_fee?.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${ps.cls}`}>
                      {ps.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(b.created_at), 'M/d HH:mm', { locale: ja })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!bookings || bookings.length === 0) && (
          <p className="text-center text-gray-400 py-12">予約がありません</p>
        )}
      </div>
    </div>
  )
}
