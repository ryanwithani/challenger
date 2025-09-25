import { Careers, type Career } from '@/src/components/sim/CareersCatalog'

export const CAREERS = Careers
export const CAREER_BY_ID = new Map(CAREERS.map(c => [c.id, c]))
export const BASE_CAREERS: Career[] = CAREERS.filter(c => !c.base) // base==null

export function getBranchesForBase(baseId: string): Career[] {
  const base = CAREER_BY_ID.get(baseId)
  if (!base) return []
  // In the catalog, branches have base = parent label
  return CAREERS.filter(c => c.base === base.label)
}

export function careerLabelFromIds(baseId?: string, branchId?: string): string | null {
  const branch = branchId ? CAREER_BY_ID.get(branchId) : undefined
  if (branch) return branch.label
  const base = baseId ? CAREER_BY_ID.get(baseId) : undefined
  return base?.label ?? null
}

export function packForCareerIds(baseId?: string, branchId?: string): string | null {
  const branch = branchId ? CAREER_BY_ID.get(branchId) : undefined
  if (branch?.pack) return branch.pack
  const base = baseId ? CAREER_BY_ID.get(baseId) : undefined
  return base?.pack ?? null
}
