'use client'

import { cn } from '@/src/lib/utils/cn'

interface ChallengeIconProps {
    className?: string
    size?: number
}

export function ChallengeIcon({ className, size = 64 }: ChallengeIconProps) {
    return (
        <div
            className={cn(
                'relative transition-all duration-300 hover:scale-105',
                'challenge-icon-gradient-mask',
                className
            )}
            style={{
                width: size,
                height: size,
            }}
            role="img"
            aria-label="Challenges"
        />
    )
}
