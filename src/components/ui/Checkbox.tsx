import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export function Checkbox({ label, className, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
return (
<label className={cn('inline-flex items-center gap-2 text-sm text-warmGray-800 dark:text-warmGray-200', className)}>
<input type="checkbox" className="h-4 w-4 rounded border-warmGray-300 dark:border-warmGray-600 text-brand-600 focus:ring-brand-400" {...props} />
{label && <span>{label}</span>}
</label>
)
}
