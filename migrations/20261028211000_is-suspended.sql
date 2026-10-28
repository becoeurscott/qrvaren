-- Sign-in callback check (runs before the browser has a session). Only reveals a yes/no for a known user id.
CREATE OR REPLACE FUNCTION public.is_suspended(p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_suspensions WHERE user_id = p_user) $$;
REVOKE ALL ON FUNCTION public.is_suspended(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_suspended(UUID) TO anon, authenticated;
