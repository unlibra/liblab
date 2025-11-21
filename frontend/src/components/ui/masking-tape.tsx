type MaskingTapeProps = {
  className?: string
}

export function MaskingTape ({ className = '' }: MaskingTapeProps) {
  return (
    <div
      className={`h-8 w-24 bg-yellow-200/75 shadow-sm backdrop-blur-sm ${className}`}
    />
  )
}
