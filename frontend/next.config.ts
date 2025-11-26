import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required at build time')
}
const normalizedApiUrl = apiUrl.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    // Ensure clients get a normalized value (no trailing slash)
    NEXT_PUBLIC_API_URL: normalizedApiUrl
  },

  // Image optimization configuration
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-loader.ts'
  },

  // Security headers
  // NOTE: These are currently ignored due to 'output: export' above.
  // Currently applied via vercel.json instead.
  // If migrating away from static export (e.g., to GCP with SSR),
  // remove 'output: export' and these headers will automatically apply.
  async headers() {
    return [
      // Security headers (all paths)
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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: ${normalizedApiUrl} https://vitals.vercel-insights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
          }
        ]
      },
      // Cache headers for static assets
      {
        source: '/(favicon.ico|apple-touch-icon.png|icon-192.png|icon-512.png|icon.svg|manifest.json)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=60'
          }
        ]
      },
      {
        source: '/(robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60'
          }
        ]
      }
    ]
  }
}

export default nextConfig
