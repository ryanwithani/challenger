import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
return (
<div className="inline-flex gap-2 rounded-xl bg-surface-muted p-1">
{tabs.map((t) => (
<button
key={t}
onClick={() => onChange(t)}
className={cn(
'rounded-lg px-3 py-1.5 text-sm transition-colors',
value === t ? 'bg-white dark:bg-warmGray-900 text-brand-700 dark:text-brand-300 shadow' : 'text-warmGray-600 dark:text-warmGray-400 hover:text-warmGray-900 dark:hover:text-warmGray-100'
)}
>
{t}
</button>
))}
</div>
)
}