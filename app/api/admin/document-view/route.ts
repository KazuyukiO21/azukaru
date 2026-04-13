import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // 管理者チェック
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 })
  }

  // 許可するバケット名
  const allowedBuckets = ['id-documents', 'certifications']
  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ error: '不正なバケットです' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 10) // 10分間有効

  if (error || !data) {
    return NextResponse.json({ error: 'URLの生成に失敗しました' }, { status: 500 })
  }

  // 署名付きURLにリダイレクト
  return NextResponse.redirect(data.signedUrl)
}
