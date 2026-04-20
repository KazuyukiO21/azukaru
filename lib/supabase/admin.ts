import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service Role クライアント（RLS をバイパス）
 * サーバーサイドの管理処理専用。絶対にクライアントに渡さないこと。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
