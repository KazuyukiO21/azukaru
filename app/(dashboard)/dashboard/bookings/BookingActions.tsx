'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'

interface Props {
  bookingId: string
  role: 'sitter' | 'owner'
  currentStatus: string
}

export default function BookingActions({ bookingId, role, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = async (newStatus: string) => {
    setLoading(newStatus)
    setError(null)
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    setLoading(null)
    if (!res.ok) { setError(data.error || '操作に失敗しました'); return }
    router.refresh()
  }

  if (role === 'sitter' && currentStatus === 'pending') {
    return (
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => update('confirmed')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading === 'confirmed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          承認する
        </button>
        <button
          onClick={() => update('cancelled')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading === 'cancelled' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          断る
        </button>
        {error && <p className="text-xs text-red-500 self-center">{error}</p>}
      </div>
    )
  }

  if (role === 'sitter' && currentStatus === 'confirmed') {
    return (
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => update('completed')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading === 'completed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          完了にする
        </button>
        {error && <p className="text-xs text-red-500 self-center">{error}</p>}
      </div>
    )
  }

  if (role === 'owner' && ['pending', 'confirmed'].includes(currentStatus)) {
    return (
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => update('cancelled')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading === 'cancelled' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          キャンセル
        </button>
        {error && <p className="text-xs text-red-500 self-center">{error}</p>}
      </div>
    )
  }

  return null
}
