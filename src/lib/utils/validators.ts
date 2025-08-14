import { z } from 'zod'

// Define your environment variable schema
const envSchema = z.object({
  // Public (Client-safe)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Anon key is required'),

  // Private (Server-only)
  // SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required'),

  // Optional: add more env variables here
  // ADMIN_EMAIL: z.string().email().optional(),
})

// Validate and export the parsed env
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})


export const PASSWORD_MIN = 12;
export const PASSWORD_REGEX = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
};

export const passwordSchema = z.string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .regex(PASSWORD_REGEX.upper, "Add an uppercase letter.")
  .regex(PASSWORD_REGEX.lower, "Add a lowercase letter.")
  .regex(PASSWORD_REGEX.number, "Add a number.")
  .regex(PASSWORD_REGEX.symbol, "Add a symbol.");

export function getPasswordChecks(pw: string) {
  return {
    length: pw.length >= PASSWORD_MIN,
    upper: PASSWORD_REGEX.upper.test(pw),
    lower: PASSWORD_REGEX.lower.test(pw),
    number: PASSWORD_REGEX.number.test(pw),
    symbol: PASSWORD_REGEX.symbol.test(pw),
  };
}

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, "Please confirm your new password."),
}).refine(
  (v) => v.newPassword === v.confirmNewPassword,
  { path: ["confirmNewPassword"], message: "Passwords do not match." }
)

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});