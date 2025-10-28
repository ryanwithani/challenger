import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-blue-500 dark:to-purple-600 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-blue-600 dark:hover:to-purple-700 shadow-lg border-none',
                secondary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg border-none',
                accent: 'bg-accent-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg active:bg-green-700',
                outline: 'border-2 border-purple-500 text-purple-500 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 active:bg-purple-100 dark:active:bg-purple-800/30',
                ghost: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 active:bg-purple-100 dark:active:bg-purple-800/30',
                destructive: 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:bg-red-800',
                gradient: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-700 hover:shadow-xl',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-sm',
                xl: 'h-14 px-8 text-base',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md'
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean
    loadingText?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, loadingText, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size }), className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {loadingText || 'Loading...'}
                    </>
                ) : (
                    children
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'