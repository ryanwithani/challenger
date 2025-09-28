export function EmptyState({ title, body, cta }: { title: string; body?: string; cta?: React.ReactNode }) {
    return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
    <div className="mb-3 text-4xl">💎</div>
    <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
    {body && <p className="mb-4 text-sm text-gray-600">{body}</p>}
    {cta}
    </div>
    )
    }