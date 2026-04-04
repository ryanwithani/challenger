-- Add automation_type column to goals table
-- This enables goals to be auto-tracked from sims data rather than requiring manual user input.
-- Known values: 'generation_ya', 'ten_children_per_gen', 'unique_spouse_traits', 'challenge_complete_gen10'
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS automation_type TEXT;
