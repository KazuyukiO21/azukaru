import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

// プラットフォーム手数料率（15%）
export const PLATFORM_FEE_RATE = 0.15

/**
 * 手数料計算
 * @param totalAmount 総額（円）
 * @returns { platformFee, sitterAmount }
 */
export function calculateFees(totalAmount: number) {
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE)
  const sitterAmount = totalAmount - platformFee
  return { platformFee, sitterAmount }
}

/**
 * Stripe Connect アカウント作成
 */
export async function createConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'JP',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    settings: {
      payouts: {
        schedule: {
          interval: 'weekly',
          weekly_anchor: 'monday',
        },
      },
    },
  })
  return account
}

/**
 * Stripe Connect オンボーディングリンク作成
 */
export async function createOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
  return accountLink
}

/**
 * Payment Intent作成（飼い主→アズカル→シッター）
 */
export async function createPaymentIntent({
  amount,
  sitterStripeAccountId,
  bookingId,
  ownerEmail,
}: {
  amount: number
  sitterStripeAccountId: string
  bookingId: string
  ownerEmail: string
}) {
  const { platformFee } = calculateFees(amount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'jpy',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: sitterStripeAccountId,
    },
    metadata: {
      booking_id: bookingId,
      owner_email: ownerEmail,
    },
    receipt_email: ownerEmail,
  })

  return paymentIntent
}
