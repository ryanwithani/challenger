import { cn } from '@/src/lib/utils/cn'
export function Chip({ active, children, onClear }: { active?: boolean; children: React.ReactNode; onClear?: () => void }) {
return (
<span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs', active ? 'border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'border-warmGray-200 dark:border-warmGray-700 text-warmGray-700 dark:text-warmGray-300')}>
{children}
{onClear && (
<button onClick={onClear} className="ml-1 text-warmGray-500 dark:text-warmGray-400 hover:text-warmGray-800 dark:hover:text-warmGray-200">✕</button>
)}
</span>
)
}