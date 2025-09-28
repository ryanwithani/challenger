import { sanitizeText } from '@/src/lib/utils/validators'

interface SafeTextProps {
  children: string | null | undefined
  className?: string
  fallback?: string
}

export function SafeText({ children, className, fallback = '' }: SafeTextProps) {
  const safeContent = sanitizeText(children) || fallback
  return <span className={className}>{safeContent}</span>
}