export interface LegacyScoring {
    careers: number
    skills: number
    collections: number
    estimatedPoints: {
        knowledge: number
        total: number
    }
}

const PACK_CONTRIBUTIONS = {
    get_to_work: { careers: 3, skills: 2, collections: 3 },
    get_together: { careers: 0, skills: 2, collections: 0 },
    city_living: { careers: 6, skills: 1, collections: 2 },
    cats_dogs: { careers: 2, skills: 1, collections: 2 },
    seasons: { careers: 0, skills: 1, collections: 1 },
    get_famous: { careers: 2, skills: 2, collections: 0 },
    island_living: { careers: 2, skills: 0, collections: 2 },
    discover_university: { careers: 6, skills: 2, collections: 1 },
    eco_lifestyle: { careers: 2, skills: 2, collections: 2 },
    snowy_escape: { careers: 2, skills: 3, collections: 1 },
    cottage_living: { careers: 0, skills: 1, collections: 2 },
    high_school_years: { careers: 0, skills: 0, collections: 1 },
    growing_together: { careers: 0, skills: 0, collections: 0 },
    horse_ranch: { careers: 0, skills: 2, collections: 1 },
    for_rent: { careers: 0, skills: 0, collections: 0 },
    lovestruck: { careers: 0, skills: 0, collections: 0 },
    life_death: { careers: 2, skills: 1, collections: 1 }
} as const

export function calculateLegacyScoring(selectedPacks: string[]): LegacyScoring {
    let totalCareers = 23
    let totalSkills = 15
    let totalCollections = 13

    selectedPacks.forEach(packKey => {
        const contribution = PACK_CONTRIBUTIONS[packKey as keyof typeof PACK_CONTRIBUTIONS]
        if (contribution) {
            totalCareers += contribution.careers
            totalSkills += contribution.skills
            totalCollections += contribution.collections
        }
    })

    const careerPoints = Math.min(Math.floor(totalCareers / 3), 10)
    const skillPoints = Math.min(Math.floor(totalSkills / 5), 10)
    const collectionPoints = Math.min(Math.floor(totalCollections / 2), 10)
    const knowledgeSubtotal = careerPoints + skillPoints + collectionPoints

    return {
        careers: totalCareers,
        skills: totalSkills,
        collections: totalCollections,
        estimatedPoints: {
            knowledge: Math.min(knowledgeSubtotal, 20),
            total: 60 + Math.min(knowledgeSubtotal, 20)
        }
    }
}