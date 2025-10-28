// Legacy Challenge Goals Seeder - Creates predefined goals for Legacy challenges
// Based on Pinstar's official Legacy Challenge scoring rules

export interface LegacyGoalTemplate {
    id: string
    title: string
    description: string
    category: string
    goalType: 'milestone' | 'counter' | 'threshold'
    pointValue: number
    maxPoints?: number
    thresholds?: { value: number; points: number }[]
    requiredPacks?: string[]
    order: number
}

// ===== FAMILY CATEGORY (10 points) =====
const familyGoals: LegacyGoalTemplate[] = [
    {
        id: 'family_generation_ya',
        title: 'Generations Reaching Young Adult',
        description: 'Each generation that reaches Young Adult stage. Track heirs aging up.',
        category: 'family',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 10,
        order: 1
    },
    {
        id: 'family_ten_children',
        title: '10 Children in Single Generation',
        description: 'Have 10 children born to the same mother in one generation.',
        category: 'family',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
    }
]

// ===== CREATIVE CATEGORY (10 points) =====
const creativeGoals: LegacyGoalTemplate[] = [
    {
        id: 'creative_memorialize_heirs',
        title: 'Memorialize Heirs and Spouses',
        description: 'Create paintings, books, or songs memorializing each generation\'s heir and spouse.',
        category: 'creative',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 5,
        order: 1
    },
    {
        id: 'creative_aspirations_completed',
        title: 'Creative Aspirations Completed',
        description: 'Complete creative aspirations (2 for 1pt, 3 for 2pts). Includes Painter Extraordinaire, Bestselling Author, Musical Genius.',
        category: 'creative',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 2, points: 1 },
            { value: 3, points: 2 }
        ],
        order: 2
    },
    {
        id: 'creative_museum_donations',
        title: 'Museum Donations',
        description: 'Donate paintings, books, or other creative works to the museum.',
        category: 'creative',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 3,
        order: 3
    }
]

// ===== FORTUNE CATEGORY (10 points) =====
const fortuneGoals: LegacyGoalTemplate[] = [
    {
        id: 'fortune_net_worth',
        title: 'Net Worth Milestones',
        description: 'Reach specific net worth thresholds for your household.',
        category: 'fortune',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 75000, points: 1 },
            { value: 120000, points: 2 },
            { value: 200000, points: 3 },
            { value: 300000, points: 4 },
            { value: 500000, points: 5 },
            { value: 850000, points: 6 },
            { value: 1400000, points: 7 },
            { value: 2300000, points: 8 },
            { value: 3700000, points: 9 },
            { value: 5700000, points: 10 }
        ],
        order: 1
    }
]

// ===== LOVE CATEGORY (10 points) =====
const loveGoals: LegacyGoalTemplate[] = [
    {
        id: 'love_unique_spouse_traits',
        title: 'Unique Spouse Traits',
        description: 'Each primary spouse must have completely unique traits (no repeats across generations).',
        category: 'love',
        goalType: 'milestone',
        pointValue: 10,
        order: 1
    }
]

// ===== KNOWLEDGE CATEGORY (10 points) =====
const knowledgeGoals: LegacyGoalTemplate[] = [
    {
        id: 'knowledge_skills_maxed',
        title: 'Skills Maxed Across Family',
        description: 'Different skills maxed by any family member across all generations.',
        category: 'knowledge',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 3, points: 1 },
            { value: 6, points: 2 },
            { value: 9, points: 3 },
            { value: 12, points: 4 },
            { value: 15, points: 5 },
            { value: 18, points: 6 },
            { value: 21, points: 7 },
            { value: 24, points: 8 },
            { value: 27, points: 9 },
            { value: 30, points: 10 } // All base game + expansion skills
        ],
        order: 1
    }
]

// ===== ATHLETIC CATEGORY (10 points) =====
const athleticGoals: LegacyGoalTemplate[] = [
    {
        id: 'athletic_aspirations_completed',
        title: 'Aspirations Completed Across Family',
        description: 'Total number of aspirations completed by any family member.',
        category: 'athletic',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 4, points: 1 },
            { value: 8, points: 2 },
            { value: 12, points: 3 },
            { value: 16, points: 4 },
            { value: 20, points: 5 },
            { value: 24, points: 6 },
            { value: 28, points: 7 },
            { value: 32, points: 8 },
            { value: 36, points: 9 },
            { value: 40, points: 10 } // All aspirations
        ],
        order: 1
    }
]

// ===== NATURE CATEGORY (10 points) =====
const natureGoals: LegacyGoalTemplate[] = [
    {
        id: 'nature_collections_completed',
        title: 'Collections Completed',
        description: 'Complete various collections (fossils, crystals, plants, etc.).',
        category: 'nature',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 5,
        order: 1
    },
    {
        id: 'nature_career_branches',
        title: 'Career Branches Completed',
        description: 'Complete different career branches across family members.',
        category: 'nature',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 3,
        order: 2
    },
    {
        id: 'nature_deaths_witnessed',
        title: 'Deaths from Natural Causes',
        description: 'Family members who die from old age (not accidents or other causes).',
        category: 'nature',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 1,
        order: 3
    },
    {
        id: 'nature_emotional_paintings',
        title: 'Emotional Paintings Created',
        description: 'Create paintings while experiencing different emotions.',
        category: 'nature',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 1,
        order: 4
    }
]

// ===== FOOD CATEGORY (10 points) =====
const foodGoals: LegacyGoalTemplate[] = [
    {
        id: 'food_excellent_meals',
        title: 'Excellent Quality Meals',
        description: 'Cook meals of Excellent quality.',
        category: 'food',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 25, points: 1 },
            { value: 50, points: 2 },
            { value: 100, points: 3 }
        ],
        order: 1
    },
    {
        id: 'food_gourmet_meals',
        title: 'Gourmet Quality Meals',
        description: 'Cook meals of Gourmet quality (requires Gourmet Cooking skill).',
        category: 'food',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 25, points: 1 },
            { value: 50, points: 2 },
            { value: 100, points: 3 }
        ],
        order: 2
    },
    {
        id: 'food_ambrosia_meals',
        title: 'Ambrosia Meals Cooked',
        description: 'Cook the legendary Ambrosia dish.',
        category: 'food',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 2,
        order: 3
    },
    {
        id: 'food_culinary_career',
        title: 'Culinary Career Completion',
        description: 'Complete the Culinary career (Chef or Mixologist branch).',
        category: 'food',
        goalType: 'milestone',
        pointValue: 2,
        order: 4
    }
]

// ===== POPULARITY CATEGORY (10 points) =====
const popularityGoals: LegacyGoalTemplate[] = [
    {
        id: 'popularity_party_medals',
        title: 'Party Medal Points',
        description: 'Earn medal points from throwing parties (Bronze=1, Silver=2, Gold=3).',
        category: 'popularity',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 9, points: 1 },
            { value: 18, points: 2 },
            { value: 27, points: 3 },
            { value: 36, points: 4 },
            { value: 45, points: 5 },
            { value: 54, points: 6 },
            { value: 63, points: 7 },
            { value: 72, points: 8 },
            { value: 81, points: 9 },
            { value: 90, points: 10 }
        ],
        order: 1
    }
]

// ===== DEVIANCE CATEGORY (10 points) =====
const devianceGoals: LegacyGoalTemplate[] = [
    {
        id: 'deviance_unused_potions',
        title: 'Unused Potions of Youth',
        description: 'Potions of Youth obtained but never used by the family.',
        category: 'deviance',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 2, points: 1 },
            { value: 4, points: 2 },
            { value: 6, points: 3 },
            { value: 8, points: 4 },
            { value: 10, points: 5 },
            { value: 12, points: 6 },
            { value: 14, points: 7 },
            { value: 16, points: 8 },
            { value: 18, points: 9 },
            { value: 20, points: 10 }
        ],
        order: 1
    }
]

// ===== PENALTY GOALS (Negative Points) =====
const penaltyGoals: LegacyGoalTemplate[] = [
    {
        id: 'penalty_power_shutoffs',
        title: 'Power Shutoffs',
        description: 'Each time utilities are shut off due to non-payment.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -2,
        maxPoints: -20,
        order: 1
    },
    {
        id: 'penalty_children_taken',
        title: 'Children Taken by Social Worker',
        description: 'Each time a child is removed by social services.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -5,
        maxPoints: -50,
        order: 2
    },
    {
        id: 'penalty_fires',
        title: 'House Fires',
        description: 'Each house fire that occurs on the lot.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -1,
        maxPoints: -10,
        order: 3
    }
]

// ===== COMBINE ALL GOALS =====
export const ALL_LEGACY_GOALS: LegacyGoalTemplate[] = [
    ...familyGoals,
    ...creativeGoals,
    ...fortuneGoals,
    ...loveGoals,
    ...knowledgeGoals,
    ...athleticGoals,
    ...natureGoals,
    ...foodGoals,
    ...popularityGoals,
    ...devianceGoals,
    ...penaltyGoals
]

// ===== CATEGORY METADATA =====
export const LEGACY_CATEGORIES = {
    family: {
        name: 'Family',
        color: 'bg-red-500',
        maxPoints: 10,
        description: 'Generations, children, and family milestones',
        icon: '/traits/Family Oriented.png'
    },
    creative: {
        name: 'Creative',
        color: 'bg-purple-500',
        maxPoints: 10,
        description: 'Memorialize family, complete creative aspirations',
        icon: '/traits/Creative.png'
    },
    fortune: {
        name: 'Fortune',
        color: 'bg-yellow-500',
        maxPoints: 10,
        description: 'Net worth milestones and financial success',
        icon: '/traits/Materialistic.png'
    },
    love: {
        name: 'Love',
        color: 'bg-pink-500',
        maxPoints: 10,
        description: 'Unique spouse traits and relationships',
        icon: '/traits/Romantic.png'
    },
    knowledge: {
        name: 'Knowledge',
        color: 'bg-blue-500',
        maxPoints: 10,
        description: 'Skills mastered across all family members',
        icon: '/traits/Curious.png'
    },
    athletic: {
        name: 'Athletic',
        color: 'bg-green-500',
        maxPoints: 10,
        description: 'Aspirations completed by family members',
        icon: '/traits/Active.png'
    },
    nature: {
        name: 'Nature',
        color: 'bg-emerald-500',
        maxPoints: 10,
        description: 'Collections, careers, and natural achievements',
        icon: '/traits/Nurturing.png'
    },
    food: {
        name: 'Food',
        color: 'bg-orange-500',
        maxPoints: 10,
        description: 'Cooking achievements and culinary success',
        icon: '/traits/Foodie.png'
    },
    popularity: {
        name: 'Popularity',
        color: 'bg-indigo-500',
        maxPoints: 10,
        description: 'Party medals and social achievements',
        icon: '/traits/Outgoing.png'
    },
    deviance: {
        name: 'Deviance',
        color: 'bg-gray-500',
        maxPoints: 10,
        description: 'Unused Potions of Youth stored',
        icon: '/PotionPurple2.png'
    },
    penalty: {
        name: 'Penalties',
        color: 'bg-red-600',
        maxPoints: 0,
        description: 'Negative points for setbacks',
        icon: '/Dislike.png'
    }
}

// ===== GOAL SEEDING FUNCTION =====
export interface LegacyChallengeConfig {
    expansionPacks: string[]
    startType: 'regular' | 'extreme' | 'ultra_extreme'
    genderLaw: string
    bloodlineLaw: string
    heirSelection: string
    speciesRule: string
}

export function generateLegacyGoals(config: LegacyChallengeConfig) {
    // Filter goals based on expansion packs owned
    let goals = ALL_LEGACY_GOALS.filter(goal => {
        if (!goal.requiredPacks) return true
        return goal.requiredPacks.some(pack => config.expansionPacks.includes(pack))
    })

    // Adjust thresholds based on start type
    if (config.startType === 'extreme') {
        goals = goals.map(goal => ({
            ...goal,
            thresholds: goal.thresholds?.map(t => ({
                ...t,
                value: Math.floor(t.value * 1.5) // 50% more difficult
            }))
        }))
    } else if (config.startType === 'ultra_extreme') {
        goals = goals.map(goal => ({
            ...goal,
            thresholds: goal.thresholds?.map(t => ({
                ...t,
                value: Math.floor(t.value * 2) // 100% more difficult
            }))
        }))
    }

    return goals
}

// ===== DATABASE INSERTION HELPER =====
export function convertGoalTemplateToDbGoal(
    template: LegacyGoalTemplate,
    challengeId: string,
    orderOffset = 0
) {
    return {
        challenge_id: challengeId,
        title: template.title,
        description: template.description,
        category: template.category,
        point_value: template.pointValue,
        order_index: template.order + orderOffset,
        goal_type: template.goalType,
        max_points: template.maxPoints,
        thresholds: template.thresholds ? JSON.stringify(template.thresholds) : null,
        current_value: 0, // Start at 0 for counters/thresholds
        target_value: template.goalType === 'milestone' ? 1 : undefined
    }
}

// ===== STORE INTEGRATION HELPER =====
export async function seedLegacyChallengeGoals(
    challengeId: string,
    config: LegacyChallengeConfig,
    supabaseClient: any
) {
    try {
        console.log('🎯 GoalsSeeder: Starting goal generation...', { challengeId, config });
        
        const goalTemplates = generateLegacyGoals(config)
        console.log(`🎯 GoalsSeeder: Generated ${goalTemplates.length} goal templates for Legacy Challenge`)
        
        if (goalTemplates.length === 0) {
            console.warn('⚠️ GoalsSeeder: No goals generated, skipping database insertion');
            return [];
        }
        
        const dbGoals = goalTemplates.map((template, index) =>
            convertGoalTemplateToDbGoal(template, challengeId, index * 10)
        )

        console.log('🎯 GoalsSeeder: Inserting goals into database...', { goalCount: dbGoals.length });
        
        // Insert goals in batches to avoid database limits
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < dbGoals.length; i += batchSize) {
            batches.push(dbGoals.slice(i, i + batchSize));
        }
        
        console.log(`🎯 GoalsSeeder: Inserting ${batches.length} batches of goals...`);
        
        const allResults = [];
        for (let i = 0; i < batches.length; i++) {
            console.log(`🎯 GoalsSeeder: Inserting batch ${i + 1}/${batches.length}...`);
            
            const { data, error } = await supabaseClient
                .from('goals')
                .insert(batches[i])
                .select()

            if (error) {
                console.error(`❌ GoalsSeeder: Error inserting batch ${i + 1}:`, error)
                throw new Error(`Failed to create Legacy Challenge goals (batch ${i + 1}): ${error.message}`)
            }

            allResults.push(...(data || []));
            console.log(`✅ GoalsSeeder: Batch ${i + 1} inserted successfully`);
        }

        console.log(`🎉 GoalsSeeder: Successfully inserted ${allResults.length} goals total`)
        return allResults
    } catch (error) {
        console.error('❌ GoalsSeeder: Error in seedLegacyChallengeGoals:', error)
        throw error
    }
}