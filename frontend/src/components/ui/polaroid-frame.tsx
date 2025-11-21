type PolaroidFrameProps = {
  src: string
  alt: string
  rotation?: number
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function PolaroidFrame ({
  src,
  alt,
  rotation = 0,
  className = '',
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
      <div className='relative bg-white p-4 shadow-xl dark:bg-gray-100'>

        {/* Paper texture */}
        <div className='pointer-events-none absolute inset-0 bg-gray-50 opacity-5' />

        <div className='relative flex justify-center overflow-hidden'>
          {/* Photo */}
          <img
            src={src}
            alt={alt}
            className='max-h-96 w-auto object-cover shadow-inner'
          />

          {/* Film gloss effect */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50' />
        </div>

        {/* Bottom margin content */}
        {children && (
          <div className='mt-4 flex justify-center'>
            {children}
          </div>
        )}

        {/* Outer frame thin line */}
        <div className='pointer-events-none absolute inset-0 rounded-sm ring-1 ring-black/5' />
      </div>
    </div>
  )
}
