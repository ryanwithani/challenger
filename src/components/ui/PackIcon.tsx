import { cn } from '@/src/lib/utils/cn'

interface PackIconProps {
    packKey: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function PackIcon({ packKey, size = 'md', className }: PackIconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    return (
        <img
            src={`/packs/${packKey}.png`}
            alt={packKey.replace('_', ' ')}
            className={cn(sizeClasses[size], className)}
            onError={(e) => {
                // Fallback to a default icon or hide if pack icon doesn't exist
                e.currentTarget.style.display = 'none'
            }}
        />
    )
}