// src/components/ui/TraitTile.tsx
'use client';

import Image from 'next/image';
import { TraitDefinition } from '@/src/components/sim/TraitsCatalog';

type Props = {
    trait: TraitDefinition;
    selected: boolean;
    disabled?: boolean;
    onToggle: (id: string) => void;
};

export default function TraitTile({ trait, selected, disabled, onToggle }: Props) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onToggle(trait.id)}
            disabled={disabled}
            role="checkbox"
            aria-checked={selected}
            aria-label={trait.label}
            className={[
                // size & layout
                'relative h-24 w-full rounded-xl',
                'grid place-items-center text-center',
                'px-2',
                // base skin (subtle Sims card)
                'bg-gradient-to-b from-sky-50 to-sky-100',
                'border border-sky-200',
                'shadow-[inset_0_1px_0_rgba(255,255,255,.7)]',
                // interactions
                'transition-transform duration-150',
                'hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sims-blue',
                selected ? 'ring-0 border-sims-purple' : 'hover:border-sims-blue/60',
                disabled && !selected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                // dark
                'dark:from-zinc-900 dark:to-zinc-800 dark:border-zinc-700',
            ].join(' ')}
        >
            {/* check badge */}
            {selected && (
                <span
                    className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-sims-purple text-white text-[11px]"
                    aria-hidden
                >
                    ✓
                </span>
            )}

            <div className="flex flex-col items-center gap-1.5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/70 border border-white/60 dark:bg-white/10 dark:border-white/10">
                        <span className="text-xl" aria-hidden>
                            {trait.label ?? '⭐'}
                        </span>
                </div>
                <div className="text-xs font-semibold leading-tight text-gray-800 dark:text-gray-100">
                    {trait.label}
                </div>
            </div>
        </button>
    );
}
