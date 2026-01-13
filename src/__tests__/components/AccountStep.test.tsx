import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountStep from '@/src/components/onboarding/steps/AccountStep'
import { createMockFetchResponse } from '../utils/test-helpers'

// Mock dependencies
jest.mock('@/src/lib/utils/csrf-client', () => ({
    csrfTokenManager: {
        getHeaders: jest.fn().mockResolvedValue({
            'X-CSRF-Token': 'mock-csrf-token',
        }),
    },
}))

jest.mock('@/src/components/auth/LoginModal', () => ({
    LoginModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="login-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}))

const mockOnSuccess = jest.fn()

describe('AccountStep Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
        localStorage.clear()
    })

    describe('Form Rendering', () => {
        test('renders all form fields', () => {
            render(<AccountStep onSuccess={mockOnSuccess} />)

            expect(screen.getByLabelText(/username/i)).toBeDefined()
            expect(screen.getByLabelText(/email/i)).toBeDefined()
            expect(screen.getByLabelText('Password')).toBeDefined()
            expect(screen.getByRole('button', { name: /continue/i })).toBeDefined()
        })

        test('renders honeypot field (hidden)', () => {
            const { container } = render(<AccountStep onSuccess={mockOnSuccess} />)
            const honeypot = container.querySelector('input[name="website"]')
            expect(honeypot).toBeDefined()
            expect(honeypot?.getAttribute('type')).toBe('text')
            expect(honeypot?.getAttribute('aria-hidden')).toBe('true')
        })
    })

    describe('Username Field Validation', () => {
        test('shows error for username too short', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'ab')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/username must be at least 3 characters/i)).toBeDefined()
            })
        })

        test('shows error for username too long', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'a'.repeat(21))
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/username must be less than 20 characters/i)).toBeDefined()
            })
        })

        test('shows error for invalid characters', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'Test User!')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/username can only contain/i)).toBeDefined()
            })
        })

        test('shows error for reserved username', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'admin')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/this username is reserved/i)).toBeDefined()
            })
        })

        test('clears error when user corrects input', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'ab')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/username must be at least 3 characters/i)).toBeDefined()
            })

            await user.clear(usernameInput)
            await user.type(usernameInput, 'validuser123')
            await user.tab()

            await waitFor(() => {
                expect(screen.queryByText(/username must be at least 3 characters/i)).toBeNull()
            })
        })
    })

    describe('Email Field Validation', () => {
        test('shows error for invalid email format', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const emailInput = screen.getByLabelText(/email/i)
            await user.type(emailInput, 'notanemail')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/invalid email/i)).toBeDefined()
            })
        })

        test('shows error for email with consecutive dots', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const emailInput = screen.getByLabelText(/email/i)
            await user.type(emailInput, 'user..name@example.com')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/invalid email/i)).toBeDefined()
            })
        })

        test('shows error for common domain typos', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const emailInput = screen.getByLabelText(/email/i)
            await user.type(emailInput, 'user@gmial.com')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/check your email domain for typos/i)).toBeDefined()
            })
        })
    })

    describe('Password Field Validation', () => {
        test('shows error for password too short', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'Short1!')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/use at least 12 characters/i)).toBeDefined()
            })
        })

        test('shows error for missing uppercase', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'lowercase123!@#')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/add an uppercase letter/i)).toBeDefined()
            })
        })

        test('shows error for missing lowercase', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'UPPERCASE123!@#')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/add a lowercase letter/i)).toBeDefined()
            })
        })

        test('shows error for missing number', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'NoNumbers!@#')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/add a number/i)).toBeDefined()
            })
        })

        test('shows error for missing symbol', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'NoSymbol12345')
            await user.tab()

            await waitFor(() => {
                expect(screen.getByText(/add a symbol\./i)).toBeDefined()
            })
        })
    })

    describe('Form Submission', () => {
        test('prevents submission with invalid data', async () => {
            const user = userEvent.setup()
            render(<AccountStep onSuccess={mockOnSuccess} />)

            const usernameInput = screen.getByLabelText(/username/i)
            await user.type(usernameInput, 'ab')
            await user.click(screen.getByRole('button', { name: /continue/i }))

            await waitFor(() => {
                expect(screen.getByText(/username must be at least 3 characters/i)).toBeDefined()
            })

            expect(mockOnSuccess).not.toHaveBeenCalled()
            expect(global.fetch).not.toHaveBeenCalled()
        })

        test('submits form with valid data', async () => {
            const user = userEvent.setup()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce(
                    createMockFetchResponse({ success: true, user: { id: '123' } })
                )

            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            await user.type(screen.getByLabelText('Password'), 'ValidPass123!@#')

            await user.click(screen.getByRole('button', { name: /continue/i }))

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('testuser123'),
                }))
            })

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledWith({
                    username: 'testuser123',
                    email: 'test@example.com',
                    password: 'ValidPass123!@#',
                })
            })
        })

        test('handles server-side validation errors', async () => {
            const user = userEvent.setup()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce(
                    createMockFetchResponse(
                        { field: 'username', error: 'This username is already taken' },
                        false,
                        400
                    )
                )

            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'existinguser')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            await user.type(screen.getByLabelText('Password'), 'ValidPass123!@#')

            await user.click(screen.getByRole('button', { name: /continue/i }))

            await waitFor(() => {
                expect(screen.getByText(/this username is already taken/i)).toBeDefined()
            })

            expect(mockOnSuccess).not.toHaveBeenCalled()
        })

        test('handles global errors', async () => {
            const user = userEvent.setup()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce(
                    createMockFetchResponse(
                        { error: 'Failed to create account. Please try again.' },
                        false,
                        500
                    )
                )

            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            await user.type(screen.getByLabelText('Password'), 'ValidPass123!@#')

            await user.click(screen.getByRole('button', { name: /continue/i }))

            await waitFor(() => {
                expect(screen.getByText(/failed to create account/i)).toBeDefined()
            })

            expect(mockOnSuccess).not.toHaveBeenCalled()
        })
    })

    describe('Honeypot Field', () => {
        test('blocks submission when honeypot is filled', async () => {
            const user = userEvent.setup()
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
            const { container } = render(<AccountStep onSuccess={mockOnSuccess} />)
            const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            await user.type(screen.getByLabelText('Password'), 'ValidPass123!@#')

            // Fill honeypot field after other fields are filled
            honeypot.value = 'bot-attempt'
            fireEvent.change(honeypot, { target: { value: 'bot-attempt' } })

            const form = container.querySelector('form') as HTMLFormElement
            // Ensure the form element has the website field with the value
            Object.defineProperty(form, 'website', {
                value: honeypot,
                writable: true,
                configurable: true
            })
            fireEvent.submit(form)

            await waitFor(() => {
                expect(screen.getByText(/submission blocked/i)).toBeDefined()
            })

            expect(global.fetch).not.toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Honeypot triggered'))

            consoleSpy.mockRestore()
        })
    })

    describe('Form Persistence', () => {
        test('saves form data to localStorage', async () => {
            const user = userEvent.setup()
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')

            // Wait for debounce (500ms)
            await waitFor(() => {
                expect(setItemSpy).toHaveBeenCalledWith(
                    'onboarding_account_data',
                    expect.stringContaining('testuser123')
                )
            }, { timeout: 600 })

            setItemSpy.mockRestore()
        })

        test('restores form data from localStorage', () => {
            const savedData = {
                username: 'saveduser',
                email: 'saved@example.com',
                password: '',
            }
            const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(savedData))

            render(<AccountStep onSuccess={mockOnSuccess} />)

            expect(screen.getByDisplayValue('saveduser')).toBeDefined()
            expect(screen.getByDisplayValue('saved@example.com')).toBeDefined()

            getItemSpy.mockRestore()
        })

        test('clears localStorage on successful submission', async () => {
            const user = userEvent.setup()
            const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
                ; (global.fetch as jest.Mock).mockResolvedValueOnce(
                    createMockFetchResponse({ success: true, user: { id: '123' } })
                )

            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'ValidPass123!@#')

            await user.click(screen.getByRole('button', { name: /continue/i }))

            await waitFor(() => {
                expect(removeItemSpy).toHaveBeenCalledWith('onboarding_account_data')
            })

            removeItemSpy.mockRestore()
        })
    })

    describe('Loading State', () => {
        test('shows loading state during submission', async () => {
            const user = userEvent.setup()
                ; (global.fetch as jest.Mock).mockImplementation(
                    () => new Promise((resolve) => setTimeout(() => resolve(createMockFetchResponse({ success: true })), 100))
                )

            render(<AccountStep onSuccess={mockOnSuccess} />)

            await user.type(screen.getByLabelText(/username/i), 'testuser123')
            await user.type(screen.getByLabelText(/email/i), 'test@example.com')
            await user.type(screen.getByLabelText('Password'), 'ValidPass123!@#')

            const submitButton = screen.getByRole('button', { name: /continue/i })
            await user.click(submitButton)

            expect(submitButton).toBeDisabled()
            expect(screen.getByText(/validating/i)).toBeDefined()
        })
    })
})

