'use client'

import { Button } from '@/src/components/ui/Button'
import type { SimWizardData } from '@/src/lib/validations/sim'

interface ReviewStepProps {
  data: SimWizardData;
  onSubmit: (data: SimWizardData) => void | Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export function ReviewStep({ data, onSubmit, onBack, loading }: ReviewStepProps) {
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onSubmit(data)
  }

  const fullName = [data.basicInfo.firstName, data.basicInfo.familyName].filter(Boolean).join(' ')
  const ageLabel = data.basicInfo.age_stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-4">
        {data.basicInfo.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.basicInfo.avatar_url}
            alt={fullName}
            className="h-20 w-20 rounded-full object-cover border-2 border-warmGray-200 dark:border-warmGray-700"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-3xl font-display font-semibold text-brand-600 dark:text-brand-300">
            {data.basicInfo.firstName.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="font-display text-2xl font-semibold text-warmGray-900 dark:text-warmGray-100">{fullName}</h2>
        <span className="rounded-full bg-warmGray-100 dark:bg-warmGray-800 px-3 py-1 text-xs text-warmGray-600 dark:text-warmGray-400">{ageLabel}</span>
      </div>

      {/* Details grid */}
      <div className="rounded-2xl border border-warmGray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-800 divide-y divide-warmGray-100 dark:divide-warmGray-700">
        <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-warmGray-100 dark:divide-warmGray-700">
          <div className="px-4 py-3">
            <dt className="text-xs font-medium text-warmGray-500 dark:text-warmGray-400 uppercase tracking-wide">Traits</dt>
            <dd className="mt-1 text-sm text-warmGray-900 dark:text-warmGray-100">
              {data.traits.length > 0
                ? data.traits.join(', ')
                : <span className="italic text-warmGray-400 dark:text-warmGray-500">None selected</span>
              }
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="text-xs font-medium text-warmGray-500 dark:text-warmGray-400 uppercase tracking-wide">Career</dt>
            <dd className="mt-1 text-sm text-warmGray-900 dark:text-warmGray-100">
              {data.personality.career?.label ?? <span className="italic text-warmGray-400 dark:text-warmGray-500">None</span>}
            </dd>
          </div>
        </dl>
        <div className="px-4 py-3">
          <dt className="text-xs font-medium text-warmGray-500 dark:text-warmGray-400 uppercase tracking-wide">Aspiration</dt>
          <dd className="mt-1 text-sm text-warmGray-900 dark:text-warmGray-100">
            {data.personality.aspiration ?? <span className="italic text-warmGray-400 dark:text-warmGray-500">None</span>}
          </dd>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} type="button" disabled={loading}>
          Back
        </Button>
        <Button type="submit" variant="primary" loading={loading} loadingText="Creating Sim...">
          Create Sim
        </Button>
      </div>
    </form>
  )
}
