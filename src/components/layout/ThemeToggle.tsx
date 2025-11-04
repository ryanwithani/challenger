'use client'

import { useTheme } from '@/src/context/ThemeProvider'
import { Button } from '@/src/components/ui/Button'

export function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme()

    const themes = [
        {
            value: 'light' as const,
            label: 'Light',
            icon: '☀️',
            description: 'Always use light mode'
        },
        {
            value: 'dark' as const,
            label: 'Dark',
            icon: '🌙',
            description: 'Always use dark mode'
        },
        {
            value: 'system' as const,
            label: 'System',
            icon: '💻',
            description: 'Follow system preference'
        },
    ]

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Appearance
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose how the interface looks to you.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {themes.map((themeOption) => (
                    <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value)}
                        className={`
              flex items-center justify-between p-4 rounded-lg border-2 transition-all
              ${theme === themeOption.value
                                ? 'border-brand-500 bg-brand-100 dark:bg-brand-900/40'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
            `}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{themeOption.icon}</span>
                            <div className="text-left">
                                <div className={`font-medium ${theme === themeOption.value
                                    ? 'text-brand-600'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    {themeOption.label}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {themeOption.description}
                                </div>
                            </div>
                        </div>

                        {theme === themeOption.value && (
                            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Current theme indicator */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Currently using: <span className="font-medium">{actualTheme}</span> mode
                {theme === 'system' && (
                    <span> (auto-detected from system)</span>
                )}
            </div>
        </div>
    )
}