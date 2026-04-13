import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquare, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'メッセージ監視' }

export default async function AdminMessagesPage() {
  await requireAdmin()
  const db = createAdminClient()

  // 最新の会話一覧（最近50件）
  const { data: conversations } = await db
    .from('conversations')
    .select(`
      *,
      owner:profiles!owner_id(display_name),
      sitter:sitter_profiles!sitter_id(profile:profiles!user_id(display_name)),
      messages(content, created_at, sender_id)
    `)
    .order('last_message_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">メッセージ監視</h1>
          <p className="text-gray-500 text-sm mt-1">すべての会話スレッドを閲覧できます</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 text-sm text-yellow-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>個人情報・プライバシーに配慮して閲覧してください</span>
        </div>
      </div>

      <div className="space-y-3">
        {(conversations ?? []).map((conv: any) => {
          const msgs: any[] = conv.messages ?? []
          const latest = msgs.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          return (
            <div key={conv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {conv.owner?.display_name}
                      <span className="text-gray-400 mx-2">⇔</span>
                      {conv.sitter?.profile?.display_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {msgs.length}件のメッセージ ／ 最終：{format(new Date(conv.last_message_at), 'M/d HH:mm', { locale: ja })}
                    </p>
                  </div>
                </div>
                {conv.booking_id && (
                  <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full shrink-0">
                    予約あり
                  </span>
                )}
              </div>

              {/* 最新メッセージプレビュー */}
              {latest && (
                <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                  <p className="line-clamp-2">{latest.content}</p>
                </div>
              )}

              {/* メッセージ履歴（最新5件） */}
              {msgs.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs text-primary-600 cursor-pointer hover:underline">
                    メッセージ履歴を見る（{msgs.length}件）
                  </summary>
                  <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
                    {msgs
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((m, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className="text-gray-300 shrink-0">
                            {format(new Date(m.created_at), 'M/d HH:mm')}
                          </span>
                          <span className="text-gray-400 shrink-0">
                            {m.sender_id === conv.owner_id
                              ? conv.owner?.display_name
                              : conv.sitter?.profile?.display_name}:
                          </span>
                          <span className="text-gray-600">{m.content}</span>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          )
        })}

        {(!conversations || conversations.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>メッセージはまだありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
