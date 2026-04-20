import Link from 'next/link'
import { Star, MapPin, PawPrint, Check } from 'lucide-react'
import type { SitterProfile } from '@/types'

const SERVICE_LABELS: Record<string, string> = {
  boarding: '宿泊預かり',
  daycare: '日中預かり',
  walking: '散歩代行',
  drop_in: '訪問ケア',
  grooming: 'トリミング',
}

const PET_TYPE_LABELS: Record<string, string> = {
  dog: '犬',
  cat: '猫',
  small_animal: '小動物',
  bird: '鳥',
  reptile: '爬虫類',
  other: 'その他',
}

interface SitterCardProps {
  sitter: any // SitterProfile with joined profile
}

export default function SitterCard({ sitter }: SitterCardProps) {
  const profile = sitter.profile
  const minPrice = Math.min(
    ...[
      sitter.price_per_night,
      sitter.price_per_day,
      sitter.price_per_walk,
      sitter.price_drop_in,
    ].filter(Boolean)
  )

  return (
    <Link href={`/sitters/${sitter.user_id}`} className="card hover:shadow-md transition-shadow group">
      {/* プロフィール画像エリア */}
      <div className="relative h-48 bg-warm-100 overflow-hidden">
        {sitter.gallery_urls?.[0] ? (
          <img
            src={sitter.gallery_urls[0]}
            alt={`${profile?.display_name}の写真`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PawPrint className="w-12 h-12 text-warm-300" />
          </div>
        )}

        {/* アバター */}
        <div className="absolute bottom-3 left-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-12 h-12 rounded-full border-2 border-white object-cover shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center shadow">
              <span className="text-primary-700 font-bold text-lg">
                {profile?.display_name?.[0] || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Stripe認証バッジ */}
        {sitter.stripe_onboarding_complete && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            本人確認済み
          </div>
        )}
      </div>

      {/* 情報エリア */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900">{profile?.display_name}</h3>
            {profile?.prefecture && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {profile.prefecture}{profile.city ? ` ${profile.city}` : ''}
              </p>
            )}
          </div>
          {sitter.review_count > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-sm">{Number(sitter.rating).toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({sitter.review_count})</span>
            </div>
          )}
        </div>

        {/* 対応ペット */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {sitter.pet_types?.slice(0, 3).map((pet: string) => (
            <span key={pet} className="badge bg-warm-100 text-warm-700">
              {PET_TYPE_LABELS[pet] || pet}
            </span>
          ))}
        </div>

        {/* 提供サービス */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {sitter.services?.slice(0, 2).map((service: string) => (
            <span key={service} className="badge bg-primary-50 text-primary-700">
              {SERVICE_LABELS[service] || service}
            </span>
          ))}
          {sitter.services?.length > 2 && (
            <span className="badge bg-gray-100 text-gray-500">
              +{sitter.services.length - 2}
            </span>
          )}
        </div>

        {/* 料金 */}
        {minPrice && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-sm">¥</span>
            <span className="font-bold text-gray-900 text-lg">
              {minPrice.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">〜 / 回</span>
          </div>
        )}
      </div>
    </Link>
  )
}
