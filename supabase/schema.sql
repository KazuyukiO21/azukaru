-- ================================================
-- アズカル（Azukaru）データベーススキーマ
-- ================================================

-- UUIDエクステンション有効化
create extension if not exists "uuid-ossp";

-- ================================================
-- プロフィールテーブル
-- ================================================
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  role text not null default 'owner' check (role in ('owner', 'sitter', 'both')),
  prefecture text,
  city text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================================================
-- シッタープロフィールテーブル
-- ================================================
create table if not exists public.sitter_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  services text[] not null default '{}',
  pet_types text[] not null default '{}',
  price_per_night integer,  -- 1泊の料金（円）
  price_per_day integer,    -- 日中預かり料金（円）
  price_per_walk integer,   -- 散歩1回の料金（円）
  price_drop_in integer,    -- 訪問1回の料金（円）
  max_pets integer not null default 1,
  home_type text,           -- 'apartment', 'house', etc.
  has_yard boolean not null default false,
  accepts_unvaccinated boolean not null default false,
  experience_years integer,
  certifications text[] not null default '{}',
  gallery_urls text[] not null default '{}',
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  is_active boolean not null default true,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================================================
-- 予約テーブル
-- ================================================
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete restrict not null,
  sitter_id uuid references auth.users(id) on delete restrict not null,
  pet_name text not null,
  pet_type text not null check (pet_type in ('dog', 'cat', 'small_animal', 'bird', 'reptile', 'other')),
  service_type text not null check (service_type in ('boarding', 'daycare', 'walking', 'drop_in', 'grooming')),
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  total_amount integer not null,       -- 総額（円）
  platform_fee integer not null,       -- 手数料15%（円）
  sitter_amount integer not null,      -- シッター受取額（円）
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint end_after_start check (end_date >= start_date)
);

-- ================================================
-- 会話テーブル
-- ================================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  sitter_id uuid references auth.users(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(owner_id, sitter_id)
);

-- ================================================
-- メッセージテーブル
-- ================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ================================================
-- レビューテーブル
-- ================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  reviewee_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ================================================
-- インデックス
-- ================================================
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_sitter_profiles_user_id on public.sitter_profiles(user_id);
create index if not exists idx_sitter_profiles_active on public.sitter_profiles(is_active) where is_active = true;
create index if not exists idx_bookings_owner on public.bookings(owner_id);
create index if not exists idx_bookings_sitter on public.bookings(sitter_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_conversations_owner on public.conversations(owner_id);
create index if not exists idx_conversations_sitter on public.conversations(sitter_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

-- ================================================
-- 更新日時の自動更新トリガー
-- ================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists sitter_profiles_updated_at on public.sitter_profiles;
create trigger sitter_profiles_updated_at
  before update on public.sitter_profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ================================================
-- ユーザー作成時に自動でプロフィール作成
-- ================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  );

  -- シッターとして登録する場合はシッタープロフィールも作成
  if coalesce(new.raw_user_meta_data->>'role', 'owner') in ('sitter', 'both') then
    insert into public.sitter_profiles (user_id)
    values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================
-- レビュー追加時にシッターの評価を更新
-- ================================================
create or replace function public.update_sitter_rating()
returns trigger as $$
declare
  avg_rating numeric;
  cnt integer;
begin
  select avg(rating), count(*)
  into avg_rating, cnt
  from public.reviews
  where reviewee_id = new.reviewee_id;

  update public.sitter_profiles
  set rating = round(avg_rating::numeric, 2),
      review_count = cnt
  where user_id = new.reviewee_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists review_added on public.reviews;
create trigger review_added
  after insert on public.reviews
  for each row execute function public.update_sitter_rating();

-- ================================================
-- Row Level Security (RLS)
-- ================================================
alter table public.profiles enable row level security;
alter table public.sitter_profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- profiles ポリシー
create policy "プロフィールは誰でも閲覧可" on public.profiles
  for select using (true);

create policy "自分のプロフィールのみ更新可" on public.profiles
  for update using (auth.uid() = user_id);

create policy "自分のプロフィールのみ削除可" on public.profiles
  for delete using (auth.uid() = user_id);

-- sitter_profiles ポリシー
create policy "シッタープロフィールは誰でも閲覧可" on public.sitter_profiles
  for select using (true);

create policy "自分のシッタープロフィールのみ更新可" on public.sitter_profiles
  for update using (auth.uid() = user_id);

-- bookings ポリシー
create policy "自分の予約を閲覧可" on public.bookings
  for select using (auth.uid() = owner_id or auth.uid() = sitter_id);

create policy "飼い主が予約作成可" on public.bookings
  for insert with check (auth.uid() = owner_id);

create policy "予約当事者のみ更新可" on public.bookings
  for update using (auth.uid() = owner_id or auth.uid() = sitter_id);

-- conversations ポリシー
create policy "自分の会話を閲覧可" on public.conversations
  for select using (auth.uid() = owner_id or auth.uid() = sitter_id);

create policy "会話作成可" on public.conversations
  for insert with check (auth.uid() = owner_id or auth.uid() = sitter_id);

create policy "会話更新可" on public.conversations
  for update using (auth.uid() = owner_id or auth.uid() = sitter_id);

-- messages ポリシー
create policy "会話参加者がメッセージ閲覧可" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.owner_id = auth.uid() or c.sitter_id = auth.uid())
    )
  );

create policy "会話参加者がメッセージ送信可" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.owner_id = auth.uid() or c.sitter_id = auth.uid())
    )
  );

create policy "自分のメッセージを既読更新可" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.owner_id = auth.uid() or c.sitter_id = auth.uid())
    )
  );

-- reviews ポリシー
create policy "レビューは誰でも閲覧可" on public.reviews
  for select using (true);

create policy "予約完了者がレビュー投稿可" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and b.status = 'completed'
      and (b.owner_id = auth.uid() or b.sitter_id = auth.uid())
    )
  );
