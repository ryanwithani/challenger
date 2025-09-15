'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/src/lib/store/authStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { ThemeToggle } from '@/src/components/ui/ThemeToggle'
import ExpansionPacks, { ExpansionPacksValue } from '@/src/components/profile/ExpansionPacks'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { preferences, loading: preferencesLoading, fetchPreferences, updateExpansionPacks } = useUserPreferencesStore();

  const [packs, setPacks] = useState<ExpansionPacksValue>({
    base_game: true,
    get_to_work: false,
    get_together: false,
    city_living: false,
    cats_dogs: false,
    seasons: false,
    get_famous: false,
    island_living: false,
    discover_university: false,
    eco_lifestyle: false,
    snowy_escape: false,
    cottage_living: false,
    high_school_years: false,
    growing_together: false,
    horse_ranch: false,
    for_rent: false,
    lovestruck: false,
    life_death: false,
  });

  useEffect(() => {
    if (preferences?.expansion_packs) {
      setPacks(preferences.expansion_packs)
    }
  }, [preferences])

  useEffect(() => {
    if (preferences?.expansion_packs) {
      setPacks(preferences.expansion_packs)
      setLoading(false)
    }
  }, [preferences])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchPreferences()
    }
  }, [user, fetchPreferences])

  const fetchProfile = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('id', user!.id)
      .single()

    if (data) {
      setUsername(data.username || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user!.id)

    if (error) {
      setMessage('Failed to update profile')
    } else {
      setMessage('Profile updated successfully!')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Profile Settings
      </h1>

      {/* Account Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('Failed')
              ? 'text-red-500 dark:text-red-400'
              : 'text-green-500 dark:text-green-400'
              }`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <ThemeToggle />
      </div>

      {/* Additional Settings */}
      <div className="card">
        <ExpansionPacks value={packs} onChange={setPacks} />
      </div>
    </div>
  )
}