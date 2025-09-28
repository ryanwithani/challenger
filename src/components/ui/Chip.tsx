import { cn } from '@/src/lib/utils/cn'
export function Chip({ active, children, onClear }: { active?: boolean; children: React.ReactNode; onClear?: () => void }) {
return (
<span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs', active ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>
{children}
{onClear && (
<button onClick={onClear} className="ml-1 text-gray-500 hover:text-gray-800">✕</button>
)}
</span>
)
}