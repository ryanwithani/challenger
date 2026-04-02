import type { ChecklistItem } from './types'

export const DEATHS: readonly ChecklistItem[] = [
  // Animals
  { key: 'deaths:Beetles', name: 'Beetles', category: 'Animals', pack: 'EL' },
  { key: 'deaths:Flies', name: 'Flies', category: 'Animals', pack: 'EL' },
  { key: 'deaths:Killer Chicken', name: 'Killer Chicken', category: 'Animals', pack: 'CLV' },
  { key: 'deaths:Killer Rabbit', name: 'Killer Rabbit', category: 'Animals', pack: 'CLV' },
  { key: 'deaths:Murder of Crows', name: 'Murder of Crows', category: 'Animals', pack: 'L&D' },
  { key: 'deaths:Rabid Rodent Fever', name: 'Rabid Rodent Fever', category: 'Animals', pack: 'MFP' },
  // Elders
  { key: 'deaths:Death in Sleep', name: 'Death in Sleep', category: 'Elders', pack: 'L&D' },
  { key: 'deaths:Old Age', name: 'Old Age', category: 'Elders', pack: 'TS4' },
  { key: 'deaths:Overexertion (Elders)', name: 'Overexertion (Elders)', category: 'Elders', pack: 'TS4' },
  // Emotion
  { key: 'deaths:Cardiac Explosion (Rage)', name: 'Cardiac Explosion (Rage)', category: 'Emotion', pack: 'TS4' },
  { key: 'deaths:Choking', name: 'Choking', category: 'Emotion', pack: 'L' },
  { key: 'deaths:Heartbreak', name: 'Heartbreak', category: 'Emotion', pack: 'L' },
  { key: 'deaths:Hysteria', name: 'Hysteria', category: 'Emotion', pack: 'TS4' },
  { key: 'deaths:Mortified', name: 'Mortified', category: 'Emotion', pack: 'TS4' },
  // Failure
  { key: 'deaths:Catastrophic Meltdown', name: 'Catastrophic Meltdown', category: 'Failure', pack: 'DU' },
  { key: 'deaths:Emotional Starvation', name: 'Emotional Starvation', category: 'Failure', pack: 'EBN' },
  { key: 'deaths:Falling', name: 'Falling', category: 'Failure', pack: 'SE' },
  { key: 'deaths:Low-Quality Puffer Fish', name: 'Low-Quality Puffer Fish', category: 'Failure', pack: 'CL' },
  { key: 'deaths:Starvation', name: 'Starvation', category: 'Failure', pack: 'TS4' },
  { key: 'deaths:Urban Myth', name: 'Urban Myth', category: 'Failure', pack: 'HSY' },
  // Ghost
  { key: 'deaths:Baleful Bog', name: 'Baleful Bog', category: 'Ghost', pack: 'L&D' },
  { key: 'deaths:Potion of Immortality', name: 'Potion of Immortality', category: 'Ghost', pack: 'RoM' },
  // Item Based
  { key: 'deaths:Money Vault', name: 'Money Vault', category: 'Item Based', pack: 'GF' },
  { key: 'deaths:Murphy Bed', name: 'Murphy Bed', category: 'Item Based', pack: 'TL' },
  { key: 'deaths:Steam', name: 'Steam', category: 'Item Based', pack: 'SD' },
  { key: 'deaths:Vending Machine', name: 'Vending Machine', category: 'Item Based', pack: 'SE' },
  // Knowledge
  { key: 'deaths:Spellcaster Overload', name: 'Spellcaster Overload', category: 'Knowledge', pack: 'RoM' },
  { key: 'deaths:Overexertion (Research)', name: 'Overexertion (Research)', category: 'Knowledge', pack: 'DU' },
  // Life Happens
  { key: 'deaths:Drowning', name: 'Drowning', category: 'Life Happens', pack: 'TS4' },
  { key: 'deaths:Electrocution', name: 'Electrocution', category: 'Life Happens', pack: 'TS4' },
  { key: 'deaths:Fire', name: 'Fire', category: 'Life Happens', pack: 'TS4' },
  // Plants
  { key: 'deaths:Cowplant', name: 'Cowplant', category: 'Plants', pack: 'TS4' },
  { key: 'deaths:Flower Arrangement', name: 'Flower Arrangement', category: 'Plants', pack: 'S' },
  { key: 'deaths:Mother Plant', name: 'Mother Plant', category: 'Plants', pack: 'SV' },
  // Poison
  { key: 'deaths:Mold', name: 'Mold', category: 'Poison', pack: 'FR' },
  { key: 'deaths:Poison', name: 'Poison', category: 'Poison', pack: 'JA' },
  { key: 'deaths:Stink Capsule', name: 'Stink Capsule', category: 'Poison', pack: 'HSY' },
  // Weather
  { key: 'deaths:Freezing', name: 'Freezing', category: 'Weather', pack: 'S' },
  { key: 'deaths:Lightning', name: 'Lightning', category: 'Weather', pack: 'S' },
  { key: 'deaths:Meteorite', name: 'Meteorite', category: 'Weather', pack: 'TS4' },
  { key: 'deaths:Overheating', name: 'Overheating', category: 'Weather', pack: 'S' },
  { key: 'deaths:Sunlight', name: 'Sunlight', category: 'Weather', pack: 'V' },
] as const
