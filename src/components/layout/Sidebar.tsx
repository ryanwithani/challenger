'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { TbHome, TbTarget, TbUser, TbUsers } from 'react-icons/tb'
import { useAuthStore } from '@/src/lib/store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: TbHome },
  { name: 'Challenges', href: '/dashboard/challenges', icon: TbTarget },
  { name: 'Sims', href: '/sims', icon: TbUsers },
  { name: 'Profile', href: '/profile', icon: TbUser },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, userProfile } = useAuthStore()
  const displayName = userProfile?.display_name || userProfile?.username || user?.user_metadata?.username || 'Challenger'
  const userInitial = displayName.charAt(0).toUpperCase()

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-warmGray-900 border-r border-warmGray-800 flex-col transition-colors">
        <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = isActiveLink(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      {
                        'bg-brand-900/40 text-brand-300': isActive,
                        'text-warmGray-400 hover:bg-warmGray-800 hover:text-warmGray-100': !isActive,
                      }
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 h-6 w-6 flex-shrink-0',
                        {
                          'text-brand-400': isActive,
                          'text-warmGray-500 group-hover:text-warmGray-300': !isActive,
                        }
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div>{item.name}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* User Section */}
        <div className="flex-shrink-0 flex border-t border-warmGray-800 p-5">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-base font-bold">{userInitial}</span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-base font-medium text-warmGray-300 truncate">
                {displayName}
              </p>
            </div>

            {/* Settings Icon */}
            <Link
              href="/profile"
              className="ml-2 p-2 rounded-lg text-warmGray-500 hover:text-warmGray-200 hover:bg-warmGray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation — unchanged */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-muted dark:bg-warmGray-900 border-t border-brand-100 dark:border-warmGray-700">
        <div className="flex justify-around items-center h-[72px]">
          {navigation.map((item) => {
            const isActive = isActiveLink(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center flex-1 h-full text-[11px] font-semibold tracking-wide transition-colors',
                  {
                    'text-brand-600 dark:text-brand-400': isActive,
                    'text-warmGray-500 dark:text-warmGray-400': !isActive,
                  }
                )}
              >
                <item.icon className="h-6 w-6 mb-1" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
