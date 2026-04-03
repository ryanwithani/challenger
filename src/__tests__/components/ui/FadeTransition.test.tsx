import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { FadeTransition } from '@/src/components/ui/FadeTransition'

describe('FadeTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders children on initial mount', () => {
    render(<FadeTransition stepKey={1}><div>Step 1 content</div></FadeTransition>)
    expect(screen.getByText('Step 1 content')).toBeDefined()
  })

  test('is visible on initial mount', () => {
    const { container } = render(
      <FadeTransition stepKey={1}><div>Content</div></FadeTransition>
    )
    expect(container.firstChild).toHaveClass('opacity-100')
  })

  test('becomes invisible immediately when stepKey changes', () => {
    const { container, rerender } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)
    expect(container.firstChild).toHaveClass('opacity-0')
  })

  test('swaps children and becomes visible after 120ms', () => {
    const { container, rerender } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)

    act(() => { jest.advanceTimersByTime(120) })

    expect(screen.getByText('Step 2')).toBeDefined()
    expect(container.firstChild).toHaveClass('opacity-100')
  })

  test('clears pending timer on unmount', () => {
    const { rerender, unmount } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)
    // Should not throw when unmounted mid-transition
    expect(() => unmount()).not.toThrow()
  })
})
