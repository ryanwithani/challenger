'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/src/lib/store/authStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { ThemeToggle } from '@/src/components/ui/ThemeToggle'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email updates about your challenges
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sims-green/25 dark:peer-focus:ring-sims-green/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sims-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Challenge Reminders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get reminded to update your challenge progress
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sims-green/25 dark:peer-focus:ring-sims-green/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sims-green"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}