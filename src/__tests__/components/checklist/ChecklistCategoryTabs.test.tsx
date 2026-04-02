import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistCategoryTabs } from '@/src/components/checklist/ChecklistCategoryTabs'

// Mock the catalog data to keep tests fast
jest.mock('@/src/data/checklists', () => ({
  CATALOG_BY_TYPE: {
    skills: Array(74).fill({ key: 'skills:test', name: 'test', category: 'test', pack: 'TS4' }),
    aspirations: Array(97).fill({ key: 'aspirations:test', name: 'test', category: 'test', pack: 'TS4' }),
    careers: Array(91).fill({ key: 'careers:test', name: 'test', category: 'test', pack: 'TS4' }),
    parties: Array(38).fill({ key: 'parties:test', name: 'test', category: 'test', pack: 'TS4' }),
    traits: Array(402).fill({ key: 'traits:test', name: 'test', category: 'test', pack: 'TS4' }),
    deaths: Array(42).fill({ key: 'deaths:test', name: 'test', category: 'test', pack: 'TS4' }),
    collections: Array(47).fill({ key: 'collections:test', name: 'test', category: 'test', pack: 'TS4' }),
  },
  CHECKLIST_CATEGORIES: ['skills', 'aspirations', 'careers', 'parties', 'traits', 'deaths', 'collections'],
  CATEGORY_LABELS: {
    skills: 'Skills', aspirations: 'Aspirations', careers: 'Careers',
    parties: 'Parties', traits: 'Traits', deaths: 'Deaths', collections: 'Collections',
  },
}))

describe('ChecklistCategoryTabs', () => {
  test('renders all 7 category tabs', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set()}
        onCategoryChange={jest.fn()}
      />
    )

    expect(screen.getByRole('tab', { name: /Skills/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Aspirations/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Deaths/ })).toBeInTheDocument()
  })

  test('marks active tab as selected', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="deaths"
        completions={new Set()}
        onCategoryChange={jest.fn()}
      />
    )

    expect(screen.getByRole('tab', { name: /Deaths/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Skills/ })).toHaveAttribute('aria-selected', 'false')
  })

  test('calls onCategoryChange when tab is clicked', () => {
    const onCategoryChange = jest.fn()
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set()}
        onCategoryChange={onCategoryChange}
      />
    )

    fireEvent.click(screen.getByRole('tab', { name: /Deaths/ }))
    expect(onCategoryChange).toHaveBeenCalledWith('deaths')
  })

  test('shows completion count in tab badge', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set(['skills:Cooking', 'skills:Painting', 'deaths:Fire'])}
        onCategoryChange={jest.fn()}
      />
    )

    // Skills tab should show "2" (2 of 74 completed with skills: prefix)
    const skillsTab = screen.getByRole('tab', { name: /Skills/ })
    expect(skillsTab).toHaveTextContent('2')
  })
})
