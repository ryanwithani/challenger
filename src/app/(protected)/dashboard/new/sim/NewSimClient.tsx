'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { SimWizard } from '@/src/components/sim/form/SimWizard' // Corrected import path
import { useSimStore } from '@/src/lib/store/simStore'
import { Toast } from '@/src/components/ui/Toast' // Assuming you have a Toast component
import type { Database } from '@/src/types/database.types'

type SimInsert = Database['public']['Tables']['sims']['Insert']

export default function NewSimClient() {
  const router = useRouter()
  
  // 1. State is now minimal: only for API submission and success feedback.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const { linkSimToChallenge } = useSimStore();
  
  // 2. This function is now MUCH simpler.
  // It receives the ALREADY VALIDATED data from the SimWizard.
  async function handleFinalSubmit(simData: SimInsert) {
    setIsSubmitting(true)
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to create a sim");
      }
      
      const { data, error } = await supabase
        .from('sims')
        .insert({ ...simData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      if (simData.challenge_id && data.id) {
        await linkSimToChallenge(data.id, simData.challenge_id);
      }
      
      setToast({ 
        message: `${simData.name} has been created successfully!`, 
        type: 'success' 
      });
      
      // Redirect after a short delay to show the success toast
      setTimeout(() => {
        router.push(`/sim/${data.id}`);
      }, 1500);

    } catch (err: any) {
      setToast({ message: err.message || 'Failed to create sim.', type: 'error' });
      console.error('Error creating sim:', err);
      setIsSubmitting(false); // Stop loading on error
    }
    // No need to set isSubmitting to false on success, as we are redirecting
  }

  const handleCancel = () => {
    // Optionally clear any saved wizard progress from localStorage here
    router.push('/dashboard')
  }

  // 3. The JSX is now just a clean wrapper for the wizard.
  return (
    <div className="min-h-screen bg-gradient-to-br from-cozy-cream to-brand-100 dark:from-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 p-8">
          <SimWizard 
            onSubmit={handleFinalSubmit} 
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </div>
        
        {toast && (
          <div className="fixed top-5 right-5 z-50">
              <Toast message={toast.message} type={toast.type} />
          </div>
        )}
      </div>
    </div>
  )
}