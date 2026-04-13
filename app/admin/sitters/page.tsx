import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Star } from 'lucide-react'
import SitterToggle from './SitterToggle'
import Link from 'next/link'

export const metadata: Metadata = { title: 'シッター管理' }

const SERVICE_LABEL: Record<string, string> = {
  boarding: '宿泊', daycare: '日中', walking: '散歩', drop_in: '訪問',
}

export default async function AdminSittersPage() {
  await requireAdmin()
  const db = createAdminClient()

  const { data: sitters } = await db
    .from('sitter_profiles')
    .select(`*, profile:profiles!user_id(display_name, avatar_url, prefecture, city, created_at)`)
    .order('created_at', { ascending: false })

  const active   = (sitters ?? []).filter((s: any) => s.is_active).length
  const inactive = (sitters ?? []).filter((s: any) => !s.is_active).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">シッター管理</h1>
        <p className="text-gray-500 text-sm mt-1">
          公開中 <strong className="text-green-600">{active}</strong> 件 ／ 非公開 <strong className="text-gray-500">{inactive}</strong> 件
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['シッター', '居住地', 'サービス', '評価', '公開状態', '登録日'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(sitters ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {s.profile?.avatar_url ? (
                      <img src={s.profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                        {s.profile?.display_name?.[0]}
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/sitters/${s.user_id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 hover:underline"
                        target="_blank"
                      >
                        {s.profile?.display_name}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {s.stripe_onboarding_complete ? '💳 Stripe済' : '⚠️ Stripe未設定'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  {s.profile?.prefecture}{s.profile?.city ? ` ${s.profile.city}` : ''}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(s.services ?? []).map((sv: string) => (
                      <span key={sv} className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded-full">
                        {SERVICE_LABEL[sv] ?? sv}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {s.review_count > 0 ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{Number(s.rating).toFixed(1)}</span>
                      <span className="text-gray-400 text-xs">({s.review_count})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">未評価</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <SitterToggle sitterId={s.user_id} isActive={s.is_active} />
                    <span className="text-xs text-gray-500">{s.is_active ? '公開中' : '非公開'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {format(new Date(s.created_at), 'yyyy/M/d', { locale: ja })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!sitters || sitters.length === 0) && (
          <p className="text-center text-gray-400 py-12">シッターが登録されていません</p>
        )}
      </div>
    </div>
  )
}
