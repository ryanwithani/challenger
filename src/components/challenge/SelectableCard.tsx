import { cn } from "@/src/lib/utils/cn"
import { Tooltip } from "@/src/components/ui/Tooltip"
import { packIconPath } from "../sim/packAssets"

// PATCH: tighten spacing, add compact prop, improve selected visuals, clamp title
export type SelectableCardProps = {
    id: string
    selected: boolean
    disabled: boolean
    title: string
    subtitle?: string
    tooltip?: string
    onToggle: () => void
    compact?: boolean
}
export function SelectableCard({
    id, selected, disabled, title, subtitle, tooltip, onToggle, compact = true,
  }: SelectableCardProps) {
    const base = compact ? 'h-22 px-2 py-2 rounded-xl' : 'h-28 p-3 rounded-2xl'
    const iconPath = packIconPath(title as string)
    const content = (
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-pressed={!!selected}
        aria-disabled={!!disabled}
        className={cn(
          'relative flex w-full flex-col items-center justify-center gap-1 border text-center text-sm transition focus-visible:ring-2 focus-visible:ring-brand-400',
          base,
          selected ? 'border-brand-500 ring-2 ring-brand-200 bg-brand-50' : 'border-gray-200 hover:border-brand-300 bg-white',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <div className={cn(compact ? 'text-xl' : 'text-2xl', 'leading-none')}>
        <img src={iconPath} alt={title} aria-hidden className={cn(compact ? 'h-6 w-6' : 'h-7 w-7')} />
        </div>
        <div className="font-medium text-gray-900 text-[13px] leading-tight line-clamp-2">{title}</div>
        {subtitle && <div className="text-[11px] text-gray-500 line-clamp-1">{subtitle}</div>}
        {selected && (
          <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">✓</span>
        )}
      </button>
    )
    return tooltip ? <Tooltip text={tooltip}>{content}</Tooltip> : content as React.ReactNode
  }
  