import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'ユーザー管理' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; q?: string }
}) {
  await requireAdmin()
  const db = createAdminClient()

  let query = db
    .from('profiles')
    .select('*, sitter_profiles(is_active, rating, review_count, stripe_onboarding_complete)')
    .order('created_at', { ascending: false })

  if (searchParams.role && searchParams.role !== 'all') {
    query = query.eq('role', searchParams.role)
  }
  if (searchParams.q) {
    query = query.ilike('display_name', `%${searchParams.q}%`)
  }

  const { data: users } = await query.limit(100)

  const ROLE_LABEL: Record<string, string> = {
    owner: '飼い主', sitter: 'シッター', both: '両方',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-500 text-sm mt-1">全登録ユーザーの一覧</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
          <Users className="w-4 h-4" />
          <span className="font-bold">{users?.length ?? 0}</span>
          <span className="text-sm">件</span>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex gap-3 mb-6">
        {['all', 'owner', 'sitter', 'both'].map((r) => (
          <a
            key={r}
            href={`/admin/users?role=${r}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (searchParams.role ?? 'all') === r
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {r === 'all' ? 'すべて' : ROLE_LABEL[r]}
          </a>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ユーザー', 'ロール', 'シッター状態', 'Stripe', '登録日'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(users ?? []).map((u: any) => {
              const sp = u.sitter_profiles?.[0]
              return (
                <tr key={u.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {u.display_name?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{u.display_name}</p>
                        {u.prefecture && (
                          <p className="text-xs text-gray-400">{u.prefecture} {u.city}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === 'sitter' ? 'bg-green-50 text-green-700' :
                      u.role === 'both'   ? 'bg-purple-50 text-purple-700' :
                                            'bg-gray-100 text-gray-600'
                    }`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {sp ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sp.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          {sp.is_active ? '公開中' : '非公開'}
                          {sp.review_count > 0 && ` / ★${Number(sp.rating).toFixed(1)} (${sp.review_count}件)`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {sp ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sp.stripe_onboarding_complete
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {sp.stripe_onboarding_complete ? '設定済み' : '未設定'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {format(new Date(u.created_at), 'yyyy/M/d', { locale: ja })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="text-center text-gray-400 py-12">ユーザーが見つかりません</p>
        )}
      </div>
    </div>
  )
}
