import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineConfirm } from '@/src/components/ui/InlineConfirm'

describe('InlineConfirm', () => {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the message', () => {
    render(
      <InlineConfirm
        message="Discard your progress?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByText('Discard your progress?')).toBeDefined()
  })

  test('renders default button labels', () => {
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDefined()
  })

  test('renders custom button labels', () => {
    render(
      <InlineConfirm
        message="Delete this?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined()
  })

  test('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  test('calls onCancel when keep-editing button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
