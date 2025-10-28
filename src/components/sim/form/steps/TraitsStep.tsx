'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { TraitPickerPanel } from '@/src/components/sim/TraitPickerPanel'
import { Button } from '@/src/components/ui/Button'

const traitsSchema = z.array(z.string()).min(0).max(3, 'You can select a maximum of 3 traits');

interface TraitsStepProps {
  data: string[] | undefined;
  onNext: (data: string[]) => void;
  onBack: () => void;
  nextStepName?: string;
}

export function TraitsStep({ data, onNext, onBack, nextStepName = 'Personality' }: TraitsStepProps) {
  const [traits, setTraits] = useState<string[]>(data || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update traits when props change
  useEffect(() => {
    if (data) {
      setTraits(data);
    }
  }, [data]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate the traits data
      const validatedData = traitsSchema.parse(traits);
      
      // Additional business logic validation
      if (validatedData.length > 3) {
        setErrors({ traits: 'You can select a maximum of 3 traits' });
        return;
      }
      
      // Check for duplicate traits
      const uniqueTraits = Array.from(new Set(validatedData));
      if (uniqueTraits.length !== validatedData.length) {
        setErrors({ traits: 'Duplicate traits are not allowed' });
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

  const handleTraitsChange = (newTraits: string[]) => {
    setTraits(newTraits);
    // Clear error when user makes changes
    if (errors.traits) {
      setErrors(prev => ({ ...prev, traits: '' }));
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
      <h2 className="text-xl font-semibold text-gray-900">Sim Traits</h2>
      
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
                {errors.traits && <li>{errors.traits}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <TraitPickerPanel
        value={traits}
        onChange={handleTraitsChange}
        max={3}
        // You might need to pass ageStage to the picker if it does filtering
      />

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