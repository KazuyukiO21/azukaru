'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SitterToggle({
  sitterId,
  isActive,
}: {
  sitterId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(isActive)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/sitters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sitter_id: sitterId, is_active: !active }),
    })
    if (res.ok) {
      setActive(!active)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        active ? 'bg-green-400' : 'bg-gray-200'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-white mx-auto" />
      ) : (
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            active ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      )}
    </button>
  )
}
