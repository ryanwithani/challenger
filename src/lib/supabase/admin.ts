import { createClient } from '@supabase/supabase-js'
import { env } from '@/src/lib/validations/env'

// Admin client with service role key for server-side operations
export function createSupabaseAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
    }

    return createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
