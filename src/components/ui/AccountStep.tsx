'use client'
import { useState } from 'react'
import { Input } from '@/src/components/ui/Input'
import { Label } from '@/src/components/ui/Label'
import { Button } from '@/src/components/ui/Button'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function AccountStep({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: { username } } 
      })
      
      if (error) throw error
      
      // Optionally create profile row now
      const user = data.user
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, username })
      }
      
      onSuccess()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</Label>
        <Input 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="SimFan_92" 
          required 
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-200 text-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
          required 
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-200 text-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Create a secure password"
          required 
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-200 text-lg"
        />
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full text-lg py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg rounded-xl font-semibold transition-all duration-200 border-none"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  )
}