import { cn } from '@/src/lib/utils/cn'
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
return <span className={cn('inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700', className)}>{children}</span>
}