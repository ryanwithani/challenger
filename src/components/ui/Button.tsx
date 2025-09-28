import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils/cn'


const buttonVariants = cva(
'inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:pointer-events-none',
{
variants: {
variant: {
primary: 'bg-brand-500 text-white hover:bg-brand-600',
secondary: 'bg-surface-muted text-brand-700 hover:bg-brand-100',
ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
destructive: 'bg-red-600 text-white hover:bg-red-700',
},
size: {
sm: 'h-8 px-3 text-sm',
md: 'h-10 px-4 text-sm',
lg: 'h-12 px-6 text-base',
},
},
defaultVariants: { variant: 'primary', size: 'md' },
}
)


export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement>,
VariantProps<typeof buttonVariants> {}


export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
({ className, variant, size, ...props }, ref) => (
<button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
)
)
Button.displayName = 'Button'