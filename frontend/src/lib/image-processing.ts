/**
 * 画像処理ユーティリティ
 * 再利用可能な画像処理機能を提供
 */

export type ImageProcessingOptions = {
  borderRadius?: number // pixel value
  borderRadiusPercent?: number // 0-100 (percentage, 100 = perfect circle)
  backgroundColor?: string // hex color (e.g., '#ffffff')
}

/**
 * ファイルから画像を読み込む
 */
export async function loadImageFromFile (file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }

    img.src = url
  })
}

/**
 * 画像をリサイズして処理を適用
 */
export async function processImage (
  image: HTMLImageElement,
  size: number,
  options: ImageProcessingOptions = {}
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvasコンテキストの取得に失敗しました')
  }

  canvas.width = size
  canvas.height = size

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 角丸を適用
  let radius = 0
  let isCircle = false

  if (options.borderRadius && options.borderRadius > 0) {
    radius = options.borderRadius
    // px指定で半径がsize/2以上の場合は円として扱う
    if (radius >= size / 2) {
      radius = size / 2
      isCircle = true
    }
  } else if (options.borderRadiusPercent && options.borderRadiusPercent > 0) {
    // %指定の場合、100%で完全な円
    if (options.borderRadiusPercent >= 100) {
      radius = size / 2
      isCircle = true
    } else {
      // 100%未満の場合は角丸の半径を計算
      radius = (size / 2) * (options.borderRadiusPercent / 100)
    }
  }

  if (radius > 0) {
    ctx.save()
    ctx.beginPath()

    if (isCircle) {
      // 完全な円を描画
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    } else {
      // 角丸四角形を描画
      ctx.moveTo(radius, 0)
      ctx.lineTo(size - radius, 0)
      ctx.quadraticCurveTo(size, 0, size, radius)
      ctx.lineTo(size, size - radius)
      ctx.quadraticCurveTo(size, size, size - radius, size)
      ctx.lineTo(radius, size)
      ctx.quadraticCurveTo(0, size, 0, size - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
    }

    ctx.closePath()
    ctx.clip()

    // 背景色を適用（クリップされた領域内のみ）
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, size, size)
    }

    // 画像を描画
    ctx.drawImage(image, 0, 0, size, size)

    ctx.restore()
  } else {
    // 角丸なしの場合
    // 背景色を適用
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, size, size)
    }

    // 画像を描画
    ctx.drawImage(image, 0, 0, size, size)
  }

  // PNG blobに変換
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvasからのblob作成に失敗しました'))
        }
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Blobをダウンロード
 */
export function downloadBlob (blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Canvas から Data URL を取得
 */
export function canvasToDataURL (canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
