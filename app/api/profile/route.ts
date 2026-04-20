import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 許可する都道府県リスト
const VALID_PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

export async function PATCH(request: Request) {
  const supabase = createClient()

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が正しくありません' }, { status: 400 })
  }

  const { display_name, bio, prefecture, city, phone, avatar_url } = body

  // ─── バリデーション ───────────────────────────
  const errors: string[] = []

  if (display_name !== undefined) {
    if (typeof display_name !== 'string' || display_name.trim().length === 0) {
      errors.push('ニックネームを入力してください')
    } else if (display_name.trim().length > 50) {
      errors.push('ニックネームは50文字以内にしてください')
    }
  }

  if (bio !== undefined && bio !== null) {
    if (typeof bio !== 'string' || bio.length > 500) {
      errors.push('自己紹介は500文字以内にしてください')
    }
  }

  if (prefecture !== undefined && prefecture !== null && prefecture !== '') {
    if (!VALID_PREFECTURES.includes(prefecture as string)) {
      errors.push('都道府県が正しくありません')
    }
  }

  if (city !== undefined && city !== null) {
    if (typeof city !== 'string' || city.length > 50) {
      errors.push('市区町村は50文字以内にしてください')
    }
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    const phoneRegex = /^[0-9\-\+]{10,15}$/
    if (!phoneRegex.test(phone as string)) {
      errors.push('電話番号の形式が正しくありません')
    }
  }

  // avatar_url のバリデーション（Supabase Storage のURLのみ許可）
  if (avatar_url !== undefined && avatar_url !== null) {
    const url = avatar_url as string
    if (!url.includes('.supabase.co/storage/')) {
      errors.push('avatar_url が不正です')
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('、') }, { status: 400 })
  }

  // ─── 更新 ──────────────────────────────────────
  const updateData: Record<string, unknown> = {}
  if (display_name !== undefined) updateData.display_name = (display_name as string).trim()
  if (bio !== undefined) updateData.bio = bio || null
  if (prefecture !== undefined) updateData.prefecture = prefecture || null
  if (city !== undefined) updateData.city = city || null
  if (phone !== undefined) updateData.phone = phone || null
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
