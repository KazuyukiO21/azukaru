import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) return null
  return user
}

export async function PATCH(request: Request) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()
  const { sitter_id, is_active } = body

  if (!sitter_id || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'パラメータが不正です' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('sitter_profiles')
    .update({ is_active })
    .eq('user_id', sitter_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  return NextResponse.json({ sitter: data })
}
