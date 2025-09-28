import * as React from 'react'


export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
if (!open) return null
return (
<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
<div className="w-full max-w-lg rounded-2xl bg-white shadow-card">
<div className="flex items-center justify-between border-b px-5 py-3">
<h2 className="text-base font-semibold text-gray-900">{title}</h2>
<button aria-label="Close" onClick={onClose} className="rounded-lg p-1 hover:bg-surface-muted">✕</button>
</div>
<div className="p-5">{children}</div>
</div>
</div>
)
}