export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-100 to-accent-400/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    )
  }