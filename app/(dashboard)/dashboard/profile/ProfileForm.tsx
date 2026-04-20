'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, User, MapPin, Phone, FileText } from 'lucide-react'
import type { Profile } from '@/types'
import AvatarUpload from '@/components/ui/AvatarUpload'

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

export default function ProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [prefecture, setPrefecture] = useState(profile.prefecture || '')
  const [city, setCity] = useState(profile.city || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, bio, prefecture, city, phone }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || '更新に失敗しました')
      return
    }

    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* アバター */}
      <div className="flex justify-center pb-2">
        <AvatarUpload
          userId={userId}
          currentUrl={profile.avatar_url}
          displayName={displayName || profile.display_name}
          onUpload={() => router.refresh()}
        />
      </div>

      {/* ニックネーム */}
      <div>
        <label className="label flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          ニックネーム <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
          placeholder="表示名（50文字以内）"
          maxLength={50}
          required
        />
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="label flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          自己紹介
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input min-h-[100px] resize-y"
          placeholder="ペットとの関わりや趣味など、自由に書いてください（500文字以内）"
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{bio.length} / 500</p>
      </div>

      {/* 居住地 */}
      <div>
        <label className="label flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          居住地
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="input"
          >
            <option value="">都道府県を選択</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            placeholder="市区町村（例：渋谷区）"
            maxLength={50}
          />
        </div>
      </div>

      {/* 電話番号 */}
      <div>
        <label className="label flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          電話番号
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
          placeholder="例：090-1234-5678"
          maxLength={15}
        />
        <p className="text-xs text-gray-400 mt-1">※ シッターとの連絡用として使用されます</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          プロフィールを保存しました
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
        ) : (
          '変更を保存する'
        )}
      </button>
    </form>
  )
}
