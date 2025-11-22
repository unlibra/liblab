type MaskingTapeProps = {
  className?: string
  width?: number // px
  height?: number // px
}

export function MaskingTape ({ className = '', width, height }: MaskingTapeProps) {
  const style = (width || height)
    ? {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
      }
    : undefined

  return (
    <div
      className={`h-6 w-20 bg-yellow-200/75 shadow-sm backdrop-blur-sm sm:h-12 sm:w-40 ${className}`}
      style={style}
    />
  )
}
