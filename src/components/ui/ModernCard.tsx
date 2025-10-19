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
      <div className={`bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300 ${
        gradient ? 'bg-gradient-to-br from-white to-purple-50' : ''
      } ${className}`}>
        {children}
      </div>
    )
  }