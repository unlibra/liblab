type PolaroidFrameProps = {
  rotation?: number
  className?: string
  image: {
    src: string
    alt: string
    className?: string
  }
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function PolaroidFrame ({
  rotation = 0,
  className = '',
  image,
  style = {},
  children
}: PolaroidFrameProps) {
  return (
    <div
      // Root element: handles positioning and rotation only
      className={`${className}`}
      style={{ transform: `rotate(${rotation}deg)`, ...style }}
    >
      {/* Inner element: handles Polaroid appearance and internal coordinates */}
      <div className='relative bg-white p-4 shadow-xl dark:bg-gray-100 sm:p-6'>

        {/* Paper texture */}
        <div className='pointer-events-none absolute inset-0 bg-gray-50 opacity-5' />

        <div className='relative flex justify-center overflow-hidden'>
          {/* Photo */}
          <img
            src={image.src}
            alt={image.alt}
            crossOrigin='anonymous'
            className={image.className ?? 'max-h-[800px] w-auto max-w-[calc(min(1200px,85vw))]'}
          />

          {/* Film gloss effect */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50' />
        </div>

        {/* Bottom margin content */}
        {children && (
          <div className='mt-4 flex justify-center sm:mt-6'>
            {children}
          </div>
        )}

        {/* Outer frame thin line */}
        <div className='pointer-events-none absolute inset-0 rounded-sm ring-1 ring-black/5' />
      </div>
    </div>
  )
}
