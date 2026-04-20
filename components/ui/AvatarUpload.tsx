'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  currentUrl: string | null
  displayName: string
  onUpload?: (url: string) => void
}

export default function AvatarUpload({ userId, currentUrl, displayName, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    setError(null)
    setUploading(true)

    // ローカルプレビューを即時表示
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`

      // Supabase Storage にアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // profiles テーブルの avatar_url を更新
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!res.ok) throw new Error('プロフィールの更新に失敗しました')

      setPreview(publicUrl)
      onUpload?.(publicUrl)
    } catch {
      setError('アップロードに失敗しました。もう一度お試しください')
      setPreview(currentUrl)
    } finally {
      setUploading(false)
    }
  }

  const initials = displayName?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group"
        aria-label="プロフィール写真を変更"
      >
        {/* アバター */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ring-4 ring-white shadow-md">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="プロフィール写真" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary-600">{initials}</span>
          )}
        </div>

        {/* ホバーオーバーレイ */}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white" />
          }
        </div>
      </button>

      <p className="text-xs text-gray-400">
        {uploading ? 'アップロード中...' : 'クリックして写真を変更'}
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
