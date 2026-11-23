/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, TriangleAlert, X } from 'lucide-react'
import { cx } from './cx'
import s from './ui.module.css'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, { tone = 'success', duration = 3600 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((current) => [...current, { id, message, tone }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={s.toastWrap} aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={cx(s.toast, toast.tone === 'error' && s.toastError)}>
            <span className={s.toastIcon}>
              {toast.tone === 'error' ? (
                <TriangleAlert size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
            </span>
            <span>{toast.message}</span>
            <button
              type="button"
              className={s.toastClose}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
