export function Stepper({ steps, current }: { steps: string[]; current: number }) {
    return (
    <ol className="flex items-center gap-3">
    {steps.map((s, i) => (
    <li key={s} className="flex items-center gap-2">
    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i <= current ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</span>
    <span className={`text-sm ${i === current ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{s}</span>
    </li>
    ))}
    </ol>
    )
    }