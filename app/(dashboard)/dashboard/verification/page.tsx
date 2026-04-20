import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import VerificationClient from './VerificationClient'

export const metadata: Metadata = { title: '本人確認・資格証明' }

export default async function VerificationPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) redirect('/login?redirect=/dashboard/verification')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // 本人確認状態を取得
  const { data: verification } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 資格証明一覧を取得
  const { data: certifications } = await supabase
    .from('sitter_certifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={{ id: user.id, display_name: profile.display_name, avatar_url: profile.avatar_url }} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* パンくず */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/dashboard" className="hover:text-gray-600">ダッシュボード</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">本人確認・資格証明</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">本人確認・資格証明</h1>
        <p className="text-gray-500 text-sm mb-8">
          本人確認や資格の証明書を提出することで、信頼度が上がり予約が入りやすくなります。
        </p>

        <VerificationClient
          verification={verification}
          certifications={certifications ?? []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
