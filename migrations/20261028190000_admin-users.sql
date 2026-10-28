-- Admin user management: list accounts and grant or revoke admin. auth.users is not exposed
-- through the API, so these SECURITY DEFINER functions read it after checking is_admin().

CREATE OR REPLACE FUNCTION public.admin_list_users(p_search TEXT DEFAULT NULL, p_limit INT DEFAULT 100)
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ, is_admin BOOLEAN)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
    SELECT u.id, u.email::TEXT, u.created_at, EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = u.id)
    FROM auth.users u
    WHERE p_search IS NULL OR u.email ILIKE '%' || p_search || '%'
    ORDER BY u.created_at DESC
    LIMIT LEAST(GREATEST(p_limit, 1), 500);
END $$;

-- An admin cannot remove themself, so the panel can never end up with no admin by accident.
CREATE OR REPLACE FUNCTION public.admin_set_admin(p_user UUID, p_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  IF p_admin THEN
    INSERT INTO public.admins (user_id) VALUES (p_user) ON CONFLICT DO NOTHING;
  ELSIF p_user = auth.uid() THEN
    RAISE EXCEPTION 'cannot remove yourself';
  ELSE
    DELETE FROM public.admins WHERE user_id = p_user;
  END IF;
  INSERT INTO public.audit_log (actor, table_name, action, row_key)
  VALUES (auth.uid(), 'admins', CASE WHEN p_admin THEN 'GRANT' ELSE 'REVOKE' END, p_user::TEXT);
END $$;

REVOKE ALL ON FUNCTION public.admin_list_users(TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_admin(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(UUID, BOOLEAN) TO authenticated;
