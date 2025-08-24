// components/sim/AvatarUpload.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { uploadSimAvatar, deleteSimAvatar } from '@/src/lib/utils/avatarUpload'

interface AvatarUploadProps {
    simId: string
    currentAvatarUrl?: string | null
    onAvatarUpdate: (url: string | null) => void
}

export function AvatarUpload({ simId, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const handleFileUpload = async (file: File) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size must be less than 5MB')
            return
        }

        setUploading(true)
        try {
            const url = await uploadSimAvatar(simId, file)
            if (url) {
                onAvatarUpdate(url)
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileUpload(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileUpload(file)
    }

    const handleDeleteAvatar = async () => {
        if (confirm('Are you sure you want to remove this avatar?')) {
            setUploading(true)
            try {
                await deleteSimAvatar(simId)
                onAvatarUpdate(null)
            } catch (error) {
                console.error('Delete failed:', error)
            } finally {
                setUploading(false)
            }
        }
    }

    return (
        <div className="space-y-4">
            {/* Current Avatar Display */}
            <div className="text-center">
                {currentAvatarUrl ? (
                    <div className="relative inline-block">
                        <img
                            src={currentAvatarUrl}
                            alt="Sim avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <button
                            onClick={handleDeleteAvatar}
                            disabled={uploading}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center mx-auto">
                        <span className="text-4xl text-gray-400">👤</span>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
                        ? 'border-sims-green bg-sims-green/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploading}
                />

                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="space-y-2">
                        <div className="text-3xl">📷</div>
                        <div className="text-sm text-gray-600">
                            {uploading ? 'Uploading...' : 'Click or drag to upload avatar'}
                        </div>
                        <div className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                        </div>
                    </div>
                </label>
            </div>

            {uploading && (
                <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sims-green"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                </div>
            )}
        </div>
    )
}