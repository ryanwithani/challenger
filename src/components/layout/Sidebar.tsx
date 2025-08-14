'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { TbHome, TbTarget, TbUser } from 'react-icons/tb'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: TbHome },
  { name: 'Challenges', href: '/challenge/new', icon: TbTarget },
  { name: 'Profile', href: '/profile', icon: TbUser },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  {
                    'bg-brand-primary text-white': isActive,
                    'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                  }
                )}
              >
                <item.icon className="h-5 w-5 text-slate-500" aria-hidden />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Sims Challenger</p>
            <p className="text-xs text-gray-500">Challenge your gameplay</p>
          </div>
        </div>
      </div>
    </div>
  )
}
