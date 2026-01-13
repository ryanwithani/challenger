'use client'

import Image from 'next/image'
import { cn } from '@/src/lib/utils/cn'

interface CrownIconProps {
    className?: string
    size?: number
}

export function CrownIcon({ className, size = 48 }: CrownIconProps) {
    return (
        <div
            className={cn(
                'relative transition-all duration-300 hover:scale-105',
                'icon-gradient-mask',
                className
            )}
            style={{
                width: size,
                height: size,
            }}
        >
            <Image
                src="/ChallengerCrown.svg"
                alt="Challenger Crown Logo"
                width={size}
                height={size}
                className="w-full h-full object-contain"
                style={{ background: 'transparent' }}
            />
        </div>
    )
}
