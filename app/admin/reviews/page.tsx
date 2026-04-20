import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Star } from 'lucide-react'
import ReviewDeleteButton from './ReviewDeleteButton'

export const metadata: Metadata = { title: 'レビュー管理' }

export default async function AdminReviewsPage() {
  await requireAdmin()
  const db = createAdminClient()

  const { data: reviews } = await db
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(display_name),
      reviewee:profiles!reviewee_id(display_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">レビュー管理</h1>
        <p className="text-gray-500 text-sm mt-1">
          全 <strong>{reviews?.length ?? 0}</strong> 件 ／ 不適切なレビューはここから削除できます
        </p>
      </div>

      <div className="space-y-3">
        {(reviews ?? []).map((r: any) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  {/* 星評価 */}
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{r.rating}.0</span>
                  <span className="text-gray-300 text-xs">|</span>
                  <span className="text-xs text-gray-500">
                    <strong>{r.reviewer?.display_name}</strong> → <strong>{r.reviewee?.display_name}</strong>
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                )}
                {!r.comment && (
                  <p className="text-xs text-gray-400 italic">コメントなし</p>
                )}
              </div>
              <div className="flex items-start gap-3 shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {format(new Date(r.created_at), 'yyyy/M/d', { locale: ja })}
                </span>
                <ReviewDeleteButton reviewId={r.id} />
              </div>
            </div>
          </div>
        ))}

        {(!reviews || reviews.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>レビューはまだありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
