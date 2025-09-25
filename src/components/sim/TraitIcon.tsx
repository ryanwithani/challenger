// TraitIcon.tsx
import Image from 'next/image'

function pathFromLabel(label: string) {
  return `/traits/${encodeURIComponent(`${label}.png`)}`
}

export function TraitIcon({ label, size = 24 }: { label: string; size?: number }) {
  return <Image src={pathFromLabel(label)} alt={label} width={size} height={size} />
}
