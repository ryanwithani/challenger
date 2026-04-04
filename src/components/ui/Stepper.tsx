import { cn } from '@/src/lib/utils/cn'

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
    return (
    <ol className="flex items-center gap-3">
    {steps.map((s, i) => (
    <li key={s} className="flex items-center gap-2">
    <span className={cn(
      'grid h-6 w-6 place-items-center rounded-full text-xs',
      i <= current ? 'bg-brand-500 text-white' : 'bg-warmGray-200 dark:bg-warmGray-700 text-warmGray-600 dark:text-warmGray-400'
    )}>{i + 1}</span>
    <span className={cn(
      'text-sm',
      i === current ? 'font-semibold text-warmGray-900 dark:text-warmGray-50' : 'text-warmGray-600 dark:text-warmGray-400'
    )}>{s}</span>
    </li>
    ))}
    </ol>
    )
    }
