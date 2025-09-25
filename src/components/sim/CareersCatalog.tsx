// src/components/sim/CareersCatalog.ts
// Shape mirrors your TraitsCatalog style: flat array with predictable keys.
// You can use a PNG per career in /public/images/careers/<Label>.png (optional).

export type CareerType = 'Full-time' | 'Part-time' | 'Active' | 'Freelance'

export type Career = {
  id: string                  // snake_case id
  label: string               // display name
  type: CareerType            // FT / PT / Active / Freelance
  levels?: number | null      // number of levels, or null for N/A
  base?: string | null        // base career (for branch rows), e.g., "Astronaut"
  degree?: string | null      // associated degree (display label)
  pack?: string | null        // pack label; use "Base Game" or null if none
  iconFile?: string | null    // optional override for icon filename (Label.png is default)
}

export const Careers: Career[] = [
  // --- Astronaut ---
  {
    id: 'astronaut',
    label: 'Astronaut',
    type: 'Full-time',
    levels: 7,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'space_ranger',
    label: 'Space Ranger',
    type: 'Full-time',
    levels: 3,
    base: 'Astronaut',
    degree: 'Physics',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'interstellar_smuggler',
    label: 'Interstellar Smuggler',
    type: 'Full-time',
    levels: 3,
    base: 'Astronaut',
    degree: 'Villainy',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Athlete ---
  {
    id: 'athlete',
    label: 'Athlete',
    type: 'Full-time',
    levels: 4,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'professional_athlete',
    label: 'Professional Athlete',
    type: 'Full-time',
    levels: 6,
    base: 'Athlete',
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'bodybuilder',
    label: 'Bodybuilder',
    type: 'Full-time',
    levels: 6,
    base: 'Athlete',
    degree: 'Biology',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Part-time basics ---
  { id: 'babysitter', label: 'Babysitter', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'barista', label: 'Barista', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'fast_food_employee', label: 'Fast Food Employee', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'manual_laborer', label: 'Manual Laborer', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'retail_employee', label: 'Retail Employee', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },

  // --- Business ---
  {
    id: 'business',
    label: 'Business',
    type: 'Full-time',
    levels: 6,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'management',
    label: 'Management',
    type: 'Full-time',
    levels: 4,
    base: 'Business',
    degree: 'Communications',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'investor',
    label: 'Investor',
    type: 'Full-time',
    levels: 4,
    base: 'Business',
    degree: 'Economics',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Criminal ---
  {
    id: 'criminal',
    label: 'Criminal',
    type: 'Full-time',
    levels: 5,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'boss',
    label: 'Boss',
    type: 'Full-time',
    levels: 5,
    base: 'Criminal',
    degree: 'Villainy',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'oracle',
    label: 'Oracle',
    type: 'Full-time',
    levels: 5,
    base: 'Criminal',
    degree: 'Computer Science',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Culinary ---
  {
    id: 'culinary',
    label: 'Culinary',
    type: 'Full-time',
    levels: 5,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'chef',
    label: 'Chef',
    type: 'Full-time',
    levels: 5,
    base: 'Culinary',
    degree: 'Culinary Arts',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'mixologist',
    label: 'Mixologist',
    type: 'Full-time',
    levels: 5,
    base: 'Culinary',
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Entertainer ---
  {
    id: 'entertainer',
    label: 'Entertainer',
    type: 'Full-time',
    levels: 4,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'musician',
    label: 'Musician',
    type: 'Full-time',
    levels: 6,
    base: 'Entertainer',
    degree: 'Fine Art',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'comedian',
    label: 'Comedian',
    type: 'Full-time',
    levels: 6,
    base: 'Entertainer',
    degree: 'Drama',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Freelancers (Base set) ---
  { id: 'freelance_artist', label: 'Freelance Artist', type: 'Freelance', levels: null, base: 'Freelancer', degree: 'Fine Art', pack: 'Base Game', iconFile: null },
  { id: 'freelance_programmer', label: 'Freelance Programmer', type: 'Freelance', levels: null, base: 'Freelancer', degree: 'Computer Science', pack: 'Base Game', iconFile: null },
  { id: 'freelance_writer', label: 'Freelance Writer', type: 'Freelance', levels: null, base: 'Freelancer', degree: 'Language & Literature', pack: 'Base Game', iconFile: null },

  // --- Painter ---
  {
    id: 'painter',
    label: 'Painter',
    type: 'Full-time',
    levels: 6,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'master_of_the_real',
    label: 'Master of the Real',
    type: 'Full-time',
    levels: 4,
    base: 'Painter',
    degree: 'Fine Art',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'patron_of_the_arts',
    label: 'Patron of the Arts',
    type: 'Full-time',
    levels: 4,
    base: 'Painter',
    degree: 'Art History',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Secret Agent ---
  {
    id: 'secret_agent',
    label: 'Secret Agent',
    type: 'Full-time',
    levels: 7,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'diamond_agent',
    label: 'Diamond Agent',
    type: 'Full-time',
    levels: 3,
    base: 'Secret Agent',
    degree: 'Psychology',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'villain',
    label: 'Villain',
    type: 'Full-time',
    levels: 4,
    base: 'Secret Agent',
    degree: 'Villainy',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Style Influencer ---
  {
    id: 'style_influencer',
    label: 'Style Influencer',
    type: 'Full-time',
    levels: 5,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'stylist',
    label: 'Stylist',
    type: 'Full-time',
    levels: 5,
    base: 'Style Influencer',
    degree: 'Fine Art',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'trend_setter',
    label: 'Trend Setter',
    type: 'Full-time',
    levels: 5,
    base: 'Style Influencer',
    degree: 'Art History',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Tech Guru ---
  {
    id: 'tech_guru',
    label: 'Tech Guru',
    type: 'Full-time',
    levels: 6,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'esport_gamer',
    label: 'eSports Gamer',
    type: 'Full-time',
    levels: 4,
    base: 'Tech Guru',
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'startup_entrepreneur',
    label: 'Start-up Entrepreneur',
    type: 'Full-time',
    levels: 4,
    base: 'Tech Guru',
    degree: 'Computer Science',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Writer ---
  {
    id: 'writer',
    label: 'Writer',
    type: 'Full-time',
    levels: 5,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'author',
    label: 'Author',
    type: 'Full-time',
    levels: 5,
    base: 'Writer',
    degree: 'Language & Literature',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'journalist',
    label: 'Journalist',
    type: 'Full-time',
    levels: 5,
    base: 'Writer',
    degree: 'Communications',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Active Careers ---
{ id: 'detective', label: 'Detective', type: 'Active', levels: 10, base: null, degree: 'Psychology', pack: 'Base Game', iconFile: null },
  { id: 'doctor', label: 'Doctor', type: 'Active', levels: 10, base: null, degree: 'Biology', pack: 'Base Game', iconFile: null },
  { id: 'scientist', label: 'Scientist', type: 'Active', levels: 10, base: null, degree: 'Physics', pack: 'Base Game', iconFile: null },

  // --- Critic ---
  { id: 'critic', label: 'Critic', type: 'Full-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  {
    id: 'arts_critic',
    label: 'Arts Critic',
    type: 'Full-time',
    levels: 7,
    base: 'Critic',
    degree: 'Art History',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'food_critic',
    label: 'Food Critic',
    type: 'Full-time',
    levels: 7,
    base: 'Critic',
    degree: 'Culinary Arts',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Politician ---
  { id: 'politician', label: 'Politician', type: 'Full-time', levels: 4, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'politician_branch', label: 'Politician (Branch)', type: 'Full-time', levels: 6, base: 'Politician', degree: 'History', pack: 'Base Game', iconFile: null },
  { id: 'charity_organizer', label: 'Charity Organizer', type: 'Full-time', levels: 6, base: 'Politician', degree: 'Communications', pack: 'Base Game', iconFile: null },

  // --- Social Media ---
  {
    id: 'social_media',
    label: 'Social Media',
    type: 'Full-time',
    levels: 3,
    base: null,
    degree: null,
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'internet_personality',
    label: 'Internet Personality',
    type: 'Full-time',
    levels: 7,
    base: 'Social Media',
    degree: 'Drama',
    pack: 'Base Game',
    iconFile: null,
  },
  {
    id: 'public_relations',
    label: 'Public Relations',
    type: 'Full-time',
    levels: 7,
    base: 'Social Media',
    degree: 'Communications',
    pack: 'Base Game',
    iconFile: null,
  },

  // --- Gardener ---
{ id: 'gardener', label: 'Gardener', type: 'Full-time', levels: 4, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'botanist', label: 'Botanist', type: 'Full-time', levels: 6, base: 'Gardener', degree: 'Biology', pack: 'Base Game', iconFile: null },
  { id: 'floral_designer', label: 'Floral Designer', type: 'Full-time', levels: 6, base: 'Gardener', degree: 'Fine Art', pack: 'Base Game', iconFile: null },

  // --- Actor ---
  { id: 'actor', label: 'Actor', type: 'Active', levels: 10, base: null, degree: 'Drama', pack: 'Base Game', iconFile: null },

  // --- Military ---
  { id: 'military', label: 'Military', type: 'Full-time', levels: 5, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'covert_operator', label: 'Covert Operator', type: 'Full-time', levels: 5, base: 'Military', degree: 'Psychology', pack: 'Base Game', iconFile: null },
  { id: 'officer', label: 'Officer', type: 'Full-time', levels: 5, base: 'Military', degree: 'History', pack: 'Base Game', iconFile: null },

  // --- Conservationist ---
  { id: 'conservationist', label: 'Conservationist', type: 'Full-time', levels: 6, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'environmental_manager', label: 'Environmental Manager', type: 'Full-time', levels: 4, base: 'Conservationist', degree: 'Economics', pack: 'Base Game', iconFile: null },
  { id: 'marine_biologist', label: 'Marine Biologist', type: 'Full-time', levels: 4, base: 'Conservationist', degree: 'Biology', pack: 'Base Game', iconFile: null },

  // --- Island part-time ---
  { id: 'diver', label: 'Diver', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'fisherman', label: 'Fisherman', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'lifeguard', label: 'Lifeguard', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },

  // --- Freelancer (Photography) ---
{ id: 'freelance_fashion_photographer', label: 'Freelance Fashion Photographer', type: 'Freelance', levels: null, base: 'Freelancer', degree: 'Fine Art', pack: 'Base Game', iconFile: null },

  // --- Education ---
    { id: 'education', label: 'Education', type: 'Full-time', levels: 5, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'administrator', label: 'Administrator', type: 'Full-time', levels: 5, base: 'Education', degree: 'Economics', pack: 'Base Game', iconFile: null },
  { id: 'professor', label: 'Professor', type: 'Full-time', levels: 5, base: 'Education', degree: 'Psychology', pack: 'Base Game', iconFile: null },

  // --- Engineer ---
  { id: 'engineer', label: 'Engineer', type: 'Full-time', levels: 6, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'computer_engineer', label: 'Computer Engineer', type: 'Full-time', levels: 4, base: 'Engineer', degree: 'Computer Science', pack: 'Base Game', iconFile: null },
  { id: 'mechanical_engineer', label: 'Mechanical Engineer', type: 'Full-time', levels: 4, base: 'Engineer', degree: 'Physics', pack: 'Base Game', iconFile: null },

  // --- Law ---
  { id: 'law', label: 'Law', type: 'Full-time', levels: 7, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'judge', label: 'Judge', type: 'Full-time', levels: 3, base: 'Law', degree: 'History', pack: 'Base Game', iconFile: null },
  { id: 'private_attorney', label: 'Private Attorney', type: 'Full-time', levels: 3, base: 'Law', degree: 'Language & Literature', pack: 'Base Game', iconFile: null },

  // --- Civil Designer ---
  { id: 'civil_designer', label: 'Civil Designer', type: 'Full-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'civic_planner', label: 'Civic Planner', type: 'Full-time', levels: 7, base: 'Civil Designer', degree: 'Communications', pack: 'Base Game', iconFile: null },
  { id: 'green_technician', label: 'Green Technician', type: 'Full-time', levels: 7, base: 'Civil Designer', degree: 'Physics', pack: 'Base Game', iconFile: null },

  // --- Freelance Crafter ---
  { id: 'freelance_crafter', label: 'Freelance Crafter', type: 'Freelance', levels: null, base: 'Freelancer', degree: 'Fine Art', pack: 'Base Game', iconFile: null },

  // --- Salaryperson ---
  { id: 'salaryperson', label: 'Salaryperson', type: 'Full-time', levels: 4, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'expert', label: 'Expert', type: 'Full-time', levels: 6, base: 'Salaryperson', degree: 'Computer Science', pack: 'Base Game', iconFile: null },
  { id: 'supervisor', label: 'Supervisor', type: 'Full-time', levels: 6, base: 'Salaryperson', degree: 'Communications', pack: 'Base Game', iconFile: null },

  // --- Paranormal (Freelance) ---
  { id: 'paranormal_investigator', label: 'Paranormal Investigator', type: 'Freelance', levels: null, base: 'Freelancer', degree: null, pack: 'Base Game', iconFile: null },

  // --- Interior Decorator (Active) ---
  { id: 'interior_decorator', label: 'Interior Decorator', type: 'Active', levels: 10, base: null, degree: null, pack: 'Base Game', iconFile: null },

  // --- Side Hustles ---
  { id: 'simfluencer', label: 'Simfluencer', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'video_game_streamer', label: 'Video Game Streamer', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'handyperson', label: 'Handyperson', type: 'Part-time', levels: 3, base: null, degree: null, pack: 'Base Game', iconFile: null },

  // --- Romance Careers ---
  { id: 'romance_consultant', label: 'Romance Consultant', type: 'Full-time', levels: 7, base: null, degree: 'Psychology', pack: 'Base Game', iconFile: null },
  { id: 'matchmaker', label: 'Matchmaker', type: 'Full-time', levels: 3, base: 'Romance Consultant', degree: null, pack: 'Base Game', iconFile: null },
  { id: 'relationship_counselor', label: 'Relationship Counselor', type: 'Full-time', levels: 3, base: 'Romance Consultant', degree: null, pack: 'Base Game', iconFile: null },

  // --- Death/Afterlife Careers ---
  { id: 'reaper', label: 'Reaper', type: 'Active', levels: 10, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'undertaker', label: 'Undertaker', type: 'Full-time', levels: 4, base: null, degree: null, pack: 'Base Game', iconFile: null },
  { id: 'funeral_director', label: 'Funeral Director', type: 'Full-time', levels: 6, base: 'Undertaker', degree: 'Psychology', pack: 'Base Game', iconFile: null },
  { id: 'mortician', label: 'Mortician', type: 'Full-time', levels: 6, base: 'Undertaker', degree: 'Biology', pack: 'Base Game', iconFile: null },

  // --- Naturopath (Active) ---
  { id: 'naturopath', label: 'Naturopath', type: 'Active', levels: 5, base: null, degree: 'Biology', pack: 'Base Game', iconFile: null },
  { id: 'apothe_curist', label: 'Apothe-curist', type: 'Active', levels: 5, base: 'Naturopath', degree: 'Physics', pack: 'Base Game', iconFile: null },
  { id: 'lifestyle_coaching', label: 'Lifestyle Coaching', type: 'Active', levels: 5, base: 'Naturopath', degree: 'Psychology', pack: 'Base Game', iconFile: null },
]
