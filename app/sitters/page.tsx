import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import SittersView from '@/components/sitter/SittersView'

export const metadata: Metadata = {
  title: 'シッターを探す',
}

interface SearchParams {
  service?: string
  pet?: string
  prefecture?: string
  city?: string
  page?: string
}

export default async function SittersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  }

  // シッター検索クエリ
  let query = supabase
    .from('sitter_profiles')
    .select(`
      *,
      profile:profiles!user_id(*)
    `)
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (searchParams.service) {
    query = query.contains('services', [searchParams.service])
  }
  if (searchParams.pet) {
    query = query.contains('pet_types', [searchParams.pet])
  }

  const { data: sitters, error } = await query.limit(48)

  const sittersData = error ? [] : (sitters ?? [])

  return (
    <div className="min-h-screen bg-warm-50">
      <Header
        user={
          profile
            ? { id: user!.id, display_name: profile.display_name, avatar_url: profile.avatar_url }
            : null
        }
      />
      <SittersView
        sitters={sittersData}
        searchParams={searchParams}
        totalCount={sittersData.length}
      />
    </div>
  )
}
