import { cn } from '@/src/lib/utils/cn'

export function Switch({ checked, onChange, className }: { checked?: boolean; onChange?: (v: boolean) => void; className?: string }) {
    return (
    <button
    type="button"
    onClick={() => onChange?.(!checked)}
    aria-pressed={!!checked}
    className={cn(
      'relative h-6 w-11 rounded-full transition-colors',
      checked ? 'bg-brand-500' : 'bg-warmGray-300 dark:bg-warmGray-700',
      className
    )}
    >
    <span
    className={cn(
      'absolute top-0.5 h-5 w-5 rounded-full bg-white dark:bg-warmGray-100 transition-transform',
      checked ? 'translate-x-5' : 'translate-x-0.5'
    )}
    />
    </button>
    )
    }
