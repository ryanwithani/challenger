import type { ChecklistItem } from './types'

export const PARTIES: readonly ChecklistItem[] = [
  // Parties
  { key: 'parties:Black and White Bash', name: 'Black and White Bash', category: 'Parties', pack: 'TS4' },
  { key: 'parties:Dance Party', name: 'Dance Party', category: 'Parties', pack: 'GT' },
  { key: 'parties:Dinner Party', name: 'Dinner Party', category: 'Parties', pack: 'TS4' },
  { key: 'parties:House Party', name: 'House Party', category: 'Parties', pack: 'TS4' },
  { key: 'parties:Icognito Costume Party', name: 'Icognito Costume Party', category: 'Parties', pack: 'TS4' },
  { key: 'parties:Spooky Party', name: 'Spooky Party', category: 'Parties', pack: 'SS' },
  // Celebrities
  { key: 'parties:Charity Benefit Party', name: 'Charity Benefit Party', category: 'Celebrities', pack: 'GF' },
  { key: 'parties:Fan Meet and Greet', name: 'Fan Meet and Greet', category: 'Celebrities', pack: 'GF' },
  { key: 'parties:Lampoon Party', name: 'Lampoon Party', category: 'Celebrities', pack: 'GF' },
  // Outdoors
  { key: 'parties:Getaway', name: 'Getaway', category: 'Outdoors', pack: 'AA' },
  { key: 'parties:Kava Party', name: 'Kava Party', category: 'Outdoors', pack: 'IL' },
  { key: 'parties:Mountain Climb Excursion', name: 'Mountain Climb Excursion', category: 'Outdoors', pack: 'SE' },
  { key: 'parties:Pool Party', name: 'Pool Party', category: 'Outdoors', pack: 'FR' },
  { key: 'parties:Ranch Animal Day', name: 'Ranch Animal Day', category: 'Outdoors', pack: 'HR' },
  { key: 'parties:Ranch Gathering', name: 'Ranch Gathering', category: 'Outdoors', pack: 'HR' },
  { key: 'parties:Weenie Roast', name: 'Weenie Roast', category: 'Outdoors', pack: 'OR' },
  // Family Get Togethers
  { key: 'parties:Baby Shower', name: 'Baby Shower', category: 'Family Get Togethers', pack: 'GTO' },
  { key: 'parties:Birthday Party', name: 'Birthday Party', category: 'Family Get Togethers', pack: 'TS4' },
  { key: 'parties:Family Reunion', name: 'Family Reunion', category: 'Family Get Togethers', pack: 'GTO' },
  { key: 'parties:Funeral', name: 'Funeral', category: 'Family Get Togethers', pack: 'L&D' },
  { key: 'parties:Neighborhood Potluck', name: 'Neighborhood Potluck', category: 'Family Get Togethers', pack: 'FR' },
  // Wedding Activities
  { key: 'parties:Bach Party', name: 'Bach Party', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Engagement Dinner', name: 'Engagement Dinner', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Family Gathering', name: 'Family Gathering', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Reception', name: 'Reception', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Rehearsal Dinner', name: 'Rehearsal Dinner', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Vow Renewal', name: 'Vow Renewal', category: 'Wedding Activities', pack: 'MWS' },
  { key: 'parties:Wedding Ceremony', name: 'Wedding Ceremony', category: 'Wedding Activities', pack: 'TS4' },
  // Date/Hangout
  { key: 'parties:Date', name: 'Date', category: 'Date/Hangout', pack: 'TS4' },
  { key: 'parties:Get to Know You Date', name: 'Get to Know You Date', category: 'Date/Hangout', pack: 'L' },
  { key: 'parties:Romantic Date', name: 'Romantic Date', category: 'Date/Hangout', pack: 'L' },
  { key: 'parties:Romantic Repair Date', name: 'Romantic Repair Date', category: 'Date/Hangout', pack: 'L' },
  { key: 'parties:Friendly Hangout', name: 'Friendly Hangout', category: 'Date/Hangout', pack: 'L' },
  // School Events
  { key: 'parties:High School Graduation', name: 'High School Graduation', category: 'School Events', pack: 'HSY' },
  { key: 'parties:Keg Party', name: 'Keg Party', category: 'School Events', pack: 'DU' },
  { key: 'parties:Prom', name: 'Prom', category: 'School Events', pack: 'HSY' },
  // Children
  { key: 'parties:Slumber Party (Pj Party)', name: 'Slumber Party (Pj Party)', category: 'Children', pack: 'GTO' },
  { key: 'parties:Toddler Play Date', name: 'Toddler Play Date', category: 'Children', pack: 'TS' },
] as const
