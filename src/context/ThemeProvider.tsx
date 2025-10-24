'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    actualTheme: 'light' | 'dark' // The resolved theme (system resolves to light/dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('system')
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        // Load theme from localStorage (only on client side)
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme | null
            if (savedTheme) {
                setTheme(savedTheme)
            }
        }
    }, [])

    useEffect(() => {
        // Update actualTheme when theme changes (only on client side)
        if (typeof window === 'undefined') return

        const updateActualTheme = () => {
            if (theme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                setActualTheme(systemPrefersDark ? 'dark' : 'light')
            } else {
                setActualTheme(theme)
            }
        }

        updateActualTheme()

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            mediaQuery.addEventListener('change', updateActualTheme)
            return () => mediaQuery.removeEventListener('change', updateActualTheme)
        }
    }, [theme])

    useEffect(() => {
        // Apply theme to document (only on client side)
        if (typeof window === 'undefined') return

        const root = document.documentElement

        if (actualTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }, [actualTheme])

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme)
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme)
        }
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme: handleSetTheme,
            actualTheme
        }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}