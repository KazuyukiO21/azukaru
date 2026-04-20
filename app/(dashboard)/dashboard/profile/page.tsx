import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ChevronRight, Settings } from 'lucide-react'
import ProfileForm from './ProfileForm'

export const metadata: Metadata = { title: 'プロフィール編集' }

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const isSitter = ['sitter', 'both'].includes(profile.role)

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={{ id: user.id, display_name: profile.display_name, avatar_url: profile.avatar_url }} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* パンくず */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/dashboard" className="hover:text-gray-600">ダッシュボード</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">プロフィール編集</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">プロフィール編集</h1>

        <div className="card p-6 sm:p-8 mb-4">
          <ProfileForm profile={profile} userId={user.id} />
        </div>

        {/* シッターの場合はシッター設定へのリンクも表示 */}
        {isSitter && (
          <Link
            href="/dashboard/sitter-setup"
            className="flex items-center justify-between card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">シッタープロフィール設定</p>
                <p className="text-sm text-gray-500">サービス・料金・対応ペットを設定</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        )}
      </main>
    </div>
  )
}
