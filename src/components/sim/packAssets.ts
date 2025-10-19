// packAssets.ts
export function packIconPath(packKey: string) {
  // Convert pack key to display name
  // get_together -> Get Together
  const displayName = packKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return `/packs/${encodeURIComponent(displayName)}.png`
}