import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-2xl transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
                    'resize-none bg-white text-gray-900',
                    'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

Textarea.displayName = 'Textarea'