import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { conversation_id, content, recipient_id } = await request.json()

  // 新規会話の場合は作成
  let conversationId = conversation_id
  if (!conversationId && recipient_id) {
    // 既存の会話を検索
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(owner_id.eq.${user.id},sitter_id.eq.${recipient_id}),and(owner_id.eq.${recipient_id},sitter_id.eq.${user.id})`
      )
      .single()

    if (existing) {
      conversationId = existing.id
    } else {
      // プロフィールを確認して owner/sitter を判断
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const isOwner = myProfile?.role === 'owner' || myProfile?.role === 'both'

      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          owner_id: isOwner ? user.id : recipient_id,
          sitter_id: isOwner ? recipient_id : user.id,
        })
        .select()
        .single()

      if (convError || !newConv) {
        return NextResponse.json({ error: '会話の作成に失敗しました' }, { status: 500 })
      }
      conversationId = newConv.id
    }
  }

  // メッセージ送信
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'メッセージの送信に失敗しました' }, { status: 500 })
  }

  // 会話の最終メッセージ時刻を更新
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return NextResponse.json({ message, conversationId })
}
