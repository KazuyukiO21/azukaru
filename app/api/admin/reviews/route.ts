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

export async function DELETE(request: Request) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('reviews').delete().eq('id', id)

  if (error) return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  return NextResponse.json({ success: true })
}
