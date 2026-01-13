import {
    usernameSchema,
    emailSchema,
    passwordSchema,
    signUpSchema,
    PASSWORD_MIN,
    PASSWORD_REGEX,
} from '@/src/lib/utils/validators'

describe('Username Validation', () => {
    describe('Valid Usernames', () => {
        test('valid username with lowercase letters and numbers', () => {
            const result = usernameSchema.safeParse('testuser123')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('testuser123')
            }
        })

        test('valid username with hyphens and underscores', () => {
            const result = usernameSchema.safeParse('user-name_123')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('user-name_123')
            }
        })

        test('minimum length (3 characters)', () => {
            const result = usernameSchema.safeParse('abc')
            expect(result.success).toBe(true)
        })

        test('maximum length (20 characters)', () => {
            const result = usernameSchema.safeParse('abcdefghijklmnopqrs')
            expect(result.success).toBe(true)
        })
    })

    describe('Invalid Usernames', () => {
        test('too short (less than 3 characters)', () => {
            const result = usernameSchema.safeParse('ab')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Username must be at least 3 characters')
            }
        })

        test('too long (more than 20 characters)', () => {
            const result = usernameSchema.safeParse('thisusernameistoolongforvalidation')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Username must be less than 20 characters')
            }
        })

        test('contains invalid characters', () => {
            const invalidUsernames = ['Test User!', 'user@name', 'user name', 'user.name']
            invalidUsernames.forEach((username) => {
                const result = usernameSchema.safeParse(username)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('Username can only contain lowercase letters, numbers, - and _')
                }
            })
        })

        test('reserved usernames', () => {
            const reserved = ['admin', 'root', 'system', 'mod', 'moderator', 'support', 'help']
            reserved.forEach((username) => {
                const result = usernameSchema.safeParse(username)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('This username is reserved.')
                }
            })
        })

        test('empty username', () => {
            const result = usernameSchema.safeParse('')
            expect(result.success).toBe(false)
        })
    })

    describe('Username Transformation', () => {
        test('converts to lowercase', () => {
            const result = usernameSchema.safeParse('TestUser')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('testuser')
            }
        })

        test('trims whitespace and converts to lowercase', () => {
            const result = usernameSchema.safeParse('  TestUser  ')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('testuser')
            }
        })

        test('case insensitive reserved check', () => {
            const result = usernameSchema.safeParse('ADMIN')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('This username is reserved.')
            }
        })
    })
})

describe('Email Validation', () => {
    describe('Valid Emails', () => {
        test('valid email address', () => {
            const result = emailSchema.safeParse('user@example.com')
            expect(result.success).toBe(true)
        })

        test('email with plus addressing', () => {
            const result = emailSchema.safeParse('test.user+tag@example.co.uk')
            expect(result.success).toBe(true)
        })

        test('email with subdomain', () => {
            const result = emailSchema.safeParse('user@sub.example.com')
            expect(result.success).toBe(true)
        })

        test('maximum length (254 characters)', () => {
            const longEmail = 'a'.repeat(240) + '@example.com'
            expect(longEmail.length).toBeLessThanOrEqual(254)
            const result = emailSchema.safeParse(longEmail)
            expect(result.success).toBe(true)
        })
    })

    describe('Invalid Emails', () => {
        test('invalid email format', () => {
            const invalidEmails = ['notanemail', '@example.com', 'user@', 'user@.com']
            invalidEmails.forEach((email) => {
                const result = emailSchema.safeParse(email)
                expect(result.success).toBe(false)
                if (!result.success) {
                    // Check for any email validation error (Zod's default message)
                    expect(result.error.issues[0].message).toBeTruthy()
                    // Zod 4 default email error typically contains "Invalid" or "email"
                    expect(result.error.issues[0].message.toLowerCase()).toMatch(/invalid|email/)
                }
            })
        })

        test('email too long', () => {
            const longEmail = 'a'.repeat(250) + '@example.com'
            const result = emailSchema.safeParse(longEmail)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email address is too long')
            }
        })

        test('consecutive dots', () => {
            const result = emailSchema.safeParse('user..name@example.com')
            expect(result.success).toBe(false)
            if (!result.success) {
                // Zod's default email validator will reject this
                expect(result.error.issues[0].message).toBeTruthy()
                expect(result.error.issues[0].message.toLowerCase()).toMatch(/invalid|email/)
            }
        })

        test('email starting with dot', () => {
            const result = emailSchema.safeParse('.user@example.com')
            expect(result.success).toBe(false)
            if (!result.success) {
                // Zod's default email validator will reject this
                expect(result.error.issues[0].message).toBeTruthy()
                expect(result.error.issues[0].message.toLowerCase()).toMatch(/invalid|email/)
            }
        })

        test('email ending with dot', () => {
            const result = emailSchema.safeParse('user.@example.com')
            expect(result.success).toBe(false)
            if (!result.success) {
                // Zod's default email validator will reject this
                expect(result.error.issues[0].message).toBeTruthy()
                expect(result.error.issues[0].message.toLowerCase()).toMatch(/invalid|email/)
            }
        })

        test('common domain typos', () => {
            const typos = ['user@gmial.com', 'user@gmai.com', 'user@yahooo.com', 'user@hotmial.com']
            typos.forEach((email) => {
                const result = emailSchema.safeParse(email)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error.issues[0].message).toContain('check your email domain for typos')
                }
            })
        })

        test('empty email', () => {
            const result = emailSchema.safeParse('')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email is required')
            }
        })
    })

    describe('Email Transformation', () => {
        test('converts to lowercase', () => {
            const result = emailSchema.safeParse('User@EXAMPLE.COM')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('user@example.com')
            }
        })

        test('trims whitespace', () => {
            const result = emailSchema.safeParse('  user@example.com  ')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('user@example.com')
            }
        })
    })
})

describe('Password Validation', () => {
    describe('Valid Passwords', () => {
        test('valid password with all requirements', () => {
            const result = passwordSchema.safeParse('ValidPass123!@#')
            expect(result.success).toBe(true)
        })

        test('minimum length (12 characters)', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5f6!')
            expect(result.success).toBe(true)
        })

        test('password with all requirement types', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5f6!')
            expect(result.success).toBe(true)
        })
    })

    describe('Invalid Passwords', () => {
        test('too short', () => {
            const result = passwordSchema.safeParse('Short1!')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(`Use at least ${PASSWORD_MIN} characters`)
            }
        })

        test('too long', () => {
            const longPassword = 'A'.repeat(129) + '1!'
            const result = passwordSchema.safeParse(longPassword)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password is too long')
            }
        })

        test('missing uppercase', () => {
            const result = passwordSchema.safeParse('lowercase123!@#')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add an uppercase letter.')
            }
        })

        test('missing lowercase', () => {
            const result = passwordSchema.safeParse('UPPERCASE123!@#')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a lowercase letter.')
            }
        })

        test('missing number', () => {
            const result = passwordSchema.safeParse('NoNumbers!@#')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a number.')
            }
        })

        test('missing symbol', () => {
            const result = passwordSchema.safeParse('NoSymbol1234')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a symbol.')
            }
        })

        test('empty password', () => {
            const result = passwordSchema.safeParse('')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain(`Use at least ${PASSWORD_MIN} characters`)
            }
        })
    })

    describe('Password Regex Checks', () => {
        test('PASSWORD_REGEX.upper matches uppercase', () => {
            expect(PASSWORD_REGEX.upper.test('A')).toBe(true)
            expect(PASSWORD_REGEX.upper.test('a')).toBe(false)
        })

        test('PASSWORD_REGEX.lower matches lowercase', () => {
            expect(PASSWORD_REGEX.lower.test('a')).toBe(true)
            expect(PASSWORD_REGEX.lower.test('A')).toBe(false)
        })

        test('PASSWORD_REGEX.number matches numbers', () => {
            expect(PASSWORD_REGEX.number.test('1')).toBe(true)
            expect(PASSWORD_REGEX.number.test('a')).toBe(false)
        })

        test('PASSWORD_REGEX.symbol matches symbols', () => {
            expect(PASSWORD_REGEX.symbol.test('!')).toBe(true)
            expect(PASSWORD_REGEX.symbol.test('a')).toBe(false)
        })
    })
})

describe('Sign Up Schema', () => {
    test('valid signup data', () => {
        const result = signUpSchema.safeParse({
            username: 'testuser',
            email: 'test@example.com',
            password: 'ValidPass123!@#',
            confirmPassword: 'ValidPass123!@#',
        })
        expect(result.success).toBe(true)
    })

    test('passwords do not match', () => {
        const result = signUpSchema.safeParse({
            username: 'testuser',
            email: 'test@example.com',
            password: 'ValidPass123!@#',
            confirmPassword: 'DifferentPass123!@#',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            const confirmPasswordError = result.error.issues.find(
                (e) => e.path.includes('confirmPassword')
            )
            expect(confirmPasswordError?.message).toBe("Passwords don't match")
        }
    })

    test('invalid username in signup', () => {
        const result = signUpSchema.safeParse({
            username: 'ab',
            email: 'test@example.com',
            password: 'ValidPass123!@#',
            confirmPassword: 'ValidPass123!@#',
        })
        expect(result.success).toBe(false)
    })

    test('invalid email in signup', () => {
        const result = signUpSchema.safeParse({
            username: 'testuser',
            email: 'invalid-email',
            password: 'ValidPass123!@#',
            confirmPassword: 'ValidPass123!@#',
        })
        expect(result.success).toBe(false)
    })

    test('invalid password in signup', () => {
        const result = signUpSchema.safeParse({
            username: 'testuser',
            email: 'test@example.com',
            password: 'short',
            confirmPassword: 'short',
        })
        expect(result.success).toBe(false)
    })
})

