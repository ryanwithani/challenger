// packAssets.ts
import { getPackName } from '@/src/data/packs'

export function packIconPath(packKey: string) {
  const displayName = getPackName(packKey)
  return `/packs/${encodeURIComponent(displayName)}.png`
}
