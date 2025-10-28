import * as React from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: SelectOption[]
  placeholder?: string
  emptyOption?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, emptyOption = "— Select —", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <select
          ref={ref}
          className={cn(
            'h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-200',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || 'select'}-error` : undefined}
          {...props}
        >
          {(placeholder || emptyOption) && (
            <option value="" disabled={!placeholder}>
              {placeholder || emptyOption}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${props.id || 'select'}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Grouped Select component for optgroups
export interface SelectGroup {
  label: string
  options: SelectOption[]
}

export interface GroupedSelectProps extends Omit<SelectProps, 'options'> {
  groups: SelectGroup[]
}

export const GroupedSelect = React.forwardRef<HTMLSelectElement, GroupedSelectProps>(
  ({ className, error, groups, placeholder, emptyOption = "— Select —", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <select
          ref={ref}
          className={cn(
            'h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-200',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id || 'grouped-select'}-error` : undefined}
          {...props}
        >
          {(placeholder || emptyOption) && (
            <option value="" disabled={!placeholder}>
              {placeholder || emptyOption}
            </option>
          )}
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {error && (
          <p id={`${props.id || 'grouped-select'}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

GroupedSelect.displayName = 'GroupedSelect'
