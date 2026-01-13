'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Header with mascot */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <Image
              src="/mascot/pointing.png"
              alt="Mascot pointing"
              width={80}
              height={80}
              className="w-20 h-20 object-contain -mr-2"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 text-transparent bg-clip-text font-exo2">
              Create a Sim
            </h1>
          </div>
          
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