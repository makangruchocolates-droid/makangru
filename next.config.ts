import type { NextConfig } from 'next'

const securityHeaders = [
  { key:'Strict-Transport-Security', value:'max-age=63072000; includeSubDomains; preload' },
  { key:'X-Content-Type-Options', value:'nosniff' },
  { key:'X-Frame-Options', value:'DENY' },
  { key:'Referrer-Policy', value:'strict-origin-when-cross-origin' },
  { key:'Permissions-Policy', value:'camera=(), microphone=(), geolocation=(), payment=(self)' },
  {
    key:'Content-Security-Policy',
    value:[
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://www.facebook.com https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://www.facebook.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'**.supabase.co', pathname:'/storage/v1/object/public/**' },
      { protocol:'https', hostname:'images.unsplash.com' },
    ],
  },
  async headers() {
    return [{ source:'/(.*)', headers:securityHeaders }]
  },
}
export default nextConfig
