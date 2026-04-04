'use client'

import { useToastStore } from '@/src/lib/store/toastStore'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md pointer-events-auto',
            t.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
