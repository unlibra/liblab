import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required at build time')
}
const normalizedApiUrl = apiUrl.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  basePath: '/lab',
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  env: {
    // Ensure clients get a normalized value (no trailing slash)
    NEXT_PUBLIC_API_URL: normalizedApiUrl
  },
  async redirects () {
    return [
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true
      },
      {
        source: '/',
        destination: '/ja',
        permanent: false,
        locale: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '^ja.*'
          }
        ]
      },
      {
        source: '/',
        destination: '/en',
        permanent: false,
        locale: false
      }
    ]
  }
}

export default nextConfig
