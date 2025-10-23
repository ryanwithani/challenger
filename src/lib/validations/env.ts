import { z } from 'zod';

// Define your environment variable schema
const envSchema = z.object({
    // Public (Client-safe)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    // Private (Server-only) - Use a consistent naming convention
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// Validate and export the parsed env
export const env = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // This now matches the schema
});