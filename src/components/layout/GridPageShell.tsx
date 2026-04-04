export function PageShell({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
    return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-warmGray-50">{title}</h1>
    <div className="flex items-center gap-2">{actions}</div>
    </div>
    <div>{children}</div>
    </div>
    )
    }