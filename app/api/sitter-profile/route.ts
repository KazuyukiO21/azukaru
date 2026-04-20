import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_SERVICES = ['boarding', 'daycare', 'walking', 'drop_in', 'grooming']
const VALID_PET_TYPES = ['dog', 'cat', 'small_animal', 'bird', 'reptile', 'other']

export async function PATCH(request: Request) {
  const supabase = createClient()

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // シッターロール確認
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['sitter', 'both'].includes(profile.role)) {
    return NextResponse.json({ error: 'シッターアカウントのみ利用可能です' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が正しくありません' }, { status: 400 })
  }

  const {
    services, pet_types,
    price_per_night, price_per_day, price_per_walk, price_drop_in,
    max_pets, home_type, has_yard, accepts_unvaccinated,
    experience_years, certifications, bio, is_active,
  } = body

  // ─── バリデーション ───────────────────────────
  const errors: string[] = []

  if (services !== undefined) {
    if (!Array.isArray(services) || (services as string[]).some((s) => !VALID_SERVICES.includes(s))) {
      errors.push('サービス種別が正しくありません')
    }
    if ((services as string[]).length === 0) {
      errors.push('サービスを1つ以上選択してください')
    }
  }

  if (pet_types !== undefined) {
    if (!Array.isArray(pet_types) || (pet_types as string[]).some((p) => !VALID_PET_TYPES.includes(p))) {
      errors.push('ペット種別が正しくありません')
    }
    if ((pet_types as string[]).length === 0) {
      errors.push('対応ペットを1つ以上選択してください')
    }
  }

  const priceFields = { price_per_night, price_per_day, price_per_walk, price_drop_in }
  for (const [key, val] of Object.entries(priceFields)) {
    if (val !== undefined && val !== null) {
      const num = Number(val)
      if (!Number.isInteger(num) || num < 500 || num > 500000) {
        errors.push(`${key} は500円〜500,000円の範囲で設定してください`)
      }
    }
  }

  if (max_pets !== undefined) {
    const num = Number(max_pets)
    if (!Number.isInteger(num) || num < 1 || num > 10) {
      errors.push('最大預かり頭数は1〜10頭で設定してください')
    }
  }

  if (experience_years !== undefined && experience_years !== null) {
    const num = Number(experience_years)
    if (!Number.isInteger(num) || num < 0 || num > 50) {
      errors.push('経験年数は0〜50年で設定してください')
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('、') }, { status: 400 })
  }

  // ─── 更新データ組み立て ────────────────────────
  const updateData: Record<string, unknown> = {}
  if (services !== undefined) updateData.services = services
  if (pet_types !== undefined) updateData.pet_types = pet_types
  if (price_per_night !== undefined) updateData.price_per_night = price_per_night ? Number(price_per_night) : null
  if (price_per_day !== undefined) updateData.price_per_day = price_per_day ? Number(price_per_day) : null
  if (price_per_walk !== undefined) updateData.price_per_walk = price_per_walk ? Number(price_per_walk) : null
  if (price_drop_in !== undefined) updateData.price_drop_in = price_drop_in ? Number(price_drop_in) : null
  if (max_pets !== undefined) updateData.max_pets = Number(max_pets)
  if (home_type !== undefined) updateData.home_type = home_type || null
  if (has_yard !== undefined) updateData.has_yard = Boolean(has_yard)
  if (accepts_unvaccinated !== undefined) updateData.accepts_unvaccinated = Boolean(accepts_unvaccinated)
  if (experience_years !== undefined) updateData.experience_years = experience_years ? Number(experience_years) : null
  if (certifications !== undefined) updateData.certifications = Array.isArray(certifications) ? certifications : []
  if (is_active !== undefined) updateData.is_active = Boolean(is_active)

  // bio はプロフィールテーブルに保存
  if (bio !== undefined) {
    await supabase
      .from('profiles')
      .update({ bio: (bio as string)?.trim() || null })
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('sitter_profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Sitter profile update error:', error)
    return NextResponse.json({ error: 'シッター情報の更新に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ sitterProfile: data })
}
