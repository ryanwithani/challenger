'use client'

import { cn } from '@/src/lib/utils/cn'

interface SimIconProps {
    className?: string
    size?: number
}

export function SimIcon({ className, size = 64 }: SimIconProps) {
    return (
        <div
            className={cn(
                'relative transition-all duration-300 hover:scale-105',
                'sim-icon-gradient-mask',
                className
            )}
            style={{
                width: size,
                height: size,
            }}
            role="img"
            aria-label="Sims"
        />
    )
}
