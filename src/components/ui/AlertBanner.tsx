'use client'
import { TbAlertTriangle, TbAlertCircle } from 'react-icons/tb'

interface AlertBannerProps {
  type: 'error' | 'warning'
  messages: string[]
  actions?: React.ReactNode
}

export function AlertBanner({ type, messages, actions }: AlertBannerProps) {
  const isError = type === 'error'
  return (
    <div
      className={
        isError
          ? 'mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-xl'
          : 'mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-xl'
      }
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <TbAlertCircle
            className="shrink-0 mt-0.5 text-xl text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        ) : (
          <TbAlertTriangle
            className="shrink-0 mt-0.5 text-xl text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          <p
            className={
              isError
                ? 'font-semibold mb-2 text-red-800 dark:text-red-200'
                : 'font-semibold mb-2 text-amber-800 dark:text-amber-200'
            }
          >
            Please fix the following errors:
          </p>
          <ul
            className={
              isError
                ? 'text-sm space-y-1 list-disc list-inside text-red-700 dark:text-red-300'
                : 'text-sm space-y-1 list-disc list-inside text-amber-700 dark:text-amber-300'
            }
          >
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
          {actions && <div className="mt-3 flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
