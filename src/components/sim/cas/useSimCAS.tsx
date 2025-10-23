// In useSimCAS.tsx, update the store to use localStorage if available
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CareerSelection } from '@/src/components/sim/CareerSelect';

type SimCAS = {
  step: number;
  name: string;
  age_stage: string;
  avatar_url: string | null;
  challenge_id: string | null;
  traits: string[];
  career: CareerSelection | null;
  aspiration: string | null;
  setStep: (n: number) => void;
  patch: (p: Partial<Omit<SimCAS,'step'|'setStep'|'patch'|'reset'>>) => void;
  reset: () => void;
};

export const useSimCAS = create<SimCAS>()(
  persist(
    (set) => ({
      step: 1,
      name: '', 
      age_stage: 'young_adult',
      avatar_url: null, 
      challenge_id: null,
      traits: [], 
      career: null, 
      aspiration: null,
      setStep: (n) => set({ step: n }),
      patch: (p) => set(p),
      reset: () => set({
        step: 1, 
        name: '', 
        age_stage: 'young_adult',
        avatar_url: null, 
        challenge_id: null,
        traits: [], 
        career: null, 
        aspiration: null
      }),
    }),
    {
      name: 'sim-creation-storage',
      skipHydration: typeof window === 'undefined', // Skip on server
    }
  )
);