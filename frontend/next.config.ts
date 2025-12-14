import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required at build time')
}
const normalizedApiUrl = apiUrl.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  basePath: '/lab',
  reactStrictMode: true,
  env: {
    // Ensure clients get a normalized value (no trailing slash)
    NEXT_PUBLIC_API_URL: normalizedApiUrl
  }
}

export default nextConfig
