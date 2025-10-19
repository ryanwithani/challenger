// components/pickers/useMaxSelect.ts
import { useState } from 'react'
export function useMaxSelect(max: number) {
const [selected, setSelected] = useState<string[]>([])
function toggle(id: string) {
setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < max ? [...prev, id] : prev))
}
const canSelectMore = selected.length < max
return { selected, toggle, canSelectMore }
}