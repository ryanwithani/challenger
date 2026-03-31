-- Migrate user_preferences.expansion_packs from boolean-map format to acronym-array format.
-- Before: {"get_to_work": true, "seasons": false, "spa_day": true, ...}
-- After:  ["GTW", "SD"]
--
-- Safe to run multiple times — skips rows already in array format.

UPDATE user_preferences
SET
  expansion_packs = (
    SELECT jsonb_agg(acronym ORDER BY acronym)
    FROM (
      SELECT
        CASE key
          WHEN 'get_to_work' THEN 'GTW'
          WHEN 'get_together' THEN 'GT'
          WHEN 'city_living' THEN 'CL'
          WHEN 'cats_and_dogs' THEN 'C&D'
          WHEN 'cats_dogs' THEN 'C&D'
          WHEN 'seasons' THEN 'S'
          WHEN 'get_famous' THEN 'GF'
          WHEN 'island_living' THEN 'IL'
          WHEN 'discover_university' THEN 'DU'
          WHEN 'eco_lifestyle' THEN 'EL'
          WHEN 'snowy_escape' THEN 'SE'
          WHEN 'cottage_living' THEN 'CLV'
          WHEN 'high_school_years' THEN 'HSY'
          WHEN 'growing_together' THEN 'GTO'
          WHEN 'horse_ranch' THEN 'HR'
          WHEN 'for_rent' THEN 'FR'
          WHEN 'lovestruck' THEN 'L'
          WHEN 'life_and_death' THEN 'L&D'
          WHEN 'life_death' THEN 'L&D'
          WHEN 'enchanted_by_nature' THEN 'EBN'
          WHEN 'businesses_and_hobbies' THEN 'B&H'
          WHEN 'outdoor_retreat' THEN 'OR'
          WHEN 'spa_day' THEN 'SD'
          WHEN 'strangerville' THEN 'SV'
          WHEN 'dine_out' THEN 'DO'
          WHEN 'vampires' THEN 'V'
          WHEN 'parenthood' THEN 'PH'
          WHEN 'jungle_adventure' THEN 'JA'
          WHEN 'realm_of_magic' THEN 'RoM'
          WHEN 'journey_to_batuu' THEN 'JTB'
          WHEN 'dream_home_decorator' THEN 'DHD'
          WHEN 'my_wedding_stories' THEN 'MWS'
          WHEN 'werewolves' THEN 'W'
          ELSE NULL
        END AS acronym
      FROM jsonb_each_text(expansion_packs) AS kv(key, value)
      WHERE value = 'true'
    ) mapped
    WHERE acronym IS NOT NULL
  ),
  updated_at = now()
WHERE jsonb_typeof(expansion_packs) = 'object';

-- Handle edge case: if the subquery returns no rows, jsonb_agg returns NULL.
-- Set those to empty array.
UPDATE user_preferences
SET expansion_packs = '[]'::jsonb
WHERE expansion_packs IS NULL;
