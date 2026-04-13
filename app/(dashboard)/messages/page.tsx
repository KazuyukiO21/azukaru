import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/ui/Header'
import MessageList from '@/components/chat/MessageList'

export const metadata: Metadata = {
  title: 'メッセージ',
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { conv?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/messages')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 会話一覧取得
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      owner:profiles!owner_id(display_name, avatar_url, user_id),
      sitter:sitter_profiles!sitter_id(
        user_id,
        profile:profiles!user_id(display_name, avatar_url)
      ),
      messages(id, content, sender_id, is_read, created_at)
    `)
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  // 選択中の会話のメッセージ取得
  let selectedConversation = null
  let messages = null

  if (searchParams.conv) {
    const { data: conv } = await supabase
      .from('conversations')
      .select(`
        *,
        owner:profiles!owner_id(*),
        sitter:sitter_profiles!sitter_id(
          user_id,
          profile:profiles!user_id(*)
        )
      `)
      .eq('id', searchParams.conv)
      .single()

    selectedConversation = conv

    const { data: msgs } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(display_name, avatar_url)
      `)
      .eq('conversation_id', searchParams.conv)
      .order('created_at', { ascending: true })

    messages = msgs

    // 未読メッセージを既読に
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', searchParams.conv)
      .neq('sender_id', user.id)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Header
        user={profile ? { id: user.id, display_name: profile.display_name, avatar_url: profile.avatar_url } : null}
      />
      <MessageList
        conversations={conversations || []}
        selectedConversation={selectedConversation}
        initialMessages={messages || []}
        currentUserId={user.id}
      />
    </div>
  )
}
