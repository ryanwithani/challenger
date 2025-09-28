import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'


export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return <div className={cn('rounded-2xl bg-white shadow-card', className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return <div className={cn('p-4 border-b border-gray-100', className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return <div className={cn('p-4', className)} {...props} />
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return <div className={cn('p-4 border-t border-gray-100', className)} {...props} />
}