-- Admin roles with granular permissions, account suspension, and internal notes on users.

-- ---------- Roles ----------
ALTER TABLE public.admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'
  CHECK (role IN ('super_admin', 'admin', 'support', 'moderator', 'analyst'));
UPDATE public.admins SET role = 'super_admin';

CREATE OR REPLACE FUNCTION public.admin_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT role FROM public.admins WHERE user_id = auth.uid() $$;

-- The single source of truth for what each role may do. The app reads it to build the menu,
-- and every policy and admin function checks it.
CREATE OR REPLACE FUNCTION public.role_perms(p_role TEXT)
RETURNS TEXT[]
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'super_admin' THEN ARRAY['analytics', 'audit', 'config', 'users.read', 'users.suspend', 'notes', 'roles']
    WHEN 'admin'       THEN ARRAY['analytics', 'audit', 'config', 'users.read', 'users.suspend', 'notes']
    WHEN 'support'     THEN ARRAY['users.read', 'notes']
    WHEN 'moderator'   THEN ARRAY['users.read', 'users.suspend', 'notes']
    WHEN 'analyst'     THEN ARRAY['analytics']
    ELSE ARRAY[]::TEXT[]
  END
$$;

CREATE OR REPLACE FUNCTION public.has_admin_perm(p TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT COALESCE(p = ANY (public.role_perms(public.admin_role())), FALSE) $$;

CREATE OR REPLACE FUNCTION public.my_admin_perms()
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT jsonb_build_object('role', public.admin_role(), 'perms', to_jsonb(public.role_perms(public.admin_role()))) $$;

-- Config writes need 'config'; analytics data needs 'analytics'; the audit log needs 'audit'.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['features', 'plans', 'plan_features', 'settings', 'ad_slots', 'ad_blocks'] LOOP
    EXECUTE format('DROP POLICY "admin write" ON public.%I', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_admin_perm(''config'')) WITH CHECK (public.has_admin_perm(''config''))', t);
  END LOOP;
END $$;
DROP POLICY "admin read" ON public.ad_click_daily;
CREATE POLICY "admin read" ON public.ad_click_daily FOR SELECT TO authenticated USING (public.has_admin_perm('analytics'));
DROP POLICY "admin read" ON public.audit_log;
CREATE POLICY "admin read" ON public.audit_log FOR SELECT TO authenticated USING (public.has_admin_perm('audit'));
DROP POLICY "admin read" ON public.events;
CREATE POLICY "admin read" ON public.events FOR SELECT TO authenticated USING (public.has_admin_perm('analytics'));

-- analytics_summary() checked is_admin(); tighten it to the 'analytics' permission.
DO $$
DECLARE v_src TEXT;
BEGIN
  SELECT pg_get_functiondef('public.analytics_summary(int)'::regprocedure) INTO v_src;
  EXECUTE replace(v_src, 'IF NOT public.is_admin() THEN', 'IF NOT public.has_admin_perm(''analytics'') THEN');
END $$;

-- ---------- Suspension ----------
CREATE TABLE public.user_suspensions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT '',
  suspended_by UUID,
  suspended_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read" ON public.user_suspensions FOR SELECT TO authenticated USING (public.has_admin_perm('users.read'));
REVOKE ALL ON public.user_suspensions FROM anon, authenticated;
GRANT SELECT ON public.user_suspensions TO authenticated;

-- For the app's session check and for RLS on user-owned tables: FALSE when the caller is suspended.
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_suspensions WHERE user_id = auth.uid()) $$;

-- ---------- Notes ----------
CREATE TABLE public.admin_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author UUID NOT NULL DEFAULT auth.uid(),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX admin_notes_user_idx ON public.admin_notes (user_id, created_at DESC);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes read" ON public.admin_notes FOR SELECT TO authenticated USING (public.has_admin_perm('notes'));
CREATE POLICY "notes write" ON public.admin_notes FOR INSERT TO authenticated WITH CHECK (public.has_admin_perm('notes') AND author = auth.uid());
CREATE POLICY "notes delete own" ON public.admin_notes FOR DELETE TO authenticated USING (public.has_admin_perm('notes') AND (author = auth.uid() OR public.has_admin_perm('roles')));
REVOKE ALL ON public.admin_notes FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.admin_notes TO authenticated;
GRANT USAGE ON SEQUENCE public.admin_notes_id_seq TO authenticated;

-- ---------- User admin functions ----------
DROP FUNCTION public.admin_list_users(TEXT, INT);
DROP FUNCTION public.admin_set_admin(UUID, BOOLEAN);

CREATE FUNCTION public.admin_list_users(p_search TEXT DEFAULT NULL, p_status TEXT DEFAULT NULL, p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (id UUID, email TEXT, name TEXT, created_at TIMESTAMPTZ, role TEXT, suspended BOOLEAN, total BIGINT)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NOT public.has_admin_perm('users.read') THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
    WITH f AS (
      SELECT u.id, u.email::TEXT AS email, (u.profile->>'name')::TEXT AS name, u.created_at, a.role, (s.user_id IS NOT NULL) AS suspended
      FROM auth.users u
      LEFT JOIN public.admins a ON a.user_id = u.id
      LEFT JOIN public.user_suspensions s ON s.user_id = u.id
      WHERE (p_search IS NULL OR u.email ILIKE '%' || p_search || '%' OR u.profile->>'name' ILIKE '%' || p_search || '%' OR u.id::TEXT = p_search)
        AND (p_status IS NULL
          OR (p_status = 'suspended' AND s.user_id IS NOT NULL)
          OR (p_status = 'active' AND s.user_id IS NULL)
          OR (p_status = 'staff' AND a.user_id IS NOT NULL))
    )
    SELECT f.*, count(*) OVER () FROM f
    ORDER BY f.created_at DESC
    LIMIT LEAST(GREATEST(p_limit, 1), 200) OFFSET GREATEST(p_offset, 0);
END $$;

CREATE FUNCTION public.admin_get_user(p_user UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v JSONB;
BEGIN
  IF NOT public.has_admin_perm('users.read') THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT jsonb_build_object(
    'id', u.id, 'email', u.email, 'name', u.profile->>'name', 'avatar', u.profile->>'avatar_url',
    'email_verified', u.email_verified, 'created_at', u.created_at, 'updated_at', u.updated_at,
    'role', a.role,
    'suspension', CASE WHEN s.user_id IS NULL THEN NULL ELSE jsonb_build_object('reason', s.reason, 'at', s.suspended_at, 'by', (SELECT email FROM auth.users WHERE id = s.suspended_by)) END
  ) INTO v
  FROM auth.users u
  LEFT JOIN public.admins a ON a.user_id = u.id
  LEFT JOIN public.user_suspensions s ON s.user_id = u.id
  WHERE u.id = p_user;
  RETURN v;
END $$;

-- Roles: super admins only. Nobody changes their own role, and the last super admin cannot be demoted.
CREATE FUNCTION public.admin_set_role(p_user UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_old TEXT;
BEGIN
  IF NOT public.has_admin_perm('roles') THEN RAISE EXCEPTION 'Only a super admin can change roles' USING ERRCODE = '42501'; END IF;
  IF p_user = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own role'; END IF;
  IF p_role IS NOT NULL AND p_role NOT IN ('super_admin', 'admin', 'support', 'moderator', 'analyst') THEN RAISE EXCEPTION 'Unknown role'; END IF;
  SELECT role INTO v_old FROM public.admins WHERE user_id = p_user;
  IF v_old = 'super_admin' AND COALESCE(p_role, '') <> 'super_admin'
     AND (SELECT count(*) FROM public.admins WHERE role = 'super_admin') <= 1 THEN
    RAISE EXCEPTION 'At least one super admin must remain';
  END IF;
  IF p_role IS NULL THEN
    DELETE FROM public.admins WHERE user_id = p_user;
  ELSE
    INSERT INTO public.admins (user_id, role) VALUES (p_user, p_role) ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;
  INSERT INTO public.audit_log (actor, table_name, action, row_key, before, after)
  VALUES (auth.uid(), 'admins', 'ROLE', p_user::TEXT, to_jsonb(v_old), to_jsonb(p_role));
END $$;

-- Suspension: staff with 'users.suspend'. Staff accounts cannot be suspended; demote them first.
CREATE FUNCTION public.admin_set_suspended(p_user UUID, p_suspended BOOLEAN, p_reason TEXT DEFAULT '')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NOT public.has_admin_perm('users.suspend') THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  IF p_suspended THEN
    IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user) THEN RAISE EXCEPTION 'Staff accounts cannot be suspended; remove their role first'; END IF;
    INSERT INTO public.user_suspensions (user_id, reason, suspended_by) VALUES (p_user, left(COALESCE(p_reason, ''), 500), auth.uid())
    ON CONFLICT (user_id) DO UPDATE SET reason = EXCLUDED.reason, suspended_by = EXCLUDED.suspended_by, suspended_at = NOW();
  ELSE
    DELETE FROM public.user_suspensions WHERE user_id = p_user;
  END IF;
  INSERT INTO public.audit_log (actor, table_name, action, row_key, after)
  VALUES (auth.uid(), 'users', CASE WHEN p_suspended THEN 'SUSPEND' ELSE 'REACTIVATE' END, p_user::TEXT,
          CASE WHEN p_suspended THEN jsonb_build_object('reason', p_reason) END);
END $$;

REVOKE ALL ON FUNCTION public.admin_list_users(TEXT, TEXT, INT, INT), public.admin_get_user(UUID),
  public.admin_set_role(UUID, TEXT), public.admin_set_suspended(UUID, BOOLEAN, TEXT),
  public.my_admin_perms(), public.has_admin_perm(TEXT), public.admin_role(), public.is_active_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, TEXT, INT, INT), public.admin_get_user(UUID),
  public.admin_set_role(UUID, TEXT), public.admin_set_suspended(UUID, BOOLEAN, TEXT),
  public.my_admin_perms(), public.has_admin_perm(TEXT), public.admin_role(), public.is_active_user() TO authenticated;
