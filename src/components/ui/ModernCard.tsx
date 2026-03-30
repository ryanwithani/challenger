export function ModernCard({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-brand-800 transition-colors ${className}`}>
      {children}
    </div>
  )
}
