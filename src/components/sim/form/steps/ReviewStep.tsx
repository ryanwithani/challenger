'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
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
    if (e) {
      e.preventDefault();
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Review Your Sim</h2>
      
      <Card>
        <CardHeader><CardTitle>Sim Overview</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {data.basicInfo.firstName} {data.basicInfo.familyName}</p>
          <p><strong>Age:</strong> {data.basicInfo.age_stage}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Traits</CardTitle></CardHeader>
        <CardContent>
          <p>{data.traits.join(', ') || 'No traits selected'}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Personality</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Career:</strong> {data.personality.career?.label || 'None'}</p>
          <p><strong>Aspiration:</strong> {data.personality.aspiration || 'None'}</p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          type="button" 
          disabled={loading}
        >
          Back
        </Button>
        <Button 
          type="submit"
          variant="primary" 
          loading={loading}
          loadingText="Creating Sim..."
        >
          Create Sim
        </Button>
      </div>
    </form>
  );
}