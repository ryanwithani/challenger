// src/components/sim/traitAssets.ts
import { Traits } from '@/src/components/sim/TraitsCatalog'

const VALID_IDS = new Set(Traits.map(t => t.id))

/** Always use label to build filename */
export function traitPngPath({ id, label }: { id: string; label: string }): string {
  if (!VALID_IDS.has(id)) return '/traits/_fallback.png'
  const file = `${label}.png`
  return `/traits/${encodeURIComponent(file)}`
}
