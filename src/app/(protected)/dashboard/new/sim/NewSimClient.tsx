'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { SimWizard } from '@/src/components/sim/form/SimWizard'
import { toast } from '@/src/lib/store/toastStore'
import type { Database } from '@/src/types/database.types'

type SimInsert = Database['public']['Tables']['sims']['Insert']

export default function NewSimClient() {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)

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

      toast.success(`${simData.name} has been created successfully!`)

      setTimeout(() => {
        router.push(`/sim/${data.id}`);
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || 'Failed to create sim.')
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    router.push('/sims')
  }

  return (
    <div className="min-h-screen bg-cozy-cream dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-warmGray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-warmGray-700 p-8">
          {/* Header with mascot */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-warmGray-700">
            <Image
              src="/mascot/pointing.png"
              alt="Mascot pointing"
              width={80}
              height={80}
              className="w-20 h-20 object-contain -mr-2"
            />
            <h1 className="text-2xl font-bold text-brand-500 font-display">
              Create a Sim
            </h1>
          </div>

          <SimWizard
            onSubmit={handleFinalSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </div>

      </div>
    </div>
  )
}
