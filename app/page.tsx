import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <img
          src="/azukaru_icon.png"
          alt="アズカル"
          width={72}
          height={72}
          className="mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          アズカル
        </h1>
        <p className="text-gray-600 mb-2">
          現在、サービスの準備中です。
        </p>
        <p className="text-gray-500 text-sm">
          もうしばらくお待ちください。
        </p>
      </div>
    </div>
  )
}
