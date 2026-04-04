import { cn } from '@/src/lib/utils/cn'

export function ModernCard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-white dark:bg-warmGray-900 rounded-2xl p-6 shadow-sm border border-warmGray-100 dark:border-warmGray-800 transition-colors', className)}>
      {children}
    </div>
  )
}
