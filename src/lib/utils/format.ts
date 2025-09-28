export function formatConfigValue(value: string): string {
    return value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
}

export function getDifficultyColor(startType: string): string {
    switch (startType) {
        case 'ultra_extreme': return 'bg-red-100 text-red-800'
        case 'extreme': return 'bg-amber-100 text-amber-800'
        default: return 'bg-green-100 text-green-800'
    }
}