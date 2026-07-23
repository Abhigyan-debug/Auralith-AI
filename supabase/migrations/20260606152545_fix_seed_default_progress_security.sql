/*
# Fix seed_default_progress security issues

1. Set a fixed search_path on the function to prevent search_path hijacking.
2. Revoke EXECUTE from anon and authenticated roles so it cannot be called
   directly via the REST API — it is only meant to fire as a trigger.
*/

CREATE OR REPLACE FUNCTION seed_default_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  topics text[] := ARRAY['Arrays','Strings','Linked Lists','Trees','Graphs','Dynamic Programming','Sorting','Binary Search','Recursion','Hashing'];
  t text;
BEGIN
  FOREACH t IN ARRAY topics
  LOOP
    INSERT INTO progress_reports (user_id, topic, score, problems_solved, total_time_minutes)
    VALUES (NEW.user_id, t, 0, 0, 0)
    ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION seed_default_progress() FROM anon;
REVOKE EXECUTE ON FUNCTION seed_default_progress() FROM authenticated;
REVOKE EXECUTE ON FUNCTION seed_default_progress() FROM public;
