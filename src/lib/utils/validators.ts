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

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .toLowerCase()
  .trim()
  .refine((email) => {
    // No consecutive dots
    return !email.includes('..')
  }, 'Email cannot contain consecutive dots')
  .refine((email) => {
    // Cannot start or end with a dot
    return !email.startsWith('.') && !email.endsWith('.')
  }, 'Email cannot start or end with a dot')
  .refine((email) => {
    // Local part (before @) cannot start or end with a dot
    const [localPart] = email.split('@')
    return !localPart.startsWith('.') && !localPart.endsWith('.')
  }, 'Email username cannot start or end with a dot')
  .refine((email) => {
    // Check for common typos in popular domains
    const commonTypos = [
      'gmial.com',
      'gmai.com',
      'gmil.com',
      'gmal.com',
      'gmail.co',
      'gmail.cm',
      'gmaill.com',
      'yahooo.com',
      'yaho.com',
      'yahoo.co',
      'hotmial.com',
      'hotmai.com',
      'hotmal.com',
      'hotmil.com',
      'outlok.com',
      'outloo.com'
    ]
    const domain = email.split('@')[1]?.toLowerCase()
    return !commonTypos.includes(domain)
  }, 'Please check your email domain for typos')

export function validateEmail(email: string) {
  const result = emailSchema.safeParse(email)

  if (result.success) {
    return {
      valid: true,
      email: result.data,
      errors: []
    }
  }
  return {
    valid: false,
    email: null,
    errors: result.error.errors.map(err => err.message)
  }
}

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

