import type { ReactNode } from 'react'

export default function WithoutSupportLayout ({ children }: { children: ReactNode }) {
  return (
    <div className='bg-white dark:bg-atom-one-dark'>
      {children}
    </div>
  )
}
