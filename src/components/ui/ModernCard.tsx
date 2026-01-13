export function ModernCard({
  children,
  className = '',
  gradient = false
}: {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}) {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-lg border-2 border-gray-100 dark:border-brand-800 hover:shadow-xl transition-all duration-300 ${gradient ? 'bg-gradient-to-br from-white to-brand-50 dark:from-surface-dark dark:to-brand-900/30' : ''
      } ${className}`}>
      {children}
    </div>
  )
}