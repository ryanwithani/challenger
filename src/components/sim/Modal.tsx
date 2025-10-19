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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={clsx(
            'w-full max-w-4xl rounded-xl bg-white p-4 shadow-xl outline-none',
            className
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
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
