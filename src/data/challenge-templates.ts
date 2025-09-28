import { ChallengeTemplate } from '@/src/types/challenge'

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
    {
        value: 'custom',
        label: 'Custom Challenge',
        description: 'Create your own unique challenge with custom rules',
        icon: '🎯',
        needsConfiguration: false
    },
    {
        value: 'legacy',
        label: 'Legacy Challenge',
        description: '10 generations with specific scoring rules and restrictions',
        icon: '👑',
        needsConfiguration: true
    },
    {
        value: 'not_so_berry',
        label: 'Not So Berry',
        description: 'Colorful legacy with unique goals per generation',
        icon: '🌈',
        needsConfiguration: false
    },
    {
        value: '100_baby',
        label: '100 Baby Challenge',
        description: 'Have 100 babies with one matriarch',
        icon: '👶',
        needsConfiguration: false
    },
]