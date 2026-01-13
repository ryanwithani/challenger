import {
    usernameSchema,
    emailSchema,
    passwordSchema,
} from '@/src/lib/utils/validators'

describe('Edge Cases - Username Validation', () => {
    describe('Boundary Conditions', () => {
        test('minimum length (3 characters)', () => {
            const result = usernameSchema.safeParse('abc')
            expect(result.success).toBe(true)
        })

        test('just below minimum (2 characters)', () => {
            const result = usernameSchema.safeParse('ab')
            expect(result.success).toBe(false)
        })

        test('maximum length (20 characters)', () => {
            const result = usernameSchema.safeParse('a'.repeat(20))
            expect(result.success).toBe(true)
        })

        test('just above maximum (21 characters)', () => {
            const result = usernameSchema.safeParse('a'.repeat(21))
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 20 characters')
            }
        })
    })

    describe('Special Characters', () => {
        test('valid special characters', () => {
            const validUsernames = ['user-name', 'user_name', 'user123', 'user-name_123']
            validUsernames.forEach((username) => {
                const result = usernameSchema.safeParse(username)
                expect(result.success).toBe(true)
            })
        })

        test('invalid special characters', () => {
            const invalidUsernames = ['user.name', 'user@name', 'user name', 'user+name']
            invalidUsernames.forEach((username) => {
                const result = usernameSchema.safeParse(username)
                expect(result.success).toBe(false)
            })
        })
    })

    describe('Unicode Characters', () => {
        test('rejects unicode characters', () => {
            const unicodeUsernames = ['用户', 'ñame', 'üser', 'тест']
            unicodeUsernames.forEach((username) => {
                const result = usernameSchema.safeParse(username)
                expect(result.success).toBe(false)
            })
        })
    })

    describe('Case Transformation', () => {
        test('mixed case conversion', () => {
            const result = usernameSchema.safeParse('TestUser123')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('testuser123')
            }
        })

        test('whitespace trimming', () => {
            const result = usernameSchema.safeParse('  testuser  ')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe('testuser')
            }
        })
    })
})

describe('Edge Cases - Email Validation', () => {
    describe('Boundary Conditions', () => {
        test('maximum length (254 characters)', () => {
            const localPart = 'a'.repeat(240)
            const email = `${localPart}@example.com`
            expect(email.length).toBeLessThanOrEqual(254)

            const result = emailSchema.safeParse(email)
            expect(result.success).toBe(true)
        })

        test('exceeds maximum length', () => {
            const localPart = 'a'.repeat(250)
            const email = `${localPart}@example.com`

            const result = emailSchema.safeParse(email)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email address is too long')
            }
        })
    })

    describe('Plus Addressing', () => {
        test('valid plus addressing', () => {
            const emails = [
                'user+tag@example.com',
                'user+tag+tag2@example.com',
                'user.name+tag@example.com',
            ]

            emails.forEach((email) => {
                const result = emailSchema.safeParse(email)
                expect(result.success).toBe(true)
            })
        })
    })

    describe('Subdomains', () => {
        test('valid subdomain emails', () => {
            const emails = [
                'user@sub.example.com',
                'user@sub.sub.example.com',
                'user@example.co.uk',
            ]

            emails.forEach((email) => {
                const result = emailSchema.safeParse(email)
                expect(result.success).toBe(true)
            })
        })
    })

    describe('International Domains', () => {
        test('valid international domains', () => {
            const emails = [
                'user@example.co.uk',
                'user@example.com.au',
                'user@example.de',
            ]

            emails.forEach((email) => {
                const result = emailSchema.safeParse(email)
                expect(result.success).toBe(true)
            })
        })
    })

    describe('Edge Case Formats', () => {
        test('handles dots in local part', () => {
            const result = emailSchema.safeParse('first.last@example.com')
            expect(result.success).toBe(true)
        })

        test('rejects consecutive dots', () => {
            const result = emailSchema.safeParse('user..name@example.com')
            expect(result.success).toBe(false)
        })

        test('rejects leading dot in local part', () => {
            const result = emailSchema.safeParse('.user@example.com')
            expect(result.success).toBe(false)
        })

        test('rejects trailing dot in local part', () => {
            const result = emailSchema.safeParse('user.@example.com')
            expect(result.success).toBe(false)
        })
    })
})

describe('Edge Cases - Password Validation', () => {
    describe('Boundary Conditions', () => {
        test('minimum length (12 characters) with all requirements', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5f6!')
            expect(result.success).toBe(true)
        })

        test('just below minimum (11 characters)', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5!')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 12 characters')
            }
        })

        test('maximum length (128 characters)', () => {
            const password = 'A'.repeat(64) + '1'.repeat(32) + '!'.repeat(32)
            expect(password.length).toBeLessThanOrEqual(128)

            const result = passwordSchema.safeParse(password)
            expect(result.success).toBe(true)
        })

        test('exceeds maximum length (129 characters)', () => {
            const password = 'A'.repeat(65) + '1'.repeat(32) + '!'.repeat(32)

            const result = passwordSchema.safeParse(password)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password is too long')
            }
        })
    })

    describe('All Requirement Types', () => {
        test('password with all requirements met', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5f6!')
            expect(result.success).toBe(true)
        })

        test('password missing uppercase', () => {
            const result = passwordSchema.safeParse('a1b2c3d4e5f6!')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add an uppercase letter.')
            }
        })

        test('password missing lowercase', () => {
            const result = passwordSchema.safeParse('A1B2C3D4E5F6!')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a lowercase letter.')
            }
        })

        test('password missing number', () => {
            const result = passwordSchema.safeParse('Abcdefghijkl!')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a number.')
            }
        })

        test('password missing symbol', () => {
            const result = passwordSchema.safeParse('A1b2c3d4e5f6')
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Add a symbol.')
            }
        })
    })

    describe('Special Characters', () => {
        test('various symbol types are accepted', () => {
            const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']
            symbols.forEach((symbol) => {
                const password = `A1b2c3d4e5f${symbol}`
                const result = passwordSchema.safeParse(password)
                expect(result.success).toBe(true)
            })
        })
    })
})

