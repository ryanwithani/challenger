'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { uploadSimAvatar } from '@/src/lib/utils/avatarUpload' // We'll need this
import { AvatarUploader } from '@/src/components/ui/AvatarUpload' // Our new reusable component
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { FormField } from '@/src/components/ui/FormField'
import { Select } from '@/src/components/ui/Select'
import type { SimWizardData } from '@/src/lib/validations/sim'

const AGE_OPTIONS = [
  { value: 'infant', label: 'Infant' }, { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' }, { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' }, { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
];

const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
  familyName: z.string().max(50, 'Max 50 characters').optional(),
  age_stage: z.string().min(1, 'Age stage is required'),
  avatar_url: z.string().nullable(),
  challenge_id: z.string().nullable(),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface BasicInfoStepProps {
  data: BasicInfoData | undefined;
  challenges: any[];
  onNext: (data: BasicInfoData) => void;
  onCancel: () => void;
  nextStepName?: string;
}

export function BasicInfoStep({ data, challenges, onNext, onCancel, nextStepName = 'Traits' }: BasicInfoStepProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    firstName: data?.firstName || '',
    familyName: data?.familyName || '',
    age_stage: data?.age_stage || 'young_adult',
    avatar_url: data?.avatar_url || null,
    challenge_id: data?.challenge_id || null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when props change
  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName || '',
        familyName: data.familyName || '',
        age_stage: data.age_stage || 'young_adult',
        avatar_url: data.avatar_url || null,
        challenge_id: data.challenge_id || null,
      });
    }
  }, [data]);

  // This function will be passed to the AvatarUploader
  const handleAvatarUpload = (file: File) => {
    // Here you would pass the Sim's ID if you were editing an existing sim.
    // For a new sim, we can pass a placeholder or handle it in the upload function.
    return uploadSimAvatar('new_sim_placeholder', file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate the form data
      const validatedData = basicInfoSchema.parse(formData);
      
      // Additional business logic validation
      if (validatedData.firstName.trim().length === 0) {
        setErrors({ firstName: 'First name cannot be empty' });
        return;
      }
      
      if (validatedData.familyName && validatedData.familyName.trim().length === 0) {
        setErrors({ familyName: 'Family name cannot be empty if provided' });
        return;
      }
      
      // Validate age_stage is a valid option
      const validAgeStages = AGE_OPTIONS.map(option => option.value);
      if (!validAgeStages.includes(validatedData.age_stage)) {
        setErrors({ age_stage: 'Please select a valid age stage' });
        return;
      }
      
      // Validate avatar_url if provided
      if (validatedData.avatar_url && validatedData.avatar_url.trim().length === 0) {
        setErrors({ avatar_url: 'Avatar URL cannot be empty if provided' });
        return;
      }
      
      // Validate challenge_id if provided
      if (validatedData.challenge_id && validatedData.challenge_id.trim().length === 0) {
        setErrors({ challenge_id: 'Challenge ID cannot be empty if provided' });
        return;
      }
      
      // Validate challenge_id is a valid challenge if provided
      if (validatedData.challenge_id) {
        const validChallengeIds = challenges.map(challenge => challenge.id);
        if (!validChallengeIds.includes(validatedData.challenge_id)) {
          setErrors({ challenge_id: 'Please select a valid challenge' });
          return;
        }
      }
      
      onNext(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Validation error:', error);
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
      <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
      
      {/* Show form-level errors */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-amber-800 font-semibold mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                {errors.general && <li className="text-red-600 font-medium">{errors.general}</li>}
                {errors.firstName && <li>{errors.firstName}</li>}
                {errors.familyName && <li>{errors.familyName}</li>}
                {errors.age_stage && <li>{errors.age_stage}</li>}
                {errors.avatar_url && <li>{errors.avatar_url}</li>}
                {errors.challenge_id && <li>{errors.challenge_id}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          required
          error={errors.firstName}
          description={`${formData.firstName?.length || 0}/50`}
        >
          <Input 
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Bella" 
            maxLength={50}
            required
            className={errors.firstName ? 'border-red-300 focus:border-red-500' : ''}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="sr-only">{errors.firstName}</p>
          )}
        </FormField>
        
        <FormField
          label="Family Name"
          error={errors.familyName}
          description={`${formData.familyName?.length || 0}/50`}
        >
          <Input 
            value={formData.familyName}
            onChange={(e) => updateField('familyName', e.target.value)}
            placeholder="Goth" 
            maxLength={50}
            className={errors.familyName ? 'border-red-300 focus:border-red-500' : ''}
            aria-invalid={!!errors.familyName}
            aria-describedby={errors.familyName ? 'familyName-error' : undefined}
          />
          {errors.familyName && (
            <p id="familyName-error" className="sr-only">{errors.familyName}</p>
          )}
        </FormField>
      </div>

      <FormField label="Age Stage" required error={errors.age_stage}>
        <Select
          value={formData.age_stage}
          onChange={(e) => updateField('age_stage', e.target.value)}
          options={AGE_OPTIONS}
          required
          error={errors.age_stage}
          aria-invalid={!!errors.age_stage}
          aria-describedby={errors.age_stage ? 'ageStage-error' : undefined}
        />
        {errors.age_stage && (
          <p id="ageStage-error" className="sr-only">{errors.age_stage}</p>
        )}
      </FormField>

      <FormField label="Avatar (Optional)" description="Upload a picture to represent your Sim" error={errors.avatar_url}>
        <AvatarUploader 
          value={formData.avatar_url} 
          onChange={(value) => updateField('avatar_url', value)}
          uploadFunction={handleAvatarUpload as (file: File) => Promise<string>}
        />
      </FormField>
      
      <FormField label="Link to Challenge (Optional)" description="Track this Sim's progress within a challenge" error={errors.challenge_id}>
        <Select
          value={formData.challenge_id || ''} 
          onChange={(e) => updateField('challenge_id', e.target.value || null)}
          options={challenges.map(challenge => ({
            value: challenge.id,
            label: `${challenge.name || challenge.challenge_type}${challenge.status === 'active' ? ' (Active)' : ''}`
          }))}
          emptyOption="— No Challenge —"
        />
      </FormField>

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText="Validating..."
        >
          Next: {nextStepName}
        </Button>
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Press Ctrl+Enter (or Cmd+Enter on Mac) to quickly proceed to the next step
      </div>
    </form>
  );
}