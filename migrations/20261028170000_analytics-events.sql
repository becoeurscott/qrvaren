-- Site analytics: one row per event (page view, QR download, sign-in...). Written through
-- track_event() only, read through analytics_summary() by admins only.

CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL CHECK (name ~ '^[a-z0-9_]{1,40}$'),
  path TEXT,
  locale TEXT,
  qr_type TEXT,
  fmt TEXT,
  session_id TEXT,          -- random per-tab id, only sent when the visitor accepted analytics
  user_id UUID,
  referrer_host TEXT,
  device TEXT CHECK (device IS NULL OR device IN ('mobile', 'tablet', 'desktop')),
  country TEXT
);
CREATE INDEX events_at_idx ON public.events (at DESC);
CREATE INDEX events_name_at_idx ON public.events (name, at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read" ON public.events FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.events FROM anon, authenticated;
GRANT SELECT ON public.events TO authenticated;

CREATE OR REPLACE FUNCTION public.track_event(p JSONB)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF COALESCE(p->>'name', '') !~ '^[a-z0-9_]{1,40}$' THEN RETURN; END IF;
  INSERT INTO public.events (name, path, locale, qr_type, fmt, session_id, user_id, referrer_host, device, country)
  VALUES (
    p->>'name',
    left(p->>'path', 200),
    left(p->>'locale', 5),
    left(p->>'qr_type', 30),
    left(p->>'fmt', 10),
    left(p->>'session_id', 40),
    auth.uid(),
    left(p->>'referrer_host', 100),
    CASE WHEN p->>'device' IN ('mobile', 'tablet', 'desktop') THEN p->>'device' END,
    left(upper(p->>'country'), 2)
  );
END $$;

-- Everything the admin dashboard shows, in one round trip.
CREATE OR REPLACE FUNCTION public.analytics_summary(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_since TIMESTAMPTZ := date_trunc('day', NOW()) - make_interval(days => GREATEST(LEAST(p_days, 365), 1) - 1);
  v_users JSONB := NULL;
  v_out JSONB;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;

  BEGIN
    SELECT jsonb_build_object('total', count(*), 'new', count(*) FILTER (WHERE created_at >= v_since)) INTO v_users FROM auth.users;
  EXCEPTION WHEN OTHERS THEN v_users := NULL;
  END;

  WITH e AS (SELECT * FROM public.events WHERE at >= v_since),
  days AS (SELECT generate_series(v_since, date_trunc('day', NOW()), '1 day')::DATE AS day)
  SELECT jsonb_build_object(
    'since', v_since,
    'users', v_users,
    'totals', (SELECT jsonb_build_object(
      'pageviews', count(*) FILTER (WHERE name = 'pageview'),
      'visitors', count(DISTINCT session_id),
      'downloads', count(*) FILTER (WHERE name = 'qr_download'),
      'signins', count(*) FILTER (WHERE name = 'sign_in')) FROM e),
    'adClicks', (SELECT COALESCE(sum(clicks), 0) FROM public.ad_click_daily WHERE day >= v_since::DATE),
    'daily', (SELECT jsonb_agg(jsonb_build_object(
        'day', d.day,
        'pageviews', (SELECT count(*) FROM e WHERE e.at::DATE = d.day AND name = 'pageview'),
        'downloads', (SELECT count(*) FROM e WHERE e.at::DATE = d.day AND name = 'qr_download')) ORDER BY d.day) FROM days d),
    'pages', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT path AS k, count(*) AS n FROM e WHERE name = 'pageview' GROUP BY path ORDER BY n DESC LIMIT 10) x),
    'qrTypes', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT COALESCE(qr_type, '?') AS k, count(*) AS n FROM e WHERE name = 'qr_download' GROUP BY 1 ORDER BY n DESC LIMIT 10) x),
    'formats', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT COALESCE(fmt, '?') AS k, count(*) AS n FROM e WHERE name = 'qr_download' GROUP BY 1) x),
    'referrers', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT referrer_host AS k, count(*) AS n FROM e WHERE name = 'pageview' AND referrer_host IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 10) x),
    'devices', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT COALESCE(device, '?') AS k, count(*) AS n FROM e WHERE name = 'pageview' GROUP BY 1) x),
    'countries', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT country AS k, count(*) AS n FROM e WHERE name = 'pageview' AND country IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 10) x),
    'locales', (SELECT COALESCE(jsonb_agg(x ORDER BY x.n DESC), '[]') FROM (SELECT COALESCE(locale, '?') AS k, count(*) AS n FROM e WHERE name = 'pageview' GROUP BY 1) x),
    'recent', (SELECT COALESCE(jsonb_agg(x), '[]') FROM (SELECT at, name, path, qr_type, fmt, device, country FROM public.events ORDER BY at DESC LIMIT 25) x)
  ) INTO v_out;
  RETURN v_out;
END $$;

REVOKE ALL ON FUNCTION public.track_event(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_event(JSONB) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_summary(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_summary(INT) TO authenticated;
