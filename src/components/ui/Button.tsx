import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-brand-500 text-white shadow-md hover:bg-brand-600 hover:shadow-lg active:bg-brand-700',
                secondary: 'bg-surface-muted text-brand-700 border border-gray-200 hover:bg-gray-50 hover:text-brand-800',
                accent: 'bg-accent-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg active:bg-green-700',
                outline: 'border-2 border-brand-500 text-brand-500 bg-transparent hover:bg-brand-50 active:bg-brand-100',
                ghost: 'text-brand-600 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100',
                destructive: 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:bg-red-800',
                gradient: 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg hover:from-brand-600 hover:to-purple-700 hover:shadow-xl',
            },
            size: {
                sm: 'h-8 px-3 text-sm',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
                xl: 'h-14 px-8 text-lg',
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