'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  user?: {
    id: string
    email?: string
    display_name?: string
    avatar_url?: string | null
  } | null
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-9 h-9" />
            <span className="text-xl font-bold text-gray-900">
              アズカル
            </span>
          </Link>

          {/* ナビゲーション（デスクトップ） */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/sitters" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              シッターを探す
            </Link>
            <Link href="/signup" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              シッターになる
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              使い方
            </Link>
          </nav>

          {/* 右側のアクション */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-50 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.display_name || 'アカウント'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-10">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-warm-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        ダッシュボード
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-warm-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Bell className="w-4 h-4" />
                        メッセージ
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-warm-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        プロフィール編集
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary py-2 px-4 text-sm hidden sm:block">
                  ログイン
                </Link>
                <Link href="/signup" className="btn-primary py-2 px-4 text-sm">
                  無料登録
                </Link>
              </>
            )}

            {/* モバイルメニューボタン */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              <Link href="/sitters" className="px-4 py-2.5 text-gray-700 hover:bg-warm-50 rounded-xl">シッターを探す</Link>
              <Link href="/#how-it-works" className="px-4 py-2.5 text-gray-700 hover:bg-warm-50 rounded-xl">使い方</Link>
              <Link href="/signup" className="px-4 py-2.5 text-gray-700 hover:bg-warm-50 rounded-xl">シッターになる</Link>
              {!user && (
                <Link href="/login" className="px-4 py-2.5 text-gray-700 hover:bg-warm-50 rounded-xl">ログイン</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
