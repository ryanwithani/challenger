// src/components/sim/AspirationsCatalog.ts
// Catalog of The Sims aspirations (adult/teen/child/etc.), similar to TraitsCatalog/CareersCatalog.
// Icons convention: /public/images/aspirations/<Label>.png (Title Case, spaces preserved).
// Use `iconFile` to override any special filenames.

export type AspirationAgeGroup =
  | 'adult'
  | 'teen'
  | 'child'
  | 'limited'
  | 'tutorial'

export type AspirationCategory =
  | 'Animal'
  | 'Athletic'
  | 'Creativity'
  | 'Deviance'
  | 'Fairy'
  | 'Family'
  | 'Food'
  | 'Fortune'
  | 'Knowledge'
  | 'Location'
  | 'Love'
  | 'Nature'
  | 'Popularity'
  | 'Star Wars'
  | 'Wellness'
  | 'Werewolf'
  | 'Child'
  | 'Teen'
  | 'Limited-Time'
  | 'Tutorial'

export type Milestone = {
  id: string               // snake_case
  label: string            // display label, e.g., "Basic Trainer"
  requirements: string[]   // bullet list of tasks
}

export type Aspiration = {
  id: string                    // snake_case, canonical id
  label: string                 // display label
  category: AspirationCategory  // top-level grouping
  ageGroup: AspirationAgeGroup  // who can take it
  rewardTrait: string | null    // reward trait label (null if none)
  pack?: string | null          // e.g., "Base Game"; hide icon if "Base Game"
  satisfactionPoints?: number | null
  milestones: Milestone[]       // ordered list (3–4 for most, 1 for one-step)
  iconFile?: string | null      // optional override for PNG filename
  notes?: string | null         // any extra notes
}

// Helper for milestone creation
const M = (id: string, label: string, requirements: string[]): Milestone => ({ id, label, requirements })

export const Aspirations: Aspiration[] = [
  /* ===========================
   * Animal
   * =========================== */
  {
    id: 'friend_of_the_animals',
    label: 'Friend of the Animals',
    category: 'Animal',
    ageGroup: 'adult',
    rewardTrait: 'Animal Whisperer',
    pack: 'Cats & Dogs',
    satisfactionPoints: null,
    milestones: [
      M('acquaintance_of_the_animals', 'Acquaintance of the Animals', [
        'Have a cat or dog in your household',
        'Be friends with 1 cat or dog',
        'Be friendly with a cat or dog 12 times',
      ]),
      M('friend_of_the_animals_m2', 'Friend of the Animals', [
        'Be friends with 5 cats and/or dogs',
        'Be companions with 1 cat or dog',
        'Successfully train out 2 misbehaviors',
      ]),
      M('best_friend_of_the_animals', 'Best Friend of the Animals', [
        'Be companions with 2 cats and/or dogs',
        'Feel the love 5 times',
        'Successfully train out 4 misbehaviors',
      ]),
      M('bff_of_the_animals', 'BFF of the Animals', [
        'Play with 2 different ghost cats or dogs',
        'Feel the love with 8 different cats or dogs',
        'Be friends with 12 cats and/or dogs at the same time',
      ]),
    ],
  },

  /* ===========================
   * Athletic
   * =========================== */
  {
    id: 'bodybuilder',
    label: 'Bodybuilder',
    category: 'Athletic',
    ageGroup: 'adult',
    rewardTrait: 'Long Lived',
    pack: 'Base Game',
    satisfactionPoints: 5050,
    milestones: [
      M('basic_trainer', 'Basic Trainer', [
        'Work out for 8 total hours',
        'Work out at a gym venue',
      ]),
      M('exercise_demon', 'Exercise Demon', [
        'Achieve level 4 Fitness skill',
        'Push the limits for 1 hour while Energized',
        'Own 2 pieces of workout equipment',
      ]),
      M('fit_to_a_t', 'Fit to a T', [
        'Achieve level 6 Fitness skill',
        'Go jogging for 2 total hours',
        'Spend 10 hours exercising',
      ]),
      M('bodybuilder_final', 'Bodybuilder', [
        'Achieve level 10 Fitness skill',
        "Reach Sim's maximum body potential",
      ]),
    ],
  },
  {
    id: 'extreme_sports_enthusiast',
    label: 'Extreme Sports Enthusiast',
    category: 'Athletic',
    ageGroup: 'adult',
    rewardTrait: 'Survival Instinct',
    pack: 'Snowy Escape',
    satisfactionPoints: null,
    milestones: [
      M('snow_student', 'Snow Student', [
        'Go Down the Bunny Slope',
        'Purchase a Remedy/Deterrent (Vending Machine or Computer)',
        'Use a Mt. Komorebi Info Board',
      ]),
      M('thrill_seeker', 'Thrill Seeker', [
        'Achieve Level 3 Rock Climbing skill',
        'Complete a Hiking Trail',
        'Actively Ski, Snowboard, or Rock Climb for 3 Hours',
        'Encounter a Kodama or Forest Spirit',
      ]),
      M('trailblazer', 'Trailblazer', [
        'High Intensity Ski/Snowboard on Intermediate/Expert Slope',
        'Reach the Peak of Mt. Komorebi',
        'Endure an injury from Skiing/Snowboarding/Rock Climbing',
      ]),
      M('peak_pioneer', 'Peak Pioneer', [
        'Survive 3 wildlife attacks unscathed',
        'Reach Level 8 Skiing/Snowboarding/Rock Climbing',
        'Complete High Intensity on Expert Slope or climb in bad weather',
      ]),
    ],
  },
  {
    id: 'championship_rider',
    label: 'Championship Rider',
    category: 'Athletic',
    ageGroup: 'adult',
    rewardTrait: 'Grand Champ Trainer',
    pack: 'Horse Ranch',
    satisfactionPoints: null,
    milestones: [
      M('championship_rider', 'Championship Rider', [
        'Achieve level 10 Horse Riding skill',
        'Compete in 15 Horse Competitions',
        'Win Gold in 5 Master Horse Competitions',
        'Place at the Ultimate Horse Championship',
      ]),
    ],
  },

  /* ===========================
   * Creativity
   * =========================== */
  {
    id: 'painter_extraordinaire',
    label: 'Painter Extraordinaire',
    category: 'Creativity',
    ageGroup: 'adult',
    rewardTrait: 'Expressionistic',
    pack: 'Base Game',
    satisfactionPoints: 5000,
    milestones: [
      M('ill_at_easel', 'Ill at Easel', [
        'Start 3 paintings while Inspired',
        'Paint for 5 hours',
      ]),
      M('fine_artist', 'Fine Artist', [
        'Achieve level 4 Painting skill',
        'Sell 3 paintings to collectors or gallery',
        'Complete 3 Emotional paintings',
      ]),
      M('brushing_with_greatness', 'Brushing with Greatness', [
        'Achieve level 6 Painting skill',
        'View/admire 3 paintings at a museum',
        'Complete 10 Excellent paintings',
      ]),
      M('painter_extraordinaire_final', 'Painter Extraordinaire', [
        'Achieve level 10 Painting skill',
        'Complete 5 Masterpieces',
      ]),
    ],
  },
  {
    id: 'musical_genius',
    label: 'Musical Genius',
    category: 'Creativity',
    ageGroup: 'adult',
    rewardTrait: 'Piper',
    pack: 'Base Game',
    satisfactionPoints: 4925,
    milestones: [
      M('tone_deaf', 'Tone Deaf', [
        'Practice music for 6 hours',
        'Listen to music for 2 hours',
      ]),
      M('fine_tuned', 'Fine Tuned', [
        'Achieve level 4 skill in an instrument',
        'Play an instrument for 1 hour while Inspired',
      ]),
      M('harmonious', 'Harmonious', [
        'Achieve level 6 in any instrument',
        'Write 4 songs',
        'Earn §500 from licensed songs',
      ]),
      M('musical_genius_final', 'Musical Genius', [
        'Reach level 10 in an instrument',
        'Spend 75 hours playing instruments',
        'Mentor others in music for 3 hours',
      ]),
    ],
  },
  {
    id: 'bestselling_author',
    label: 'Bestselling Author',
    category: 'Creativity',
    ageGroup: 'adult',
    rewardTrait: 'Poetic',
    pack: 'Base Game',
    satisfactionPoints: 4925,
    milestones: [
      M('fledge_linguist', 'Fledge-linguist', [
        'Write 2 books',
        'Write for 1 hour while Inspired',
      ]),
      M('competent_wordsmith', 'Competent Wordsmith', [
        'Achieve level 4 Writing skill',
        'Write for a total of 15 hours',
        'Write 5 Good books',
      ]),
      M('novelest_novelist', 'Novelest Novelist', [
        'Achieve level 6 Writing skill',
        'Publish 10 books',
        'Write 5 Excellent books',
      ]),
      M('bestselling_author_final', 'Bestselling Author', [
        'Achieve level 10 Writing skill',
        'Complete 3 Bestsellers',
        'Earn §25,000 in royalties',
      ]),
    ],
  },
  {
    id: 'master_actor',
    label: 'Master Actor/Master Actress',
    category: 'Creativity',
    ageGroup: 'adult',
    rewardTrait: 'World-Renowned Actor/Actress',
    pack: 'Get Famous',
    satisfactionPoints: 4025,
    milestones: [
      M('aspiring_actor', 'Aspiring Actor/Actress', [
        'Achieve level 3 Acting skill',
        'Practice acting for 2 hours',
      ]),
      M('intermediate_actor', 'Intermediate Actor/Actress', [
        'Become an Adult',
        'Join the Acting career',
        'Earn Gold in a commercial acting gig',
        'Give a street performance',
      ]),
      M('advanced_actor', 'Advanced Actor/Actress', [
        'Achieve level 7 Acting skill',
        'Receive an award',
        'Earn Gold in a TV show acting gig',
      ]),
      M('master_actor_final', 'Master Actor/Actress', [
        'Achieve level 10 Acting skill',
        'Place a celebrity tile in Starlight Boulevard',
        'Earn Gold in a movie acting gig',
      ]),
    ],
  },

  /* ===========================
   * Deviance
   * =========================== */
  {
    id: 'public_enemy',
    label: 'Public Enemy',
    category: 'Deviance',
    ageGroup: 'adult',
    rewardTrait: 'Mastermind',
    pack: 'Base Game',
    satisfactionPoints: 4125,
    milestones: [
      M('mostly_harmless', 'Mostly Harmless', [
        'Perform 10 Mean/Mischievous interactions',
        'Be disliked by 2 Sims',
      ]),
      M('neighborhood_nuisance', 'Neighborhood Nuisance', [
        'Be disliked by 4 Sims',
        'Become an Adult',
        'Join the Criminal career',
      ]),
      M('criminal_mind', 'Criminal Mind', [
        'Have a declared enemy',
        'Reach level 4 Criminal career',
        'Fight 5 times',
      ]),
      M('public_enemy_final', 'Public Enemy', [
        'Witness the death of a Sim',
        'Reach level 8 Criminal career',
        'Have 3 declared enemies',
      ]),
    ],
  },
  {
    id: 'chief_of_mischief',
    label: 'Chief of Mischief',
    category: 'Deviance',
    ageGroup: 'adult',
    rewardTrait: 'Tormentor',
    pack: 'Base Game',
    satisfactionPoints: 4425,
    milestones: [
      M('mostly_harmless_m', 'Mostly Harmless', [
        'Perform 10 Mean/Mischievous interactions',
        'Be disliked by 2 Sims',
      ]),
      M('artful_trickster', 'Artful Trickster', [
        'Use a computer to cause mischief 3 times',
        'Achieve level 3 Mischief skill',
      ]),
      M('professional_prankster', 'Professional Prankster', [
        'Pull 10 pranks',
        'Achieve level 6 Mischief skill',
      ]),
      M('chief_of_mischief_final', 'Chief of Mischief', [
        'Clog drains at 3 different homes',
        'Perform voodoo 5 times',
        'Achieve level 10 Mischief skill',
      ]),
    ],
  },
  {
    id: 'villainous_valentine',
    label: 'Villainous Valentine',
    category: 'Deviance',
    ageGroup: 'adult',
    rewardTrait: 'Twisted Heart',
    pack: 'Base Game',
    satisfactionPoints: null,
    milestones: [
      M('villainous_valentine', 'Villainous Valentine', [
        'Get caught cheating (x10)',
        'Achieve "ex" status with 5 Sims',
        'Break up 10 couples',
      ]),
    ],
  },

  /* ===========================
   * Family (subset)
   * =========================== */
  {
    id: 'successful_lineage',
    label: 'Successful Lineage',
    category: 'Family',
    ageGroup: 'adult',
    rewardTrait: 'Vicarious',
    pack: 'Base Game',
    satisfactionPoints: 5325,
    milestones: [
      M('readily_a_parent', 'Readily a Parent', [
        'Become an Adult',
        "Spend §1000 on kids' stuff",
      ]),
      M('caregiver', 'Caregiver', [
        'Read to a child for 2 total hours',
        'Become a parent',
        'Socialize with your child 10 times',
      ]),
      M('trusted_mentor', 'Trusted Mentor', [
        'Help a child with homework 3 times',
        "Have a child earn an 'A' in high school",
        'Have a child max any skill',
      ]),
      M('successful_lineage_final', 'Successful Lineage', [
        'Mentor your child 3 times',
        'Have a child complete an aspiration',
        'Have a child or grandchild reach the top of a career',
      ]),
    ],
  },
  {
    id: 'big_happy_family',
    label: 'Big Happy Family',
    category: 'Family',
    ageGroup: 'adult',
    rewardTrait: 'Matriarch/Patriarch',
    pack: 'Base Game',
    satisfactionPoints: 5225,
    milestones: [
      M('readily_a_parent_bhf', 'Readily a Parent', [
        'Become an Adult',
        "Spend §1000 on kids' stuff",
      ]),
      M('caregiver_bhf', 'Caregiver', [
        'Read to a child for 2 total hours',
        'Become a parent',
        'Socialize with your child 10 times',
      ]),
      M('loving_guardian', 'Loving Guardian', [
        'Be parent to a child with 3 friends',
        'Be friends with 3 of your children',
        'Have a child get married',
      ]),
      M('big_happy_family_final', 'Big Happy Family', [
        'Socialize with your child or grandchild 10 times',
        'Have 4 grandchildren',
        'Become good friends with 4 children or grandchildren',
      ]),
    ],
  },

  /* ===========================
   * Food (subset)
   * =========================== */
  {
    id: 'master_chef',
    label: 'Master Chef',
    category: 'Food',
    ageGroup: 'adult',
    rewardTrait: 'Fresh Chef',
    pack: 'Base Game',
    satisfactionPoints: 4675,
    milestones: [
      M('aluminum_chef', 'Aluminum Chef', [
        'Cook 5 Excellent meals',
        'Cook 2 meals while Inspired',
      ]),
      M('captain_cook', 'Captain Cook', [
        'Achieve level 5 Cooking skill',
        'Cook a Gourmet meal',
        'Earn Silver at a Dinner Party event',
      ]),
      M('culinary_artist', 'Culinary Artist', [
        'Become an Adult',
        'Reach level 4 Culinary career',
        'Create 3 types of Excellent food',
      ]),
      M('master_chef_final', 'Master Chef', [
        'Achieve level 5 Gourmet Cooking skill',
        'Reach level 8 Culinary career',
        'Cook 3 Gourmet dishes at a single event',
      ]),
    ],
  },
  {
    id: 'master_mixologist',
    label: 'Master Mixologist',
    category: 'Food',
    ageGroup: 'adult',
    rewardTrait: 'Potion Master',
    pack: 'Base Game',
    satisfactionPoints: 4425,
    milestones: [
      M('bar_tenderfoot', 'Bar Tenderfoot', [
        'Mix 10 drinks',
        'Own a bar and 2 barstools',
      ]),
      M('electric_mixer', 'Electric Mixer', [
        'Achieve level 4 Mixology skill',
        'Become an Adult',
        'Join the Culinary career',
      ]),
      M('beverage_boss', 'Beverage Boss', [
        'Mix 3 drinks at a single social event',
        'Join Mixology branch of the Culinary career',
        'Achieve level 7 Mixology skill',
      ]),
      M('master_mixologist_final', 'Master Mixologist', [
        'Achieve level 10 Mixology skill',
        'Create 5 types of Excellent drink',
      ]),
    ],
  },

  /* ===========================
   * Fortune (subset)
   * =========================== */
  {
    id: 'fabulously_wealthy',
    label: 'Fabulously Wealthy',
    category: 'Fortune',
    ageGroup: 'adult',
    rewardTrait: 'Shrewd',
    pack: 'Base Game',
    satisfactionPoints: 4675,
    milestones: [
      M('going_for_not_broke', 'Going for Not Broke', [
        'Have earned §5,000',
        'Have §10,000 in reserve',
      ]),
      M('learning_earning', 'Learning Earning', [
        'Have §20,000 in reserve',
        'Have earned §25,000',
      ]),
      M('well_off', 'Well-off', [
        'Have earned §75,000',
        'Have §35,000 in reserve',
      ]),
      M('fabulously_wealthy_final', 'Fabulously Wealthy', [
        'Have earned §200,000',
        'Have §50,000 in reserve',
      ]),
    ],
  },

  /* ===========================
   * Knowledge (subset)
   * =========================== */
  {
    id: 'renaissance_sim',
    label: 'Renaissance Sim',
    category: 'Knowledge',
    ageGroup: 'adult',
    rewardTrait: 'Professorial',
    pack: 'Base Game',
    satisfactionPoints: 5000,
    milestones: [
      M('prudent_student', 'Prudent Student', [
        'Finish reading 3 books',
        'Achieve level 3 Logic skill',
      ]),
      M('jack_of_some_trades', 'Jack of Some Trades', [
        'Become an Adult',
        'Achieve level 4 in 4 skills',
        'Reach level 3 of any career',
      ]),
      M('pantologist', 'Pantologist', [
        'Achieve level 5 in 5 skills',
        'Reach level 3 in 2 careers',
      ]),
      M('renaissance_sim_final', 'Renaissance Sim', [
        'Achieve level 8 in 6 skills',
        'Reach level 3 in 3 careers',
      ]),
    ],
  },

  /* ===========================
   * Love (subset)
   * =========================== */
  {
    id: 'serial_romantic',
    label: 'Serial Romantic',
    category: 'Love',
    ageGroup: 'adult',
    rewardTrait: 'Player',
    pack: 'Base Game',
    satisfactionPoints: 4125,
    milestones: [
      M('amore_amateur', 'Amore Amateur', [
        'Have a boyfriend or girlfriend',
        'Go on 2 dates',
      ]),
      M('up_to_date', 'Up to Date', [
        'Achieve level 4 Charisma skill',
        'Have had 3 first kisses',
      ]),
      M('romance_juggler', 'Romance Juggler', [
        'Achieve level 6 Charisma skill',
        'Have a strong romantic relationship with 3 Sims at once',
        'Kiss 10 Sims',
      ]),
      M('serial_romantic_final', 'Serial Romantic', [
        'Earn Gold on 3 dates',
        'Have had 8 boyfriends or girlfriends',
      ]),
    ],
  },

  /* ===========================
   * Nature (subset)
   * =========================== */
  {
    id: 'freelance_botanist',
    label: 'Freelance Botanist',
    category: 'Nature',
    ageGroup: 'adult',
    rewardTrait: 'Naturalist',
    pack: 'Base Game',
    satisfactionPoints: 4825,
    milestones: [
      M('naturewalker', 'Naturewalker', [
        'Plant something 3 times',
        'Weed or water plants 10 times',
      ]),
      M('garden_variety', 'Garden Variety', [
        'Achieve level 4 Gardening skill',
        'Evolve 5 different plants',
      ]),
      M('nature_nurturer', 'Nature Nurturer', [
        'Achieve level 6 Gardening skill',
        'Graft onto 3 plants',
        'Fertilize 5 plants',
      ]),
      M('freelance_botanist_final', 'Freelance Botanist', [
        'Achieve level 10 Gardening skill',
        'Grow a Cowplant',
        'Evolve 10 Excellent plants',
      ]),
    ],
  },

  /* ===========================
   * Popularity (subset)
   * =========================== */
  {
    id: 'joke_star',
    label: 'Joke Star',
    category: 'Popularity',
    ageGroup: 'adult',
    rewardTrait: 'Hilarious',
    pack: 'Base Game',
    satisfactionPoints: 4350,
    milestones: [
      M('practical_joker', 'Practical Joker', [
        'Be funny to 5 Sims',
        'Achieve level 3 Comedy skill',
      ]),
      M('stand_up_start_up', 'Stand-up Start-up', [
        'Become an Adult',
        'Join the Entertainer career',
        'Own a microphone',
      ]),
      M('funny_business', 'Funny Businessman/Businesswoman', [
        'Achieve level 6 Comedy skill',
        'Join the Comedian branch of Entertainer career',
        'Write 3 comedy routines',
      ]),
      M('joke_star_final', 'Joke Star', [
        'Perform 3 comedy routines',
        'Achieve level 10 Comedy skill',
      ]),
    ],
  },

  /* ===========================
   * Werewolf (subset)
   * =========================== */
  {
    id: 'werewolf_initiate',
    label: 'Werewolf Initiate',
    category: 'Werewolf',
    ageGroup: 'adult',
    rewardTrait: 'Fanged Friend',
    pack: 'Werewolves',
    satisfactionPoints: null,
    milestones: [
      M('lunar_attunement', 'Lunar Attunement', [
        'Become a Werewolf',
        'Level up to Runt',
        'Experience a Full Moon',
        'Read Werewolf Books 3 times',
      ]),
    ],
    notes: 'Prerequisite for Lone Wolf, Emissary of the Collective, Wildfang Renegade, Cure Seeker.',
  },

  /* ===========================
   * Child (subset)
   * =========================== */
  {
    id: 'artistic_prodigy',
    label: 'Artistic Prodigy',
    category: 'Child',
    ageGroup: 'child',
    rewardTrait: 'Creatively Gifted',
    pack: 'Base Game',
    satisfactionPoints: null,
    milestones: [
      M('active_imagination', 'Active Imagination', [
        'Have an Activity Table',
        'Draw 2 pictures while Inspired',
      ]),
      M('daydreamer', 'Daydreamer', [
        'Achieve level 5 Creativity skill',
        'Play with 3 toys',
      ]),
      M('artistic_prodigy_final', 'Artistic Prodigy', [
        'Play instruments for 5 total hours',
        'Draw all 5 picture types on the Activity Table',
        'Achieve level 10 Creativity skill',
      ]),
    ],
  },

  /* ===========================
   * Teen (subset)
   * =========================== */
  {
    id: 'drama_llama',
    label: 'Drama Llama',
    category: 'Teen',
    ageGroup: 'teen',
    rewardTrait: 'Untroubled',
    pack: 'High School Years',
    satisfactionPoints: null,
    milestones: [
      M('hot_gossip', 'Hot Gossip', [
        'Gossip 5 times',
        'Spread a rumor',
        'Mess around in the cuddle carts',
      ]),
      M('internet_troll', 'Internet Troll', [
        'Be mean on Social Bunny 5 times',
        'Break up with a Sim',
      ]),
      M('drama_llama_final', 'Drama Llama', [
        'Have an enemy rival',
      ]),
    ],
  },

  /* ===========================
   * Location (subset)
   * =========================== */
  {
    id: 'city_native',
    label: 'City Native',
    category: 'Location',
    ageGroup: 'adult',
    rewardTrait: 'In the Know',
    pack: 'City Living',
    satisfactionPoints: 4725,
    milestones: [
      M('tourist', 'Tourist', [
        'Introduce self to someone new in 3 city neighborhoods',
        'Give an apartment key to a friend',
        'Order 3 times from food stalls',
      ]),
      M('inhabitant', 'Inhabitant', [
        'Achieve level 4 Singing skill',
        'Light Fireworks at the Humor and Hijinks Festival',
        'Use a Bubble Blower',
      ]),
      M('city_expert', 'City Expert', [
        'Donate to a protester',
        'Kiss someone at the Romance Festival',
        'Complete a mural at the Arts Center',
      ]),
      M('city_native_final', 'City Native', [
        'Live in an apartment worth §100,000',
        'Master the Singing skill',
        'Win a contest at GeekCon',
      ]),
    ],
  },

  /* ===========================
   * Star Wars (subset)
   * =========================== */
  {
    id: 'hope_vs_order',
    label: 'Hope VS Order',
    category: 'Star Wars',
    ageGroup: 'adult',
    rewardTrait: 'A Gift of Credits',
    pack: 'Journey to Batuu',
    satisfactionPoints: null,
    milestones: [
      M('first_steps_batuu', 'First Steps', [
        'Visit every neighbourhood on Batuu',
        'Ask about Resistance or First Order presence',
        'Complete a mission for Resistance or First Order',
      ]),
    ],
    notes: 'Prerequisite for Paragon of Hope / Enforcer of Order.',
  },

  /* ===========================
   * Wellness (subset)
   * =========================== */
  {
    id: 'inner_peace',
    label: 'Inner Peace',
    category: 'Wellness',
    ageGroup: 'adult',
    rewardTrait: 'Clear Perspective',
    pack: 'Spa Day',
    satisfactionPoints: null,
    milestones: [
      M('inner_peace_single', 'Inner Peace', [
        'Practice Mindfulness',
        'Seek Relaxation',
        'Find Peaceful Surroundings',
        'Maintain Harmony',
      ]),
    ],
  },

  /* ===========================
   * Tutorial (subset)
   * =========================== */
  {
    id: 'tutorial_trend_setter',
    label: 'Tutorial: Trend-Setter',
    category: 'Tutorial',
    ageGroup: 'tutorial',
    rewardTrait: 'Over-Achiever',
    pack: 'Base Game',
    satisfactionPoints: null,
    milestones: [
      M('settling_in', 'Settling In', [
        'Get to Know Roommate',
        'Grab something to Eat',
        'Interact with Fun Object',
        'Go to Sleep for the Night',
      ]),
      M('first_day_on_the_job', 'First Day on the Job', [
        'Prepare for Work',
        'Make Coffee',
        'Go to Work',
        'Socialize with Alex',
      ]),
      M('career_development', 'Career Development', [
        'Clean the Home',
        'Work on a Daily Career Task',
        'Improve a Skill · Earn a Promotion',
      ]),
      M('work_life_balance', 'Work-Life Balance', [
        'Take a Vacation Day',
        'Travel to a Community Venue',
        'Go Fishing for 1 Hour',
        'Meet new Sims',
      ]),
    ],
  },

  // ===========================
  // TODO: Continue adding the rest from your list following the same pattern:
  // - Fairy: Fairy Stories, Discordant Fairy, Harmonious Fairy…
  // - Family: Vampire Family, Super Parent…
  // - Location: StrangerVille Mystery, Beach Life, Mt. Komorebi Sightseer…
  // - Love: Soulmate, Romantic Explorer, Paragon Partner…
  // - Knowledge: Nerd Brain, Computer Whiz, Master Vampire, Archaeology Scholar, Spellcraft & Sorcery, Academic, Ghost Historian, Master Mentor, Elixir Enthusiast…
  // - Nature: Outdoor Enthusiast, Jungle Explorer, Purveyor of Potions, Eco Innovator, Country Caretaker, Crystal Crafter, Nature Nomad…
  // - Popularity: Party Animal, Friend of the World, Neighborhood Confidante, Leader of the Pack, Good Vampire, World-Famous Celebrity, Discerning Dweller, Esteemed Entrepreneur…
  // - Star Wars branches: Paragon of Hope, Enforcer of Order, Galactic Privateer…
  // - Wellness: Self-Care Specialist, Zen Guru…
  // - Werewolf branches: Lone Wolf, Emissary of the Collective, Wildfang Renegade, Cure Seeker…
  // - Child (rest) and Teen (rest), Limited-Time Positivity Challenge, etc.
]

// Quick lookups
export const ASPIRATION_BY_ID = new Map(Aspirations.map(a => [a.id, a]))
export const ASPIRATIONS_BY_CATEGORY = Aspirations.reduce((acc, a) => {
  const arr = acc.get(a.category) ?? []
  arr.push(a)
  acc.set(a.category, arr)
  return acc
}, new Map<AspirationCategory, Aspiration[]>())

// Icon helper (matches your existing approach)
export function aspirationIconPath(label: string, iconFile?: string | null) {
  const file = (iconFile?.trim() || `${label}.png`)
  return `/images/aspirations/${encodeURIComponent(file)}`
}
