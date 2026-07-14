import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, description, variant }])
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toaster Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-[360px] pointer-events-none">
        {toasts.map(t => {
          const isDestructive = t.variant === 'destructive'
          return (
            <div
              key={t.id}
              className={`flex items-start justify-between p-4 rounded-xl border shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 ${
                isDestructive
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              <div className="flex gap-3">
                {isDestructive ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-left">
                  {t.title && <h4 className="text-sm font-semibold leading-none mb-1">{t.title}</h4>}
                  {t.description && <p className="text-xs text-zinc-500 leading-normal">{t.description}</p>}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-colors ml-4 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
