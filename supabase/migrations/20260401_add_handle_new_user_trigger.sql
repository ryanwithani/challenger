-- Captures the existing handle_new_user() trigger and function.
-- This trigger auto-creates a public.users profile row whenever
-- a new auth.users row is inserted (via signUp, OAuth, etc.).
--
-- The signup API route relies on this trigger — it does NOT insert
-- into public.users directly. See src/app/api/auth/signup/route.ts.

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Try to insert with the provided username
  INSERT INTO public.users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'username'
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username is taken, use a unique fallback
    INSERT INTO public.users (id, email, username, display_name)
    VALUES (
      NEW.id,
      NEW.email,
      'user_' || substring(NEW.id::text, 1, 8),
      NEW.raw_user_meta_data->>'username'
    );
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log any other errors but don't block signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create the trigger only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
