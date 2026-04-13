import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent, calculateFees } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
  const {
    sitter_id,
    service_type,
    pet_name,
    pet_type,
    start_date,
    end_date,
    message,
    total_amount,
  } = body

  // バリデーション
  if (!sitter_id || !service_type || !pet_name || !start_date || !total_amount) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  // シッター情報取得
  const { data: sitter, error: sitterError } = await supabase
    .from('sitter_profiles')
    .select('*, profile:profiles!user_id(email)')
    .eq('user_id', sitter_id)
    .single()

  if (sitterError || !sitter) {
    return NextResponse.json({ error: 'シッターが見つかりません' }, { status: 404 })
  }

  if (!sitter.stripe_onboarding_complete || !sitter.stripe_account_id) {
    return NextResponse.json({ error: 'シッターの支払い設定が完了していません' }, { status: 400 })
  }

  const { platformFee, sitterAmount } = calculateFees(total_amount)

  // 予約レコード作成
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      owner_id: user.id,
      sitter_id,
      pet_name,
      pet_type,
      service_type,
      start_date,
      end_date: end_date || start_date,
      message,
      status: 'pending',
      payment_status: 'pending',
      total_amount,
      platform_fee: platformFee,
      sitter_amount: sitterAmount,
    })
    .select()
    .single()

  if (bookingError || !booking) {
    console.error('Booking creation error:', bookingError)
    return NextResponse.json({ error: '予約の作成に失敗しました' }, { status: 500 })
  }

  // Payment Intent作成
  try {
    const paymentIntent = await createPaymentIntent({
      amount: total_amount,
      sitterStripeAccountId: sitter.stripe_account_id,
      bookingId: booking.id,
      ownerEmail: user.email!,
    })

    // Payment Intent IDを予約に紐付け
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', booking.id)

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err: any) {
    console.error('Stripe error:', err)
    // 予約をキャンセル
    await supabase.from('bookings').delete().eq('id', booking.id)
    return NextResponse.json({ error: '決済の初期化に失敗しました' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      sitter:sitter_profiles!sitter_id(
        user_id,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ bookings })
}
