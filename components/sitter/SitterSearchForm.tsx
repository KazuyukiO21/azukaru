'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

const SERVICES = [
  { value: '', label: 'すべてのサービス' },
  { value: 'boarding', label: '宿泊預かり' },
  { value: 'daycare', label: '日中預かり' },
  { value: 'walking', label: '散歩代行' },
  { value: 'drop_in', label: '訪問ケア' },
  { value: 'grooming', label: 'トリミング' },
]

const PET_TYPES = [
  { value: '', label: 'すべてのペット' },
  { value: 'dog', label: '犬' },
  { value: 'cat', label: '猫' },
  { value: 'small_animal', label: '小動物' },
  { value: 'bird', label: '鳥' },
  { value: 'reptile', label: '爬虫類' },
]

interface SitterSearchFormProps {
  initialValues?: {
    service?: string
    pet?: string
    prefecture?: string
  }
}

export default function SitterSearchForm({ initialValues = {} }: SitterSearchFormProps) {
  const [service, setService] = useState(initialValues.service || '')
  const [pet, setPet] = useState(initialValues.pet || '')
  const [prefecture, setPrefecture] = useState(initialValues.prefecture || '')
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (service) params.set('service', service)
    if (pet) params.set('pet', pet)
    if (prefecture) params.set('prefecture', prefecture)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="input flex-1"
      >
        {SERVICES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={pet}
        onChange={(e) => setPet(e.target.value)}
        className="input flex-1"
      >
        {PET_TYPES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <input
        type="text"
        value={prefecture}
        onChange={(e) => setPrefecture(e.target.value)}
        placeholder="都道府県（例：東京都）"
        className="input flex-1"
      />

      <button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap">
        <Search className="w-4 h-4" />
        検索
      </button>
    </form>
  )
}
