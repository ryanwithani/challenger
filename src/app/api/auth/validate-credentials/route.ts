import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { emailSchema } from '@/src/lib/utils/validators'
import rateLimit from '@/src/lib/utils/rateLimit'
import { getClientIP } from '@/src/lib/utils/ip-utils'

const validationLimiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100,
})

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request)

        // Rate limiting: 10 validations per minute per IP
        await validationLimiter.check(10, clientIP)

        const { username, email } = await request.json()

        if (!username && !email) {
            return NextResponse.json(
                { error: 'Username or email is required' },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServerClient()
        const adminSupabase = createSupabaseAdminClient()
        const results: { username?: { available: boolean; error?: string }; email?: { available: boolean; error?: string } } = {}

        // Check username if provided
        if (username) {
            const usernameTrimmed = username.trim()

            // Basic validation
            if (usernameTrimmed.length < 3 || usernameTrimmed.length > 20) {
                results.username = { available: false, error: 'Username must be 3-20 characters' }
            } else if (!/^[a-z0-9_-]+$/i.test(usernameTrimmed)) {
                results.username = { available: false, error: 'Username can only contain letters, numbers, - and _' }
            } else {
                const reserved = ['admin', 'root', 'system', 'mod', 'moderator', 'support', 'help']
                if (reserved.includes(usernameTrimmed.toLowerCase())) {
                    results.username = { available: false, error: 'This username is reserved' }
                } else {
                    // Check if username exists
                    const { data: existingUsername } = await supabase
                        .from('users')
                        .select('username')
                        .ilike('username', usernameTrimmed)
                        .maybeSingle()

                    results.username = {
                        available: !existingUsername,
                        error: existingUsername ? 'This username is already taken' : undefined
                    }
                }
            }
        }

        // Check email if provided
        if (email) {
            const emailValidation = emailSchema.safeParse(email)
            if (!emailValidation.success) {
                results.email = { available: false, error: emailValidation.error.errors[0].message }
            } else {
                // Use admin client to query auth.users table directly
                try {
                    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers({
                        page: 1,
                        perPage: 1000 // Adjust based on your user base size
                    })

                    if (listError) {
                        results.email = { available: false, error: 'Unable to validate email' }
                    } else {
                        const emailExists = users.users.some(user =>
                            user.email?.toLowerCase() === emailValidation.data.toLowerCase()
                        )

                        results.email = {
                            available: !emailExists,
                            error: emailExists ? 'This email is already registered' : undefined
                        }
                    }
                } catch (error) {
                    results.email = { available: false, error: 'Unable to validate email' }
                }
            }
        }

        return NextResponse.json(results)

    } catch (error: any) {
        if (error.message?.includes('Rate limit')) {
            return NextResponse.json(
                { error: 'Too many validation attempts. Please try again in a minute.' },
                { status: 429 }
            )
        }

        console.error('Validation error:', error)
        return NextResponse.json(
            { error: 'Validation failed. Please try again.' },
            { status: 500 }
        )
    }
}
