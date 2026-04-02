-- Checklist completion tracking: stores one row per completed item per challenge.
-- Design: sparse rows (only completions stored), static catalog lives client-side.

create table public.challenge_completions (
  id           uuid        primary key default gen_random_uuid(),
  challenge_id uuid        not null references public.challenges(id) on delete cascade,
  user_id      uuid        not null references public.users(id) on delete cascade,
  item_key     text        not null,
  completed_at timestamptz not null default now(),
  unique(challenge_id, item_key)
);

-- RLS: users can only read/write their own completions
alter table public.challenge_completions enable row level security;

create policy "Users manage own completions"
  on public.challenge_completions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for bulk-loading all completions for a challenge
create index idx_challenge_completions_lookup
  on public.challenge_completions(challenge_id, user_id);

-- Atomic toggle: insert on first call, delete on second call.
-- Also increments/decrements the matching goal counter in one transaction.
create or replace function public.toggle_completion(
  p_challenge_id uuid,
  p_item_key     text,
  p_user_id      uuid
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category  text;
  v_goal_type text;
  v_action    text;
begin
  -- Extract catalog type from item key ("skills:Cooking" -> "skills")
  v_category := split_part(p_item_key, ':', 1);

  -- Try to insert; if the unique constraint fires, delete instead (toggle off)
  begin
    insert into challenge_completions(challenge_id, user_id, item_key)
    values (p_challenge_id, p_user_id, p_item_key);
    v_action := 'completed';
  exception when unique_violation then
    delete from challenge_completions
    where challenge_id = p_challenge_id
      and item_key     = p_item_key
      and user_id      = p_user_id;
    v_action := 'uncompleted';
  end;

  -- Map catalog type to goal_type
  v_goal_type := case v_category
    when 'skills'       then 'skills_completed'
    when 'aspirations'  then 'aspirations_completed'
    when 'careers'      then 'careers_completed'
    when 'parties'      then 'parties_hosted'
    when 'deaths'       then 'deaths_collected'
    when 'traits'       then 'traits_collected'
    when 'collections'  then 'collections_completed'
    else null
  end;

  -- Increment or decrement the matching goal counter (if one exists)
  if v_goal_type is not null then
    update goals
    set current_value = current_value + (case when v_action = 'completed' then 1 else -1 end)
    where challenge_id = p_challenge_id
      and goal_type    = v_goal_type
      and current_value + (case when v_action = 'completed' then 1 else -1 end) >= 0;
  end if;

  return json_build_object('action', v_action);
end;
$$;
