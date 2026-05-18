'use client'

import { CToast, CToastBody, CToaster } from '@coreui/react-pro'
import { useCallback, useState } from 'react'

export type AppToastColor = 'success' | 'danger' | 'warning' | 'info'

export type AppToastItem = {
  id: number
  message: string
  color: AppToastColor
}

export function useAppToast() {
  const [toasts, setToasts] = useState<AppToastItem[]>([])

  const pushToast = useCallback((message: string, color: AppToastColor = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, color }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return { toasts, pushToast }
}

export function AppToaster({ toasts }: { toasts: AppToastItem[] }) {
  return (
    <CToaster placement="top-end" className="p-3" style={{ zIndex: 1200 }}>
      {toasts.map((toast) => (
        <CToast key={toast.id} autohide={false} color={toast.color} className="text-white">
          <CToastBody>{toast.message}</CToastBody>
        </CToast>
      ))}
    </CToaster>
  )
}
