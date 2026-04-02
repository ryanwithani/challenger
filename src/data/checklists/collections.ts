import type { ChecklistItem } from './types'

export const COLLECTIONS: readonly ChecklistItem[] = [
  // Living Things
  { key: 'collections:Aliens', name: 'Aliens', category: 'Living Things', pack: 'TS4' },
  { key: 'collections:Axolotls', name: 'Axolotls', category: 'Living Things', pack: 'L' },
  { key: 'collections:Feathers', name: 'Feathers', category: 'Living Things', pack: 'C&D' },
  { key: 'collections:Fish', name: 'Fish', category: 'Living Things', pack: 'TS4' },
  { key: 'collections:Frogs', name: 'Frogs', category: 'Living Things', pack: 'TS4' },
  { key: 'collections:Gibbi Point Butterflies & Moths', name: 'Gibbi Point Butterflies & Moths', category: 'Living Things', pack: 'AA' },
  { key: 'collections:Insects', name: 'Insects', category: 'Living Things', pack: 'OR' },
  // Rocks
  { key: 'collections:Crystals', name: 'Crystals', category: 'Rocks', pack: 'TS4' },
  { key: 'collections:Fossils', name: 'Fossils', category: 'Rocks', pack: 'TS4' },
  { key: 'collections:Geodes', name: 'Geodes', category: 'Rocks', pack: 'GTW' },
  { key: 'collections:Metals', name: 'Metals', category: 'Rocks', pack: 'TS4' },
  { key: 'collections:Space Rocks', name: 'Space Rocks', category: 'Rocks', pack: 'TS4' },
  // Science
  { key: 'collections:Elements', name: 'Elements', category: 'Science', pack: 'TS4' },
  { key: 'collections:Microscope Prints', name: 'Microscope Prints', category: 'Science', pack: 'TS4' },
  { key: 'collections:Space Prints', name: 'Space Prints', category: 'Science', pack: 'TS4' },
  // Challenges
  { key: 'collections:Cozy Wreaths', name: 'Cozy Wreaths', category: 'Challenges', pack: 'CCE' },
  { key: 'collections:Decorative Eggs', name: 'Decorative Eggs', category: 'Challenges', pack: 'TS4' },
  { key: 'collections:Freezer Boneys', name: 'Freezer Boneys', category: 'Challenges', pack: 'RRE' },
  { key: 'collections:Magic Beans', name: 'Magic Beans', category: 'Challenges', pack: 'TS4' },
  { key: 'collections:Missing Sim Milk Cartons', name: 'Missing Sim Milk Cartons', category: 'Challenges', pack: 'BFP' },
  { key: 'collections:Sugar Skulls', name: 'Sugar Skulls', category: 'Challenges', pack: 'TS4' },
  { key: 'collections:Touch Grass Weekly', name: 'Touch Grass Weekly', category: 'Challenges', pack: 'NCE' },
  // Location
  { key: 'collections:Ancient Omiscan Artifacts', name: 'Ancient Omiscan Artifacts', category: 'Location', pack: 'JA' },
  { key: 'collections:Batuu Records', name: 'Batuu Records', category: 'Location', pack: 'JTB' },
  { key: 'collections:Buried Treasure', name: 'Buried Treasure', category: 'Location', pack: 'IL' },
  { key: 'collections:City Posters', name: 'City Posters', category: 'Location', pack: 'CL' },
  { key: 'collections:Messages In Bottles', name: 'Messages In Bottles', category: 'Location', pack: 'MWS' },
  { key: 'collections:Moonwood Relics', name: 'Moonwood Relics', category: 'Location', pack: 'W' },
  { key: 'collections:Nordhaven Bike Parts', name: 'Nordhaven Bike Parts', category: 'Location', pack: 'B&H' },
  { key: 'collections:Omiscan Treasures', name: 'Omiscan Treasures', category: 'Location', pack: 'JA' },
  { key: 'collections:Seashells', name: 'Seashells', category: 'Location', pack: 'IL' },
  { key: 'collections:Snow Globes', name: 'Snow Globes', category: 'Location', pack: 'CL' },
  { key: 'collections:Tassels', name: 'Tassels', category: 'Location', pack: 'FR' },
  // Plants
  { key: 'collections:Gardening', name: 'Gardening', category: 'Plants', pack: 'TS4' },
  { key: 'collections:Innisgreen Ingredients', name: 'Innisgreen Ingredients', category: 'Plants', pack: 'EBN' },
  // Toys
  { key: 'collections:Colored Marbles', name: 'Colored Marbles', category: 'Toys', pack: 'FR' },
  { key: 'collections:Holiday Cracker Plushies', name: 'Holiday Cracker Plushies', category: 'Toys', pack: 'TS4' },
  { key: 'collections:MySims Trophies', name: 'MySims Trophies', category: 'Toys', pack: 'TS4' },
  { key: 'collections:Simmies', name: 'Simmies', category: 'Toys', pack: 'SE' },
  { key: 'collections:Tarot Cards', name: 'Tarot Cards', category: 'Toys', pack: 'L&D' },
  { key: 'collections:Voidcritter Cards', name: 'Voidcritter Cards', category: 'Toys', pack: 'KR' },
  // Other
  { key: 'collections:Experimental Food Prints', name: 'Experimental Food Prints', category: 'Other', pack: 'DO' },
  { key: 'collections:Lightsaber Parts', name: 'Lightsaber Parts', category: 'Other', pack: 'JTB' },
  { key: 'collections:Magical Artifacts', name: 'Magical Artifacts', category: 'Other', pack: 'RoM' },
  { key: 'collections:Postcards', name: 'Postcards', category: 'Other', pack: 'TS4' },
  { key: 'collections:Trashley Certified Art', name: 'Trashley Certified Art', category: 'Other', pack: 'B&H' },
  { key: 'collections:Village Fair Ribbons', name: 'Village Fair Ribbons', category: 'Other', pack: 'CLV' },
] as const
