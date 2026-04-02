import type { ChecklistItem } from './types'

export const SKILLS: readonly ChecklistItem[] = [
  // Animal
  { key: 'skills:Entymology', name: 'Entymology', category: 'Animal', pack: 'AA' },
  { key: 'skills:Horse Riding', name: 'Horse Riding', category: 'Animal', pack: 'HR' },
  { key: 'skills:Pet Training', name: 'Pet Training', category: 'Animal', pack: 'C&D' },
  { key: 'skills:Veterinarian', name: 'Veterinarian', category: 'Animal', pack: 'C&D' },
  // Art
  { key: 'skills:Acting', name: 'Acting', category: 'Art', pack: 'GF' },
  { key: 'skills:Dancing', name: 'Dancing', category: 'Art', pack: 'GT' },
  { key: 'skills:Painting', name: 'Painting', category: 'Art', pack: 'TS4' },
  { key: 'skills:Photography', name: 'Photography', category: 'Art', pack: 'TS4' },
  { key: 'skills:Tattoing', name: 'Tattoing', category: 'Art', pack: 'B&H' },
  { key: 'skills:Writing', name: 'Writing', category: 'Art', pack: 'TS4' },
  // Child
  { key: 'skills:Creativity', name: 'Creativity', category: 'Child', pack: 'TS4' },
  { key: 'skills:Mental', name: 'Mental', category: 'Child', pack: 'TS4' },
  { key: 'skills:Motor', name: 'Motor', category: 'Child', pack: 'TS4' },
  { key: 'skills:Social', name: 'Social', category: 'Child', pack: 'TS4' },
  // Cooking
  { key: 'skills:Baking', name: 'Baking', category: 'Cooking', pack: 'GTW' },
  { key: 'skills:Cooking', name: 'Cooking', category: 'Cooking', pack: 'TS4' },
  { key: 'skills:Gourmet Cooking', name: 'Gourmet Cooking', category: 'Cooking', pack: 'TS4' },
  { key: 'skills:Juice Fizzing', name: 'Juice Fizzing', category: 'Cooking', pack: 'EL' },
  { key: 'skills:Mixology', name: 'Mixology', category: 'Cooking', pack: 'TS4' },
  { key: 'skills:Nectar Making', name: 'Nectar Making', category: 'Cooking', pack: 'HR' },
  // Crafting
  { key: 'skills:Cross-Stitch', name: 'Cross-Stitch', category: 'Crafting', pack: 'CLV' },
  { key: 'skills:Fabrication', name: 'Fabrication', category: 'Crafting', pack: 'EL' },
  { key: 'skills:Gemology', name: 'Gemology', category: 'Crafting', pack: 'CC' },
  { key: 'skills:Knitting', name: 'Knitting', category: 'Crafting', pack: 'NK' },
  { key: 'skills:Papercraft', name: 'Papercraft', category: 'Crafting', pack: 'AA' },
  { key: 'skills:Pottery', name: 'Pottery', category: 'Crafting', pack: 'B&H' },
  // Fitness
  { key: 'skills:Bowling', name: 'Bowling', category: 'Fitness', pack: 'BN' },
  { key: 'skills:Diving', name: 'Diving', category: 'Fitness', pack: 'AA' },
  { key: 'skills:Fitness', name: 'Fitness', category: 'Fitness', pack: 'TS4' },
  { key: 'skills:Rock Climbing', name: 'Rock Climbing', category: 'Fitness', pack: 'SE' },
  { key: 'skills:Skiing', name: 'Skiing', category: 'Fitness', pack: 'SE' },
  { key: 'skills:Snowboarding', name: 'Snowboarding', category: 'Fitness', pack: 'SE' },
  { key: 'skills:Wellness', name: 'Wellness', category: 'Fitness', pack: 'SD' },
  // History
  { key: 'skills:Archaeology', name: 'Archaeology', category: 'History', pack: 'JA' },
  { key: 'skills:Logic', name: 'Logic', category: 'History', pack: 'TS4' },
  { key: 'skills:Research and Debate', name: 'Research and Debate', category: 'History', pack: 'DU' },
  { key: 'skills:Selvadorian Culture', name: 'Selvadorian Culture', category: 'History', pack: 'JA' },
  // Horse
  { key: 'skills:Agility', name: 'Agility', category: 'Horse', pack: 'HR' },
  { key: 'skills:Endurance', name: 'Endurance', category: 'Horse', pack: 'HR' },
  { key: 'skills:Jumping', name: 'Jumping', category: 'Horse', pack: 'HR' },
  { key: 'skills:Temperament', name: 'Temperament', category: 'Horse', pack: 'HR' },
  // Music
  { key: 'skills:Dj Mixing', name: 'Dj Mixing', category: 'Music', pack: 'GT' },
  { key: 'skills:Guitar', name: 'Guitar', category: 'Music', pack: 'TS4' },
  { key: 'skills:Piano', name: 'Piano', category: 'Music', pack: 'TS4' },
  { key: 'skills:Pipe Organ', name: 'Pipe Organ', category: 'Music', pack: 'V' },
  { key: 'skills:Singing', name: 'Singing', category: 'Music', pack: 'CL' },
  { key: 'skills:Violin', name: 'Violin', category: 'Music', pack: 'TS4' },
  // Occult
  { key: 'skills:Medium', name: 'Medium', category: 'Occult', pack: 'PN' },
  { key: 'skills:Thanatology', name: 'Thanatology', category: 'Occult', pack: 'L&D' },
  { key: 'skills:Vampire Lore', name: 'Vampire Lore', category: 'Occult', pack: 'V' },
  // Outdoors
  { key: 'skills:Apothecary', name: 'Apothecary', category: 'Outdoors', pack: 'EBN' },
  { key: 'skills:Archery', name: 'Archery', category: 'Outdoors', pack: 'AA' },
  { key: 'skills:Fishing', name: 'Fishing', category: 'Outdoors', pack: 'L' },
  { key: 'skills:Flower Arranging', name: 'Flower Arranging', category: 'Outdoors', pack: 'S' },
  { key: 'skills:Gardening', name: 'Gardening', category: 'Outdoors', pack: 'TS4' },
  { key: 'skills:Herbalism', name: 'Herbalism', category: 'Outdoors', pack: 'OR' },
  { key: 'skills:Natural Living', name: 'Natural Living', category: 'Outdoors', pack: 'EBN' },
  // Social
  { key: 'skills:Charisma', name: 'Charisma', category: 'Social', pack: 'TS4' },
  { key: 'skills:Comedy', name: 'Comedy', category: 'Social', pack: 'TS4' },
  { key: 'skills:Mischief', name: 'Mischief', category: 'Social', pack: 'TS4' },
  { key: 'skills:Parenting', name: 'Parenting', category: 'Social', pack: 'PH' },
  { key: 'skills:Romance', name: 'Romance', category: 'Social', pack: 'L' },
  // Technology
  { key: 'skills:Entrepreneur', name: 'Entrepreneur', category: 'Technology', pack: 'HSY' },
  { key: 'skills:Media Production', name: 'Media Production', category: 'Technology', pack: 'GF' },
  { key: 'skills:Programming', name: 'Programming', category: 'Technology', pack: 'TS4' },
  { key: 'skills:Video Gaming', name: 'Video Gaming', category: 'Technology', pack: 'TS4' },
  // Tinkering
  { key: 'skills:Handiness', name: 'Handiness', category: 'Tinkering', pack: 'TS4' },
  { key: 'skills:Robotics', name: 'Robotics', category: 'Tinkering', pack: 'DU' },
  { key: 'skills:Rocket Science', name: 'Rocket Science', category: 'Tinkering', pack: 'TS4' },
  // Toddler
  { key: 'skills:Communication', name: 'Communication', category: 'Toddler', pack: 'TS4' },
  { key: 'skills:Imagination', name: 'Imagination', category: 'Toddler', pack: 'TS4' },
  { key: 'skills:Movement', name: 'Movement', category: 'Toddler', pack: 'TS4' },
  { key: 'skills:Potty', name: 'Potty', category: 'Toddler', pack: 'TS4' },
  { key: 'skills:Thinking', name: 'Thinking', category: 'Toddler', pack: 'TS4' },
] as const
