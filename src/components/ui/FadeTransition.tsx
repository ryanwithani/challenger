'use client'

import { useState, useEffect, useRef } from 'react'

interface FadeTransitionProps {
  stepKey: number
  children: React.ReactNode
}

export function FadeTransition({ stepKey, children }: FadeTransitionProps) {
  const [visible, setVisible] = useState(true)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const pendingChildren = useRef(children)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    pendingChildren.current = children
    setVisible(false)
    const timer = setTimeout(() => {
      setDisplayedChildren(pendingChildren.current)
      setVisible(true)
    }, 120)
    return () => clearTimeout(timer)
  // stepKey intentionally omitted from deps — we only want to trigger on stepKey change,
  // and children is captured via ref to avoid stale closure issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  return (
    <div className={`transition-opacity duration-[120ms] ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {displayedChildren}
    </div>
  )
}
