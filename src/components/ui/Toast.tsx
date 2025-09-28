import { useEffect, useState } from 'react'


export function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
const [open, setOpen] = useState(true)
useEffect(() => {
const id = setTimeout(() => setOpen(false), 2500)
return () => clearTimeout(id)
}, [])
if (!open) return null
return (
<div className={`fixed bottom-4 right-4 rounded-xl px-4 py-2 text-sm text-white shadow-card ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{message}</div>
)
}