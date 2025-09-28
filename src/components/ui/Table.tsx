// components/ui/table.tsx
import * as React from 'react'


export type Column<T> = { key: keyof T; label: string; sortable?: boolean; render?: (row: T) => React.ReactNode }


export function Table<T extends { id: string }>({ columns, rows, onSort, sortKey, sortDir }: {
columns: Column<T>[]
rows: T[]
onSort?: (key: keyof T) => void
sortKey?: keyof T
sortDir?: 'asc' | 'desc'
}) {
return (
<div className="overflow-hidden rounded-2xl border border-gray-200">
<table className="w-full text-left text-sm">
<thead className="bg-surface-muted">
<tr>
{columns.map((c) => (
<th key={String(c.key)} className="px-4 py-2 font-medium text-gray-700">
<button
className="inline-flex items-center gap-1"
onClick={() => c.sortable && onSort?.(c.key)}
>
{c.label}
{c.sortable && sortKey === c.key && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
</button>
</th>
))}
</tr>
</thead>
<tbody>
{rows.map((r) => (
<tr key={r.id} className="border-t hover:bg-surface-muted/60">
{columns.map((c) => (
<td key={String(c.key)} className="px-4 py-2 text-gray-800">{c.render ? c.render(r) : (r[c.key] as any)}</td>
))}
</tr>
))}
</tbody>
</table>
</div>
)
}