export interface LegacyScoring {
    careers: number
    skills: number
    collections: number
    estimatedPoints: {
        knowledge: number
        total: number
    }
}

const PACK_CONTRIBUTIONS: Record<string, { careers: number; skills: number; collections: number }> = {
    GTW: { careers: 3, skills: 2, collections: 3 },
    GT: { careers: 0, skills: 2, collections: 0 },
    CL: { careers: 6, skills: 1, collections: 2 },
    'C&D': { careers: 2, skills: 1, collections: 2 },
    S: { careers: 0, skills: 1, collections: 1 },
    GF: { careers: 2, skills: 2, collections: 0 },
    IL: { careers: 2, skills: 0, collections: 2 },
    DU: { careers: 6, skills: 2, collections: 1 },
    EL: { careers: 2, skills: 2, collections: 2 },
    SE: { careers: 2, skills: 3, collections: 1 },
    CLV: { careers: 0, skills: 1, collections: 2 },
    HSY: { careers: 0, skills: 0, collections: 1 },
    GTO: { careers: 0, skills: 0, collections: 0 },
    HR: { careers: 0, skills: 2, collections: 1 },
    FR: { careers: 0, skills: 0, collections: 0 },
    L: { careers: 0, skills: 0, collections: 0 },
    'L&D': { careers: 2, skills: 1, collections: 1 },
}

export function calculateLegacyScoring(selectedPacks: string[]): LegacyScoring {
    let totalCareers = 23
    let totalSkills = 15
    let totalCollections = 13

    selectedPacks.forEach(acronym => {
        const contribution = PACK_CONTRIBUTIONS[acronym]
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
