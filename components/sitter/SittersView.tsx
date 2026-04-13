'use client'

import { useState } from 'react'
import { List, Map, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import SitterCard from './SitterCard'
import SitterSearchForm from './SitterSearchForm'

// SitterMap は SSR 無効で動的読み込み
const SitterMap = dynamic(() => import('./SitterMap'), { ssr: false })

type ViewMode = 'list' | 'map'

interface SittersViewProps {
  sitters: any[]
  searchParams: {
    service?: string
    pet?: string
    prefecture?: string
  }
  totalCount: number
}

export default function SittersView({ sitters, searchParams, totalCount }: SittersViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  return (
    <>
      {/* 検索フォーム + ビュー切り替え */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
              シッターを探す
            </h1>
            {/* ビュー切り替えボタン */}
            <div className="flex items-center gap-1 bg-warm-100 rounded-xl p-1 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                リスト
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                地図
              </button>
            </div>
          </div>
          <SitterSearchForm initialValues={searchParams} />
        </div>
      </div>

      {/* 検索結果 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {totalCount > 0 && (
          <p className="text-sm text-gray-500 mb-6">{totalCount}件のシッターが見つかりました</p>
        )}

        {totalCount === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search className="w-9 h-9 text-primary-400" />
            </div>
            <p className="text-gray-900 text-xl font-bold mb-2">シッターを探してみましょう！</p>
            <p className="text-gray-500 text-sm">あなたのペットにぴったりのシッターがきっと見つかります</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitters.map((sitter: any) => (
              <SitterCard key={sitter.id} sitter={sitter} />
            ))}
          </div>
        ) : (
          <SitterMap sitters={sitters} />
        )}
      </main>
    </>
  )
}
