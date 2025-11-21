type CorkBoardBackgroundProps = {
  children: React.ReactNode
  className?: string
}

export function CorkBoardBackground ({
  children,
  className = ''
}: CorkBoardBackgroundProps) {
  return (
    <div className={`relative bg-stone-50 dark:bg-atom-one-dark ${className}`}>
      {/* Noise texture overlay */}
      <div
        className='pointer-events-none absolute inset-0 opacity-5'
        style={{
          backgroundImage: 'url("/images/noise.svg")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Light highlight (top-right) and vignette (bottom-left) for depth */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.4)_0%,transparent_50%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]' />

      <div className='relative'>
        {children}
      </div>
    </div>
  )
}
