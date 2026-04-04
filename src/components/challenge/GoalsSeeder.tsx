// Legacy Challenge Goals Seeder - Creates predefined goals for Legacy challenges
// Based on Pinstar's official Legacy Challenge scoring rules

export type AutomationType = 'generation_ya' | 'ten_children_per_gen' | 'unique_spouse_traits' | 'challenge_complete_gen10'

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
    automationType?: AutomationType
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
        order: 1,
        automationType: 'generation_ya'
    },
    {
        id: 'family_ten_children',
        title: '10 Children in Single Generation',
        description: 'Have 10 children born to the same mother in one generation.',
        category: 'family',
        goalType: 'milestone',
        pointValue: 1,
        order: 2,
        automationType: 'ten_children_per_gen'
    }
]

// ===== CREATIVE CATEGORY (10 points) =====
const creativeGoals: LegacyGoalTemplate[] = [
    {
        id: 'creative_memorialize_heirs',
        title: 'Memorialize Heirs and Spouses',
        description: 'Memorialize each generation\'s heir and spouse (1pt per generation, 9 pts total). Methods: paint portrait (painting 8+), write song (piano/violin/guitar 8+), perform comedy routine at party (comedy 8+), write biography (writing 10), create video game (programming 9+), take photo (photography 5).',
        category: 'creative',
        goalType: 'counter',
        pointValue: 1,
        maxPoints: 9,
        order: 1
    },
    {
        id: 'creative_aspirations_10th',
        title: 'Creative Aspirations Completed (10th Point)',
        description: 'A single family member completes at least 2 of the 3 creative aspirations (Painter Extraordinaire, Bestselling Author, Musical Genius).',
        category: 'creative',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
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
            { value: 320000, points: 4 },
            { value: 510000, points: 5 },
            { value: 830000, points: 6 },
            { value: 1300000, points: 7 },
            { value: 2100000, points: 8 },
            { value: 3500000, points: 9 },
            { value: 5700000, points: 10 }
        ],
        order: 1
    }
]

// ===== LOVE CATEGORY (10 points) =====
const loveGoals: LegacyGoalTemplate[] = [
    {
        id: 'love_unique_spouse_traits',
        title: 'Unique Spouse Traits Brought In',
        description: 'Each primary spouse must bring completely unique traits (no repeats across generations). Earn 1pt per every 3 unique traits accumulated across all generations.',
        category: 'love',
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
            { value: 27, points: 9 }
        ],
        order: 1,
        automationType: 'unique_spouse_traits'
    },
    {
        id: 'love_challenge_completion',
        title: 'Challenge Complete (10th Point)',
        description: 'The 10th Love point is earned once the 10th generation heir is born, completing the challenge.',
        category: 'love',
        goalType: 'milestone',
        pointValue: 1,
        order: 2,
        automationType: 'challenge_complete_gen10'
    }
]

// ===== KNOWLEDGE CATEGORY (10 points) =====
const knowledgeGoals: LegacyGoalTemplate[] = [
    {
        id: 'knowledge_skills_maxed',
        title: 'Skills Maxed Across Family',
        description: 'Different skills maxed by any family member across all generations. Toddler and childhood skills count equally.',
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
            { value: 27, points: 9 }
        ],
        order: 1
    },
    {
        id: 'knowledge_every_skill_maxed',
        title: 'Every Skill Maxed (10th Point)',
        description: 'Every available skill in the game is maxed at some point during the challenge. Can be done by different Sims in different generations. Includes toddler and childhood skills.',
        category: 'knowledge',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
    }
]

// ===== ATHLETIC CATEGORY (10 points) =====
const athleticGoals: LegacyGoalTemplate[] = [
    {
        id: 'athletic_aspirations_completed',
        title: 'Aspirations Completed Across Family',
        description: 'Total number of aspirations completed by any family member. Childhood aspirations count.',
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
            { value: 36, points: 9 }
        ],
        order: 1
    },
    {
        id: 'athletic_every_aspiration',
        title: 'Every Aspiration Completed (10th Point)',
        description: 'Every unique aspiration in the game is completed by a family member across the entire challenge.',
        category: 'athletic',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
    }
]

// ===== NATURE CATEGORY (10 points) =====
const natureGoals: LegacyGoalTemplate[] = [
    {
        id: 'nature_collections_completed',
        title: 'Collections Completed',
        description: 'Complete collections out of the 30 possible in the game. Can be earned throughout the challenge, not by a single Sim or generation.',
        category: 'nature',
        goalType: 'threshold',
        pointValue: 1,
        thresholds: [
            { value: 1, points: 1 },
            { value: 2, points: 2 },
            { value: 5, points: 3 },
            { value: 9, points: 4 },
            { value: 13, points: 5 }
        ],
        order: 1
    },
    {
        id: 'nature_unique_death_types',
        title: 'Ten Unique Death Types',
        description: 'Have a Sim die on the family lot in each of the 10 different ways to die.',
        category: 'nature',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
    },
    {
        id: 'nature_all_careers_topped',
        title: 'All Career Tracks Topped',
        description: 'Have Sims within the household reach the top level of each career track.',
        category: 'nature',
        goalType: 'milestone',
        pointValue: 1,
        order: 3
    },
    {
        id: 'nature_all_career_branches',
        title: 'All Career Branches Mastered',
        description: 'Have Sims within the household reach the top level of both branches of every career track.',
        category: 'nature',
        goalType: 'milestone',
        pointValue: 1,
        order: 4
    },
    {
        id: 'nature_emotional_paintings',
        title: 'All Emotional Paintings Collected',
        description: 'Collect every single emotional painting type: Angry, Sad, Playful, Flirty, Confident, and Focused.',
        category: 'nature',
        goalType: 'milestone',
        pointValue: 1,
        order: 5
    },
    {
        id: 'nature_aspiration_rewards',
        title: 'All Aspiration Rewards Collected',
        description: 'Collect and store on the family lot every single consumable aspiration reward.',
        category: 'nature',
        goalType: 'milestone',
        pointValue: 1,
        order: 6
    }
]

// ===== FOOD CATEGORY (10 points) =====
const foodGoals: LegacyGoalTemplate[] = [
    {
        id: 'food_upgrade_appliances',
        title: 'Premium Kitchen Appliances',
        description: 'Purchase the most expensive refrigerator and stove, then fully upgrade both of them.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 1
    },
    {
        id: 'food_baked_alaska',
        title: 'Perfect Baked Alaska',
        description: 'Have a Sim make the highest quality version of Baked Alaska, the most difficult dish to make. (Alternatively: bake the highest level baking dish.)',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
    },
    {
        id: 'food_culinary_master',
        title: 'Culinary Master',
        description: 'Have a single Sim max the Cooking, Baking (Get to Work), Gourmet Cooking, and Mixology skills.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 3
    },
    {
        id: 'food_both_aspirations',
        title: 'Food Aspirations Complete',
        description: 'Have Sims complete both food aspirations in a single generation. They can be done by two different Sims.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 4
    },
    {
        id: 'food_overweight_sim',
        title: 'Cooking Consequence',
        description: 'Have a Sim get fat from your family\'s cooking.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 5
    },
    {
        id: 'food_six_sims_dining',
        title: 'Full Table Dinner',
        description: 'Have at least six Sims (family members or guests) all sitting at the table eating at the same time.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 6
    },
    {
        id: 'food_career_branches',
        title: 'Chef and Mixologist',
        description: 'Reach the top of both food career branches (Chef and Mixologist).',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 7
    },
    {
        id: 'food_fresh_ingredients',
        title: 'Premium Ingredients Meal',
        description: 'Cook a meal with at least two fresh ingredients that are of the highest quality.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 8
    },
    {
        id: 'food_date_meal',
        title: 'Romantic Dinner',
        description: 'Have a Sim make their date a max-quality meal or mix a max-quality drink during a single date.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 9
    },
    {
        id: 'food_party_catering',
        title: 'Party Catering Success',
        description: 'Serve a max-quality party-sized meal AND mix a max-quality drink, both served during a single party.',
        category: 'food',
        goalType: 'milestone',
        pointValue: 1,
        order: 10
    }
]

// ===== POPULARITY CATEGORY (10 points) =====
const popularityGoals: LegacyGoalTemplate[] = [
    {
        id: 'popularity_party_medals',
        title: 'Party Medal Points',
        description: 'Earn medal points from throwing parties and dates (Bronze=1, Silver=2, Gold=3). Includes Toddler Playdates if you have Toddler Stuff Pack.',
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
            { value: 81, points: 9 }
        ],
        order: 1
    },
    {
        id: 'popularity_perfect_events',
        title: 'Perfect Events Achieved (10th Point)',
        description: 'A single Sim achieves a gold medal in every different type of party AND a gold medal on a date. (Can alternatively be replaced by earning all possible club perks in your Legacy club.)',
        category: 'popularity',
        goalType: 'milestone',
        pointValue: 1,
        order: 2
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
        description: 'Each time the power is shut off due to unpaid bills.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -1,
        maxPoints: -20,
        order: 1
    },
    {
        id: 'penalty_plumbing_shutoffs',
        title: 'Plumbing Shutoffs',
        description: 'Each time the plumbing is shut off due to unpaid bills.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -1,
        maxPoints: -20,
        order: 2
    },
    {
        id: 'penalty_children_taken',
        title: 'Children Taken by Social Worker',
        description: 'Each time a child or infant is taken away by social services.',
        category: 'penalty',
        goalType: 'counter',
        pointValue: -1,
        maxPoints: -20,
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
        color: 'bg-brand-500',
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
        target_value: template.goalType === 'milestone' ? 1 : undefined,
        automation_type: template.automationType ?? null
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