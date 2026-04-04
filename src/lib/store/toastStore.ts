'use client'

import { create } from 'zustand'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (message: string, type: 'success' | 'error') => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      useToastStore.getState().removeToast(id)
    }, 3000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
}
