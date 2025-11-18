'use client'

import { Transition, TransitionChild } from '@headlessui/react'
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { createContext, Fragment, useCallback, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast (): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider ({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration !== undefined && duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration: number = 3000) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    // Error toasts don't auto-close by default (duration = undefined = Infinity)
    showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration: number = 3000) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message: string, duration: number = 3000) => {
    showToast(message, 'info', duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer ({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-end gap-2 p-4 sm:p-6'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem ({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [show, setShow] = useState(true)

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className='size-6 text-white' />
      case 'error':
        return <ExclamationCircleIcon className='size-6 text-white' />
      case 'warning':
        return <ExclamationTriangleIcon className='size-6 text-white' />
      case 'info':
        return <InformationCircleIcon className='size-6 text-white' />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'info':
        return 'bg-blue-500'
    }
  }

  return (
    <Transition show={show} as={Fragment}>
      <div className='pointer-events-auto w-fit min-w-80 max-w-screen-sm'>
        <TransitionChild
          as={Fragment}
          enter='transform ease-out duration-300 transition'
          enterFrom='translate-y-full opacity-0'
          enterTo='translate-y-0 opacity-100'
          leave='transition ease-in duration-200'
          leaveFrom='translate-y-0 opacity-100'
          leaveTo='translate-y-full opacity-0'
        >
          <div className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg ${getBgColor()}`}>
            {getIcon()}
            <div className='flex-1 text-sm font-medium text-white'>
              {toast.message}
            </div>
            <div className='h-6 w-px bg-white' />
            <button
              onClick={handleClose}
              className='shrink-0 rounded-lg p-1 transition-colors hover:bg-white/5'
              aria-label='閉じる'
            >
              <XMarkIcon className='size-5 stroke-2 text-white' />
            </button>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  )
}
