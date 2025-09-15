// src/components/sim/traitsCatalog.ts
export type TraitCategory =
    | 'Emotional'
    | 'Social'
    | 'Lifestyle'
    | 'Mental'
    | 'Hobby'
    | 'Personality';

export type TraitDef = {
    id: string;           // slug key (store this in DB)
    label: string;        // UI label
    category: TraitCategory;
    icon?: string;        // optional URL (CDN/local). If omitted, we’ll fall back to an emoji.
    emoji?: string;       // fallback mark
};

export const TRAITS: TraitDef[] = [
    // Emotional
    { id: 'cheerful', label: 'Cheerful', category: 'Emotional', emoji: '😊' },
    { id: 'gloomy', label: 'Gloomy', category: 'Emotional', emoji: '🌧️' },
    { id: 'hot_headed', label: 'Hot-Headed', category: 'Emotional', emoji: '💥' },
    { id: 'romantic', label: 'Romantic', category: 'Emotional', emoji: '🌹' },
    { id: 'self_assured', label: 'Self-Assured', category: 'Emotional', emoji: '💪' },

    // Social
    { id: 'outgoing', label: 'Outgoing', category: 'Social', emoji: '🎉' },
    { id: 'loner', label: 'Loner', category: 'Social', emoji: '🫥' },
    { id: 'mean', label: 'Mean', category: 'Social', emoji: '😠' },
    { id: 'good', label: 'Good', category: 'Social', emoji: '👍' },
    { id: 'family_oriented', label: 'Family-Oriented', category: 'Social', emoji: '👪' },

    // Lifestyle
    { id: 'active', label: 'Active', category: 'Lifestyle', emoji: '⚽' },
    { id: 'lazy', label: 'Lazy', category: 'Lifestyle', emoji: '🛋️' },
    { id: 'neat', label: 'Neat', category: 'Lifestyle', emoji: '🧹' },
    { id: 'slob', label: 'Slob', category: 'Lifestyle', emoji: '🧼' },
    { id: 'perfectionist', label: 'Perfectionist', category: 'Lifestyle', emoji: '📐' },

    // Mental
    { id: 'genius', label: 'Genius', category: 'Mental', emoji: '🧠' },
    { id: 'creative', label: 'Creative', category: 'Mental', emoji: '💡' },
    { id: 'bookworm', label: 'Bookworm', category: 'Mental', emoji: '📚' },
    { id: 'art_lover', label: 'Art Lover', category: 'Mental', emoji: '🎨' },
    { id: 'music_lover', label: 'Music Lover', category: 'Mental', emoji: '🎵' },

    // Hobby
    { id: 'geek', label: 'Geek', category: 'Hobby', emoji: '🕹️' },
    { id: 'foodie', label: 'Foodie', category: 'Hobby', emoji: '🍽️' },
    { id: 'materialistic', label: 'Materialistic', category: 'Hobby', emoji: '💎' },
    { id: 'loves_outdoors', label: 'Loves Outdoors', category: 'Hobby', emoji: '🏞️' },
    { id: 'cat_lover', label: 'Cat Lover', category: 'Hobby', emoji: '🐱' },
    { id: 'dog_lover', label: 'Dog Lover', category: 'Hobby', emoji: '🐶' },

    // Personality
    { id: 'ambitious', label: 'Ambitious', category: 'Personality', emoji: '🏆' },
    { id: 'childish', label: 'Childish', category: 'Personality', emoji: '🧸' },
    { id: 'clumsy', label: 'Clumsy', category: 'Personality', emoji: '🍌' },
    { id: 'erratic', label: 'Erratic', category: 'Personality', emoji: '🎭' },
    { id: 'goofball', label: 'Goofball', category: 'Personality', emoji: '🤹' },
    { id: 'jealous', label: 'Jealous', category: 'Personality', emoji: '🟢' },
    { id: 'kleptomaniac', label: 'Kleptomaniac', category: 'Personality', emoji: '🧤' },
    { id: 'paranoid', label: 'Paranoid', category: 'Personality', emoji: '🕵️' },
    { id: 'snob', label: 'Snob', category: 'Personality', emoji: '🥃' },
];
