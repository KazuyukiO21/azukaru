'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Star, Navigation } from 'lucide-react'
import Link from 'next/link'
import { getPrefectureCoords, jitterCoords } from '@/lib/prefecture-coords'

// Leaflet を動的インポート（SSR 非対応のため）
import dynamic from 'next/dynamic'

interface SitterMapProps {
  sitters: any[]
}

const SERVICE_LABELS: Record<string, string> = {
  boarding: '宿泊預かり',
  daycare: '日中預かり',
  walking: '散歩代行',
  drop_in: '訪問ケア',
  grooming: 'トリミング',
}

// ─── 地図本体（Leaflet 依存部分）─────────────────────────────────────────
function MapInner({ sitters }: SitterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const [selectedSitter, setSelectedSitter] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Leaflet を動的に import
    import('leaflet').then((L) => {
      // デフォルトアイコン修正（webpack 環境での画像パス問題）
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // マップ初期化（日本中心）
      const map = L.map(mapRef.current!, {
        center: [36.2048, 138.2529],
        zoom: 6,
        zoomControl: true,
      })
      leafletMapRef.current = map

      // OpenStreetMap タイル
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      // ブランドカラーのカスタムマーカーアイコン
      const createSitterIcon = (verified: boolean) =>
        L.divIcon({
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
          html: `<div style="
            width:36px;height:36px;
            background:${verified ? '#cf7a2f' : '#9ca3af'};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
          "></div>`,
        })

      // シッターのマーカーを配置
      sitters.forEach((sitter) => {
        const prefecture = sitter.profile?.prefecture
        if (!prefecture) return

        const base = getPrefectureCoords(prefecture)
        if (!base) return

        const { lat, lng } = jitterCoords(base.lat, base.lng, sitter.user_id || sitter.id)
        const verified = sitter.stripe_onboarding_complete
        const icon = createSitterIcon(verified)

        const marker = L.marker([lat, lng], { icon }).addTo(map)

        marker.on('click', () => {
          setSelectedSitter(sitter)
        })
      })
    })

    // クリーンアップ
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [sitters])

  // 現在地に移動
  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocating(false)
        if (leafletMapRef.current) {
          import('leaflet').then((L) => {
            leafletMapRef.current.setView([latitude, longitude], 10, { animate: true })

            // 現在地マーカー
            const currentIcon = L.divIcon({
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              html: `<div style="
                width:18px;height:18px;
                background:#3b82f6;
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 0 0 4px rgba(59,130,246,0.3);
              "></div>`,
            })
            L.marker([latitude, longitude], { icon: currentIcon })
              .addTo(leafletMapRef.current)
              .bindPopup('現在地')
          })
        }
      },
      () => setLocating(false)
    )
  }

  const minPrice = (sitter: any) => {
    const prices = [
      sitter.price_per_night,
      sitter.price_per_day,
      sitter.price_per_walk,
      sitter.price_drop_in,
    ].filter(Boolean)
    return prices.length ? Math.min(...prices) : null
  }

  return (
    <div className="relative w-full" style={{ height: '600px' }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* 地図本体 */}
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* 現在地ボタン */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute top-3 right-3 z-[999] bg-white shadow-md rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-warm-50 transition-colors disabled:opacity-50"
      >
        <Navigation className={`w-4 h-4 text-primary-500 ${locating ? 'animate-pulse' : ''}`} />
        {locating ? '取得中…' : '現在地'}
      </button>

      {/* 凡例 */}
      <div className="absolute bottom-6 left-3 z-[999] bg-white rounded-xl shadow-md px-3 py-2 text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#cf7a2f' }} />
          本人確認済みシッター
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block bg-gray-400" />
          シッター
        </div>
      </div>

      {/* シッター選択パネル */}
      {selectedSitter && (
        <div className="absolute top-3 left-3 z-[999] w-72 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ヘッダー画像 */}
          <div className="relative h-28 bg-warm-100">
            {selectedSitter.gallery_urls?.[0] ? (
              <img
                src={selectedSitter.gallery_urls[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-warm-300" />
              </div>
            )}
            <button
              onClick={() => setSelectedSitter(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-gray-400 hover:text-gray-700 text-sm font-bold"
            >
              ✕
            </button>
            {/* アバター */}
            <div className="absolute -bottom-5 left-3">
              {selectedSitter.profile?.avatar_url ? (
                <img
                  src={selectedSitter.profile.avatar_url}
                  alt={selectedSitter.profile?.display_name}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center shadow">
                  <span className="text-primary-700 font-bold text-sm">
                    {selectedSitter.profile?.display_name?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 情報 */}
          <div className="pt-7 px-4 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  {selectedSitter.profile?.display_name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {selectedSitter.profile?.prefecture}
                  {selectedSitter.profile?.city ? ` ${selectedSitter.profile.city}` : ''}
                </p>
              </div>
              {selectedSitter.review_count > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold">{Number(selectedSitter.rating).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({selectedSitter.review_count})</span>
                </div>
              )}
            </div>

            {/* サービス */}
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSitter.services?.slice(0, 3).map((s: string) => (
                <span key={s} className="badge bg-primary-50 text-primary-700 text-xs">
                  {SERVICE_LABELS[s] || s}
                </span>
              ))}
            </div>

            {/* 料金 */}
            {minPrice(selectedSitter) && (
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-gray-900 font-bold text-base">
                  ¥{minPrice(selectedSitter)!.toLocaleString()}
                </span>{' '}
                〜 / 回
              </p>
            )}

            <Link
              href={`/sitters/${selectedSitter.user_id}`}
              className="btn-primary w-full text-center block mt-3 text-sm py-2"
            >
              プロフィールを見る
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SitterMap({ sitters }: SitterMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="w-full rounded-2xl bg-warm-100 flex items-center justify-center"
        style={{ height: '600px' }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-warm-400 animate-pulse" />
          <p className="text-sm">地図を読み込み中…</p>
        </div>
      </div>
    )
  }

  return <MapInner sitters={sitters} />
}
