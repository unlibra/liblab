import type { ReactNode } from 'react'

type TogglePillProps = {
  pressed: boolean
  onClick: () => void
  children: ReactNode
  ariaLabel?: string
  className?: string
  activeClassName?: string
  inactiveClassName?: string
}

/**
 * Reusable pill-style toggle button.
 */
export function TogglePill ({
  pressed,
  onClick,
  children,
  ariaLabel,
  className = '',
  activeClassName,
  inactiveClassName
}: TogglePillProps) {
  const baseClasses = 'rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
  const activeClasses = activeClassName ?? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
  const inactiveClasses = inactiveClassName ?? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'

  const stateClasses = pressed ? activeClasses : inactiveClasses

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${stateClasses} ${className}`.trim()}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      type='button'
    >
      {children}
    </button>
  )
}
