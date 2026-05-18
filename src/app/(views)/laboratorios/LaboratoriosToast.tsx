'use client'

import { CToast, CToastBody, CToaster } from '@coreui/react-pro'
import { useCallback, useState } from 'react'

export type LaboratoriosToastItem = {
  id: number
  message: string
  color: 'success' | 'danger'
}

export function useLaboratoriosToast() {
  const [toasts, setToasts] = useState<LaboratoriosToastItem[]>([])

  const pushToast = useCallback((message: string, color: 'success' | 'danger') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, color }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return { toasts, pushToast }
}

export function LaboratoriosToaster({ toasts }: { toasts: LaboratoriosToastItem[] }) {
  return (
    <CToaster placement="top-end" className="p-3" style={{ zIndex: 1100 }}>
      {toasts.map((toast) => (
        <CToast key={toast.id} autohide={false} color={toast.color} className="text-white">
          <CToastBody>{toast.message}</CToastBody>
        </CToast>
      ))}
    </CToaster>
  )
}
