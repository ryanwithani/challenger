'use client'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'

export function Modal({
  open, onClose, title, children, className = '',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus trap (very lightweight)
  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    const prev = document.activeElement as HTMLElement | null
    el?.focus()
    return () => prev?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      <div className="absolute inset-0 flex items-center justify-center p-4" onClick={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            'w-full max-w-4xl rounded-2xl bg-white dark:bg-warmGray-900 border border-warmGray-200 dark:border-warmGray-800 p-4 shadow-xl outline-none',
            className
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-warmGray-900 dark:text-warmGray-100">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-2 py-1 text-sm text-warmGray-600 dark:text-warmGray-400 hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Close
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
