'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, PawPrint, Calendar,
  Star, MessageSquare, LogOut, ShieldCheck,
} from 'lucide-react'

const NAV = [
  { href: '/admin',                  label: '概要',         icon: LayoutDashboard },
  { href: '/admin/users',            label: 'ユーザー管理',   icon: Users },
  { href: '/admin/sitters',          label: 'シッター管理',   icon: PawPrint },
  { href: '/admin/verifications',    label: '本人確認審査',   icon: ShieldCheck },
  { href: '/admin/bookings',         label: '予約・売上',     icon: Calendar },
  { href: '/admin/messages',         label: 'メッセージ監視', icon: MessageSquare },
  { href: '/admin/reviews',          label: 'レビュー管理',   icon: Star },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      {/* ロゴ */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">アズカル</p>
          <p className="text-gray-500 text-xs">管理画面</p>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className="px-3 pb-5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          サービスに戻る
        </Link>
      </div>
    </aside>
  )
}
