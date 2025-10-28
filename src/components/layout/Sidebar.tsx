'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { TbHome, TbTarget, TbUser, TbUsers, TbPlus } from 'react-icons/tb'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: TbHome,
    description: 'Overview and activity'
  },
  {
    name: 'Challenges',
    href: '/dashboard/challenges',
    icon: TbTarget,
    description: 'Manage your challenges'
  },
  {
    name: 'Sims',
    href: '/dashboard/sims',
    icon: TbUsers,
    description: 'View all your sims'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: TbUser,
    description: 'Your account settings'
  },
]

const quickActions = [
  {
    name: 'New Challenge',
    href: '/dashboard/new/challenge',
    icon: TbTarget,
  },
  {
    name: 'Add Sim',
    href: '/dashboard/new/sim',
    icon: TbPlus,
  }
]

export function Sidebar() {
  const pathname = usePathname()

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300',
                    {
                      'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-blue-500 dark:to-purple-600 text-white shadow-lg': isActive,
                      'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                    }
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      {
                        'text-white': isActive,  // Keep white for active
                        'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300': !isActive,
                      }
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    {!isActive && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* User Section */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-sims-green to-sims-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sims Challenger
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Challenge your gameplay
            </p>
          </div>

          {/* Settings Icon */}
          <Link
            href="/profile"
            className="ml-2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}