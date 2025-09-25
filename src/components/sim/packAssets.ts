// packAssets.ts (or inline in the component file)
export function packIconPath(name: string) {
    // label examples: "Horse Ranch", "Base Game"
    return `/packs/${encodeURIComponent(name)}.png`
  }
  