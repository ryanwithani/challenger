# Standardized Wizard Components

This document outlines the new standardized wizard components and hooks that provide consistent accessibility, focus management, and user experience across all wizards in the application.

## Components

### 1. Progress Component (`src/components/ui/Progress.tsx`)

A flexible progress indicator component with multiple variants and accessibility features.

#### Features
- **Three variants**: `default`, `compact`, `minimal`
- **Accessibility**: Proper ARIA labels and step indicators
- **Customizable**: Show/hide labels and progress bar
- **Responsive**: Adapts to different screen sizes

#### Usage
```tsx
import { Progress } from '@/src/components/ui/Progress'

const steps = [
  { id: 'step1', name: 'Step 1' },
  { id: 'step2', name: 'Step 2' },
  { id: 'step3', name: 'Step 3' },
]

<Progress
  steps={steps}
  currentStep={1}
  variant="default"
  showLabels={true}
  showProgressBar={true}
  aria-label="Wizard Progress"
/>
```

#### Props
- `steps`: Array of step objects with `id`, `name`, `completed?`, `disabled?`
- `currentStep`: Current step index (0-based)
- `variant`: `'default' | 'compact' | 'minimal'`
- `showLabels`: Whether to show step labels
- `showProgressBar`: Whether to show progress bar
- `className`: Additional CSS classes
- `aria-label`: Accessibility label

### 2. Enhanced Select Component (`src/components/ui/Select.tsx`)

Updated Select and GroupedSelect components with improved accessibility.

#### Features
- **ARIA attributes**: `aria-invalid`, `aria-describedby`
- **Error handling**: Proper error message association
- **Accessibility**: Screen reader friendly error announcements

#### Usage
```tsx
import { Select, GroupedSelect } from '@/src/components/ui/Select'

// Basic Select
<Select
  id="theme"
  value={value}
  onChange={handleChange}
  options={options}
  error={error}
  placeholder="Select an option"
/>

// Grouped Select
<GroupedSelect
  id="timezone"
  value={value}
  onChange={handleChange}
  groups={groupedOptions}
  error={error}
  placeholder="Select timezone"
/>
```

### 3. Live Region Component (`src/components/ui/LiveRegion.tsx`)

Components for announcing dynamic content changes to screen readers.

#### Features
- **Live announcements**: For errors, success messages, and info
- **Priority levels**: `polite` and `assertive`
- **Auto-clear**: Optional message clearing after delay
- **Multiple types**: Error, success, and info announcements

#### Usage
```tsx
import { LiveRegion, LiveRegionManager } from '@/src/components/ui/LiveRegion'

// Single live region
<LiveRegion
  message="Step completed successfully"
  priority="polite"
  clearAfter={3000}
/>

// Multiple live regions
<LiveRegionManager
  error="Please fix the validation errors"
  success="Data saved successfully"
  info="Loading data..."
  clearAfter={5000}
/>
```

## Hooks

### 1. Focus Management Hook (`src/hooks/useFocusManagement.ts`)

Provides comprehensive focus management for keyboard navigation.

#### Features
- **Auto-focus**: Focus first element on mount
- **Focus trap**: Keep focus within component
- **Focus restoration**: Restore focus on unmount
- **Navigation helpers**: Focus first, last, next, previous

#### Usage
```tsx
import { useFocusManagement } from '@/src/hooks/useFocusManagement'

function MyComponent() {
  const { containerRef, focusFirst, focusNext } = useFocusManagement({
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true
  })

  return (
    <div ref={containerRef}>
      <button onClick={focusFirst}>Focus First</button>
      <button onClick={focusNext}>Focus Next</button>
    </div>
  )
}
```

### 2. Wizard Hook (`src/hooks/useWizard.ts`)

A comprehensive hook that combines all wizard functionality.

#### Features
- **Step management**: Navigation between steps
- **Data persistence**: Auto-save to localStorage
- **Error handling**: Comprehensive error management
- **Focus management**: Integrated focus handling
- **Live regions**: Automatic announcements
- **Progress tracking**: Step completion status

#### Usage
```tsx
import { useWizard } from '@/src/hooks/useWizard'

function MyWizard() {
  const steps = [
    { id: 'step1', name: 'Step 1' },
    { id: 'step2', name: 'Step 2' },
  ]

  const initialData = { name: '', email: '' }

  const {
    currentStep,
    currentStepInfo,
    wizardData,
    errors,
    successMessage,
    isInitialized,
    progress,
    stepStatus,
    goNext,
    goBack,
    updateData,
    clearAllErrors,
    handleError,
    cleanup,
    containerRef,
    liveRegionProps
  } = useWizard(steps, initialData, {
    autoSave: true,
    storageKey: 'my_wizard',
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
    announceStepChanges: true,
    announceErrors: true,
    announceSuccess: true
  })

  return (
    <div ref={containerRef}>
      <LiveRegionManager {...liveRegionProps} />
      <Progress steps={stepStatus} currentStep={currentStep} />
      {/* Your wizard content */}
    </div>
  )
}
```

## Migration Guide

### Updating Existing Wizards

1. **Replace custom progress indicators** with the standardized `Progress` component
2. **Update Select components** to use the enhanced versions with ARIA attributes
3. **Add focus management** using the `useFocusManagement` hook
4. **Implement live regions** for error and success announcements
5. **Consider using the `useWizard` hook** for new wizards or major refactors

### Example Migration

**Before:**
```tsx
// Custom progress indicator
<nav aria-label="Progress">
  <ol className="flex items-center justify-between">
    {steps.map((step, stepIdx) => (
      <li key={step.name} className="relative flex-1">
        {/* Custom step rendering */}
      </li>
    ))}
  </ol>
</nav>

// Basic select without ARIA
<select value={value} onChange={handleChange}>
  {options.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

**After:**
```tsx
// Standardized progress component
<Progress
  steps={stepStatus}
  currentStep={currentStep}
  variant="default"
  showLabels={true}
  showProgressBar={true}
  aria-label="Wizard Progress"
/>

// Enhanced select with ARIA
<Select
  id="my-select"
  value={value}
  onChange={handleChange}
  options={options}
  error={error}
  placeholder="Select an option"
/>
```

## Accessibility Features

### Keyboard Navigation
- **Tab navigation**: All interactive elements are keyboard accessible
- **Focus management**: Proper focus handling and restoration
- **Focus trap**: Keeps focus within modal/dialog contexts
- **Skip links**: Allow users to skip to main content

### Screen Reader Support
- **ARIA labels**: Proper labeling for all interactive elements
- **Live regions**: Announce dynamic content changes
- **Error associations**: Errors are properly associated with form fields
- **Step indicators**: Clear indication of current step and progress

### Visual Indicators
- **High contrast**: Sufficient color contrast for all text and UI elements
- **Focus indicators**: Clear visual focus indicators
- **Error states**: Distinct visual error states
- **Progress indication**: Clear progress visualization

## Best Practices

1. **Always use the standardized components** for consistency
2. **Provide meaningful ARIA labels** for all interactive elements
3. **Test with keyboard navigation** to ensure proper tab order
4. **Test with screen readers** to verify announcements work correctly
5. **Use the wizard hook** for complex multi-step flows
6. **Handle errors gracefully** with proper user feedback
7. **Provide clear progress indication** so users know where they are
8. **Allow users to go back** and modify previous steps when possible

## Testing

### Keyboard Testing
- Navigate through all interactive elements using Tab/Shift+Tab
- Verify focus indicators are visible
- Test focus trap functionality in modal contexts
- Ensure all actions can be triggered with keyboard

### Screen Reader Testing
- Verify all content is announced correctly
- Test live region announcements
- Check error message associations
- Verify step progress announcements

### Visual Testing
- Check color contrast ratios
- Verify focus indicators are visible
- Test error state styling
- Ensure progress indicators are clear

## Examples

See `src/components/examples/WizardExample.tsx` for a comprehensive example showing all components and features in action.
