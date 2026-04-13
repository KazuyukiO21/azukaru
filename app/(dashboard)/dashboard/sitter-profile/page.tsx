import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import SitterProfileEditForm from './SitterProfileEditForm'

export const metadata: Metadata = { title: 'シッタープロフィール編集' }

export default async function SitterProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) redirect('/login?redirect=/dashboard/sitter-profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // シッターでない場合はロールを変更してシッタープロフィールを作成する
  if (!['sitter', 'both'].includes(profile.role)) {
    // ownerでもシッター登録できるようにroleをbothに更新
    await supabase
      .from('profiles')
      .update({ role: 'both' })
      .eq('user_id', user.id)

    // sitter_profilesが未作成なら作成
    await supabase
      .from('sitter_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
  }

  const { data: sitterProfile } = await supabase
    .from('sitter_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={{ id: user.id, display_name: profile.display_name, avatar_url: profile.avatar_url }} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* パンくず */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/dashboard" className="hover:text-gray-600">ダッシュボード</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">シッタープロフィール編集</span>
        </nav>

        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">シッタープロフィール</h1>
            <p className="text-gray-500 text-sm">情報を充実させると予約が入りやすくなります</p>
          </div>
          <Link
            href={`/sitters/${user.id}`}
            target="_blank"
            className="btn-outline flex items-center gap-1.5 text-sm shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            公開ページを見る
          </Link>
        </div>

        <SitterProfileEditForm
          sitterProfile={sitterProfile as any}
          bio={profile.bio}
          isActive={sitterProfile?.is_active ?? true}
        />
      </main>
    </div>
  )
}
