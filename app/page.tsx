import { createClient } from '@/lib/supabase/server'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import { ArrowRight, Check, Star, Shield, Smartphone, MapPin, Clock, Heart, Camera, MessageSquare, CreditCard, ChevronDown } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Header user={profile ? { id: user!.id, display_name: profile.display_name, avatar_url: profile.avatar_url } : null} />

      {/* ヒーロー */}
      <section className="bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] items-stretch">

          {/* モバイル：画像をテキストの上に表示 */}
          <div className="lg:hidden w-full h-64 overflow-hidden">
            <img
              src="/hero.png"
              alt="犬と女性が草原で戯れる様子"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* 左：テキスト */}
          <div className="flex items-center">
            <div className="w-full max-w-xl ml-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-24">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.2] mb-6">
                大切なペットを、<br />
                <span className="text-primary-500">信頼できる人</span>へ。
              </h1>
              <p className="text-gray-500 text-base sm:text-lg mb-10 leading-relaxed">
                登録シッターは全員、本人確認書類の提出と審査を経ています。<br />
                メッセージ・予約・決済まで、アプリひとつで完結。
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/sitters" className="btn-primary flex items-center gap-2 text-base py-3 px-8">
                  シッターを探す
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/signup" className="btn-outline flex items-center gap-2 text-base py-3 px-8">
                  シッターになる
                </Link>
              </div>
            </div>
          </div>

          {/* 右：画像（PC） */}
          <div className="hidden lg:block relative">
            <img
              src="/hero.png"
              alt="犬と女性が草原で戯れる様子"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white to-transparent" />
          </div>

        </div>
      </section>

      {/* 都心の飼い主が抱えるペインポイント */}
      <section className="py-12 sm:py-20 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-10 sm:mb-14">
            <div>
              <p className="text-primary-500 text-sm font-semibold mb-3">よくあるお悩み</p>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3">
                都心に住む飼い主の、<br className="sm:hidden" />リアルな困りごと
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                ペットホテルに空きがない、遠い、子が慣れてくれない——<br className="hidden sm:block" />
                アズカルはそんな「どこにも頼めない」を解決します。
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden h-52 sm:h-64 lg:h-72 w-full">
              <img
                src="/都会的な夜の静かなひととき.png"
                alt="困っている飼い主のイメージ"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: MapPin,
                title: '近くにペットホテルがない',
                body: '都心マンション暮らしでは車もなく、大型施設まで連れて行くだけで一苦労。自宅近くで預かってもらえれば、どれほど楽か。',
              },
              {
                icon: Clock,
                title: '急な出張・残業に対応できない',
                body: '「明日から3日間」「今夜遅くなる」——ペットホテルは数週間前からの予約が基本。急なスケジュール変更に対応できる場所がない。',
              },
              {
                icon: Heart,
                title: 'ケージに閉じ込めたくない',
                body: '施設では一日中ケージの中。家庭的な環境でのびのび過ごしてほしい。ペットのストレスが気になって、旅行も楽しめない。',
              },
            ].map((item) => (
              <div key={item.title} className="card p-5 sm:p-6">
                <div className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center mb-4">
                  <item.icon className="w-4 h-4 text-warm-700" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 信頼の仕組み */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-primary-500 text-sm font-semibold mb-3">安心の理由</p>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3">
            信頼は、仕組みでつくる。
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-10 sm:mb-14">
            「知らない人に預けるのは怖い」——その不安を減らすために、アズカルが用意した仕組みです。
          </p>

          <div className="space-y-6 sm:space-y-8">
            {[
              {
                icon: Shield,
                title: '登録時の本人確認',
                body: '全シッターが本人確認書類を提出し、事務局が審査を実施。氏名・住所・顔写真の一致を確認します。顔の見えない匿名のシッターは一人もいません。',
              },
              {
                icon: Camera,
                title: 'お世話中の写真・動画レポート',
                body: 'お預かり中はチャットで写真や近況をお届け。「ちゃんと食べているか」「元気にしているか」——離れていても、リアルタイムで確認できます。',
              },
              {
                icon: Star,
                title: '改ざんなしのレビュー制度',
                body: '実際に利用した飼い主だけが投稿できる口コミを、そのまま掲載。良い評価だけを選んで表示するような操作は一切しません。',
              },
              {
                icon: MessageSquare,
                title: '事前の顔合わせ・無料相談',
                body: '予約前にチャットや対面での顔合わせが可能。ペットの性格・持病・食事ルールを伝え、シッターとの相性を確かめてから依頼できます。',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-5 sm:gap-8 items-start">
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方 */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-primary-500 text-sm font-semibold mb-3">ご利用の流れ</p>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-10 sm:mb-14">
            3ステップで予約完了
          </h2>
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-0 sm:gap-8 mb-10 sm:mb-14">
            {[
              {
                step: '1',
                icon: MapPin,
                title: 'シッターを探す',
                desc: 'エリア・サービス・ペット種別で絞り込み。プロフィール・資格・レビューを比較して、気になるシッターをお気に入りに追加。',
              },
              {
                step: '2',
                icon: MessageSquare,
                title: 'メッセージで相談',
                desc: 'ペットの性格・持病・希望日程を直接相談。お互い納得できたら、そのまま予約へ進めます。',
              },
              {
                step: '3',
                icon: CreditCard,
                title: '予約・決済',
                desc: 'オンライン決済で事前払い。現金不要、鍵の受け渡しなし。キャンセルポリシーも事前に確認できます。',
              },
            ].map((item, i) => (
              <div key={item.step} className={`flex sm:block items-start gap-4 py-6 sm:py-0 ${i !== 0 ? 'border-t border-gray-200 sm:border-0' : ''}`}>
                <div className="text-5xl sm:text-7xl font-black text-primary-500 leading-none shrink-0 w-12 sm:w-auto sm:mb-5 select-none">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* チャット画面ビジュアル */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <img
                src="/Gemini_Generated_Image_j38z66j38z66j38z.png"
                alt="シッターとのチャット画面と眠る子犬"
                className="w-full object-cover"
              />
            </div>
            <div>
              <p className="text-primary-500 text-xs font-semibold mb-2">ステップ 2 のリアル</p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 leading-snug">
                預けている間も、<br />ずっとそばにいる感覚。
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                シッターとのやりとりはすべてアプリ内のチャットで完結。お世話中の様子を写真や動画で送ってもらえるので、離れていても安心。気になることはいつでも気軽に聞けます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 利用者の声 */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-primary-500 text-sm font-semibold mb-3">利用者の声</p>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-10 sm:mb-14">
            飼い主さんのリアルな感想
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                name: 'M.T. さん',
                sub: '渋谷区 / トイプードル（3歳）',
                stars: 5,
                avatar: '/温かい微笑みのポートレート.png',
                body: '急な海外出張が決まったとき、近所のペットホテルはどこも満室。アズカルで近くのシッターさんを見つけて、当日に対応してもらえました。お世話中の写真も毎日送ってくれて、出張先でも安心できました。',
              },
              {
                name: 'K.S. さん',
                sub: '港区 / 柴犬（5歳）',
                stars: 5,
                avatar: '/リラックスした表情の男性ポートレート.png',
                body: 'うちの子はケージが苦手で、ペットホテルに一度預けたら体調を崩してしまって。アズカルのシッターさんのお宅では自由に過ごせて、帰ってきたら逆に元気になっていました。ここ以外考えられないです。',
              },
              {
                name: 'Y.A. さん',
                sub: '目黒区 / ミニチュアダックス（7歳）',
                stars: 5,
                avatar: '/温かな午後のひととき.png',
                body: '老犬なので薬の投与があり、どこに頼むか不安でした。事前の相談で服薬経験のあるシッターさんを見つけられて、毎回安心して預けています。レビューを見て選べるのが一番助かっています。',
              },
              {
                name: 'R.N. さん',
                sub: '新宿区 / ミックス猫（2匹）',
                stars: 5,
                avatar: '/Gemini_Generated_Image_58nlae58nlae58nl.png',
                body: '猫2匹を一緒に預かってもらえる場所がなかなかなくて。アズカルで相談したら、猫専門のシッターさんがすぐ見つかりました。チャットで気軽にやりとりできるのもよかったです。',
              },
            ].map((review) => (
              <div key={review.name} className="card p-5 sm:p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-400 text-primary-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">「{review.body}」</p>
                <div className="flex items-center gap-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover object-top shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center shrink-0">
                      <span className="text-warm-600 text-sm font-bold">{review.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* シッター向けセクション */}
      <section className="py-12 sm:py-20 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-primary-500 rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* テキスト側 */}
              <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
                <p className="text-primary-200 text-xs sm:text-sm font-semibold mb-3">For Sitters</p>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                  ペットが好きなだけで、<br />副業ができる。
                </h2>
                <p className="text-primary-100 text-sm sm:text-base mb-7 leading-relaxed">
                  スケジュールは自由。1日1〜2頭からOK。<br />
                  週末だけでも月3〜5万円の副収入に。
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-7 sm:mb-8">
                  {[
                    { icon: Shield, label: '身元確認' },
                    { icon: Clock, label: 'スケジュール自由' },
                    { icon: CreditCard, label: 'オンライン決済' },
                    { icon: Heart, label: '保険対応（予定）' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 bg-primary-400 bg-opacity-50 rounded-xl p-3">
                      <item.icon className="w-4 h-4 text-white shrink-0" />
                      <p className="text-white text-xs sm:text-sm font-semibold leading-snug">{item.label}</p>
                    </div>
                  ))}
                </div>

                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl hover:bg-primary-50 transition-colors text-sm sm:text-base">
                  シッターとして登録する
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 画像側 */}
              <div className="relative hidden lg:block min-h-[360px]">
                <img
                  src="/笑顔の女性とゴールデンリトリバーの子犬.png"
                  alt="シッターと犬"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-primary-500 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* よくある質問 */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-primary-500 text-sm font-semibold mb-3">よくある質問</p>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-10 sm:mb-14">
            FAQ
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'シッターに何かあった場合、責任はどうなりますか？',
                a: 'アズカルはシッターと飼い主をつなぐマッチングプラットフォームです。万が一のトラブルについては、まずチャットを通じた当事者間の話し合いをお願いしています。現在、補償制度の整備を進めており、詳細が決まり次第お知らせします。',
              },
              {
                q: 'シッターの身元確認はどのように行われますか？',
                a: '登録時に本人確認書類（運転免許証・マイナンバーカードなど）の提出を必須としており、事務局が氏名・住所・顔写真の一致を審査します。審査完了後、プロフィールに「本人確認済み」バッジが表示されます。なお、身元確認はあくまで本人を特定するものであり、シッターの技術・安全性を保証するものではありません。',
              },
              {
                q: '初めて利用する前に、シッターと会うことはできますか？',
                a: 'はい、予約前にチャットを通じて事前相談や顔合わせをお願いすることができます。ペットの性格・食事ルール・持病などを共有し、お互いが安心できると判断してから予約に進んでください。',
              },
              {
                q: 'キャンセルした場合の返金はありますか？',
                a: 'キャンセルポリシーはシッターごとに設定されており、予約確定前に必ず表示されます。一般的には、サービス開始7日前までのキャンセルは全額返金、それ以降は部分返金となるケースが多いですが、各シッターのポリシーをご確認ください。',
              },
              {
                q: 'シッターの報酬はいつ、どのように受け取れますか？',
                a: 'サービス終了から数日以内に、登録いただいた銀行口座へ振り込まれます（プラットフォーム手数料を差し引いた金額）。振込スケジュールなどの詳細は、シッター向けダッシュボードでご確認いただけます。',
              },
              {
                q: '犬・猫以外のペットも預かってもらえますか？',
                a: 'うさぎ・鳥・爬虫類など、犬猫以外の対応可否はシッターによって異なります。検索時に「対応ペット」で絞り込むか、チャットで直接確認してください。',
              },
            ].map((item, i) => (
              <details key={i} className="card group">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 cursor-pointer list-none">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{item.q}</span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 感動バナー：帰宅の再会 */}
      <div className="bg-warm-50 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
            <img
              src="/Gemini_Generated_Image_lscfsdlscfsdlscf.png"
              alt="帰宅した飼い主と喜ぶ犬の再会"
              className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/65 via-gray-900/25 to-transparent flex items-center">
              <div className="px-8 sm:px-14">
                <p className="text-white text-2xl sm:text-4xl font-bold leading-snug drop-shadow">
                  「ただいま」が、<br />笑顔になる。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* デュアルCTA */}
      <section className="py-12 sm:py-20 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            さあ、はじめましょう。
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-10 sm:mb-12 text-center">
            登録は無料。飼い主もシッターも、今すぐ始められます。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* 飼い主向け */}
            <div className="card p-6 sm:p-8 flex flex-col">
              <p className="text-primary-500 text-xs font-semibold mb-2">飼い主の方へ</p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                信頼できるシッターを<br className="hidden sm:block" />見つける
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                エリアや条件で絞り込んで、レビューを見ながら比較。まずはシッターを探すだけでも大丈夫です。
              </p>
              <Link href="/sitters" className="btn-primary flex items-center justify-center gap-2 text-sm py-3">
                シッターを探す
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* シッター向け */}
            <div className="card p-6 sm:p-8 flex flex-col border-2 border-primary-100">
              <p className="text-primary-500 text-xs font-semibold mb-2">シッターになりたい方へ</p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ペット好きを<br className="hidden sm:block" />副業にする
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                スキマ時間に、自分のペースで。プロフィールを作成して、依頼を受けるだけ。難しい手続きは不要です。
              </p>
              <Link href="/signup" className="btn-outline flex items-center justify-center gap-2 text-sm py-3">
                シッターとして登録
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/azukaru_icon.png" alt="アズカル" className="w-8 h-8" />
            <span className="font-bold text-gray-900">アズカル</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-gray-700 whitespace-nowrap">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700 whitespace-nowrap">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-gray-700 whitespace-nowrap">お問い合わせ</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 アズカル. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
