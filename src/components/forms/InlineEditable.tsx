'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Input } from '@/src/components/ui/Input'
import { Select } from '@/src/components/ui/Select'

// Tiny local button to avoid styling conflicts with your global <Button>
function InlineButton({
  kind = 'primary',
  disabled,
  onClick,
  children,
  className = '',
  size = 'sm',
  ...rest
}: {
  kind?: 'primary' | 'outline'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1'
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'

  // Use your brand color if available; fall back to indigo
  const primary = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
  const outline = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(base, sizing, kind === 'primary' ? primary : outline, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

type BaseProps<T> = {
  id: string
  label?: string
  value: T | null | undefined
  placeholder?: string
  editable?: boolean
  format?: (v: T | null | undefined) => React.ReactNode
  validate?: (v: T) => string | null
  onSave: (v: T) => Promise<void>
  className?: string
}

type SelectOption = { value: string; label: string }

type InlineEditableProps =
  | (BaseProps<string> & {
    type?: 'text' | 'textarea'
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
    maxLength?: number
  })
  | (BaseProps<number> & {
    type: 'number'
    min?: number
    max?: number
    step?: number
  })
  | (BaseProps<boolean> & {
    type: 'checkbox'
  })
  | (BaseProps<string> & {
    type: 'select'
    options: SelectOption[]
  })

export function InlineEditable(props: InlineEditableProps) {
  const {
    id,
    label,
    value,
    placeholder,
    editable = true,
    format,
    validate,
    onSave,
    className,
  } = props as BaseProps<any>


  // Use specific refs for each element type


  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState<any>(
    value ?? (props.type === 'number' ? 0 : props.type === 'checkbox' ? false : '')
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)


  const display = useMemo(() => {
    return format ? format(value) : (value ?? '—')
  }, [format, value])

  useEffect(() => {
    setLocal(value ?? (props.type === 'number' ? 0 : props.type === 'checkbox' ? false : ''))
  }, [value]) // keep in sync

  // Click-outside cancels edit
  useEffect(() => {
    if (!editing) return
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        handleCancel()
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [editing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
        ; (inputRef.current as any).select?.()
    }
  }, [editing])

  const beginEdit = () => {
    if (!editable || saving) return
    setError(null)
    setLocal(value ?? (props.type === 'number' ? 0 : props.type === 'checkbox' ? false : ''))
    setEditing(true)
  }

  const commit = async (next?: any) => {
    const v = next ?? local
    if (validate) {
      const msg = validate(v)
      if (msg) {
        setError(msg)
        return
      }
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(v)
      setEditing(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveClick = () => commit(local)
  const handleCancel = () => {
    setEditing(false)
    setError(null)
    setLocal(value ?? (props.type === 'number' ? 0 : props.type === 'checkbox' ? false : ''))
  }

  const commonLabel = label ? (
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
  ) : null

  return (
    <div ref={containerRef} className={className}>
      {commonLabel}

      {!editing ? (
        <button
          type="button"
          onClick={beginEdit}
          className={clsx(
            'group w-full text-left rounded-md transition-colors',
            editable ? 'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40' : ''
          )}
          aria-label={label ? `Edit ${label}` : 'Edit'}
        >
          <div className="flex items-center gap-2">
            <div className={clsx('text-lg', typeof value === 'string' ? 'font-medium text-gray-900' : 'text-gray-900')}>
              {display || <span className="text-gray-400">{placeholder ?? '—'}</span>}
            </div>
            {editable && (
              <svg
                className="opacity-0 group-hover:opacity-100 w-4 h-4 text-gray-400 transition-opacity"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5h2M4 15.5L18.5 1a2.121 2.121 0 013 3L7 18.5 3 19l1-3.5z" />
              </svg>
            )}
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          {props.type === 'textarea' && (
            <textarea
              id={id}
              ref={textareaRef}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              maxLength={(props as any).maxLength}
              placeholder={placeholder}
              value={local ?? ''}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || e.shiftKey)) return
                if (e.key === 'Enter') { e.preventDefault(); commit((e.target as HTMLTextAreaElement).value) }
                if (e.key === 'Escape') { e.preventDefault(); handleCancel() }
              }}
            />
          )}

          {(props.type === undefined || props.type === 'text') && (
            <Input
              id={id}
              placeholder={placeholder}
              value={local ?? ''}
              maxLength={(props as any).maxLength}
              inputMode={(props as any).inputMode}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit((e.target as HTMLInputElement).value) }
                if (e.key === 'Escape') { e.preventDefault(); handleCancel() }
              }}
            />
          )}

          {props.type === 'number' && (
            <Input
              id={id}
              type="number"
              placeholder={placeholder}
              value={local ?? 0}
              min={(props as any).min}
              max={(props as any).max}
              step={(props as any).step ?? 1}
              onChange={(e) => setLocal(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit(Number((e.target as HTMLInputElement).value)) }
                if (e.key === 'Escape') { e.preventDefault(); handleCancel() }
              }}
            />
          )}

          {props.type === 'select' && (
            <Select
              id={id}
              ref={selectRef}
              className="w-full"
              value={local ?? ''}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit((e.target as HTMLSelectElement).value) }
                if (e.key === 'Escape') { e.preventDefault(); handleCancel() }
              }}
              options={(props as any).options || []}
            />
          )}

          {props.type === 'checkbox' && (
            <div className="flex items-center gap-2">
              <input
                id={id}
                ref={inputRef}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={!!local}
                onChange={(e) => setLocal(e.target.checked)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commit((e.target as HTMLInputElement).checked) }
                  if (e.key === 'Escape') { e.preventDefault(); handleCancel() }
                }}
              />
              <span className="text-sm text-gray-700">Toggle</span>
            </div>
          )}

          {/* Action row with hard-styled buttons so they are ALWAYS visible */}
          <div className="flex items-center gap-2">
            <InlineButton onClick={handleSaveClick} disabled={saving} size="sm" kind="primary">
              {saving ? 'Saving…' : 'Save'}
            </InlineButton>
            <InlineButton onClick={handleCancel} disabled={saving} size="sm" kind="outline">
              Cancel
            </InlineButton>
            <div role="status" aria-live="polite" className="text-sm text-red-600">
              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
