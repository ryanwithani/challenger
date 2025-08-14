import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'

const expansionPackSchema = z.object({
    base_game: z.boolean().default(true),
    get_to_work: z.boolean().default(false),
    get_together: z.boolean().default(false),
    city_living: z.boolean().default(false),
    cats_dogs: z.boolean().default(false),
    seasons: z.boolean().default(false),
    get_famous: z.boolean().default(false),
    island_living: z.boolean().default(false),
    discover_university: z.boolean().default(false),
    eco_lifestyle: z.boolean().default(false),
    snowy_escape: z.boolean().default(false),
    cottage_living: z.boolean().default(false),
    high_school_years: z.boolean().default(false),
    growing_together: z.boolean().default(false),
    horse_ranch: z.boolean().default(false),
    for_rent: z.boolean().default(false),
    lovestruck: z.boolean().default(false),
    life_death: z.boolean().default(false),
  })
  
  type ExpansionPackData = z.infer<typeof expansionPackSchema>

  export const ExpansionPacks = [
    {
      key: 'get_to_work',
      name: 'Get to Work',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Detective', 'Doctor', 'Scientist'],
        skills: ['Photography', 'Baking'],
        collections: ['Aliens', 'Crystals', 'Metals'],
        points: '+6 career points, +2 skill points, +3 collection points'
      }
    },
    {
      key: 'get_together',
      name: 'Get Together',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['Dancing', 'DJ Mixing'],
        collections: ['No new collections'],
        points: '+2 skill points, enables club system'
      }
    },
    {
      key: 'city_living',
      name: 'City Living',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Politician (2 branches)', 'Critic (2 branches)', 'Social Media (2 branches)'],
        skills: ['Singing'],
        collections: ['City Posters', 'Snow Globes'],
        points: '+6 career points, +1 skill point, +2 collection points'
      }
    },
    {
      key: 'cats_dogs',
      name: 'Cats & Dogs',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Veterinarian (2 branches)'],
        skills: ['Veterinarian'],
        collections: ['Feathers', 'My Sims Trophies'],
        points: '+2 career points, +1 skill point, +2 collection points'
      }
    },
    {
      key: 'seasons',
      name: 'Seasons',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['Flower Arranging'],
        collections: ['Decorative Eggs'],
        points: '+1 skill point, +1 collection point, holiday traditions'
      }
    },
    {
      key: 'get_famous',
      name: 'Get Famous',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Actor (2 branches)'],
        skills: ['Acting', 'Media Production'],
        collections: ['No new collections'],
        points: '+2 career points, +2 skill points, fame system'
      }
    },
    {
      key: 'island_living',
      name: 'Island Living',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Conservationist (2 branches)'],
        skills: ['No new skills'],
        collections: ['Seashells', 'Buried Treasure'],
        points: '+2 career points, +2 collection points, mermaids'
      }
    },
    {
      key: 'discover_university',
      name: 'Discover University',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Education (2 branches)', 'Engineer (2 branches)', 'Law (2 branches)'],
        skills: ['Research & Debate', 'Robotics'],
        collections: ['Ping Pong Balls'],
        points: '+6 career points, +2 skill points, +1 collection point'
      }
    },
    {
      key: 'eco_lifestyle',
      name: 'Eco Lifestyle',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Civil Designer (2 branches)'],
        skills: ['Fabrication', 'Juice Fizzing'],
        collections: ['Candles', 'Insect Farms'],
        points: '+2 career points, +2 skill points, +2 collection points'
      }
    },
    {
      key: 'snowy_escape',
      name: 'Snowy Escape',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Salaryman (2 branches)'],
        skills: ['Rock Climbing', 'Skiing', 'Snowboarding'],
        collections: ['Omiscan Treasures'],
        points: '+2 career points, +3 skill points, +1 collection point'
      }
    },
    {
      key: 'cottage_living',
      name: 'Cottage Living',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['Cross-Stitch'],
        collections: ['Wild Birds', 'Grocery Bags'],
        points: '+1 skill point, +2 collection points, animal care'
      }
    },
    {
      key: 'high_school_years',
      name: 'High School Years',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new adult careers (teen careers available)'],
        skills: ['No new skills'],
        collections: ['Crystals & Metals (enhanced)', 'Yearbook Quotes'],
        points: 'Enhanced teen gameplay, +1 collection point'
      }
    },
    {
      key: 'growing_together',
      name: 'Growing Together',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['No new skills'],
        collections: ['No new collections'],
        points: 'Enhanced family dynamics, compatibility system'
      }
    },
    {
      key: 'horse_ranch',
      name: 'Horse Ranch',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['Horse Riding', 'Nectar Making'],
        collections: ['Prairie Grass'],
        points: '+2 skill points, +1 collection point, horse care'
      }
    },
    {
      key: 'for_rent',
      name: 'For Rent',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['No new skills'],
        collections: ['No new collections'],
        points: 'Rental property management, apartment living'
      }
    },
    {
      key: 'lovestruck',
      name: 'Lovestruck',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['No new careers'],
        skills: ['No new skills'],
        collections: ['No new collections'],
        points: 'Enhanced romance system, dating features'
      }
    },
    {
      key: 'life_death',
      name: 'Life & Death',
      category: 'Expansion Pack',
      legacyImpact: {
        careers: ['Undertaker (2 branches)'],
        skills: ['Thanatology'],
        collections: ['Epitaphs'],
        points: '+2 career points, +1 skill point, +1 collection point'
      }
    }
  ]
  