export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2">
    <span>🔎</span>
    <input className="w-full bg-transparent text-sm outline-none" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
    )
    }