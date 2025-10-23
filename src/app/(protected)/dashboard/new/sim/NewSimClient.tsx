'use client'
import { useState } from 'react'
import { Toast } from '@/src/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { CASWizard } from '@/src/components/sim/cas/CASWizard'
import { useSimStore } from '@/src/lib/store/simStore'

export default function NewSimClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)


  const { linkSimToChallenge } = useSimStore();
  
  async function save(values: any) {
    setSaving(true)
    setError(null)
    
    try {
      // Input validation
      if (!values.name || values.name.trim().length < 1) {
        throw new Error("Sim name is required");
      }
      
      if (!values.age_stage) {
        throw new Error("Age stage is required");
      }
      
      if (values.traits && values.traits.length > 3) {
        throw new Error("Maximum of 3 traits allowed");
      }
      
      // Sanitize inputs
      const sanitizedValues = {
        name: values.name.trim().slice(0, 50), // Limit name length
        age_stage: values.age_stage,
        avatar_url: values.avatar_url,
        career: values.career?.label ? {
          label: values.career.label.trim(),
          baseId: values.career.baseId,
          branchId: values.career.branchId
        } : null,
        aspiration: values.aspiration ? values.aspiration.trim() : null,
        traits: values.traits || [],
        challenge_id: values.challenge_id || null,
      };
      
      const supabase = createSupabaseBrowserClient();
      
      // Get current user to verify authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to create a sim");
      }
      
      const { data, error } = await supabase
        .from('sims')
        .insert({
          ...sanitizedValues,
          user_id: user.id // Explicitly set the user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // If the sim has a challenge, create the challenge_sim relationship
      if (values.challenge_id) {
        try {
          await linkSimToChallenge(data.id, values.challenge_id);
        } catch (linkError: any) {
          console.error('Error linking sim to challenge:', linkError);
          // Continue anyway, as the sim was created successfully
        }
      }
      
      setToast({ 
        message: `${sanitizedValues.name} has been created successfully!`, 
        type: 'success' 
      });
      
      setTimeout(() => {
        router.push(`/sim/${data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create sim');
      console.error('Error creating sim:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mx-auto max-w-3xl mb-4">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error creating sim:</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <CASWizard 
        onSubmit={save} 
        submitLabel={saving ? "Creating..." : "Create Sim"} 
        isSubmitting={saving}
      />
      
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}