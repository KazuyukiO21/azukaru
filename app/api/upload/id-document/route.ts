import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const documentType = formData.get('documentType') as string | null

  if (!file) return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
  if (!documentType) return NextResponse.json({ error: '書類の種類を選択してください' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'JPEG・PNG・WebP・PDF形式のみアップロードできます' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
  }

  const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const filePath = `${session.user.id}/${documentType}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('id-documents')
    .upload(filePath, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: 'アップロードに失敗しました: ' + uploadError.message }, { status: 500 })
  }

  // verifications テーブルを upsert
  const { error: upsertError } = await supabase
    .from('verifications')
    .upsert({
      user_id: session.user.id,
      id_document_type: documentType,
      id_document_url: filePath,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (upsertError) {
    return NextResponse.json({ error: '申請情報の保存に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
