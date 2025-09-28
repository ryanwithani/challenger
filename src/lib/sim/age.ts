export type AgeStage = 'infant'|'toddler'|'child'|'teen'|'young_adult'|'adult'|'elder'
export const isInfant = (a?: string) => a === 'infant'
export const isToddler = (a?: string) => a === 'toddler'
export const isToddlerOrInfant = (a?: string) => a === 'infant' || a === 'toddler'
export const isWorkingAge = (a?: string) =>
  !!a && ['teen','young_adult','adult','elder'].includes(a as any)
