// src/components/AuthInitializer.tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/src/lib/store/authStore'

export function AuthInitializer() {
    const { initialize } = useAuthStore()

    useEffect(() => {
        console.log('🔵 AuthInitializer running')
        initialize()
    }, [initialize])

    return null
}