/**
 * ワッフルチャート描画ユーティリティ
 */

export type ExtractedColor = {
  hex: string
  percentage: number
}

/**
 * パーセンテージに基づいてセルの色配列を計算
 */
export function calculateCellColors (
  colors: ExtractedColor[],
  totalCells: number
): string[] {
  // Calculate cell counts based on percentages
  const cellCounts: number[] = []
  let totalCount = 0

  colors.forEach((color) => {
    const cells = Math.round((color.percentage / 100) * totalCells)
    cellCounts.push(cells)
    totalCount += cells
  })

  // Adjust to exactly match total cells
  const diff = totalCells - totalCount
  if (diff !== 0 && cellCounts.length > 0) {
    cellCounts[0] += diff
  }

  // Create array of colors for each cell
  const cellColors: string[] = []
  colors.forEach((color, i) => {
    for (let j = 0; j < cellCounts[i]; j++) {
      cellColors.push(color.hex)
    }
  })

  return cellColors
}

/**
 * ワッフルチャートのBlobを生成
 */
export async function generateWaffleChartBlob (
  colors: ExtractedColor[],
  size: number = 1080
): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = size
  canvas.height = size

  const gridSize = 8
  const totalCellCount = gridSize * gridSize

  // gap = cellSize / 8 (8px.app!)
  const cellSize = size / (gridSize + (gridSize - 1) / 8)
  const gap = cellSize / 8
  const cornerRadius = cellSize / 8

  const cellColors = calculateCellColors(colors, totalCellCount)

  // Draw waffle chart
  for (let i = 0; i < gridSize * gridSize; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    const x = col * (cellSize + gap)
    const y = row * (cellSize + gap)

    ctx.fillStyle = cellColors[i] || '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, cellSize, cellSize, cornerRadius)
    ctx.fill()
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
