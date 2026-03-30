import * as React from 'react'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<Element | null>(null)

  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement
      const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      first?.focus()
    } else {
      const prev = previousFocusRef.current as HTMLElement | null
      if (prev && document.contains(prev)) prev.focus()
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handleTabTrap(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !containerRef.current) return
    const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div ref={containerRef} className="w-full max-w-lg rounded-xl bg-white dark:bg-warmGray-900 shadow-lg border border-gray-200 dark:border-warmGray-700" onKeyDown={handleTabTrap} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-warmGray-800">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
