'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { CareerPicker } from '@/src/components/sim/CareerPicker'
import { AspirationPicker } from '@/src/components/sim/AspirationPicker'
import { Button } from '@/src/components/ui/Button'
import { FormField } from '@/src/components/ui/FormField'
import type { SimWizardData } from '@/src/lib/validations/sim'

const careerSchema = z.object({
  label: z.string(),
  value: z.string(),
}).nullable();

const personalitySchema = z.object({
  career: careerSchema,
  aspiration: z.string().nullable(),
});

type PersonalityData = z.infer<typeof personalitySchema>;

interface PersonalityStepProps {
  data: PersonalityData | undefined;
  ageStage: string;
  onNext: (data: PersonalityData) => void;
  onBack: () => void;
  nextStepName?: string;
}

export function PersonalityStep({ data, ageStage, onNext, onBack, nextStepName = 'Review' }: PersonalityStepProps) {
  const [formData, setFormData] = useState<PersonalityData>({
    career: data?.career || null,
    aspiration: data?.aspiration || null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when props change
  useEffect(() => {
    if (data) {
      setFormData({
        career: data.career || null,
        aspiration: data.aspiration || null,
      });
    }
  }, [data]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate the personality data
      const validatedData = personalitySchema.parse(formData);
      
      // Additional business logic validation
      if (validatedData.career && (!validatedData.career.label || !validatedData.career.value)) {
        setErrors({ career: 'Invalid career selection' });
        return;
      }
      
      if (validatedData.aspiration && validatedData.aspiration.trim().length === 0) {
        setErrors({ aspiration: 'Aspiration cannot be empty if provided' });
        return;
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

  const updateField = (field: keyof PersonalityData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes changes
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
      <h2 className="text-xl font-semibold text-gray-900">Personality & Goals</h2>
      
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
                {errors.career && <li>{errors.career}</li>}
                {errors.aspiration && <li>{errors.aspiration}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <FormField label="Career (Optional)" error={errors.career}>
        <CareerPicker 
          value={formData.career} 
          onChange={(value) => updateField('career', value)} 
        />
      </FormField>
      
      <FormField label="Aspiration (Optional)" error={errors.aspiration}>
        <AspirationPicker
          ageStage={ageStage}
          value={formData.aspiration}
          onChange={(value) => updateField('aspiration', value)}
        />
      </FormField>

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          type="button"
          disabled={isSubmitting}
        >
          Back
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