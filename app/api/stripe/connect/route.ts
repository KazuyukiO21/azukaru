import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createOnboardingLink, stripe } from '@/lib/stripe'

// Stripe Connectオンボーディング開始
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // シッタープロフィール確認
  const { data: sitter } = await supabase
    .from('sitter_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!sitter) {
    return NextResponse.json({ error: 'シッタープロフィールが見つかりません' }, { status: 404 })
  }

  let stripeAccountId = sitter.stripe_account_id

  // Stripeアカウント未作成の場合は作成
  if (!stripeAccountId) {
    try {
      const account = await createConnectAccount(user.email)
      stripeAccountId = account.id

      await supabase
        .from('sitter_profiles')
        .update({ stripe_account_id: stripeAccountId })
        .eq('user_id', user.id)
    } catch (err) {
      console.error('Stripe account creation error:', err)
      return NextResponse.json({ error: 'Stripeアカウントの作成に失敗しました' }, { status: 500 })
    }
  }

  // オンボーディングリンク作成
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const accountLink = await createOnboardingLink(
      stripeAccountId,
      `${baseUrl}/profile/sitter?stripe_success=true`,
      `${baseUrl}/profile/sitter?stripe_refresh=true`
    )
    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('Onboarding link error:', err)
    return NextResponse.json({ error: 'オンボーディングリンクの作成に失敗しました' }, { status: 500 })
  }
}

// オンボーディング完了確認
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: sitter } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single()

  if (!sitter?.stripe_account_id) {
    return NextResponse.json({ complete: false })
  }

  try {
    const account = await stripe.accounts.retrieve(sitter.stripe_account_id)
    const isComplete = account.details_submitted && account.charges_enabled

    if (isComplete && !sitter.stripe_onboarding_complete) {
      await supabase
        .from('sitter_profiles')
        .update({ stripe_onboarding_complete: true })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      complete: isComplete,
      charges_enabled: account.charges_enabled,
    })
  } catch (err) {
    return NextResponse.json({ complete: false, error: 'アカウント情報の取得に失敗しました' })
  }
}
