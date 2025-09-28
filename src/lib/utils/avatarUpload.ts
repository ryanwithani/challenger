// lib/utils/avatarUpload.ts
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { avatarFileSchema, getSafeFileExtension } from './validators'

export async function uploadSimAvatar(
    simId: string,
    file: File
): Promise<string | null> {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

        const validation = avatarFileSchema.safeParse({ file, simId })
        if (!validation.success) {
            const firstError = validation.error.errors[0]
            throw new Error(firstError.message)
        }
    

    const safeExtension = getSafeFileExtension(file.type)
    const filePath = `${user.id}/${simId}/avatar.${safeExtension}`

    // Upload file
    const { data, error } = await supabase.storage
        .from('sim-avatars')
        .upload(filePath, file, {
            upsert: true, // Replace existing file
            cacheControl: '3600'
        })

    if (error) {
        console.error('Upload error:', error)
        return null
    }

    // Get public URL
    const { data: publicURL } = supabase.storage
        .from('sim-avatars')
        .getPublicUrl(filePath)

    // Update sim record with avatar URL
    await supabase
        .from('sims')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', simId)

    return publicURL.publicUrl
}

export async function deleteSimAvatar(simId: string): Promise<boolean> {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Delete file from storage
    const { error } = await supabase.storage
        .from('sim-avatars')
        .remove([`${user.id}/${simId}/avatar.jpg`, `${user.id}/${simId}/avatar.png`])

    // Update sim record to remove avatar URL
    await supabase
        .from('sims')
        .update({ avatar_url: null })
        .eq('id', simId)

    return !error
}