import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export function Tooltip({ text, children, className }: { text: string; children: React.ReactNode; className?: string }) {
return (
<span className={cn('group relative inline-block', className)}>
{children}
<span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-warmGray-900 dark:bg-warmGray-100 px-2 py-1 text-xs text-white dark:text-warmGray-900 opacity-0 transition-opacity group-hover:opacity-100">
{text}
</span>
</span>
)
}
