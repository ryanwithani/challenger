'use client'

import { useState, useEffect, useRef } from 'react'

interface FadeTransitionProps {
  stepKey: number
  children: React.ReactNode
}

export function FadeTransition({ stepKey, children }: FadeTransitionProps) {
  const [visible, setVisible] = useState(true)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setVisible(false)
    const timer = setTimeout(() => {
      setVisible(true)
    }, 120)
    return () => clearTimeout(timer)
  }, [stepKey])

  return (
    <div className={`transition-opacity duration-[120ms] ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}
