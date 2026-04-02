export interface ChecklistItem {
  /** Unique key in format "{catalogType}:{name}", e.g. "skills:Cooking" */
  readonly key: string
  /** Display name shown in the UI */
  readonly name: string
  /** Subcategory within the catalog (e.g. "Cooking" within Skills) */
  readonly category: string
  /** Pack acronym matching src/data/packs.ts (e.g. "TS4", "GT") */
  readonly pack: string
}

/** The 7 catalog types used as key prefixes */
export type CatalogType =
  | 'skills'
  | 'aspirations'
  | 'careers'
  | 'parties'
  | 'traits'
  | 'deaths'
  | 'collections'
