import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Webhookはサービスロールキーを使用
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata.booking_id

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        console.log(`予約 ${bookingId} の支払いが完了しました`)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      break
    }

    case 'account.updated': {
      // Stripeアカウントの更新（シッターのオンボーディング完了など）
      const account = event.data.object as Stripe.Account

      if (account.details_submitted && account.charges_enabled) {
        await supabase
          .from('sitter_profiles')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', account.id)
      }
      break
    }

    default:
      console.log(`未処理のイベント: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
