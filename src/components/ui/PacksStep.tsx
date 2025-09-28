'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { PACKS as ALL_PACKS } from '@/src/components/profile/Packs'

// Enhanced SelectableCard matching the new design
const SelectableCard = ({ 
  id, 
  selected, 
  title, 
  onToggle 
}: {
  id: string
  selected: boolean
  title: string
  onToggle: () => void
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex w-full flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-center text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 ${
        selected 
          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg transform scale-105' 
          : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
      }`}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
        {title.charAt(0)}
      </div>
      <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{title}</div>
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  )
}

export default function PacksStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const supabase = createSupabaseBrowserClient()
  const [owned, setOwned] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // load existing packs if returning user (optional)
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      const { data: row } = await supabase.from('profiles').select('owned_packs').eq('id', user.id).single()
      if (row?.owned_packs) setOwned(row.owned_packs)
    })
  }, [])

  async function save() {
    setSaving(true)
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return
    await supabase.from('profiles').update({ owned_packs: owned }).eq('id', user.id)
    setSaving(false)
    onNext()
  }

  const togglePack = (packId: string) => {
    setOwned(prev => 
      prev.includes(packId) 
        ? prev.filter(id => id !== packId)
        : [...prev, packId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Expansion Packs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {ALL_PACKS.map(pack => (
            <SelectableCard
              key={pack.key}
              id={pack.key}
              title={pack.name}
              selected={owned.includes(pack.key)}
              onToggle={() => togglePack(pack.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-lg px-6 py-3 bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 border-none"
        >
          ← Back
        </Button>
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">
            {owned.length} pack{owned.length !== 1 ? 's' : ''} selected
          </div>
          <Button 
            onClick={save} 
            disabled={saving}
            className="text-lg px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg rounded-xl font-semibold transition-all duration-200 border-none"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Continue →'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}