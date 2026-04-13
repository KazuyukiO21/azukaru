'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import type { SitterProfile } from '@/types'

const SERVICES = [
  { id: 'boarding', label: '宿泊預かり', icon: '🏠', desc: 'お泊まりで預かります', priceLabel: '1泊あたり', unit: '泊' },
  { id: 'daycare',  label: '日中預かり', icon: '☀️', desc: '日中だけ預かります',  priceLabel: '1日あたり', unit: '日' },
  { id: 'walking',  label: '散歩代行',   icon: '🦮', desc: 'お散歩に連れて行きます', priceLabel: '1回あたり', unit: '回' },
  { id: 'drop_in',  label: '訪問ケア',   icon: '🚪', desc: '自宅に訪問してケアします', priceLabel: '1回あたり', unit: '回' },
]

const PET_TYPES = [
  { id: 'dog',          label: '犬',    icon: '🐶' },
  { id: 'cat',          label: '猫',    icon: '🐱' },
  { id: 'small_animal', label: '小動物', icon: '🐹' },
  { id: 'bird',         label: '鳥',    icon: '🐦' },
  { id: 'reptile',      label: '爬虫類', icon: '🦎' },
  { id: 'other',        label: 'その他', icon: '🐾' },
]

const HOME_TYPES = [
  { id: 'apartment', label: 'マンション・アパート' },
  { id: 'house',     label: '一戸建て' },
  { id: 'other',     label: 'その他' },
]

interface Props {
  sitterProfile: SitterProfile | null
  bio: string | null
  isActive: boolean
}

export default function SitterProfileEditForm({ sitterProfile, bio, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 基本情報
  const [bioText, setBioText] = useState(bio ?? '')
  const [publicVisible, setPublicVisible] = useState(isActive)

  // サービス & ペット
  const [services, setServices] = useState<string[]>(sitterProfile?.services ?? [])
  const [petTypes, setPetTypes] = useState<string[]>(sitterProfile?.pet_types ?? [])

  // 料金
  const [prices, setPrices] = useState({
    boarding: sitterProfile?.price_per_night?.toString() ?? '',
    daycare:  sitterProfile?.price_per_day?.toString()   ?? '',
    walking:  sitterProfile?.price_per_walk?.toString()  ?? '',
    drop_in:  sitterProfile?.price_drop_in?.toString()   ?? '',
  })

  // 環境
  const [maxPets,             setMaxPets]             = useState(sitterProfile?.max_pets?.toString() ?? '1')
  const [homeType,            setHomeType]            = useState(sitterProfile?.home_type ?? '')
  const [hasYard,             setHasYard]             = useState(sitterProfile?.has_yard ?? false)
  const [acceptsUnvaccinated, setAcceptsUnvaccinated] = useState(sitterProfile?.accepts_unvaccinated ?? false)
  const [experienceYears,     setExperienceYears]     = useState(sitterProfile?.experience_years?.toString() ?? '')

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])

  const handleSave = async () => {
    if (services.length === 0) { setError('サービスを1つ以上選択してください'); return }
    if (petTypes.length === 0)  { setError('対応ペットを1つ以上選択してください'); return }

    for (const svc of services) {
      const priceKey = svc as keyof typeof prices
      if (!prices[priceKey] || Number(prices[priceKey]) < 500) {
        const s = SERVICES.find((s) => s.id === svc)
        setError(`${s?.label}の料金を500円以上で入力してください`)
        return
      }
    }

    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = {
      services,
      pet_types: petTypes,
      bio: bioText,
      max_pets: Number(maxPets),
      home_type: homeType || null,
      has_yard: hasYard,
      accepts_unvaccinated: acceptsUnvaccinated,
      experience_years: experienceYears ? Number(experienceYears) : null,
      is_active: publicVisible,
    }
    if (services.includes('boarding') && prices.boarding) body.price_per_night = Number(prices.boarding)
    if (services.includes('daycare')  && prices.daycare)  body.price_per_day   = Number(prices.daycare)
    if (services.includes('walking')  && prices.walking)  body.price_per_walk  = Number(prices.walking)
    if (services.includes('drop_in')  && prices.drop_in)  body.price_drop_in   = Number(prices.drop_in)

    const res = await fetch('/api/sitter-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || '保存に失敗しました')
      setLoading(false)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-8">

      {/* 公開設定バナー */}
      <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 ${publicVisible ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {publicVisible
            ? <Eye className="w-5 h-5 text-green-600 shrink-0" />
            : <EyeOff className="w-5 h-5 text-gray-400 shrink-0" />
          }
          <div>
            <p className={`font-semibold text-sm ${publicVisible ? 'text-green-800' : 'text-gray-600'}`}>
              {publicVisible ? '公開中：シッター一覧に表示されています' : '非公開：シッター一覧に表示されていません'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">いつでも切り替えられます</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPublicVisible(!publicVisible)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${publicVisible ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${publicVisible ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* 自己紹介 */}
      <section className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">自己紹介</h2>
        <p className="text-sm text-gray-500 mb-4">ペットとの経験、得意なこと、どんな環境で預かるかなどを書きましょう</p>
        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          className="input min-h-[140px] resize-y"
          placeholder="例）犬を2頭飼っており、犬の扱いには慣れています。一軒家で庭もあるので、のびのびとお世話できます。散歩は毎朝欠かさず行っています。"
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{bioText.length} / 500文字</p>
      </section>

      {/* サービス */}
      <section className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">提供するサービス</h2>
        <p className="text-sm text-gray-500 mb-4">複数選択できます</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((svc) => {
            const active = services.includes(svc.id)
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => toggle(services, setServices, svc.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  active ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{svc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${active ? 'text-primary-700' : 'text-gray-800'}`}>{svc.label}</p>
                  <p className="text-xs text-gray-400">{svc.desc}</p>
                </div>
                {active && <Check className="w-4 h-4 text-primary-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* 料金 */}
      {services.length > 0 && (
        <section className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">料金設定</h2>
          <p className="text-sm text-gray-500 mb-4">手数料15%を引いた金額がお支払いされます</p>
          <div className="space-y-4">
            {SERVICES.filter((s) => services.includes(s.id)).map((svc) => {
              const priceKey = svc.id as keyof typeof prices
              const price = prices[priceKey]
              return (
                <div key={svc.id} className="bg-warm-50 rounded-xl p-4">
                  <label className="label text-sm">
                    {svc.icon} {svc.label}（{svc.priceLabel}）
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">¥</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrices({ ...prices, [priceKey]: e.target.value })}
                      className="input"
                      placeholder="例：3000"
                      min={500}
                      max={500000}
                    />
                    <span className="text-gray-400 text-sm shrink-0">/ {svc.unit}</span>
                  </div>
                  {price && Number(price) >= 500 && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      受取額：¥{Math.round(Number(price) * 0.85).toLocaleString()} /
                      プラットフォーム手数料：¥{Math.round(Number(price) * 0.15).toLocaleString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 対応ペット */}
      <section className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">対応できるペット</h2>
        <p className="text-sm text-gray-500 mb-4">複数選択できます</p>
        <div className="flex flex-wrap gap-2">
          {PET_TYPES.map((pet) => {
            const active = petTypes.includes(pet.id)
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => toggle(petTypes, setPetTypes, pet.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                  active ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{pet.icon}</span>
                {pet.label}
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* 受け入れ環境 */}
      <section className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">受け入れ環境</h2>
        <div className="space-y-5">
          <div>
            <label className="label">住居タイプ</label>
            <div className="grid grid-cols-3 gap-2">
              {HOME_TYPES.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHomeType(h.id)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    homeType === h.id ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">最大預かり頭数</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={maxPets}
                onChange={(e) => setMaxPets(e.target.value)}
                className="input w-24"
                min={1}
                max={10}
              />
              <span className="text-gray-500 text-sm">頭まで</span>
            </div>
          </div>

          <div>
            <label className="label">経験年数</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="input w-24"
                min={0}
                max={50}
                placeholder="0"
              />
              <span className="text-gray-500 text-sm">年</span>
            </div>
          </div>

          <div className="space-y-3">
            <label
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-warm-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">庭・屋外スペースあり</p>
                <p className="text-xs text-gray-400">大型犬の預かりにも対応しやすくなります</p>
              </div>
              <input
                type="checkbox"
                checked={hasYard}
                onChange={(e) => setHasYard(e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
            </label>

            <label
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-warm-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">ワクチン未接種のペットも受け入れ可</p>
                <p className="text-xs text-gray-400">子犬・子猫など未接種のペットも預かれる場合</p>
              </div>
              <input
                type="checkbox"
                checked={acceptsUnvaccinated}
                onChange={(e) => setAcceptsUnvaccinated(e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
            </label>
          </div>
        </div>
      </section>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-8"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
          ) : saved ? (
            <><Check className="w-4 h-4" />保存しました！</>
          ) : (
            <><Save className="w-4 h-4" />プロフィールを保存する</>
          )}
        </button>
        {saved && <p className="text-sm text-green-600 font-medium">変更が保存されました ✓</p>}
      </div>
    </div>
  )
}
