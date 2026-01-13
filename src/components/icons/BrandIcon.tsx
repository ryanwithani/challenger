'use client'

import Image from 'next/image'

interface BrandIconProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
}

export function BrandIcon({ src, alt, className = '', width = 64, height = 64 }: BrandIconProps) {
    return (
        <div className={`relative icon-brand ${className}`}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="w-full h-full object-contain"
                style={{ background: 'transparent' }}
            />
        </div>
    )
}
