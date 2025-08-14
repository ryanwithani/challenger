'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/src/lib/store/authStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}