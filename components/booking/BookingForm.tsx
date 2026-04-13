'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Calendar, PawPrint, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import type { ServiceType, PetType } from '@/types'

const SERVICE_LABELS: Record<ServiceType, string> = {
  boarding: '宿泊預かり',
  daycare: '日中預かり',
  walking: '散歩代行',
  drop_in: '訪問ケア',
  grooming: 'トリミング',
}

const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: '犬',
  cat: '猫',
  small_animal: '小動物',
  bird: '鳥',
  reptile: '爬虫類',
  other: 'その他',
}

interface BookingFormProps {
  sitter: any
  currentUserId: string | null
  isOwner: boolean
}

export default function BookingForm({ sitter, currentUserId, isOwner }: BookingFormProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(sitter.services?.[0] || 'boarding')
  const [petName, setPetName] = useState('')
  const [petType, setPetType] = useState<PetType>('dog')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // サービスごとの料金を取得
  const getPrice = (service: ServiceType): number | null => {
    switch (service) {
      case 'boarding': return sitter.price_per_night
      case 'daycare': return sitter.price_per_day
      case 'walking': return sitter.price_per_walk
      case 'drop_in': return sitter.price_drop_in
      default: return null
    }
  }

  // 日数計算
  const getNights = () => {
    if (!startDate || !endDate) return 0
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  // 合計金額計算
  const getTotal = () => {
    const price = getPrice(serviceType)
    if (!price) return null
    const nights = getNights()
    if (serviceType === 'boarding' || serviceType === 'daycare') {
      return nights > 0 ? price * nights : price
    }
    return price
  }

  const total = getTotal()
  const platformFee = total ? Math.round(total * 0.15) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (!isOwner) {
      setError('予約は飼い主アカウントのみ可能です')
      return
    }
    if (!total) {
      setError('サービス料金が設定されていません')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sitter_id: sitter.user_id,
          service_type: serviceType,
          pet_name: petName,
          pet_type: petType,
          start_date: startDate,
          end_date: endDate || startDate,
          message,
          total_amount: total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '予約の作成に失敗しました')
      }

      // Stripe決済ページへ
      if (data.clientSecret) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (stripe) {
          router.push(`/bookings/${data.bookingId}/payment?client_secret=${data.clientSecret}`)
        }
      } else {
        router.push(`/dashboard?booking=created`)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!currentUserId) {
    return (
      <div className="card p-6 text-center">
        <PawPrint className="w-10 h-10 text-primary-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium mb-4">予約するにはログインが必要です</p>
        <Link href="/login" className="btn-primary block">ログイン</Link>
        <Link href="/signup" className="btn-secondary block mt-3">無料で登録</Link>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">予約リクエスト</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* サービス選択 */}
        <div>
          <label className="label">サービス</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="input"
          >
            {sitter.services?.map((s: ServiceType) => (
              <option key={s} value={s}>
                {SERVICE_LABELS[s]}
                {getPrice(s) ? ` ¥${getPrice(s)!.toLocaleString()}～` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* ペット情報 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">ペットの名前</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="input"
              placeholder="例：ポチ"
              required
            />
          </div>
          <div>
            <label className="label">ペットの種類</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value as PetType)}
              className="input"
            >
              {sitter.pet_types?.map((p: PetType) => (
                <option key={p} value={p}>{PET_TYPE_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 日程 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">
              <Calendar className="inline-block w-3 h-3 mr-1" />
              開始日
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          {(serviceType === 'boarding' || serviceType === 'daycare') && (
            <div>
              <label className="label">
                <Calendar className="inline-block w-3 h-3 mr-1" />
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>

        {/* メッセージ */}
        <div>
          <label className="label">メッセージ（任意）</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input h-24 resize-none"
            placeholder="ペットの特徴や注意事項があれば..."
          />
        </div>

        {/* 料金内訳 */}
        {total && (
          <div className="bg-warm-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>サービス料金</span>
              <span>¥{(total - platformFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>サービス手数料（15%）</span>
              <span>¥{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-warm-200">
              <span>合計</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !sitter.stripe_onboarding_complete}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />処理中...</>
          ) : (
            <><Lock className="w-4 h-4" />安全に予約する</>
          )}
        </button>

        {!sitter.stripe_onboarding_complete && (
          <p className="text-xs text-center text-gray-400">
            このシッターはまだ支払い設定が完了していません
          </p>
        )}

        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Stripeによる安全な決済
        </p>
      </form>
    </div>
  )
}
