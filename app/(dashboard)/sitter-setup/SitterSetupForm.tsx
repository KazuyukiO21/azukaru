'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PawPrint, Home, DollarSign, Star, ChevronRight, ChevronLeft,
  Check, Loader2, Dog, Cat, Bird, Rabbit,
} from 'lucide-react'
import type { SitterProfile } from '@/types'

// ─── 定数 ────────────────────────────────────────────────────
const SERVICES = [
  { id: 'boarding', label: '🏠 宿泊預かり', desc: 'お泊まりで預かります' },
  { id: 'daycare',  label: '☀️ 日中預かり',  desc: '日中だけ預かります' },
  { id: 'walking',  label: '🦮 散歩代行',    desc: 'お散歩に連れて行きます' },
  { id: 'drop_in',  label: '🚪 訪問ケア',    desc: '自宅に訪問してケアします' },
]

const PET_TYPES = [
  { id: 'dog',          label: '犬',   icon: '🐶' },
  { id: 'cat',          label: '猫',   icon: '🐱' },
  { id: 'small_animal', label: '小動物', icon: '🐹' },
  { id: 'bird',         label: '鳥',   icon: '🐦' },
  { id: 'reptile',      label: '爬虫類', icon: '🦎' },
  { id: 'other',        label: 'その他', icon: '🐾' },
]

const STEPS = [
  { id: 1, label: 'サービス',   icon: PawPrint },
  { id: 2, label: '料金',       icon: DollarSign },
  { id: 3, label: '環境',       icon: Home },
  { id: 4, label: '確認',       icon: Star },
]

// ─── コンポーネント ──────────────────────────────────────────
interface Props {
  sitterProfile: SitterProfile | null
  bio: string | null
}

export default function SitterSetupForm({ sitterProfile, bio }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [services, setServices] = useState<string[]>(sitterProfile?.services ?? [])
  const [petTypes, setPetTypes] = useState<string[]>(sitterProfile?.pet_types ?? [])
  const [bioText, setBioText] = useState(bio ?? '')

  // Step 2
  const [pricePerNight, setPricePerNight] = useState(sitterProfile?.price_per_night?.toString() ?? '')
  const [pricePerDay,   setPricePerDay]   = useState(sitterProfile?.price_per_day?.toString()   ?? '')
  const [pricePerWalk,  setPricePerWalk]  = useState(sitterProfile?.price_per_walk?.toString()  ?? '')
  const [priceDropIn,   setPriceDropIn]   = useState(sitterProfile?.price_drop_in?.toString()   ?? '')

  // Step 3
  const [maxPets,             setMaxPets]             = useState(sitterProfile?.max_pets?.toString() ?? '1')
  const [homeType,            setHomeType]            = useState(sitterProfile?.home_type ?? '')
  const [hasYard,             setHasYard]             = useState(sitterProfile?.has_yard ?? false)
  const [acceptsUnvaccinated, setAcceptsUnvaccinated] = useState(sitterProfile?.accepts_unvaccinated ?? false)
  const [experienceYears,     setExperienceYears]     = useState(sitterProfile?.experience_years?.toString() ?? '')

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])
  }

  // ─── バリデーション ────────────────────────────────────────
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (services.length === 0) return 'サービスを1つ以上選択してください'
      if (petTypes.length === 0)  return '対応ペットを1つ以上選択してください'
    }
    if (s === 2) {
      const needPrice: Record<string, string> = {
        boarding: pricePerNight, daycare: pricePerDay,
        walking: pricePerWalk,   drop_in: priceDropIn,
      }
      for (const svc of services) {
        const val = needPrice[svc]
        if (!val) return `${SERVICES.find((s) => s.id === svc)?.label} の料金を入力してください`
        if (Number(val) < 500 || Number(val) > 500000) return '料金は500円〜500,000円の範囲で設定してください'
      }
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => Math.min(s + 1, 4))
  }

  const handleSubmit = async () => {
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
      is_active: true,
    }
    if (services.includes('boarding') && pricePerNight) body.price_per_night = Number(pricePerNight)
    if (services.includes('daycare')  && pricePerDay)   body.price_per_day   = Number(pricePerDay)
    if (services.includes('walking')  && pricePerWalk)  body.price_per_walk  = Number(pricePerWalk)
    if (services.includes('drop_in')  && priceDropIn)   body.price_drop_in   = Number(priceDropIn)

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

    router.push('/dashboard?setup=done')
    router.refresh()
  }

  // ─── ステッパー UI ────────────────────────────────────────
  const Stepper = () => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done    = step > s.id
        const current = step === s.id
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done    ? 'bg-primary-500 text-white' :
                  current ? 'bg-primary-500 text-white ring-4 ring-primary-100' :
                            'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${current ? 'text-primary-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mb-5 mx-1 transition-colors ${step > s.id ? 'bg-primary-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  // ─── Step 1: サービス & ペット種別 ─────────────────────────
  const Step1 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">提供するサービスを選んでください</h2>
        <p className="text-sm text-gray-500 mb-5">複数選択できます。あとから変更可能です。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((svc) => {
            const active = services.includes(svc.id)
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => toggleItem(services, setServices, svc.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${active ? 'bg-primary-100' : 'bg-gray-50'}`}>
                  {svc.label.split(' ')[0]}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${active ? 'text-primary-700' : 'text-gray-800'}`}>
                    {svc.label.split(' ').slice(1).join(' ')}
                  </p>
                  <p className="text-xs text-gray-400">{svc.desc}</p>
                </div>
                {active && <Check className="w-4 h-4 text-primary-500 ml-auto shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">対応できるペットを選んでください</h2>
        <p className="text-sm text-gray-500 mb-5">複数選択できます。</p>
        <div className="flex flex-wrap gap-2">
          {PET_TYPES.map((pet) => {
            const active = petTypes.includes(pet.id)
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => toggleItem(petTypes, setPetTypes, pet.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                  active
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{pet.icon}</span>
                {pet.label}
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">自己紹介</h2>
        <p className="text-sm text-gray-500 mb-3">ペットとの経験、得意なこと、どんな家で預かるかなど</p>
        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          className="input min-h-[120px] resize-y"
          placeholder="例）犬を2頭飼っており、犬の扱いには慣れています。一軒家で庭もあるので、のびのびとお世話できます。..."
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{bioText.length} / 500</p>
      </div>
    </div>
  )

  // ─── Step 2: 料金設定 ─────────────────────────────────────
  const Step2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">料金を設定してください</h2>
        <p className="text-sm text-gray-500 mb-6">選択したサービスの料金を入力します。手数料15%を引いた金額が振り込まれます。</p>
      </div>

      <div className="space-y-4">
        {services.includes('boarding') && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="label">🏠 宿泊預かり（1泊あたり）</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">¥</span>
              <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)}
                className="input" placeholder="例：3000" min={500} max={500000} />
              <span className="text-gray-400 text-sm shrink-0">/ 泊</span>
            </div>
            {pricePerNight && (
              <p className="text-xs text-gray-400 mt-1">
                シッター受取額：¥{Math.round(Number(pricePerNight) * 0.85).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {services.includes('daycare') && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="label">☀️ 日中預かり（1日あたり）</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">¥</span>
              <input type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)}
                className="input" placeholder="例：2000" min={500} max={500000} />
              <span className="text-gray-400 text-sm shrink-0">/ 日</span>
            </div>
            {pricePerDay && (
              <p className="text-xs text-gray-400 mt-1">
                シッター受取額：¥{Math.round(Number(pricePerDay) * 0.85).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {services.includes('walking') && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="label">🦮 散歩代行（1回あたり）</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">¥</span>
              <input type="number" value={pricePerWalk} onChange={(e) => setPricePerWalk(e.target.value)}
                className="input" placeholder="例：1500" min={500} max={500000} />
              <span className="text-gray-400 text-sm shrink-0">/ 回</span>
            </div>
            {pricePerWalk && (
              <p className="text-xs text-gray-400 mt-1">
                シッター受取額：¥{Math.round(Number(pricePerWalk) * 0.85).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {services.includes('drop_in') && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <label className="label">🚪 訪問ケア（1回あたり）</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">¥</span>
              <input type="number" value={priceDropIn} onChange={(e) => setPriceDropIn(e.target.value)}
                className="input" placeholder="例：2000" min={500} max={500000} />
              <span className="text-gray-400 text-sm shrink-0">/ 回</span>
            </div>
            {priceDropIn && (
              <p className="text-xs text-gray-400 mt-1">
                シッター受取額：¥{Math.round(Number(priceDropIn) * 0.85).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-warm-50 rounded-xl p-4 text-sm text-gray-500">
        💡 近隣シッターの平均は宿泊¥2,500〜¥4,000、散歩¥1,000〜¥2,000程度です。
      </div>
    </div>
  )

  // ─── Step 3: 環境情報 ─────────────────────────────────────
  const Step3 = () => (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">お預かり環境を教えてください</h2>
        <p className="text-sm text-gray-500 mb-6">飼い主が安心して選べるよう、できるだけ詳しく教えてください。</p>
      </div>

      <div>
        <label className="label">最大預かり頭数</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n} type="button"
              onClick={() => setMaxPets(n.toString())}
              className={`w-12 h-12 rounded-xl border-2 font-bold transition-all ${
                maxPets === n.toString()
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {n}
            </button>
          ))}
          <span className="flex items-center text-gray-400 text-sm ml-1">頭</span>
        </div>
      </div>

      <div>
        <label className="label">住居タイプ</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'house',     label: '🏠 一軒家' },
            { id: 'apartment', label: '🏢 マンション・アパート' },
          ].map((h) => (
            <button
              key={h.id} type="button"
              onClick={() => setHomeType(h.id)}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                homeType === h.id
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-100 hover:border-gray-200 text-gray-600'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="label">その他の環境</label>
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer">
          <input
            type="checkbox" checked={hasYard}
            onChange={(e) => setHasYard(e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <div>
            <p className="font-medium text-gray-800 text-sm">庭・専用スペースがある</p>
            <p className="text-xs text-gray-400">犬の場合は特に安心材料になります</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white cursor-pointer">
          <input
            type="checkbox" checked={acceptsUnvaccinated}
            onChange={(e) => setAcceptsUnvaccinated(e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <div>
            <p className="font-medium text-gray-800 text-sm">ワクチン未接種のペットも受け入れ可</p>
            <p className="text-xs text-gray-400">幼齢のペットなどに対応できる場合</p>
          </div>
        </label>
      </div>

      <div>
        <label className="label">ペットシッターとしての経験年数</label>
        <div className="flex items-center gap-3">
          <input
            type="number" value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="input w-28" placeholder="0"
            min={0} max={50}
          />
          <span className="text-gray-500">年</span>
          <span className="text-sm text-gray-400">（0でも大丈夫です）</span>
        </div>
      </div>
    </div>
  )

  // ─── Step 4: 確認画面 ─────────────────────────────────────
  const Step4 = () => {
    const priceMap: Record<string, string> = {
      boarding: pricePerNight ? `¥${Number(pricePerNight).toLocaleString()} / 泊` : '—',
      daycare:  pricePerDay   ? `¥${Number(pricePerDay).toLocaleString()} / 日`   : '—',
      walking:  pricePerWalk  ? `¥${Number(pricePerWalk).toLocaleString()} / 回`  : '—',
      drop_in:  priceDropIn   ? `¥${Number(priceDropIn).toLocaleString()} / 回`   : '—',
    }
    const svcLabel: Record<string, string> = {
      boarding: '🏠 宿泊預かり', daycare: '☀️ 日中預かり',
      walking: '🦮 散歩代行',   drop_in: '🚪 訪問ケア',
    }
    const petLabel: Record<string, string> = {
      dog: '🐶 犬', cat: '🐱 猫', small_animal: '🐹 小動物',
      bird: '🐦 鳥', reptile: '🦎 爬虫類', other: '🐾 その他',
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">内容を確認してください</h2>
          <p className="text-sm text-gray-500 mb-6">保存後もいつでも変更できます。</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">サービス & 料金</p>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s} className="flex justify-between text-sm">
                  <span className="text-gray-700">{svcLabel[s]}</span>
                  <span className="font-semibold text-gray-900">{priceMap[s]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">対応ペット</p>
            <div className="flex flex-wrap gap-2">
              {petTypes.map((p) => (
                <span key={p} className="text-sm bg-warm-50 px-3 py-1 rounded-full text-gray-700">{petLabel[p]}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">環境</p>
            <div className="space-y-1.5 text-sm text-gray-700">
              <p>最大頭数：{maxPets}頭</p>
              {homeType && <p>住居：{homeType === 'house' ? '一軒家' : 'マンション・アパート'}</p>}
              {hasYard && <p>✅ 庭・専用スペースあり</p>}
              {acceptsUnvaccinated && <p>✅ ワクチン未接種OK</p>}
              {experienceYears && <p>経験：{experienceYears}年</p>}
            </div>
          </div>
        </div>

        <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-700">
          🎉 プロフィールを公開すると、飼い主からの予約リクエストが届き始めます。
        </div>
      </div>
    )
  }

  // ─── レンダリング ──────────────────────────────────────────
  return (
    <div>
      <Stepper />

      <div className="min-h-[360px]">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={() => { setError(null); setStep((s) => s - 1) }}
            className="btn-secondary flex items-center gap-1.5 px-5"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />保存中...</>
            ) : (
              <><Check className="w-4 h-4" />プロフィールを公開する</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
