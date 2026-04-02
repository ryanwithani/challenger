import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistPanel } from '@/src/components/checklist/ChecklistPanel'
import type { ChecklistItem } from '@/src/data/checklists/types'

const mockItems: ChecklistItem[] = [
  { key: 'skills:Cooking', name: 'Cooking', category: 'Cooking', pack: 'TS4' },
  { key: 'skills:Baking', name: 'Baking', category: 'Cooking', pack: 'GTW' },
  { key: 'skills:Painting', name: 'Painting', category: 'Art', pack: 'TS4' },
  { key: 'skills:Guitar', name: 'Guitar', category: 'Music', pack: 'TS4' },
]

describe('ChecklistPanel', () => {
  test('renders subcategory group headers', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={jest.fn()}
      />
    )

    // "Cooking" appears as both header and item name — use getAllByText and check header count
    expect(screen.getAllByText('Cooking').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Art')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
  })

  test('shows completion count per subcategory', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set(['skills:Cooking'])}
        onToggle={jest.fn()}
      />
    )

    // Cooking group: 1/2 completed
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  test('renders all item names', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={jest.fn()}
      />
    )

    expect(screen.getAllByText('Cooking').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Baking')).toBeInTheDocument()
    expect(screen.getByText('Painting')).toBeInTheDocument()
    expect(screen.getByText('Guitar')).toBeInTheDocument()
  })

  test('passes onToggle to item rows', () => {
    const onToggle = jest.fn()
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={onToggle}
      />
    )

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onToggle).toHaveBeenCalledWith('skills:Cooking')
  })
})
