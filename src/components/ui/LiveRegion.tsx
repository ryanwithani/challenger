'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/src/lib/utils/cn'

export interface LiveRegionProps {
  /**
   * The message to announce
   */
  message?: string
  /**
   * The priority of the announcement ('polite' or 'assertive')
   */
  priority?: 'polite' | 'assertive'
  /**
   * Whether to clear the message after a delay
   */
  clearAfter?: number
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether the region is visible (for testing/debugging)
   */
  visible?: boolean
}

export function LiveRegion({
  message,
  priority = 'polite',
  clearAfter,
  className,
  visible = false
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Set new timeout if clearAfter is specified
      if (clearAfter && clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          setCurrentMessage('')
        }, clearAfter)
      }
    }
  }, [message, clearAfter])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={cn(
        'sr-only',
        visible && 'not-sr-only absolute top-0 left-0 bg-yellow-100 border border-yellow-300 p-2 text-sm',
        className
      )}
    >
      {currentMessage}
    </div>
  )
}

export interface LiveRegionManagerProps {
  /**
   * The current error message
   */
  error?: string
  /**
   * The current success message
   */
  success?: string
  /**
   * The current info message
   */
  info?: string
  /**
   * Whether to clear messages after a delay
   */
  clearAfter?: number
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether the regions are visible (for testing/debugging)
   */
  visible?: boolean
}

export function LiveRegionManager({
  error,
  success,
  info,
  clearAfter = 5000,
  className,
  visible = false
}: LiveRegionManagerProps) {
  return (
    <div className={cn('', className)}>
      <LiveRegion
        message={error}
        priority="assertive"
        clearAfter={clearAfter}
        visible={visible}
      />
      <LiveRegion
        message={success}
        priority="polite"
        clearAfter={clearAfter}
        visible={visible}
      />
      <LiveRegion
        message={info}
        priority="polite"
        clearAfter={clearAfter}
        visible={visible}
      />
    </div>
  )
}
