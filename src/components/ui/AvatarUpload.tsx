'use client'
import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/src/lib/utils/cn'

interface AvatarUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  uploadFunction: (file: File) => Promise<string>;
}

export function AvatarUploader({ value, onChange, uploadFunction }: AvatarUploaderProps) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setErr(null);
    try {
      const newUrl = await uploadFunction(file);
      onChange(newUrl);
    } catch (e: any) {
      setErr(e?.message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
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
              className="h-16 w-16 rounded-xl object-cover border-2 border-warmGray-200 dark:border-warmGray-700"
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
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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
            className={cn(
              'block w-full text-sm text-warmGray-700 dark:text-warmGray-300',
              'file:mr-4 file:rounded-xl file:border-2 file:border-warmGray-300 dark:file:border-warmGray-600',
              'file:bg-white dark:file:bg-warmGray-800 file:px-4 file:py-2 file:text-sm file:font-medium',
              'hover:file:bg-warmGray-50 dark:hover:file:bg-warmGray-700',
              'focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800',
              'rounded-xl border-2 border-dashed border-warmGray-300 dark:border-warmGray-600 p-4 text-center'
            )}
          />
          <p className="text-xs text-warmGray-500 dark:text-warmGray-400">JPEG, PNG, or WebP • Max 5MB</p>
        </div>
      )}
      {busy && (
        <p className="text-sm text-warmGray-600 dark:text-warmGray-400 flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-warmGray-400 dark:border-warmGray-500 border-t-transparent rounded-full animate-spin" />
          Uploading…
        </p>
      )}
      {err && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">{err}</p>}
    </div>
  )
}
