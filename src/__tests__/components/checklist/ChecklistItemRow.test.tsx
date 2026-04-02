import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistItemRow } from '@/src/components/checklist/ChecklistItemRow'
import type { ChecklistItem } from '@/src/data/checklists/types'

const mockItem: ChecklistItem = {
  key: 'skills:Cooking',
  name: 'Cooking',
  category: 'Cooking',
  pack: 'TS4',
}

describe('ChecklistItemRow', () => {
  test('renders item name and pack badge', () => {
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={jest.fn()} />)

    expect(screen.getByText('Cooking')).toBeInTheDocument()
    expect(screen.getByText('TS4')).toBeInTheDocument()
  })

  test('shows checked state when completed', () => {
    render(<ChecklistItemRow item={mockItem} completed={true} onToggle={jest.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  test('shows unchecked state when not completed', () => {
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={jest.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  test('calls onToggle with item key when clicked', () => {
    const onToggle = jest.fn()
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('skills:Cooking')
  })

  test('applies completed styling when checked', () => {
    render(<ChecklistItemRow item={mockItem} completed={true} onToggle={jest.fn()} />)

    const nameElement = screen.getByText('Cooking')
    expect(nameElement).toHaveClass('line-through')
  })
})
