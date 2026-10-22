'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)
const nextId = () => Math.random().toString(36).slice(2, 10)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timeout = timeouts.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId()
      setToasts((prev) => [...prev, { ...toast, id }])
      const duration = toast.duration ?? 4000
      const timeout = setTimeout(() => removeToast(id), duration)
      timeouts.current.set(id, timeout)
    },
    [removeToast],
  )

  useEffect(() => {
    const currentTimeouts = timeouts.current
    return () => {
      currentTimeouts.forEach((t) => clearTimeout(t))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-sage-600" aria-hidden="true" />,
    error: <AlertCircle className="h-5 w-5 text-terracotta-600" aria-hidden="true" />,
    info: <Info className="h-5 w-5 text-brand-blue-600" aria-hidden="true" />,
  }

  const bgMap = {
    success: 'bg-sage-50 border-sage-200',
    error: 'bg-terracotta-50 border-terracotta-200',
    info: 'bg-brand-blue-50 border-brand-blue-200',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-md pointer-events-auto',
        bgMap[toast.type],
      )}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</span>
      <p className="flex-1 text-sm font-medium text-charcoal-800">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-charcoal-400 hover:text-charcoal-600 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}