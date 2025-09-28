import * as React from 'react'


export function Checkbox({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
return (
<label className="inline-flex items-center gap-2 text-sm">
<input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-400" {...props} />
{label && <span>{label}</span>}
</label>
)
}