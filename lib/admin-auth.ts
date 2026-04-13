import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 管理者かどうかを確認し、違う場合はリダイレクト。
 * 環境変数 ADMIN_EMAILS にカンマ区切りで管理者メールアドレスを設定する。
 * 例: ADMIN_EMAILS=admin@example.com,kazuyuki.otsuki@gmail.com
 */
export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/')
  }

  return user
}
