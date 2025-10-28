export const DASHBOARD_TABS: { id: string; name: string }[] = [
  { id: 'overview', name: 'Overview' },
  { id: 'challenges', name: 'Challenges' },
  { id: 'sims', name: 'Sims' }
] as const;

export const CHALLENGE_STATUS: { id: string; name: string }[] = [
  { id: 'active', name: 'Active' },
  { id: 'completed', name: 'Completed' },
  { id: 'paused', name: 'Paused' },
  { id: 'archived', name: 'Archived' }
] as const;

export const LOCAL_STORAGE_KEYS = {
    PASSWORD_RESET_RATE_LIMIT: 'password_reset_rate_limit',
    PASSWORD_RESET_REQUEST: 'password_reset_request',
} as const;

export const SIM_PROGRESS_STORAGE_KEY = 'sim_wizard_progress'
export const SIM_BASIC_INFO_STORAGE_KEY = 'sim_wizard_basic_info'
export const SIM_TRAITS_STORAGE_KEY = 'sim_wizard_traits'
export const SIM_PERSONALITY_STORAGE_KEY = 'sim_wizard_personality'

export const CHALLENGE_PROGRESS_STORAGE_KEY = 'challenge_wizard_progress'
export const CHALLENGE_BASIC_INFO_STORAGE_KEY = 'challenge_wizard_basic_info'
export const CHALLENGE_CONFIGURATION_STORAGE_KEY = 'challenge_wizard_configuration'

export const UI_VARIANTS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    ACCENT: 'accent',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    DESTRUCTIVE: 'destructive',
    GRADIENT: 'gradient',
} as const;