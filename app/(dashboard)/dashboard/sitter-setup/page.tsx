import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import SitterSetupForm from './SitterSetupForm'

export const metadata: Metadata = { title: 'シッタープロフィール設定' }

export default async function SitterSetupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/sitter-setup')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (!['sitter', 'both'].includes(profile.role)) {
    redirect('/dashboard')
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
          <span className="text-gray-700">シッタープロフィール設定</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">シッタープロフィールを設定しよう</h1>
          <p className="text-gray-500">4つのステップで完了します。情報を入力するほど予約が入りやすくなります。</p>
        </div>

        <div className="card p-6 sm:p-8">
          <SitterSetupForm
            sitterProfile={sitterProfile as any}
            bio={profile.bio}
          />
        </div>
      </main>
    </div>
  )
}
