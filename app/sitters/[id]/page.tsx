import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import BookingForm from '@/components/booking/BookingForm'
import { Star, MapPin, Check, PawPrint, Home, Shield } from 'lucide-react'

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', params.id)
    .single()

  return {
    title: profile ? `${profile.display_name}のプロフィール` : 'シッター詳細',
  }
}

export default async function SitterDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    currentProfile = data
  }

  // シッター情報取得
  const { data: sitter } = await supabase
    .from('sitter_profiles')
    .select(`*, profile:profiles!user_id(*)`)
    .eq('user_id', params.id)
    .single()

  if (!sitter || !sitter.is_active) {
    notFound()
  }

  const profile = sitter.profile as any

  // レビュー取得
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles!reviewer_id(display_name, avatar_url)`)
    .eq('reviewee_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={currentProfile ? { id: user!.id, display_name: currentProfile.display_name, avatar_url: currentProfile.avatar_url } : null} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム：シッター情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* プロフィールカード */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-primary-700 font-bold text-2xl">
                      {profile?.display_name?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.display_name}</h1>
                    {sitter.stripe_onboarding_complete && (
                      <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        本人確認済み
                      </span>
                    )}
                  </div>
                  {profile?.prefecture && (
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {profile.prefecture}{profile.city ? ` ${profile.city}` : ''}
                    </p>
                  )}
                  {sitter.review_count > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i <= Math.round(sitter.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{Number(sitter.rating).toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({sitter.review_count}件のレビュー)</span>
                    </div>
                  )}
                </div>
              </div>

              {profile?.bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* 提供サービス */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">提供サービスと料金</h2>
              <div className="space-y-3">
                {sitter.services?.includes('boarding') && sitter.price_per_night && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{SERVICE_LABELS.boarding}</span>
                    <span className="font-semibold">¥{sitter.price_per_night.toLocaleString()} / 泊</span>
                  </div>
                )}
                {sitter.services?.includes('daycare') && sitter.price_per_day && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{SERVICE_LABELS.daycare}</span>
                    <span className="font-semibold">¥{sitter.price_per_day.toLocaleString()} / 日</span>
                  </div>
                )}
                {sitter.services?.includes('walking') && sitter.price_per_walk && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{SERVICE_LABELS.walking}</span>
                    <span className="font-semibold">¥{sitter.price_per_walk.toLocaleString()} / 回</span>
                  </div>
                )}
                {sitter.services?.includes('drop_in') && sitter.price_drop_in && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700">{SERVICE_LABELS.drop_in}</span>
                    <span className="font-semibold">¥{sitter.price_drop_in.toLocaleString()} / 回</span>
                  </div>
                )}
              </div>
            </div>

            {/* 対応情報 */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">対応情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">対応ペット</p>
                  <div className="flex flex-wrap gap-2">
                    {sitter.pet_types?.map((pet: string) => (
                      <span key={pet} className="badge bg-warm-100 text-warm-700">
                        {PET_TYPE_LABELS[pet] || pet}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">最大預かり頭数</p>
                  <p className="font-semibold">{sitter.max_pets}頭まで</p>
                </div>
                {sitter.home_type && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">住居タイプ</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {sitter.home_type === 'house' ? '一軒家' : 'マンション・アパート'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-2">庭</p>
                  <p className="font-semibold">{sitter.has_yard ? 'あり' : 'なし'}</p>
                </div>
                {sitter.experience_years && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">経験年数</p>
                    <p className="font-semibold">{sitter.experience_years}年</p>
                  </div>
                )}
              </div>
              {sitter.certifications?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">資格・認定</p>
                  <div className="flex flex-wrap gap-2">
                    {sitter.certifications.map((cert: string) => (
                      <span key={cert} className="badge bg-blue-50 text-blue-700 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* レビュー */}
            {reviews && reviews.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  レビュー ({sitter.review_count}件)
                </h2>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        {review.reviewer?.avatar_url ? (
                          <img src={review.reviewer.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {review.reviewer?.display_name?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{review.reviewer?.display_name}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右カラム：予約フォーム */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm
                sitter={sitter}
                currentUserId={user?.id || null}
                isOwner={currentProfile?.role === 'owner' || currentProfile?.role === 'both'}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
