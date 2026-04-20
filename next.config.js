/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ────────────────────────────────────────────────
  // セキュリティヘッダー
  // ────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // クリックジャッキング防止
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIMEタイプスニッフィング防止
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // リファラー情報の制限
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // XSS保護（レガシーブラウザ向け）
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HTTPS強制（Vercel本番環境）
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Permissions Policy（カメラ・マイク等の不要アクセス禁止 / 地図のために geolocation を許可）
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.tile.openstreetmap.org",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.tile.openstreetmap.org",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
