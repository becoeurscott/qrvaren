-- The slug guard reads reserved_slugs, which signed-in users can't select, so every card insert
-- failed with "permission denied". Run the trigger as its owner instead.
ALTER FUNCTION public.cards_guard_slug() SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.cards_guard_slug() FROM PUBLIC, anon, authenticated;
