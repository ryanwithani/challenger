'use client'
import { Button } from '@/src/components/ui/Button'
import { useRouter } from 'next/navigation'


export default function StarterStep({ onBack }: { onBack: () => void }) {
const router = useRouter()


return (
<div className="space-y-4">
<p className="text-sm text-gray-700">All set! You can start by creating your first Legacy or adding a Sim.</p>
<div className="flex gap-2">
<Button onClick={() => router.push('/legacies/new')}>Start a Legacy</Button>
<Button variant="secondary" onClick={() => router.push('/sims/new')}>Add a Sim</Button>
</div>
<div className="pt-2">
<Button variant="ghost" onClick={onBack}>Back</Button>
</div>
</div>
)
}