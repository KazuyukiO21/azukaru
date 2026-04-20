# アズカル デザインガイド

他スレッドでも参照できるよう、プロジェクトのデザイン仕様をまとめたドキュメントです。

---

## プロジェクト概要

**アズカル** — ペットを預けたい飼い主と、信頼できる個人シッターをつなぐ日本初のペット特化マーケットプレイス。

- **技術スタック**: Next.js (App Router) / TypeScript / Tailwind CSS / Supabase
- **フォント**: Noto Sans JP（Google Fonts）、`font-feature-settings: "palt"` 適用
- **言語**: 日本語UI（`lang="ja"`）

---

## カラーパレット

### Primary（オレンジ〜レッド系）

| トークン | HEX | 用途 |
|---|---|---|
| `primary-50` | `#fef8f0` | 薄い背景、バッジ背景 |
| `primary-100` | `#fdecd8` | ホバー背景、アイコン背景 |
| `primary-500` | `#cf7a2f` | **メインカラー**（ボタン、ロゴ、CTAセクション背景）※ブランドロゴの実測値 |
| `primary-600` | `#b46520` | ボタンホバー |
| `primary-700` | `#93521a` | ボタンアクティブ、テキスト強調 |

### Warm（ベージュ〜ブラウン系）

| トークン | HEX | 用途 |
|---|---|---|
| `warm-50` | `#fdfaf5` | **ページ背景色** |
| `warm-100` | `#faf3e7` | カードプレースホルダー、セカンダリホバー |
| `warm-200` | `#f5e5cd` | ボーダー代わりなど |
| `warm-300` | `#edd1a8` | アイコン（淡い） |
| `warm-700` | `#a86135` | バッジテキスト |

### グレースケール（Tailwindデフォルト）

- 背景: `gray-100`, `gray-50`, `white`
- テキスト: `gray-900`（本文）/ `gray-700`（中間）/ `gray-600`（サブ）/ `gray-500`（ラベル）/ `gray-400`（プレースホルダー・著作権表記）
- ボーダー: `gray-100`〜`gray-200`

---

## タイポグラフィ

- **フォント**: Noto Sans JP（weights: 400 / 500 / 600 / 700）
- 見出し系: `font-bold tracking-tight`（globals.cssにbase設定済み）
- `tracking-tight` で日本語の詰め組み感を実現

### 頻出テキストサイズ

| クラス | 用途 |
|---|---|
| `text-4xl sm:text-5xl font-bold` | ヒーローH1 |
| `text-2xl sm:text-3xl font-bold` | セクションH2 |
| `text-xl font-bold` | ロゴ・カードH3 |
| `text-lg` | 本文・説明文 |
| `text-sm` | ラベル・サブテキスト |
| `text-xs` | 注意書き・著作権 |

---

## レイアウト

- **最大幅**: `max-w-4xl`（テキスト中心）/ `max-w-5xl`（グリッドレイアウト）/ `max-w-6xl`（フル幅ヘッダー・フッター）
- **横余白**: `px-4` または `sm:px-6`
- **セクション縦余白**: `py-16 sm:py-20` または `py-16 sm:py-24`

---

## 共通コンポーネントクラス（globals.css）

### ボタン

```html
<!-- プライマリボタン（CTAメイン） -->
<button class="btn-primary">ボタン</button>
<!-- bg-primary-500, hover:bg-primary-600, text-white, rounded-xl, py-2.5 px-6 -->

<!-- セカンダリボタン（白背景・ボーダー） -->
<button class="btn-secondary">ボタン</button>
<!-- bg-white, border border-gray-200, text-gray-700, rounded-xl -->

<!-- アウトラインボタン -->
<button class="btn-outline">ボタン</button>
<!-- border-2 border-primary-500, text-primary-600, hover:bg-primary-50, rounded-xl -->
```

### カード

```html
<div class="card">...</div>
<!-- bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -->

<!-- ホバー時の影強調 -->
<div class="card hover:shadow-md transition-shadow">...</div>
```

### フォームインプット

```html
<input class="input" />
<!-- w-full px-4 py-3 rounded-xl border border-gray-200 bg-white -->
<!-- focus:ring-2 focus:ring-primary-400 focus:border-transparent -->

<label class="label">ラベル</label>
<!-- text-sm font-medium text-gray-700 mb-1.5 -->
```

### バッジ

```html
<!-- ペット種別（ウォーム系） -->
<span class="badge bg-warm-100 text-warm-700">犬</span>

<!-- サービス種別（プライマリ系） -->
<span class="badge bg-primary-50 text-primary-700">宿泊預かり</span>

<!-- グレー（その他） -->
<span class="badge bg-gray-100 text-gray-500">+2</span>

<!-- base: inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium -->
```

---

## ブランドアイコン（ロゴ画像）

- ファイル: `azukaru_icon.png`（プロジェクトルートに配置）
- 背景透過済みの PNG。円形オレンジ背景に白の肉球マーク＋「アズカル」テキスト
- 画面に配置する際は背景なしでそのまま使用できる
- コード上のロゴ（ヘッダー・ファビコンなど）はこのファイルを参照すること

---

## UIアイコン

**Lucide React** を使用。

頻出アイコン: `PawPrint`, `Shield`, `Star`, `MapPin`, `Check`, `Bell`, `User`, `LogOut`, `Menu`, `X`, `ChevronDown`, `ArrowRight`, `Smartphone`

```tsx
import { PawPrint } from 'lucide-react'
<PawPrint className="w-5 h-5" />
```

---

## UIパターン集

### ロゴ

```html
<div class="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
  <PawPrint class="w-5 h-5 text-white" />
</div>
<span class="text-xl font-bold text-gray-900">アズカル</span>
```

### バッジ付きラベル（ピル型）

```html
<div class="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
  <PawPrint class="w-4 h-4" />
  ペット特化マッチングプラットフォーム
</div>
```

### アイコン付き特徴カード

```html
<div class="card p-6 text-center">
  <div class="w-14 h-14 rounded-2xl {color} flex items-center justify-center mx-auto mb-4">
    <Icon class="w-7 h-7" />
  </div>
  <h3 class="text-lg font-bold text-gray-900 mb-2">タイトル</h3>
  <p class="text-gray-600 text-sm leading-relaxed">説明文</p>
</div>
```

色のバリエーション（アイコン背景）: `text-blue-500 bg-blue-50` / `text-yellow-500 bg-yellow-50` / `text-green-500 bg-green-50`

### ステップリスト

```html
<div class="flex items-start gap-5">
  <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center shrink-0">
    01
  </div>
  <div>
    <h3 class="font-bold text-gray-900 text-lg">ステップタイトル</h3>
    <p class="text-gray-600 mt-1">説明</p>
  </div>
</div>
```

### CTAセクション（プライマリ背景）

```html
<section class="bg-primary-500 py-16 sm:py-20">
  <div class="max-w-3xl mx-auto px-4 text-center">
    <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">...</h2>
    <p class="text-primary-100 text-lg mb-8">...</p>
    <!-- チェックリスト -->
    <span class="flex items-center gap-1.5 bg-primary-400 text-white px-4 py-2 rounded-full text-sm">
      <Check class="w-4 h-4" /> 項目
    </span>
    <!-- ホワイトボタン -->
    <a class="bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:bg-primary-50 transition-colors inline-block">
      登録する
    </a>
  </div>
</section>
```

### アバター

```html
<!-- 画像あり -->
<img src={avatarUrl} class="w-8 h-8 rounded-full object-cover" />

<!-- 画像なし（イニシャル） -->
<div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
  <User class="w-4 h-4 text-primary-600" />
</div>
```

### 本人確認済みバッジ

```html
<div class="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
  <Check class="w-3 h-3" />
  本人確認済み
</div>
```

### ドロップダウンメニュー

```html
<div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-10">
  <a class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-warm-50 transition-colors">
    <Icon class="w-4 h-4" />
    メニュー項目
  </a>
  <div class="border-t border-gray-100 my-1" />
  <!-- 危険アクション -->
  <button class="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left">
    <LogOut class="w-4 h-4" />
    ログアウト
  </button>
</div>
```

---

## ヘッダー・フッター

### ヘッダー

```html
<header class="bg-white border-b border-gray-100 sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-16">
      <!-- ロゴ / ナビ / ユーザーアクション -->
    </div>
  </div>
</header>
```

### フッター

```html
<footer class="bg-white border-t border-gray-100 py-10">
  <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
    <!-- ロゴ / リンク群 / copyright -->
  </div>
</footer>
```

---

## トランジション・アニメーション

- ボタン: `transition-colors duration-150`
- カードホバー: `hover:shadow-md transition-shadow`
- 画像ズーム: `group-hover:scale-105 transition-transform duration-300`
- メニュー項目: `transition-colors`

---

## Supabase連携メモ

- `createClient` from `@/lib/supabase/server`（サーバーコンポーネント）
- `createClient` from `@/lib/supabase/client`（クライアントコンポーネント）
- 認証: `supabase.auth.getUser()` → profilesテーブルをJOIN
- 決済: Stripe（`stripe_onboarding_complete` フラグで本人確認済み判定）

---

## ルート構成

```
app/
├── page.tsx              # トップページ（LP）
├── (auth)/               # ログイン・サインアップ
├── (dashboard)/          # ダッシュボード（認証済み）
├── sitters/              # シッター一覧・詳細
├── booking/              # 予約フロー
├── chat/                 # メッセージ
├── contact/              # お問い合わせ
└── privacy/              # プライバシーポリシー
```
