// PackIcon.tsx
'use client'
import Image from 'next/image'
import { packIconPath } from '@/src/components/sim/packAssets'

export function PackIcon({
  name,
  size = 16,
  owned = true,
  className = '',
}: {
  name: string
  size?: number
  owned?: boolean
  className?: string
}) {
  return (
    <Image
      src={packIconPath(name)}
      alt={name}
      width={size}
      height={size}
      className={`${owned ? '' : 'opacity-50 grayscale'} ${className}`}
    />
  )
}
