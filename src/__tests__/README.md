# Test Suite Documentation

This directory contains comprehensive tests for the sign-up process based on `TEST_PLAN_SIGNUP.md`.

## Test Structure

```
src/__tests__/
├── unit/                    # Unit tests for validation schemas
│   └── validators.test.ts
├── components/              # Component tests
│   └── AccountStep.test.tsx
├── api/                     # API endpoint tests
│   └── signup.test.ts
├── integration/             # Integration tests
│   └── signup-flow.test.ts
├── security/                # Security tests
│   └── security.test.ts
├── e2e/                     # End-to-end tests
│   └── signup.e2e.test.ts
├── edge-cases/              # Edge case tests
│   └── signup-edge-cases.test.ts
└── utils/                   # Test utilities
    └── test-helpers.tsx
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in CI Mode

```bash
npm run test:ci
```

### Run Specific Test Files

```bash
# Unit tests
npm test -- validators

# Component tests
npm test -- AccountStep

# API tests
npm test -- signup.test

# Security tests
npm test -- security

# Integration tests
npm test -- signup-flow

# Edge cases
npm test -- edge-cases
```

## Test Coverage

### Current Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Security Tests**: All security features

### View Coverage Report

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in your browser.

## Test Categories

### 1. Unit Tests (`unit/`)

Tests for validation schemas:
- Username validation
- Email validation
- Password validation
- Sign-up schema validation

### 2. Component Tests (`components/`)

Tests for React components:
- Form rendering
- Field validation
- Error display
- Form submission
- Loading states
- Form persistence

### 3. API Tests (`api/`)

Tests for API endpoints:
- Successful signup
- Validation errors
- Duplicate checks
- Server errors
- Profile creation

### 4. Security Tests (`security/`)

Tests for security features:
- CSRF protection
- Honeypot protection
- Rate limiting
- Input sanitization
- Password security
- Error message security

### 5. Integration Tests (`integration/`)

Tests for complete flows:
- End-to-end signup
- Error handling
- CSRF token management
- Database integration
- User preferences

### 6. E2E Tests (`e2e/`)

End-to-end tests using Playwright:
- Complete signup flow
- Form validation
- Form persistence
- Honeypot detection
- Accessibility

### 7. Edge Cases (`edge-cases/`)

Tests for boundary conditions:
- Minimum/maximum lengths
- Special characters
- Unicode characters
- Case transformations
- Plus addressing
- Subdomains

## E2E Testing Setup

### Playwright Setup

1. Install Playwright:
```bash
npm install -D @playwright/test
```

2. Initialize Playwright:
```bash
npx playwright install
```

3. Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

4. Run E2E tests:
```bash
npx playwright test
```

### Cypress Setup (Alternative)

1. Install Cypress:
```bash
npm install -D cypress
```

2. Initialize Cypress:
```bash
npx cypress open
```

3. Run Cypress tests:
```bash
npx cypress run
```

## Test Data Management

### Test Fixtures

Use test fixtures for consistent test data:
- Valid usernames
- Valid emails
- Valid passwords
- Invalid inputs
- Edge cases

### Cleanup

- Test data is cleaned up after each test
- Mock functions are reset between tests
- localStorage is cleared between tests

## Mocking

### Mocked Dependencies

- `next/navigation` - Router
- `@/src/lib/supabase/server` - Supabase client
- `@/src/lib/utils/csrf-client` - CSRF token manager
- `@/src/lib/utils/rateLimit` - Rate limiter
- `fetch` - API calls
- `localStorage` - Browser storage

### Custom Mocks

Create custom mocks in `src/__tests__/utils/test-helpers.tsx`:
- Mock Supabase client
- Mock fetch responses
- Mock form data
- Helper functions

## Writing New Tests

### Test File Structure

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from '@/src/components/Component'

describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the action
   - Assert: Verify the result

2. **Test Isolation**
   - Each test should be independent
   - Clean up after each test
   - Don't rely on test execution order

3. **Descriptive Test Names**
   - Use clear, descriptive names
   - Include what is being tested
   - Include expected behavior

4. **Mock External Dependencies**
   - Mock API calls
   - Mock external services
   - Use real services in integration tests

5. **Test Edge Cases**
   - Boundary conditions
   - Error cases
   - Empty/null values
   - Invalid inputs

## Troubleshooting

### Tests Not Running

1. Check Jest configuration in `jest.config.js`
2. Verify test files match pattern: `**/*.test.{ts,tsx}`
3. Check test environment setup in `jest.setup.js`

### Mock Issues

1. Ensure mocks are reset in `beforeEach`
2. Check mock implementations match expected behavior
3. Verify async mocks are properly awaited

### Coverage Issues

1. Check coverage thresholds in `jest.config.js`
2. Ensure all code paths are tested
3. Review uncovered lines in coverage report

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

## Notes

- All tests should be deterministic (no random data)
- Test data should be cleaned up after each test run
- Use test fixtures for consistent test data
- Mock external services in unit tests
- Use real services in integration/E2E tests
- Document any test-specific environment requirements

