import { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import VerificationReviewClient from './VerificationReviewClient'

export const metadata: Metadata = { title: '本人確認審査' }

export default async function AdminVerificationsPage() {
  await requireAdmin()
  const db = createAdminClient()

  // 審査待ちの本人確認申請
  const { data: pendingVerifications } = await db
    .from('verifications')
    .select(`
      *,
      profile:profiles!user_id(display_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  // 審査待ちの資格証明
  const { data: pendingCerts } = await db
    .from('sitter_certifications')
    .select(`
      *,
      profile:profiles!user_id(display_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // 処理済みの本人確認（最新10件）
  const { data: processedVerifications } = await db
    .from('verifications')
    .select(`
      *,
      profile:profiles!user_id(display_name, avatar_url)
    `)
    .neq('status', 'pending')
    .order('reviewed_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">本人確認審査</h1>
        <p className="text-gray-500 text-sm mt-1">
          申請中の本人確認書類と資格証明書を審査してください
        </p>
      </div>

      <VerificationReviewClient
        pendingVerifications={pendingVerifications ?? []}
        pendingCerts={pendingCerts ?? []}
        processedVerifications={processedVerifications ?? []}
      />
    </div>
  )
}
