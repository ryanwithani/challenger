// components/ui/radial-progress.tsx
export function RadialProgress({ value, size = 80 }: { value: number; size?: number }) {
    const radius = (size - 10) / 2 
    const circumference = 2 * Math.PI * radius
    const clamped = Math.min(100, Math.max(0, value))
    const offset = circumference - (clamped / 100) * circumference
    return (
    <svg width={size} height={size} className="text-gray-200">
    <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="10" fill="none" />
    <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke="currentColor"
    strokeWidth="10"
    strokeLinecap="round"
    className="text-brand-500 transition-all"
    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
    fill="none"
    />
    </svg>
    )
    }