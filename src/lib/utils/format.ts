export function formatConfigValue(value: string): string {
    return value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
}

export function getDifficultyColor(startType: string): string {
    switch (startType) {
        case 'ultra_extreme': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        case 'extreme': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
}