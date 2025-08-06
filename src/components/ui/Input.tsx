import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sims-blue focus:border-transparent',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'