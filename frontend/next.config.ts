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
  }
}

export default nextConfig
