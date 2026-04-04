import { createClient } from '@supabase/supabase-js'

/**
 * Deletes a test user from both Supabase Auth and the users table.
 * Uses the service role key to bypass RLS.
 */
export async function deleteTestUser(email: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase admin credentials — skipping test user cleanup')
    return
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Find the user by email
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers()

  if (listError) {
    console.warn(`Failed to list users for cleanup: ${listError.message}`)
    return
  }

  const user = users.find((u) => u.email === email)
  if (!user) return

  // Delete from users table first (FK constraint)
  await admin.from('users').delete().eq('id', user.id)

  // Delete from auth
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    console.warn(`Failed to delete test user ${email}: ${deleteError.message}`)
  }
}
