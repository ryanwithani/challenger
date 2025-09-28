export function Switch({ checked, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) {
    return (
    <button
    type="button"
    onClick={() => onChange?.(!checked)}
    aria-pressed={!!checked}
    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-gray-300'}`}
    >
    <span
    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
    />
    </button>
    )
    }