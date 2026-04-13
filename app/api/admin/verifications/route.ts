import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) return null
  return user
}

// GET: 本人確認申請一覧
export async function GET(request: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'
  const type = searchParams.get('type') ?? 'verification' // 'verification' | 'certification'

  const db = createAdminClient()

  if (type === 'certification') {
    const { data, error } = await db
      .from('sitter_certifications')
      .select(`
        *,
        profile:profiles!user_id(display_name, avatar_url, email:auth.users!inner(email))
      `)
      .eq('status', status)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const { data, error } = await db
    .from('verifications')
    .select(`
      *,
      profile:profiles!user_id(display_name, avatar_url)
    `)
    .eq('status', status)
    .order('submitted_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH: 承認・却下
export async function PATCH(request: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  const body = await request.json()
  const { id, action, type, rejection_reason } = body
  // action: 'approve' | 'reject'
  // type: 'verification' | 'certification'

  if (!id || !action || !type) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 })
  }

  const db = createAdminClient()
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const now = new Date().toISOString()

  if (type === 'certification') {
    const { error } = await db
      .from('sitter_certifications')
      .update({
        status: newStatus,
        reviewed_at: now,
        ...(newStatus === 'rejected' && rejection_reason ? { rejection_reason } : {}),
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // 本人確認
  const { error } = await db
    .from('verifications')
    .update({
      status: newStatus,
      reviewed_at: now,
      ...(newStatus === 'rejected' && rejection_reason ? { rejection_reason } : {}),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 承認されたらprofilesのis_id_verifiedをtrueに
  if (newStatus === 'approved') {
    const { data: ver } = await db
      .from('verifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (ver) {
      await db
        .from('profiles')
        .update({ is_id_verified: true })
        .eq('user_id', ver.user_id)
    }
  }

  return NextResponse.json({ success: true })
}
