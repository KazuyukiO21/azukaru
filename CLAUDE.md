# アズカル プロジェクト指示

## デザインガイドの遵守

このプロジェクトでコードや画面を作成・修正する際は、必ず `design.md` のデザインガイドに従ってください。

### 特に守るべきルール

**カラー**
- メインカラーは `primary-500`（#f04e1a）。独自の赤・オレンジ色は使わない
- ページ背景は `bg-warm-50`。`bg-gray-50` や `bg-white` をページ背景に使わない
- テキストカラーは `gray-900` / `gray-700` / `gray-600` / `gray-500` / `gray-400` の階層を守る

**コンポーネントクラス**
- ボタンは `btn-primary` / `btn-secondary` / `btn-outline` を使う（独自インラインスタイルは書かない）
- カードは `card` クラスを使う（`rounded-2xl shadow-sm border border-gray-100`）
- フォームは `input` / `label` クラスを使う

**レイアウト**
- 最大幅: テキスト中心は `max-w-4xl`、グリッドは `max-w-5xl`、ヘッダー/フッターは `max-w-6xl`
- セクション余白: `py-16 sm:py-20` または `py-16 sm:py-24`
- 横余白: `px-4` または `sm:px-6`

**アイコン**
- Lucide React のみ使用

**フォント**
- Noto Sans JP（既にlayout.tsxで設定済み）。追加フォントは導入しない

---

## 技術スタック

- Next.js (App Router) / TypeScript / Tailwind CSS / Supabase
- サーバーコンポーネントは `@/lib/supabase/server`、クライアントは `@/lib/supabase/client`

## プロジェクト概要

アズカル — ペットを預けたい飼い主と個人シッターをつなぐ日本語マッチングサービス。
詳細なデザイン仕様・コードスニペットは `design.md` を参照。
