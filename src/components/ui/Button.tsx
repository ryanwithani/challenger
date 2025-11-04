import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-brand-500 to-accent-500 dark:from-brand-600 dark:to-accent-600 text-white hover:from-brand-600 hover:to-accent-600 dark:hover:from-brand-700 dark:hover:to-accent-700 shadow-lg border-none',
                secondary: 'bg-gradient-to-r from-brand-400 to-brand-600 text-white hover:from-brand-500 hover:to-brand-700 shadow-lg border-none',
                accent: 'bg-accent-500 text-white shadow-md hover:bg-accent-600 hover:shadow-lg active:bg-accent-700',
                outline: 'border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 active:bg-brand-100 dark:active:bg-brand-800/30',
                ghost: 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-300 active:bg-brand-100 dark:active:bg-brand-800/30',
                destructive: 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:bg-red-800',
                gradient: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl',
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