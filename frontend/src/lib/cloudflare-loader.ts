import type { ImageLoaderProps } from 'next/image'

/**
 * Cloudflare Images loader for Next.js Image component
 * Uses Cloudflare's unified Images product (formerly Image Resizing)
 * @see https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/
 */
export default function cloudflareLoader ({
  src,
  width,
  quality
}: ImageLoaderProps): string {
  // In development, return the original path (no Cloudflare transformation)
  // This allows local images to be displayed without deploying first
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    // Return original path for local development
    return src
  }

  // Image subdomain (must be proxied through Cloudflare with orange cloud)
  const imagesDomain = process.env.NEXT_PUBLIC_IMAGES_DOMAIN

  if (!imagesDomain) {
    throw new Error('NEXT_PUBLIC_IMAGES_DOMAIN is not defined')
  }

  // If src is an absolute URL (external image), use Cloudflare to transform it
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const params = [`width=${width}`, 'format=auto', 'fit=scale-down']
    if (quality) {
      params.push(`quality=${quality}`)
    }
    return `${imagesDomain}/cdn-cgi/image/${params.join(',')}/${src}`
  }

  // Build transformation parameters
  const params = [`width=${width}`, 'format=auto', 'fit=scale-down']
  if (quality) {
    params.push(`quality=${quality}`)
  }
  const paramsString = params.join(',')

  // For local images, keep the leading slash
  // URL structure: https://images.example.com/cdn-cgi/image/{params}/{path}
  return `${imagesDomain}/cdn-cgi/image/${paramsString}${src}`
}
