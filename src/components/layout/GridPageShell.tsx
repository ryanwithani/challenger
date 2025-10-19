export function PageShell({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
    return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
    <h1 className="font-display text-2xl font-semibold text-gray-900">{title}</h1>
    <div className="flex items-center gap-2">{actions}</div>
    </div>
    <div>{children}</div>
    </div>
    )
    }