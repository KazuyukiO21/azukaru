import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ChevronRight, Calendar, PawPrint } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import BookingActions from './BookingActions'

export const metadata: Metadata = { title: '予約管理' }

const STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: '確認待ち', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確定',     cls: 'bg-green-100  text-green-700'  },
  completed: { label: '完了',     cls: 'bg-blue-100   text-blue-700'   },
  cancelled: { label: 'キャンセル', cls: 'bg-red-100  text-red-600'    },
}

const SERVICE_LABELS: Record<string, string> = {
  boarding: '宿泊預かり', daycare: '日中預かり',
  walking: '散歩代行',   drop_in: '訪問ケア', grooming: 'トリミング',
}

export default async function BookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/bookings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const isSitter = ['sitter', 'both'].includes(profile.role)

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      owner:profiles!owner_id(display_name, avatar_url),
      sitter:sitter_profiles!sitter_id(
        user_id,
        profile:profiles!user_id(display_name, avatar_url)
      )
    `)
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const tabs = isSitter
    ? [
        { label: 'シッターとして受けた予約', filter: (b: any) => b.sitter_id === user.id },
        { label: '飼い主として依頼した予約', filter: (b: any) => b.owner_id === user.id },
      ]
    : [{ label: '依頼した予約', filter: (b: any) => b.owner_id === user.id }]

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={{ id: user.id, display_name: profile.display_name, avatar_url: profile.avatar_url }} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/dashboard" className="hover:text-gray-600">ダッシュボード</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700">予約管理</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">予約管理</h1>

        {tabs.map((tab) => {
          const filtered = (bookings ?? []).filter(tab.filter)
          return (
            <div key={tab.label} className="mb-10">
              {isSitter && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{tab.label}</h2>
              )}

              {filtered.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">
                  <PawPrint className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">まだ予約がありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((booking: any) => {
                    const role = booking.sitter_id === user.id ? 'sitter' : 'owner'
                    const otherPerson = role === 'sitter'
                      ? booking.owner
                      : (booking.sitter?.profile ?? null)
                    const st = STATUS[booking.status] ?? STATUS.pending

                    return (
                      <div key={booking.id} className="card p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {otherPerson?.avatar_url ? (
                              <img src={otherPerson.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                                {otherPerson?.display_name?.[0] ?? '?'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {role === 'sitter' ? '飼い主：' : 'シッター：'}
                                {otherPerson?.display_name ?? '—'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.pet_name}（{SERVICE_LABELS[booking.service_type] ?? booking.service_type}）
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.start_date), 'M月d日(E)', { locale: ja })}
                          {booking.end_date !== booking.start_date && (
                            <> 〜 {format(new Date(booking.end_date), 'M月d日(E)', { locale: ja })}</>
                          )}
                          <span className="ml-auto font-semibold text-gray-800">
                            ¥{booking.total_amount.toLocaleString()}
                          </span>
                        </div>

                        {booking.message && (
                          <p className="mt-2 text-sm text-gray-500 bg-warm-50 rounded-lg px-3 py-2 line-clamp-2">
                            {booking.message}
                          </p>
                        )}

                        <BookingActions
                          bookingId={booking.id}
                          role={role}
                          currentStatus={booking.status}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
