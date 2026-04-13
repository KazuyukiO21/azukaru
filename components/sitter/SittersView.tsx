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
        <p className="text-sm text-gray-500 mb-6">
          {totalCount > 0 ? `${totalCount}件のシッターが見つかりました` : '条件に合うシッターが見つかりませんでした'}
        </p>

        {totalCount === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">条件に合うシッターが見つかりませんでした</p>
            <p className="text-gray-400 text-sm mt-2">検索条件を変えて試してみてください</p>
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
