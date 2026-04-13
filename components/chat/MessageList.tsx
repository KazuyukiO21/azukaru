'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface MessageListProps {
  conversations: any[]
  selectedConversation: any | null
  initialMessages: any[]
  currentUserId: string
}

export default function MessageList({
  conversations,
  selectedConversation,
  initialMessages,
  currentUserId,
}: MessageListProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Supabase Realtime でリアルタイム受信
  useEffect(() => {
    if (!selectedConversation) return

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          // 送信者情報を取得
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', payload.new.sender_id)
            .single()

          const newMsg = { ...(payload.new as any), sender }
          setMessages((prev) => {
            // 重複チェック
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    // 楽観的UI更新
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: null,
    }
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error('送信に失敗しました')
      }

      const { message } = await response.json()

      // 楽観的メッセージを実際のメッセージに置換
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? { ...message, sender: null } : m))
      )
    } catch {
      // エラー時は楽観的メッセージを削除
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const getConversationPartner = (conv: any) => {
    if (conv.owner_id === currentUserId) {
      return conv.sitter?.profile || { display_name: '相手', avatar_url: null }
    }
    return conv.owner || { display_name: '相手', avatar_url: null }
  }

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-8">
      <div className="bg-white rounded-none sm:rounded-2xl border border-gray-100 overflow-hidden flex h-[calc(100vh-80px)] sm:h-[calc(100vh-140px)]">
        {/* 会話一覧 */}
        <div
          className={`w-full sm:w-80 border-r border-gray-100 flex flex-col ${
            selectedConversation ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900">メッセージ</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                まだメッセージがありません
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = getConversationPartner(conv)
                const lastMsg = conv.messages?.[conv.messages.length - 1]
                const unreadCount = conv.messages?.filter(
                  (m: any) => !m.is_read && m.sender_id !== currentUserId
                ).length || 0
                const isSelected = selectedConversation?.id === conv.id

                return (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/messages?conv=${conv.id}`)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-warm-50 transition-colors text-left ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    {partner.avatar_url ? (
                      <img
                        src={partner.avatar_url}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-primary-700 font-bold">
                          {partner.display_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {partner.display_name}
                        </span>
                        {lastMsg && (
                          <span className="text-xs text-gray-400 shrink-0 ml-2">
                            {format(new Date(lastMsg.created_at), 'M/d', { locale: ja })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {lastMsg?.content || 'メッセージを送ってみましょう'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* メッセージ本文 */}
        <div
          className={`flex-1 flex flex-col ${
            selectedConversation ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* ヘッダー */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => router.push('/messages')}
                  className="sm:hidden text-gray-500 mr-1"
                >
                  ←
                </button>
                {(() => {
                  const partner = getConversationPartner(selectedConversation)
                  return (
                    <>
                      {partner.avatar_url ? (
                        <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-bold text-sm">
                            {partner.display_name?.[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{partner.display_name}</span>
                    </>
                  )
                })()}
              </div>

              {/* メッセージ一覧 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && msg.sender?.avatar_url && (
                        <img src={msg.sender.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-primary-500 text-white rounded-br-sm'
                            : 'bg-warm-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: ja })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 送信フォーム */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="input flex-1"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary p-3 aspect-square flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-14 h-14 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">会話を選択してください</p>
              <p className="text-gray-400 text-sm mt-1">
                シッターのページから最初のメッセージを送れます
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
