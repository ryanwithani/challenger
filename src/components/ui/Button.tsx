import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-brand-primary hover:bg-brand-primary/80 text-white focus:ring-brand-primary': variant === 'primary',
            'bg-brand-accent hover:bg-brand-accent/80 text-white focus:ring-brand-accent': variant === 'secondary',
            'border border-gray-300 hover:border-gray-400 text-gray-700 bg-white': variant === 'outline',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'