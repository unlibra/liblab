/**
 * カラー抽出API
 */

import { loadImageFromFile, processImage } from '@/lib/image/image-processing'

export type ExtractedColor = {
  hex: string
  percentage: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * バックエンドAPIを使用して画像から色を抽出
 */
export async function extractColorsFromImage (
  file: File,
  numColors: number
): Promise<ExtractedColor[]> {
  // Resize image on client side to reduce bandwidth
  const image = await loadImageFromFile(file)
  const resizedBlob = await processImage(image, 300, { preserveAspectRatio: true })
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
