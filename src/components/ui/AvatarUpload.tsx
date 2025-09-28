'use client'
import { useState } from 'react'
import Image from 'next/image'
import { uploadSimAvatar } from '@/src/lib/utils/avatarUpload'

export function AvatarUploader({
  value, onChange,
}: { value: string | null; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBusy(true); setErr(null)
    try { onChange(await uploadSimAvatar('simId', f)) } catch (e:any) { setErr(e?.message ?? 'Upload failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image 
              src={value} 
              alt="Avatar" 
              width={64} 
              height={64} 
              className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200" 
            />
            {busy && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => onChange(null)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/webp" 
            onChange={onFile}
            disabled={busy}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-2 file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded-xl border-2 border-dashed border-gray-300 p-4 text-center" 
          />
          <p className="text-xs text-gray-500">JPEG, PNG, or WebP • Max 5MB</p>
        </div>
      )}
      {busy && <p className="text-sm text-gray-600 flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>Uploading…</p>}
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{err}</p>}
    </div>
  )
}
