-- Phase 1: entitlements engine, ad slots, admin, audit log.
-- Nothing "free vs paid" is hard-coded: the app only asks can(user, feature).

-- ---------- Admin ----------
CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$ SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) $$;

-- ---------- Entitlements ----------
CREATE TABLE public.features (
  key TEXT PRIMARY KEY CHECK (key ~ '^[a-z0-9_.]+$'),
  description TEXT NOT NULL DEFAULT ''
);

-- audience: which plan applies by default to anonymous visitors / signed-in users without subscription.
CREATE TABLE public.plans (
  key TEXT PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+$'),
  name TEXT NOT NULL,
  audience TEXT CHECK (audience IN ('visitor', 'signed_in')),
  sort INT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX plans_audience_unique ON public.plans (audience) WHERE audience IS NOT NULL;

-- limit_count: quota (NULL = unlimited). lifetime_days: how long stored content lives (NULL = forever).
CREATE TABLE public.plan_features (
  plan_key TEXT NOT NULL REFERENCES public.plans(key) ON DELETE CASCADE ON UPDATE CASCADE,
  feature_key TEXT NOT NULL REFERENCES public.features(key) ON DELETE CASCADE ON UPDATE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  limit_count INT CHECK (limit_count IS NULL OR limit_count >= 0),
  lifetime_days INT CHECK (lifetime_days IS NULL OR lifetime_days > 0),
  PRIMARY KEY (plan_key, feature_key)
);
CREATE INDEX plan_features_feature_idx ON public.plan_features (feature_key);

-- Small global settings (prices, grace period, cache version). Values are small JSON scalars.
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Ads / promo slots ----------
CREATE TABLE public.ad_slots (
  key TEXT PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+$'),
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public.ad_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key TEXT NOT NULL REFERENCES public.ad_slots(key) ON DELETE CASCADE ON UPDATE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('promo', 'adsense')),
  locale TEXT CHECK (locale IN ('en', 'es', 'fr')),       -- NULL = all locales
  pages TEXT[],                                           -- NULL = all pages (e.g. 'home', 'wifi-qr-code')
  plans TEXT[],                                           -- NULL = all plans
  title TEXT,
  body TEXT,
  image_url TEXT,
  link_url TEXT CHECK (link_url IS NULL OR link_url ~ '^https?://'),
  cta TEXT,
  adsense_client TEXT,
  adsense_slot TEXT,
  priority INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'promo' OR (title IS NOT NULL AND link_url IS NOT NULL)),
  CHECK (kind <> 'adsense' OR (adsense_client IS NOT NULL AND adsense_slot IS NOT NULL))
);
CREATE INDEX ad_blocks_slot_idx ON public.ad_blocks (slot_key, enabled, priority DESC);

CREATE TRIGGER ad_blocks_updated_at BEFORE UPDATE ON public.ad_blocks
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- Daily aggregates: one row per block per day, so a traffic spike is cheap.
CREATE TABLE public.ad_click_daily (
  block_id UUID NOT NULL REFERENCES public.ad_blocks(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  PRIMARY KEY (block_id, day)
);

CREATE OR REPLACE FUNCTION public.record_ad_click(p_block_id UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_url TEXT;
BEGIN
  SELECT link_url INTO v_url FROM public.ad_blocks WHERE id = p_block_id AND enabled AND kind = 'promo';
  IF v_url IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.ad_click_daily (block_id, day, clicks) VALUES (p_block_id, CURRENT_DATE, 1)
  ON CONFLICT (block_id, day) DO UPDATE SET clicks = public.ad_click_daily.clicks + 1;
  RETURN v_url;
END $$;

-- ---------- Audit log ----------
CREATE TABLE public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor UUID,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  row_key TEXT,
  before JSONB,
  after JSONB,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX audit_log_at_idx ON public.audit_log (at DESC);

-- Every config change is logged and bumps settings.config_version, which invalidates app caches.
CREATE OR REPLACE FUNCTION public.audit_config_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_row JSONB := to_jsonb(COALESCE(NEW, OLD));
BEGIN
  INSERT INTO public.audit_log (actor, table_name, action, row_key, before, after)
  VALUES (
    auth.uid(), TG_TABLE_NAME, TG_OP,
    COALESCE(v_row->>'key', v_row->>'id', concat_ws(':', v_row->>'plan_key', v_row->>'feature_key')),
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END
  );
  IF TG_TABLE_NAME <> 'settings' OR v_row->>'key' <> 'config_version' THEN
    INSERT INTO public.settings (key, value) VALUES ('config_version', to_jsonb(extract(epoch FROM clock_timestamp())::BIGINT))
    ON CONFLICT (key) DO UPDATE SET value = to_jsonb(extract(epoch FROM clock_timestamp())::BIGINT), updated_at = NOW();
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER audit_features AFTER INSERT OR UPDATE OR DELETE ON public.features FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_plans AFTER INSERT OR UPDATE OR DELETE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_plan_features AFTER INSERT OR UPDATE OR DELETE ON public.plan_features FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_settings AFTER INSERT OR UPDATE OR DELETE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_ad_slots AFTER INSERT OR UPDATE OR DELETE ON public.ad_slots FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_ad_blocks AFTER INSERT OR UPDATE OR DELETE ON public.ad_blocks FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();

-- ---------- RLS ----------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_click_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Public config: readable by everyone (the generator needs it without an account).
CREATE POLICY "public read" ON public.features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.plan_features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.ad_slots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read enabled" ON public.ad_blocks FOR SELECT TO anon, authenticated USING (enabled OR public.is_admin());
CREATE POLICY "public read" ON public.settings FOR SELECT TO anon, authenticated USING (true);

-- Admin-only writes and reads of private tables.
CREATE POLICY "admin write" ON public.features FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write" ON public.plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write" ON public.plan_features FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write" ON public.ad_slots FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write" ON public.ad_blocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin read" ON public.ad_click_daily FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin read" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "self read" ON public.admins FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON public.admins, public.features, public.plans, public.plan_features, public.settings,
  public.ad_slots, public.ad_blocks, public.ad_click_daily, public.audit_log FROM anon, authenticated;
GRANT SELECT ON public.features, public.plans, public.plan_features, public.settings, public.ad_slots, public.ad_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.features, public.plans, public.plan_features, public.settings, public.ad_slots, public.ad_blocks TO authenticated;
GRANT SELECT ON public.ad_click_daily, public.audit_log, public.admins TO authenticated;
REVOKE ALL ON FUNCTION public.record_ad_click(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_ad_click(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ---------- Seed (defaults from the spec, editable in admin) ----------
INSERT INTO public.features (key, description) VALUES
  ('qr.type.url', 'URL QR code'), ('qr.type.wifi', 'WiFi QR code'), ('qr.type.text', 'Text QR code'),
  ('qr.type.vcard', 'vCard QR code'), ('qr.type.email', 'Email QR code'), ('qr.type.sms', 'SMS QR code'),
  ('qr.type.pdf', 'PDF QR code (stored file)'), ('qr.type.card', 'Business card QR code'),
  ('qr.custom.colors', 'Custom colors'), ('qr.custom.dots', 'Module shapes'), ('qr.custom.logo', 'Center logo'), ('qr.custom.frame', 'Frame with text'),
  ('export.png', 'PNG export'), ('export.svg', 'SVG export'), ('export.pdf', 'PDF export'),
  ('qr.redirect', 'Redirected (trackable) QR'), ('qr.scan_stats', 'Scan statistics'),
  ('card.create', 'Hosted business card');

INSERT INTO public.plans (key, name, audience, sort) VALUES
  ('visitor', 'Visitor', 'visitor', 0),
  ('signed_in', 'Signed in', 'signed_in', 1),
  ('card', 'Business card', NULL, 2);

-- Visitor: every direct type, all customization and exports.
INSERT INTO public.plan_features (plan_key, feature_key)
SELECT 'visitor', key FROM public.features
WHERE key IN ('qr.type.url','qr.type.wifi','qr.type.text','qr.type.vcard','qr.type.email','qr.type.sms',
              'qr.custom.colors','qr.custom.dots','qr.custom.logo','qr.custom.frame','export.png','export.svg','export.pdf');
-- Signed in: visitor + PDF and trackable links, with quotas and lifetimes.
INSERT INTO public.plan_features (plan_key, feature_key, limit_count, lifetime_days)
SELECT 'signed_in', feature_key, NULL, NULL FROM public.plan_features WHERE plan_key = 'visitor';
INSERT INTO public.plan_features (plan_key, feature_key, limit_count, lifetime_days) VALUES
  ('signed_in', 'qr.type.pdf', 3, 30), ('signed_in', 'qr.redirect', 5, NULL), ('signed_in', 'qr.scan_stats', NULL, NULL);
-- Card plan: signed in + one hosted card.
INSERT INTO public.plan_features (plan_key, feature_key, limit_count, lifetime_days)
SELECT 'card', feature_key, limit_count, lifetime_days FROM public.plan_features WHERE plan_key = 'signed_in';
INSERT INTO public.plan_features (plan_key, feature_key, limit_count) VALUES ('card', 'card.create', 1), ('card', 'qr.type.card', NULL);
UPDATE public.plan_features SET limit_count = 20, lifetime_days = 365 WHERE plan_key = 'card' AND feature_key = 'qr.type.pdf';

INSERT INTO public.settings (key, value) VALUES
  ('price.card.monthly_usd', '3'), ('price.card.yearly_usd', '30'),
  ('card.grace_days', '30'), ('config_cache_seconds', '60');

INSERT INTO public.ad_slots (key, label) VALUES
  ('below_generator', 'Below the generator'),
  ('after_download', 'After a download'),
  ('card_footer', 'Bottom of business card pages');
