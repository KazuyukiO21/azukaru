import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// シッター: pending → confirmed / cancelled
// 飼い主: pending → cancelled
// システム: confirmed → completed (将来的にcron等で自動化)
const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
  sitter: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
  },
  owner: {
    pending: ['cancelled'],
    confirmed: ['cancelled'],
  },
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const bookingId = params.id
  if (!bookingId || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
    return NextResponse.json({ error: '予約IDが正しくありません' }, { status: 400 })
  }

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が正しくありません' }, { status: 400 })
  }

  const { status: newStatus } = body
  if (!newStatus) {
    return NextResponse.json({ error: 'ステータスを指定してください' }, { status: 400 })
  }

  // 予約を取得
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }

  // 権限確認：予約の当事者のみ操作可
  const isSitter = booking.sitter_id === user.id
  const isOwner = booking.owner_id === user.id
  if (!isSitter && !isOwner) {
    return NextResponse.json({ error: 'この予約を操作する権限がありません' }, { status: 403 })
  }

  // ステータス遷移の検証
  const role = isSitter ? 'sitter' : 'owner'
  const allowedNext = ALLOWED_TRANSITIONS[role]?.[booking.status] ?? []
  if (!allowedNext.includes(newStatus)) {
    return NextResponse.json(
      { error: `${booking.status} から ${newStatus} への変更はできません` },
      { status: 400 }
    )
  }

  // 更新
  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select()
    .single()

  if (updateError) {
    console.error('Booking update error:', updateError)
    return NextResponse.json({ error: '予約の更新に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ booking: updated })
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      owner:profiles!owner_id(display_name, avatar_url, phone),
      sitter:sitter_profiles!sitter_id(
        user_id, rating, review_count,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .eq('id', params.id)
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
