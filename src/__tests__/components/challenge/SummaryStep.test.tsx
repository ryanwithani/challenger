import React from 'react'
import { render, screen } from '@testing-library/react'
import { SummaryStep } from '@/src/components/challenge/forms/challenge-wizard/SummaryStep'

jest.mock('@/src/components/sim/PackIcon', () => ({
  PackIcon: ({ packId }: { packId: string }) => <span data-testid={`pack-${packId}`} />,
}))

jest.mock('@/src/lib/utils/legacy-scoring', () => ({
  calculateLegacyScoring: jest.fn().mockReturnValue({ totalPoints: 0, breakdown: [] }),
}))

jest.mock('@/src/lib/utils/format', () => ({
  formatConfigValue: (v: string) => v,
  getDifficultyColor: () => 'bg-gray-100 text-gray-700',
}))

jest.mock('@/src/data/challenge-templates', () => ({
  CHALLENGE_TEMPLATES: [
    { value: 'legacy', label: 'Legacy Challenge', needsConfiguration: true },
    { value: 'custom', label: 'Custom', needsConfiguration: false },
  ],
}))

jest.mock('@/src/data/packs', () => ({
  getPackName: (id: string) => id,
}))

const baseData = {
  basicInfo: {
    name: 'The Smith Legacy',
    challenge_type: 'custom' as const,
    description: '',
  },
}

const onSubmit = jest.fn()
const onBack = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('SummaryStep — loading state', () => {
  test('Back button is enabled when loading is false', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={false} />
    )
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
  })

  test('Back button is disabled when loading is true', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={true} />
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  test('shows status text when loading is true', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={true} />
    )
    expect(screen.getByText('Creating your challenge...')).toBeDefined()
  })

  test('does not show status text when loading is false', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={false} />
    )
    expect(screen.queryByText('Creating your challenge...')).toBeNull()
  })
})
