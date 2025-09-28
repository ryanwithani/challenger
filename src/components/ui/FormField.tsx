import { cn } from '@/src/lib/utils/cn'

interface FormFieldProps {
    label: string
    error?: string | null
    required?: boolean
    className?: string
    children: React.ReactNode
    description?: string
}

export function FormField({
    label,
    error,
    required,
    className,
    children,
    description
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {children}
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}