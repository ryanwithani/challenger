import { z } from 'zod'
import DOMPurify from 'dompurify'

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

// Sanitization helpers
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return ''
  // Strip all HTML tags and encode special characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return ''
  // Allow only safe HTML tags if you need basic formatting
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  })
}

export const goalSchema = z.object({
  title: z.string().max(200).transform(sanitizeText),
  description: z.string().max(1000).transform(sanitizeText),
  category: z.string().max(50).transform(sanitizeText),
})

export const simNameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .transform(sanitizeText)

export const textFieldSchema = z.string()
  .max(500, 'Text too long')
  .transform(sanitizeText)

export const notesFieldSchema = z.string()
  .max(1000, 'Notes too long')
  .transform(sanitizeText)


export const PASSWORD_MIN = 12;
export const PASSWORD_REGEX = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
};

export const passwordSchema = z.string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(128, 'Password is too long')
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
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const avatarFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"),
  simId: z.string().uuid("Invalid sim ID format")
})

const SAFE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

export function getSafeFileExtension(mimeType: string): string {
  const extension = SAFE_EXTENSIONS[mimeType]
  if (!extension) {
    throw new Error('Unsupported file type')
  }
  return extension
}

