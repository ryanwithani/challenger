import { SelectableCard } from "../challenge/SelectableCard";

// PATCH: responsive auto-fit grid + pass compact cards
export function PacksGrid({ packs, value, onChange }: {
    packs: { id: string; name: string }[]
    value: string[]
    onChange: (next: string[]) => void
  }) {
    const toggle = (id: string) =>
      onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  
    return (
        <div role="grid" className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {packs.map(p => (
            <SelectableCard
              key={p.id}
              id={p.id}
              disabled={false}
              title={p.name}
              selected={value.includes(p.id)}
              onToggle={() => toggle(p.id)}
              compact={true}
            />
          ))}
        </div>
    )
  }
  