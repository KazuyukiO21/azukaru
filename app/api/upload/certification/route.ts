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
  const name = formData.get('name') as string | null
  const issuer = formData.get('issuer') as string | null
  const issuedDate = formData.get('issuedDate') as string | null

  if (!file) return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
  if (!name) return NextResponse.json({ error: '資格名を入力してください' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'JPEG・PNG・WebP・PDF形式のみアップロードできます' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
  }

  const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const timestamp = Date.now()
  const filePath = `${session.user.id}/${timestamp}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('certifications')
    .upload(filePath, file, { upsert: false, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: 'アップロードに失敗しました: ' + uploadError.message }, { status: 500 })
  }

  const { error: insertError } = await supabase
    .from('sitter_certifications')
    .insert({
      user_id: session.user.id,
      name,
      issuer: issuer || null,
      issued_date: issuedDate || null,
      document_url: filePath,
      status: 'pending',
    })

  if (insertError) {
    return NextResponse.json({ error: '資格情報の保存に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  const { data: cert } = await supabase
    .from('sitter_certifications')
    .select('document_url')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!cert) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

  if (cert.document_url) {
    await supabase.storage.from('certifications').remove([cert.document_url])
  }

  await supabase.from('sitter_certifications').delete().eq('id', id).eq('user_id', session.user.id)

  return NextResponse.json({ success: true })
}
