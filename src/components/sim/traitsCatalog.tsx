export type TraitCategory = 'emotional' | 'social' | 'lifestyle' | 'mental' | 'hobby' | 'personality' 

export type TraitDefinition = {
    id: string
    label: string
    category?: TraitCategory
    expansionPack?: string;
    ageStage?: 'infant' | 'toddler' | 'adult' | 'elder';
}

export const Traits: TraitDefinition[] = [
    {
        id: 'ambitious',
        label: 'Ambitious',
        category: 'emotional',
    },
    {
        id: 'childish',
        label: 'Childish',
        category: 'emotional',
    },
    {
        id: 'clumsy',
        label: 'Clumsy',
        category: 'emotional',
    },
    {
        id: 'erratic',
        label: 'Erratic',
        category: 'emotional',
    },
    {
        id: 'goofball',
        label: 'Goofball',
        category: 'emotional',
    },
    {
        id: 'cheerful',
        label: 'Cheerful',
        category: 'emotional',
    },
    {
        id: 'creative',
        label: 'Creative',
        category: 'emotional',
    },
    {
        id: 'gloomy',
        label: 'Gloomy',
        category: 'emotional',
    },
    {
        id: 'hot_headed',
        label: 'Hot-Headed',
        category: 'emotional',
    },
    {
        id: 'self_assured',
        label: 'Self-Assured',
        category: 'emotional',
    },
    {
        id: 'outgoing',
        label: 'Outgoing',
        category: 'social',
    },
    {
        id: 'high_maintenance',
        label: 'High Maintenance',
        category: 'emotional',
        expansionPack: 'Spa Day'
    },
    {
        id: 'love_bug',
        label: 'Love Bug',
        category: 'emotional',
        expansionPack: 'Lovestruck'
    },
    {
        id: 'romantic',
        label: 'Romantic',
        category: 'emotional',
    },
    {
        id: 'paranoid',
        label: 'Paranoid',
        category: 'emotional',
        expansionPack: 'Strangerville'
    },
    {
        id: 'romantically_reserved',
        label: 'Romantically Reserved',
        category: 'emotional',
        expansionPack: 'Lovestruck'
    },
    {
        id: 'squeamish',
        label: 'Squeamish',
        category: 'emotional',
        expansionPack: 'Outdoor Retreat'
    },
    {
        id: 'unflirty',
        label: 'Unflirty',
        category: 'emotional',
        expansionPack: 'City Living'
    },
    {
        id: 'wise',
        label: 'Wise',
        category: 'emotional',
        expansionPack: 'For Rent',
        ageStage: 'elder'
    },
    {
        id: 'art_lover',
        label: 'Art Lover',
        category: 'hobby',
    },
    {
        id: 'bookworm',
        label: 'Bookworm',
        category: 'hobby',
    },
    {
        id: 'dance_machine',
        label: 'Dance Machine',
        category: 'hobby',
        expansionPack: 'Get Together',
    },
    {
        id: 'foodie',
        label: 'Foodie',
        category: 'hobby',
    },
    {
        id: 'geek',
        label: 'Geek',
        category: 'hobby',
    },
    {
        id: 'loves_outdoors',
        label: 'Loves Outdoors',
        category: 'hobby',
    },
    {
        id: 'maker',
        label: 'Maker',
        category: 'hobby',
        expansionPack: 'Eco Lifestyle',
    },
    {
        id: 'music_lover',
        label: 'Music Lover',
        category: 'hobby',
    },
    {
        id: 'recycle_disciple',
        label: 'Recycle Disciple',
        category: 'hobby',
        expansionPack: 'Eco Lifestyle',
    },
    {
        id: 'active',
        label: 'Active',
        category: 'lifestyle',
    },
    {
        id: 'adventurous',
        label: 'Adventurous',
        category: 'lifestyle',
        expansionPack: 'Snowy Escape',
    },
    {
        id: 'chased_by_death',
        label: 'Chased by Death',
        category: 'lifestyle',
        expansionPack: 'Life and Death',
    },
    {
        id: 'child_of_the_islands',
        label: 'Child of the Islands',
        category: 'lifestyle',  
        expansionPack: 'Island Living',
    },
    {
        id: 'child_of_the_ocean',
        label: 'Child of the Ocean',
        category: 'lifestyle',
        expansionPack: 'Island Living',
    },
    {
        id: 'child_of_the_village',
        label: 'Child of the Village',
        category: 'lifestyle',
        expansionPack: 'For Rent',
    },
    {
        id: 'disruptive',
        label: 'Disruptive',
        category: 'lifestyle',
        expansionPack: 'Enchanted by Nature',
    },
    {
        id: 'freegan',
        label: 'Freegan',
        category: 'lifestyle',
        expansionPack: 'Eco Lifestyle',
    },
    {
        id: 'glutton',
        label: 'Glutton',
        category: 'lifestyle',
    },
    {
        id: 'green_fiend',
        label: 'Green Fiend',
        category: 'lifestyle',      
        expansionPack: 'Eco Lifestyle',
    },
    {
        id: 'kleptomaniac',
        label: 'Kleptomaniac',
        category: 'lifestyle',
    },
    {
        id: 'lactose_intolerant',
        label: 'Lactose Intolerant',
        category: 'lifestyle',
        expansionPack: 'Cottage Living',
    },
    {
        id: 'lazy',
        label: 'Lazy',
        category: 'lifestyle',
    },
    {
        id: 'macabre',
        label: 'Macabre',
        category: 'lifestyle',
        expansionPack: 'Life and Death',
    },
    {
        id: 'materialistic',
        label: 'Materialistic',
        category: 'lifestyle',
    },
    {
        id: 'mystical',
        label: 'Mystical',
        category: 'lifestyle',
        expansionPack: 'Enchanted by Nature',
    },
    {
        id: 'neat',
        label: 'Neat',
        category: 'lifestyle',
    },
    {
        id: 'overachiever',
        label: 'Overachiever',
        category: 'lifestyle',
        expansionPack: 'High School Years',
    },
    {
        id: 'perfectionist',
        label: 'Perfectionist',
        category: 'lifestyle',
    },
    {
        id: 'rancher',
        label: 'Rancher',
        category: 'lifestyle',
        expansionPack: 'Horse Ranch',
    },
    {
        id: 'skeptical',
        label: 'Skeptical',
        category: 'lifestyle',
        expansionPack: 'Life and Death',
    },
    {
        id: 'slob',
        label: 'Slob',
        category: 'lifestyle',
    },
    {
        id: 'vegetarian',
        label: 'Vegetarian',
        category: 'lifestyle',
    },
    {
        id: 'animal_enthusiast',
        label: 'Animal Enthusiast',
        category: 'social',
        expansionPack: 'Cottage Living',
    },
    {
        id: 'bro',
        label: 'Bro',
        category: 'social',
    },
    {
        id: 'cat_lover',
        label: 'Cat Lover',
        category: 'social',
        expansionPack: 'Cats and Dogs',
    },
    {
        id: 'cringe',
        label: 'Cringe',
        category: 'social',
        expansionPack: 'For Rent',
    },
    {
        id: 'dog_lover',
        label: 'Dog Lover',
        category: 'social',
        expansionPack: 'Cats and Dogs',
    },
    {
        id: 'evil',
        label: 'Evil',
        category: 'social',
    },
    {
        id: 'family_oriented',
        label: 'Family Oriented',
        category: 'social',
    },
    {
        id: 'generous',
        label: 'Generous',
        category: 'social',
        expansionPack: 'For Rent',
    },
    {
        id: 'good',
        label: 'Good',
        category: 'social',
    },
    {
        id: 'hates_children',
        label: 'Hates Children',
        category: 'social',
    },
    {
        id: 'horse_lover',
        label: 'Horse Lover',
        category: 'social',
        expansionPack: 'Horse Ranch',
    },
    {
        id: 'idealist',
        label: 'Idealist',
        category: 'social',
        expansionPack: 'Businesses and Hobbies',
    },
    {
        id: 'insider',
        label: 'Insider',
        category: 'social',
        expansionPack: 'Get Together',
    },
    {
        id: 'jealous',
        label: 'Jealous',
        category: 'social',
    },
    {
        id: 'loner',
        label: 'Loner',
        category: 'social',
    },
    {
        id: 'loyal',
        label: 'Loyal',
        category: 'social',         
    },
    {
        id: 'mean',
        label: 'Mean',
        category: 'social',
    },
    {
        id: 'noncommittal',
        label: 'Noncommittal',
        category: 'social',
    },
    {
        id: 'nosy',
        label: 'Nosy',
        category: 'social',
        expansionPack: 'For Rent',
    },
    {
        id: 'party_animal',
        label: 'Party Animal',
        category: 'social',
        expansionPack: 'High School Years',
    },
    {
        id: 'plant_lover',
        label: 'Plant Lover',
        category: 'social',
        expansionPack: 'Enchanted by Nature',
    },
    {
        id: 'proper',
        label: 'Proper',
        category: 'social',
        expansionPack: 'Snowy Escape',
    },
    {
        id: 'self_absorbed',
        label: 'Self-Absorbed',
        category: 'social',
        expansionPack: 'Get Famous',
    },
    {
        id: 'shady',
        label: 'Shady',
        category: 'social',
        expansionPack: 'Businesses and Hobbies',
    },
    {
        id: 'snob',
        label: 'Snob',
        category: 'social',
    },
    {
        id: 'socially_awkward',
        label: 'Socially Awkward',
        category: 'social',
        expansionPack: 'High School Years',
    },
    {
        id: 'angelic',
        label: 'Angelic',
        ageStage: 'toddler',
    },
    {
        id: 'charmer',
        label: 'Charmer',
        ageStage: 'toddler',
    },
    {
        id: 'clingy',
        label: 'Clingy',
        ageStage: 'toddler',
    },
    {
        id: 'fussy',
        label: 'Fussy',
        ageStage: 'toddler',
    },
    {
        id: 'independent',
        label: 'Independent',
        ageStage: 'toddler',
    },
    {
        id: 'inquisitive',
        label: 'Inquisitive',
        ageStage: 'toddler',
    },
    {
        id: 'silly',
        label: 'Silly',
        ageStage: 'toddler',
    },
    {
        id: 'wild',
        label: 'Wild',
        ageStage: 'toddler',
    },
    {
        id: 'cautious',
        label: 'Cautious',
        ageStage: 'infant',
    },
    {
        id: 'sensitive',
        label: 'Sensitive',
        ageStage: 'infant',
    },
    {
        id: 'calm',
        label: 'Calm',
        ageStage: 'infant',
    },
    {
        id: 'intense',
        label: 'Intense',
        ageStage: 'infant',
    },
    {
        id: 'wiggly',
        label: 'Wiggly',
        ageStage: 'infant',
    },
    {
        id: 'sunny',
        label: 'Sunny',
        ageStage: 'infant',
    },
]