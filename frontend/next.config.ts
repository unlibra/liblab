import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required at build time')
}
const normalizedApiUrl = apiUrl.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  // Static export for Vercel
  output: 'export',
  reactStrictMode: true,
  env: {
    // Ensure clients get a normalized value (no trailing slash)
    NEXT_PUBLIC_API_URL: normalizedApiUrl
  },

  // Security headers
  // NOTE: These are currently ignored due to 'output: export' above.
  // Currently applied via vercel.json instead.
  // If migrating away from static export (e.g., to GCP with SSR),
  // remove 'output: export' and these headers will automatically apply.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ${normalizedApiUrl} https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
          }
        ]
      }
    ]
  }
}

export default nextConfig
