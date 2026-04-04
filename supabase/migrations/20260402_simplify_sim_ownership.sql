-- Migration: Simplify sim ownership model
-- Adds user_id to sims (direct ownership), makes challenge_id nullable,
-- drops the redundant challenge_sims join table and related RPCs.

-- 1. Add user_id column (nullable first for backfill)
ALTER TABLE public.sims ADD COLUMN user_id UUID REFERENCES public.users(id);

-- 2. Backfill user_id from challenges
UPDATE public.sims s
SET user_id = c.user_id
FROM public.challenges c
WHERE s.challenge_id = c.id;

-- 3. Make user_id NOT NULL now that all rows are backfilled
ALTER TABLE public.sims ALTER COLUMN user_id SET NOT NULL;

-- 4. Make challenge_id nullable (sims can exist without a challenge)
ALTER TABLE public.sims ALTER COLUMN challenge_id DROP NOT NULL;

-- 5. Add index for user_id lookups (dashboard query)
CREATE INDEX idx_sims_user_id ON public.sims(user_id);

-- 6. Drop RPC functions first (they depend on challenge_sims type)
DROP FUNCTION IF EXISTS public.link_sim_to_challenge(UUID, UUID);
DROP FUNCTION IF EXISTS public.update_challenge_sim(UUID, INTEGER, BOOLEAN, public.relationship_to_heir);
DROP FUNCTION IF EXISTS public.get_all_sims_for_user(UUID);

-- 7. Drop the redundant challenge_sims table
DROP TABLE IF EXISTS public.challenge_sims;

-- 8. Replace RLS policy with direct user_id match
DROP POLICY IF EXISTS "users can manage their own sims" ON public.sims;
CREATE POLICY "users can manage their own sims"
  ON public.sims
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
