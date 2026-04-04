import { cn } from '@/src/lib/utils/cn'

export function EmptyState({ title, body, cta, className }: { title: string; body?: string; cta?: React.ReactNode; className?: string }) {
    return (
    <div className={cn('grid place-items-center rounded-2xl border border-dashed border-warmGray-300 dark:border-warmGray-700 bg-white dark:bg-warmGray-900 p-10 text-center', className)}>
    <div className="mb-3 text-4xl">💎</div>
    <h3 className="mb-1 text-lg font-semibold text-warmGray-900 dark:text-warmGray-50">{title}</h3>
    {body && <p className="mb-4 text-sm text-warmGray-600 dark:text-warmGray-400">{body}</p>}
    {cta}
    </div>
    )
    }
