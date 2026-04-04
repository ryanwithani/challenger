import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
return <label className={cn('mb-1 block text-sm font-medium text-warmGray-800 dark:text-warmGray-200', className)} {...props} />
}