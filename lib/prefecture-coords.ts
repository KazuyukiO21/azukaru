// 都道府県名 → 緯度経度マッピング（地図表示用）
export const PREFECTURE_COORDS: Record<string, { lat: number; lng: number }> = {
  '北海道':   { lat: 43.0642, lng: 141.3469 },
  '青森県':   { lat: 40.8245, lng: 140.7400 },
  '岩手県':   { lat: 39.7036, lng: 141.1527 },
  '宮城県':   { lat: 38.2688, lng: 140.8721 },
  '秋田県':   { lat: 39.7186, lng: 140.1024 },
  '山形県':   { lat: 38.2404, lng: 140.3634 },
  '福島県':   { lat: 37.7503, lng: 140.4675 },
  '茨城県':   { lat: 36.3418, lng: 140.4468 },
  '栃木県':   { lat: 36.5658, lng: 139.8836 },
  '群馬県':   { lat: 36.3906, lng: 139.0604 },
  '埼玉県':   { lat: 35.8572, lng: 139.6489 },
  '千葉県':   { lat: 35.6074, lng: 140.1065 },
  '東京都':   { lat: 35.6762, lng: 139.6503 },
  '神奈川県': { lat: 35.4473, lng: 139.6425 },
  '新潟県':   { lat: 37.9161, lng: 139.0364 },
  '富山県':   { lat: 36.6953, lng: 137.2114 },
  '石川県':   { lat: 36.5944, lng: 136.6256 },
  '福井県':   { lat: 36.0652, lng: 136.2216 },
  '山梨県':   { lat: 35.6642, lng: 138.5686 },
  '長野県':   { lat: 36.6513, lng: 138.1810 },
  '岐阜県':   { lat: 35.3912, lng: 136.7223 },
  '静岡県':   { lat: 34.9769, lng: 138.3831 },
  '愛知県':   { lat: 35.1802, lng: 136.9066 },
  '三重県':   { lat: 34.7303, lng: 136.5086 },
  '滋賀県':   { lat: 35.0045, lng: 135.8686 },
  '京都府':   { lat: 35.0116, lng: 135.7681 },
  '大阪府':   { lat: 34.6937, lng: 135.5022 },
  '兵庫県':   { lat: 34.6913, lng: 135.1830 },
  '奈良県':   { lat: 34.6851, lng: 135.8328 },
  '和歌山県': { lat: 34.2260, lng: 135.1675 },
  '鳥取県':   { lat: 35.5036, lng: 134.2383 },
  '島根県':   { lat: 35.4723, lng: 133.0505 },
  '岡山県':   { lat: 34.6618, lng: 133.9344 },
  '広島県':   { lat: 34.3963, lng: 132.4596 },
  '山口県':   { lat: 34.1860, lng: 131.4705 },
  '徳島県':   { lat: 34.0658, lng: 134.5593 },
  '香川県':   { lat: 34.3401, lng: 134.0434 },
  '愛媛県':   { lat: 33.8416, lng: 132.7657 },
  '高知県':   { lat: 33.5597, lng: 133.5311 },
  '福岡県':   { lat: 33.6064, lng: 130.4181 },
  '佐賀県':   { lat: 33.2494, lng: 130.2989 },
  '長崎県':   { lat: 32.7447, lng: 129.8738 },
  '熊本県':   { lat: 32.7898, lng: 130.7417 },
  '大分県':   { lat: 33.2382, lng: 131.6126 },
  '宮崎県':   { lat: 31.9111, lng: 131.4239 },
  '鹿児島県': { lat: 31.5602, lng: 130.5581 },
  '沖縄県':   { lat: 26.2124, lng: 127.6792 },
}

// 都道府県名から座標を取得（部分一致対応）
export function getPrefectureCoords(prefecture: string): { lat: number; lng: number } | null {
  // 完全一致
  if (PREFECTURE_COORDS[prefecture]) return PREFECTURE_COORDS[prefecture]
  // 部分一致（「東京」→「東京都」等）
  const key = Object.keys(PREFECTURE_COORDS).find((k) => k.includes(prefecture) || prefecture.includes(k))
  return key ? PREFECTURE_COORDS[key] : null
}

// 座標に小さなランダムオフセットを加えて重複マーカーを分散させる
export function jitterCoords(lat: number, lng: number, seed: string): { lat: number; lng: number } {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const jitter = 0.04
  return {
    lat: lat + ((hash % 100) / 100 - 0.5) * jitter,
    lng: lng + (((hash * 7) % 100) / 100 - 0.5) * jitter,
  }
}
