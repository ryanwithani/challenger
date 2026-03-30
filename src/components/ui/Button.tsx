import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-brand-500 dark:bg-brand-600 text-white hover:bg-brand-600 dark:hover:bg-brand-700 border-none',
                secondary: 'bg-brand-400 dark:bg-brand-500 text-white hover:bg-brand-500 dark:hover:bg-brand-600 border-none',
                accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 dark:bg-accent-600 dark:hover:bg-accent-700',
                outline: 'border border-brand-500 dark:border-brand-400 text-brand-500 dark:text-brand-400 bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/20 active:bg-brand-100 dark:active:bg-brand-800/30',
                ghost: 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-300 active:bg-brand-100 dark:active:bg-brand-800/30',
                destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800',
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