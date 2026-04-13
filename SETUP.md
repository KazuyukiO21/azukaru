# アズカル MVP セットアップガイド

## 必要なもの

- Node.js 18以上
- Supabaseアカウント（無料）
- Stripeアカウント（無料）
- Vercelアカウント（無料）

---

## ステップ1：依存関係のインストール

```bash
cd azukaru
npm install
```

---

## ステップ2：Supabaseの設定

### 2-1. プロジェクト作成
1. [https://supabase.com](https://supabase.com) にアクセス
2. 「New Project」でプロジェクト作成
3. リージョン：**Northeast Asia (Tokyo)** を選択

### 2-2. データベーススキーマの実行
1. Supabase Dashboard > **SQL Editor** を開く
2. `supabase/schema.sql` の内容を全てコピー&ペースト
3. **Run** を実行

### 2-3. APIキーの取得
Dashboard > **Project Settings** > **API** から：
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（非公開！）

### 2-4. Realtimeの有効化
Dashboard > **Database** > **Replication** で `messages` テーブルのRealtimeを有効化

---

## ステップ3：Stripeの設定

### 3-1. APIキーの取得
1. [https://dashboard.stripe.com](https://dashboard.stripe.com) にアクセス
2. **開発者** > **APIキー** から取得：
   - `公開可能キー` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `シークレットキー` → `STRIPE_SECRET_KEY`

### 3-2. Connectの設定
1. Stripe Dashboard > **Connect** > **設定**
2. **プラットフォーム名**：アズカル
3. **ビジネスタイプ**：マーケットプレイス

### 3-3. Webhookの設定（本番用）
1. Dashboard > **開発者** > **Webhook**
2. エンドポイント：`https://your-app.vercel.app/api/stripe/webhook`
3. イベント選択：
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. 署名シークレット → `STRIPE_WEBHOOK_SECRET`

---

## ステップ4：環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を開いて全ての値を入力：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ステップ5：ローカル起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

---

## ステップ6：Vercelへデプロイ

```bash
npm install -g vercel
vercel
```

または GitHub にプッシュして Vercel と連携：
1. [https://vercel.com](https://vercel.com) > **New Project**
2. GitHubリポジトリを選択
3. **Environment Variables** に `.env.local` の内容を入力
4. **Deploy**

---

## マネタイズの流れ

```
飼い主が予約 → Stripe決済（合計金額）
    ↓
アズカルが15%手数料を受け取る
    ↓
シッターに85%が自動送金（Stripe Connect）
    ↓
シッターは毎週月曜日に銀行口座へ振込
```

### 収益試算
| 月間取引件数 | 平均取引額 | 月間売上（GMV） | アズカル手数料（15%） |
|------------|----------|--------------|-------------------|
| 50件       | ¥10,000  | ¥500,000     | **¥75,000**       |
| 200件      | ¥10,000  | ¥2,000,000   | **¥300,000**      |
| 500件      | ¥12,000  | ¥6,000,000   | **¥900,000**      |

---

## 開発ロードマップ

### Phase 1（MVP - 今ここ）
- [x] ユーザー登録・ログイン
- [x] シッター検索・一覧・詳細
- [x] 予約・Stripe決済
- [x] メッセージ（Realtime）
- [ ] シッタープロフィール編集画面
- [ ] 予約管理画面

### Phase 2（成長期）
- [ ] レビュー・評価機能
- [ ] 写真レポート機能
- [ ] プッシュ通知
- [ ] カレンダー連携

### Phase 3（スケール）
- [ ] SEO最適化
- [ ] iOS/Androidアプリ（React Native）
- [ ] 身元確認API連携
- [ ] ペット保険連携
