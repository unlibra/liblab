type ChekiPadding = {
  left: number
  right: number
  top: number
  bottom: number
}

type PolaroidFrameProps = {
  rotation?: number
  className?: string
  image: {
    src: string
    alt: string
    className?: string
    style?: React.CSSProperties
    onLoad?: () => void
  }
  style?: React.CSSProperties
  children?: React.ReactNode
  chekiPadding?: ChekiPadding // Cheki padding (px)
}

export function PolaroidFrame ({
  rotation = 0,
  className = '',
  image,
  style = {},
  children,
  chekiPadding
}: PolaroidFrameProps) {
  // Use cheki padding if specified, otherwise default
  const paddingStyle = chekiPadding
    ? {
        paddingTop: `${chekiPadding.top}px`,
        paddingRight: `${chekiPadding.right}px`,
        paddingBottom: `${chekiPadding.bottom}px`,
        paddingLeft: `${chekiPadding.left}px`
      }
    : undefined

  // Color palette area style (fit within bottom padding area)
  const paletteContainerStyle = chekiPadding
    ? {
        height: `${chekiPadding.bottom}px`,
      }
    : undefined

  const { onLoad } = image

  return (
    <div
      // Root element: handles positioning and rotation only
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
    >
      {/* Inner element: handles Polaroid appearance and internal coordinates */}
      <div
        className='relative overflow-hidden rounded bg-white px-3 pb-10 pt-5 drop-shadow-xl dark:bg-gray-100 sm:px-12 sm:pb-40 sm:pt-20'
        style={paddingStyle}
      >

        {/* Paper texture */}
        <div className='pointer-events-none absolute inset-0 bg-gray-50 opacity-5' />

        <div className='relative flex justify-center overflow-hidden'>
          {/* Photo */}
          <img
            src={image.src}
            alt={image.alt}
            crossOrigin='anonymous'
            className={`drag-none ${image.className ?? 'max-w-[160px] sm:max-w-[640px]'}`}
            style={image.style}
            onLoad={onLoad}
          />

          {/* Film gloss effect */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50' />
        </div>

        {/* Bottom margin content */}
        {children && (
          <div
            className='absolute inset-x-0 bottom-0 flex h-10 items-center justify-center sm:h-40'
            style={paletteContainerStyle}
          >
            {children}
          </div>
        )}

        {/* Outer frame thin line */}
        <div className='pointer-events-none absolute inset-0 rounded-sm ring-1 ring-black/5' />
      </div>
    </div>
  )
}
