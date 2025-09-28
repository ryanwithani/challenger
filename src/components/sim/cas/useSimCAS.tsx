import { create } from 'zustand'
import type { AgeStage } from '@/src/lib/sim/age'
import type { CareerSelection } from '@/src/components/sim/CareerSelect'

type SimCAS = {
  step: number
  name: string
  age_stage: AgeStage
  avatar_url: string | null
  challenge_id: string | null
  traits: string[]
  career: CareerSelection | null
  aspiration: string | null
  setStep: (n: number) => void
  patch: (p: Partial<Omit<SimCAS,'step'|'setStep'|'patch'>>) => void
  reset: () => void
}
export const useSimCAS = create<SimCAS>((set) => ({
  step: 1,
  name: '', age_stage: 'young_adult',
  avatar_url: null, challenge_id: null,
  traits: [], career: null, aspiration: null,
  setStep: (n) => set({ step: n }),
  patch: (p) => set(p),
  reset: () => set({
    step: 1, name: '', age_stage: 'young_adult',
    avatar_url: null, challenge_id: null,
    traits: [], career: null, aspiration: null
  }),
}))
