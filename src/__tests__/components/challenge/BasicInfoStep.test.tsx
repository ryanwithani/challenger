import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BasicInfoStep } from '@/src/components/challenge/forms/challenge-wizard/BasicInfoStep'

// CHALLENGE_TEMPLATES drives rendered options; mock to keep tests isolated
jest.mock('@/src/data/challenge-templates', () => ({
  CHALLENGE_TEMPLATES: [
    { value: 'legacy', label: 'Legacy Challenge', description: 'The classic legacy challenge', needsConfiguration: true },
    { value: 'custom', label: 'Custom', description: 'Build your own', needsConfiguration: false },
  ],
}))

const onNext = jest.fn()
const onCancel = jest.fn()
const onConfirmCancel = jest.fn()
const onDismissCancelConfirm = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('BasicInfoStep — cancel confirm', () => {
  test('renders Cancel button when showCancelConfirm is false', () => {
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={false}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined()
    expect(screen.queryByText('Discard your progress?')).toBeNull()
  })

  test('renders InlineConfirm when showCancelConfirm is true', () => {
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    expect(screen.getByText('Discard your progress?')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDefined()
  })

  test('InlineConfirm Discard button calls onConfirmCancel', async () => {
    const user = userEvent.setup()
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirmCancel).toHaveBeenCalledTimes(1)
  })

  test('InlineConfirm Keep editing button calls onDismissCancelConfirm', async () => {
    const user = userEvent.setup()
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(onDismissCancelConfirm).toHaveBeenCalledTimes(1)
  })
})
