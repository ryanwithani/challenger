import { cn } from '@/src/lib/utils/cn'
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
return <span className={cn('inline-flex items-center rounded-full bg-brand-50 dark:bg-brand-900/30 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300', className)}>{children}</span>
}