/**
 * Safe JSON parsing utilities with proper error handling and type safety
 */

export interface ParseResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Safely parse JSON string with error handling
 */
export function safeParse<T = any>(jsonString: string | null | undefined, fallback?: T): ParseResult<T> {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      success: false,
      error: 'Invalid input: expected non-empty string',
      data: fallback
    }
  }

  try {
    const parsed = JSON.parse(jsonString)
    return {
      success: true,
      data: parsed
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      data: fallback
    }
  }
}

/**
 * Safely parse completion details with type safety
 */
export interface CompletionDetails {
  method: string
  sim_name?: string
  notes?: string
  points_earned?: number
  completed_at?: string
}

export function safeParseCompletionDetails(
  details: string | null | undefined
): ParseResult<CompletionDetails> {
  return safeParse<CompletionDetails>(details, {
    method: 'Unknown',
    sim_name: undefined,
    notes: undefined,
    points_earned: 0,
    completed_at: undefined
  })
}

/**
 * Safely parse thresholds array with type safety
 */
export interface Threshold {
  value: number
  points: number
}

export function safeParseThresholds(
  thresholds: string | null | undefined
): ParseResult<Threshold[]> {
  return safeParse<Threshold[]>(thresholds, [])
}

/**
 * Safely parse challenge configuration
 */
export interface ChallengeConfig {
  start_type?: 'regular' | 'extreme' | 'ultra_extreme'
  gender_law?: string
  bloodline_law?: string
  heir_selection?: string
  species_rule?: string
  expansion_packs?: string[]
}

export function safeParseChallengeConfig(
  config: string | null | undefined
): ParseResult<ChallengeConfig> {
  return safeParse<ChallengeConfig>(config, {
    start_type: 'regular',
    gender_law: 'traditional',
    bloodline_law: 'traditional',
    heir_selection: 'traditional',
    species_rule: 'traditional',
    expansion_packs: []
  })
}

/**
 * Utility to get parsed data or fallback
 */
export function getParsedData<T>(result: ParseResult<T>, fallback: T): T {
  return result.success ? result.data! : fallback
}

/**
 * Utility to check if parsing was successful
 */
export function isParseSuccess<T>(result: ParseResult<T>): result is { success: true; data: T } {
  return result.success
}
