import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
error?: string
}


export function Input({ className, error, ...props }: InputProps) {
return (
<div className="space-y-1">
<input
className={cn(
'h-10 w-full rounded-xl border border-warmGray-300 dark:border-warmGray-600 bg-white dark:bg-warmGray-800 px-3 text-sm text-warmGray-900 dark:text-warmGray-100 placeholder:text-warmGray-400 dark:placeholder:text-warmGray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800',
error && 'border-red-500 focus:ring-red-200',
className
)}
{...props}
/>
{error && <p className="text-xs text-red-600">{error}</p>}
</div>
)
}