'use client'

import { useState } from 'react'
import { cn } from '@/src/lib/utils/cn'

type AvatarSize = 'sm' | 'md' | 'lg'

const AVATAR_SIZE: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-lg' },
  lg: { container: 'w-20 h-20', text: 'text-2xl' },
}

interface AvatarCircleProps {
  avatarUrl?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}

/**
 * Round avatar with initials fallback.
 * Falls back to initials if avatarUrl is absent or fails to load.
 */
export function AvatarCircle({ avatarUrl, name, size = 'md', className }: AvatarCircleProps) {
  const [imgError, setImgError] = useState(false)
  const { container, text } = AVATAR_SIZE[size]
  const showInitials = !avatarUrl || imgError

  return (
    <div
      className={cn(
        container,
        'rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center',
        'bg-brand-100 dark:bg-brand-900/40',
        className,
      )}
    >
      {!showInitials && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl!}
          alt={name ?? 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {showInitials && (
        <span className={cn('text-brand-500 dark:text-brand-300 font-bold font-display', text)}>
          {name?.charAt(0)?.toUpperCase() ?? 'S'}
        </span>
      )}
    </div>
  )
}
