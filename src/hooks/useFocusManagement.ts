'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface FocusManagementOptions {
  /**
   * Whether to focus the first focusable element when the component mounts
   */
  autoFocus?: boolean
  /**
   * Whether to trap focus within the component
   */
  trapFocus?: boolean
  /**
   * Whether to restore focus to the previously focused element when unmounting
   */
  restoreFocus?: boolean
  /**
   * Custom selector for focusable elements (default: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
   */
  focusableSelector?: string
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const {
    autoFocus = false,
    trapFocus = false,
    restoreFocus = false,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  } = options

  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement
    }
  }, [restoreFocus])

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(focusableSelector)
      const firstFocusable = focusableElements[0] as HTMLElement
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
  }, [autoFocus, focusableSelector])

  // Focus trap
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        containerRef.current!.querySelectorAll(focusableSelector)
      ) as HTMLElement[]

      if (focusableElements.length === 0) return

      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [trapFocus, focusableSelector])

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus()
      }
    }
  }, [restoreFocus])

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return
    const focusableElements = containerRef.current.querySelectorAll(focusableSelector)
    const firstFocusable = focusableElements[0] as HTMLElement
    if (firstFocusable) {
      firstFocusable.focus()
    }
  }, [focusableSelector])

  const focusLast = useCallback(() => {
    if (!containerRef.current) return
    const focusableElements = containerRef.current.querySelectorAll(focusableSelector)
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
    if (lastFocusable) {
      lastFocusable.focus()
    }
  }, [focusableSelector])

  const focusNext = useCallback(() => {
    if (!containerRef.current) return
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const nextIndex = (currentIndex + 1) % focusableElements.length
    focusableElements[nextIndex]?.focus()
  }, [focusableSelector])

  const focusPrevious = useCallback(() => {
    if (!containerRef.current) return
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
    focusableElements[prevIndex]?.focus()
  }, [focusableSelector])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious
  }
}
