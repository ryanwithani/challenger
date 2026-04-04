import { cn } from '@/src/lib/utils/cn'

export function RadialProgress({ value, size = 80, className }: { value: number; size?: number; className?: string }) {
    const radius = (size - 10) / 2
    const circumference = 2 * Math.PI * radius
    const clamped = Math.min(100, Math.max(0, value))
    const offset = circumference - (clamped / 100) * circumference
    return (
    <svg width={size} height={size} className={cn('text-warmGray-200 dark:text-warmGray-700', className)}>
    <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="10" fill="none" />
    <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke="currentColor"
    strokeWidth="10"
    strokeLinecap="round"
    className="text-brand-500 transition-all"
    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
    fill="none"
    />
    </svg>
    )
    }
