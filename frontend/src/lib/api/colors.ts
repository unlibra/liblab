/**
 * カラー抽出API
 */

import { loadImageFromFile, processImage } from '@/lib/image/image-processing'

export type ExtractedColor = {
  hex: string
  percentage: number
}

// NEXT_PUBLIC_API_URL is enforced and normalized at build time in next.config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

/**
 * バックエンドAPIを使用して画像から色を抽出
 */
export async function extractColorsFromImage (
  file: File,
  numColors: number
): Promise<ExtractedColor[]> {
  // Resize image on client side to reduce bandwidth (max 300x300)
  const image = await loadImageFromFile(file)
  const resizedBlob = await processImage(image, 300, 300, { preserveAspectRatio: true })
  const resizedFile = new File([resizedBlob], file.name, { type: 'image/png' })

  const formData = new FormData()
  formData.append('file', resizedFile)

  const response = await fetch(
    `${API_BASE_URL}/api/colors/extract?num_colors=${numColors}`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    throw new Error('Failed to extract colors')
  }

  const data = await response.json()
  return data.colors as ExtractedColor[]
}
