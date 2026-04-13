import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

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

  const { booking_id, rating, comment } = body

  // ─── バリデーション ───────────────────────────
  if (!booking_id || typeof booking_id !== 'string') {
    return NextResponse.json({ error: '予約IDが必要です' }, { status: 400 })
  }
  const ratingNum = Number(rating)
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: '評価は1〜5で入力してください' }, { status: 400 })
  }
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string' || comment.length > 1000) {
      return NextResponse.json({ error: 'コメントは1000文字以内にしてください' }, { status: 400 })
    }
  }

  // 予約を取得して権限確認
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('owner_id, sitter_id, status')
    .eq('id', booking_id)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }

  if (booking.status !== 'completed') {
    return NextResponse.json({ error: '完了した予約のみレビューできます' }, { status: 400 })
  }

  const isOwner = booking.owner_id === user.id
  const isSitter = booking.sitter_id === user.id
  if (!isOwner && !isSitter) {
    return NextResponse.json({ error: 'この予約のレビューを投稿する権限がありません' }, { status: 403 })
  }

  // レビュー対象：飼い主 → シッター / シッター → 飼い主
  const reviewee_id = isOwner ? booking.sitter_id : booking.owner_id

  // 重複チェック
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking_id)
    .eq('reviewer_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'この予約のレビューはすでに投稿済みです' }, { status: 409 })
  }

  // レビュー投稿
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      booking_id,
      reviewer_id: user.id,
      reviewee_id,
      rating: ratingNum,
      comment: comment ? (comment as string).trim() : null,
    })
    .select()
    .single()

  if (reviewError) {
    console.error('Review insert error:', reviewError)
    return NextResponse.json({ error: 'レビューの投稿に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ review }, { status: 201 })
}
