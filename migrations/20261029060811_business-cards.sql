-- Phase 2: hosted business cards (one per account), public by slug on <slug>.qrvaren.online,
-- activated by a Stripe subscription, suspended for a grace period when it ends.

-- ---------- Reserved slugs (also used as subdomains, keep in sync with infra/card-subdomains) ----------
CREATE TABLE public.reserved_slugs (slug TEXT PRIMARY KEY);
INSERT INTO public.reserved_slugs (slug) VALUES
  ('www'), ('admin'), ('api'), ('app'), ('c'), ('mail'), ('email'), ('smtp'), ('ftp'), ('cdn'), ('static'),
  ('status'), ('help'), ('support'), ('blog'), ('dashboard'), ('login'), ('qrvaren'), ('create'), ('pricing'),
  ('privacy'), ('terms'), ('panel'), ('card'), ('cards'), ('cartes'), ('tarjetas');

-- ---------- Cards ----------
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'hidden')),
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es', 'fr')),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  tagline TEXT CHECK (char_length(tagline) <= 120),
  description TEXT CHECK (char_length(description) <= 1000),
  phone TEXT CHECK (char_length(phone) <= 40),
  email TEXT CHECK (char_length(email) <= 120),
  website TEXT CHECK (website IS NULL OR (website ~ '^https?://' AND char_length(website) <= 300)),
  address TEXT CHECK (char_length(address) <= 200),
  -- Small, whole-object fields read and written with the card.
  hours JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(hours) = 'array' AND jsonb_array_length(hours) <= 7),
  socials JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(socials) = 'object'),
  links JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(links) = 'array' AND jsonb_array_length(links) <= 8),
  gallery JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(gallery) = 'array' AND jsonb_array_length(gallery) <= 8),
  logo_url TEXT, logo_key TEXT,
  photo_url TEXT, photo_key TEXT,
  -- Server-maintained (Stripe webhooks, admin, purge job). Users cannot write these columns.
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  paid_until TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX cards_status_expires_idx ON public.cards (status, expires_at);

CREATE TRIGGER cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- Slug: lowercased, not reserved, and frozen after creation (printed QR codes must keep working).
CREATE OR REPLACE FUNCTION public.cards_guard_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.slug := lower(NEW.slug);
    IF EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = NEW.slug) THEN
      RAISE EXCEPTION 'slug_reserved' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'slug_frozen' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cards_guard_slug BEFORE INSERT OR UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.cards_guard_slug();

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.cards FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "owner create" ON public.cards FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()) AND status = 'draft');
CREATE POLICY "owner edit" ON public.cards FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (owner_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "owner delete" ON public.cards FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()) OR public.is_admin());

-- Column grants: users write content only; status, plan and dates stay server-owned.
REVOKE ALL ON public.cards FROM anon, authenticated;
GRANT SELECT, DELETE ON public.cards TO authenticated;
GRANT INSERT (owner_id, slug, locale, name, tagline, description, phone, email, website, address, hours, socials, links, gallery,
              logo_url, logo_key, photo_url, photo_key) ON public.cards TO authenticated;
GRANT UPDATE (locale, name, tagline, description, phone, email, website, address, hours, socials, links, gallery,
              logo_url, logo_key, photo_url, photo_key) ON public.cards TO authenticated;
REVOKE ALL ON public.reserved_slugs FROM anon, authenticated;

-- Is this slug free? (format, reserved list, taken)
CREATE OR REPLACE FUNCTION public.slug_available(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT lower(p_slug) ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
     AND NOT EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = lower(p_slug))
     AND NOT EXISTS (SELECT 1 FROM public.cards WHERE slug = lower(p_slug));
$$;

-- Public page data: only what the card shows. Suspended cards return a minimal stub.
CREATE OR REPLACE FUNCTION public.get_public_card(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT CASE
    WHEN c.status = 'active' THEN jsonb_build_object(
      'status', 'active', 'slug', c.slug, 'locale', c.locale, 'name', c.name, 'tagline', c.tagline,
      'description', c.description, 'phone', c.phone, 'email', c.email, 'website', c.website, 'address', c.address,
      'hours', c.hours, 'socials', c.socials, 'links', c.links, 'gallery', c.gallery,
      'logo_url', c.logo_url, 'photo_url', c.photo_url, 'updated_at', c.updated_at)
    WHEN c.status = 'suspended' THEN jsonb_build_object('status', 'suspended', 'slug', c.slug, 'locale', c.locale, 'name', c.name)
    ELSE NULL
  END
  FROM public.cards c WHERE c.slug = lower(p_slug);
$$;

-- ---------- Views (daily aggregate, one row per card per day) ----------
CREATE TABLE public.card_view_daily (
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  views INT NOT NULL DEFAULT 0,
  PRIMARY KEY (card_id, day)
);
ALTER TABLE public.card_view_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.card_view_daily FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.cards c WHERE c.id = card_id AND c.owner_id = (SELECT auth.uid())));
REVOKE ALL ON public.card_view_daily FROM anon, authenticated;
GRANT SELECT ON public.card_view_daily TO authenticated;

CREATE OR REPLACE FUNCTION public.record_card_view(p_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.cards WHERE slug = lower(p_slug) AND status = 'active';
  IF v_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.card_view_daily (card_id, day, views) VALUES (v_id, CURRENT_DATE, 1)
  ON CONFLICT (card_id, day) DO UPDATE SET views = public.card_view_daily.views + 1;
END $$;

-- ---------- Reports (moderation queue) ----------
CREATE TABLE public.card_reports (
  id BIGSERIAL PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX card_reports_open_idx ON public.card_reports (status, created_at DESC);
ALTER TABLE public.card_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.card_reports FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE ALL ON public.card_reports FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.card_reports TO authenticated;

-- Anyone can report an active card; at most 20 open reports per card are kept.
CREATE OR REPLACE FUNCTION public.report_card(p_slug TEXT, p_reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.cards WHERE slug = lower(p_slug) AND status = 'active';
  IF v_id IS NULL OR char_length(coalesce(trim(p_reason), '')) = 0 THEN RETURN FALSE; END IF;
  IF (SELECT count(*) FROM public.card_reports WHERE card_id = v_id AND status = 'open') >= 20 THEN RETURN TRUE; END IF;
  INSERT INTO public.card_reports (card_id, reason) VALUES (v_id, left(trim(p_reason), 500));
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.slug_available(TEXT), public.get_public_card(TEXT), public.record_card_view(TEXT), public.report_card(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.slug_available(TEXT), public.get_public_card(TEXT), public.record_card_view(TEXT), public.report_card(TEXT, TEXT) TO anon, authenticated;

-- ---------- Stripe: who may start checkout / portal (billing subject = the user) ----------
ALTER TABLE payments.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.stripe_customer_portal_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users create their stripe checkout sessions" ON payments.stripe_checkout_sessions
  FOR INSERT TO authenticated WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);
CREATE POLICY "users read their stripe checkout sessions" ON payments.stripe_checkout_sessions
  FOR SELECT TO authenticated USING (subject_type = 'user' AND subject_id = auth.uid()::text);
CREATE POLICY "users create their stripe portal sessions" ON payments.stripe_customer_portal_sessions
  FOR INSERT TO authenticated WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);
CREATE POLICY "users read their stripe portal sessions" ON payments.stripe_customer_portal_sessions
  FOR SELECT TO authenticated USING (subject_type = 'user' AND subject_id = auth.uid()::text);

-- ---------- Stripe: activate / suspend the card from verified webhook events ----------
-- invoice.paid activates (or renews) the card; subscription deleted or canceled/unpaid suspends it
-- for card.grace_days (settings, default 30), after which purge_expired_cards() deletes it.
CREATE TABLE public.billing_dead_letters (
  id BIGSERIAL PRIMARY KEY,
  provider_event_id TEXT,
  event_type TEXT,
  reason TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.billing_dead_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read" ON public.billing_dead_letters FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON public.billing_dead_letters FROM anon, authenticated;
GRANT SELECT ON public.billing_dead_letters TO authenticated;

CREATE OR REPLACE FUNCTION public.card_billing_from_stripe()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  o JSONB := NEW.payload -> 'data' -> 'object';
  v_type TEXT;
  v_user TEXT;
  v_end BIGINT;
  v_interval TEXT;
  v_grace INT;
BEGIN
  IF NEW.provider <> 'stripe' OR NEW.processing_status <> 'processed'
     OR NEW.event_type NOT IN ('invoice.paid', 'customer.subscription.deleted', 'customer.subscription.updated') THEN
    RETURN NEW;
  END IF;

  -- Billing subject: subscription metadata on the event first, then the customer mapping.
  v_type := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_type',
                     o -> 'metadata' ->> 'insforge_subject_type');
  v_user := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_id',
                     o -> 'metadata' ->> 'insforge_subject_id');
  IF v_user IS NULL THEN
    SELECT m.subject_type, m.subject_id INTO v_type, v_user
    FROM payments.customer_mappings m
    WHERE m.provider = NEW.provider AND m.environment = NEW.environment AND m.provider_customer_id = o ->> 'customer';
  END IF;
  IF v_user IS NULL OR v_type IS DISTINCT FROM 'user' THEN
    INSERT INTO public.billing_dead_letters (provider_event_id, event_type, reason)
    VALUES (NEW.provider_event_id, NEW.event_type, 'no user billing subject');
    RETURN NEW;
  END IF;

  IF NEW.event_type = 'invoice.paid' THEN
    v_end := (o -> 'lines' -> 'data' -> 0 -> 'period' ->> 'end')::BIGINT;
    v_interval := o -> 'lines' -> 'data' -> 0 -> 'pricing' -> 'price_details' ->> 'interval';
    IF v_interval IS NULL THEN v_interval := o -> 'lines' -> 'data' -> 0 -> 'price' -> 'recurring' ->> 'interval'; END IF;
    UPDATE public.cards SET
      status = CASE WHEN status = 'hidden' THEN 'hidden' ELSE 'active' END,
      plan = CASE WHEN v_interval = 'year' THEN 'yearly' WHEN v_interval = 'month' THEN 'monthly' ELSE plan END,
      paid_until = CASE WHEN v_end IS NOT NULL THEN to_timestamp(v_end) ELSE paid_until END,
      suspended_at = NULL,
      expires_at = NULL
    WHERE owner_id::text = v_user;
  ELSIF NEW.event_type = 'customer.subscription.deleted'
     OR (NEW.event_type = 'customer.subscription.updated' AND o ->> 'status' IN ('canceled', 'unpaid', 'incomplete_expired')) THEN
    SELECT COALESCE((value #>> '{}')::INT, 30) INTO v_grace FROM public.settings WHERE key = 'card.grace_days';
    UPDATE public.cards SET
      status = CASE WHEN status = 'active' THEN 'suspended' ELSE status END,
      suspended_at = COALESCE(suspended_at, NOW()),
      expires_at = COALESCE(expires_at, NOW() + make_interval(days => COALESCE(v_grace, 30)))
    WHERE owner_id::text = v_user AND status IN ('active', 'draft');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER card_billing_from_stripe
  AFTER INSERT OR UPDATE OF processing_status ON payments.webhook_events
  FOR EACH ROW EXECUTE FUNCTION public.card_billing_from_stripe();

-- Deletes cards whose grace period is over (run daily by a schedule). Returns storage keys to remove.
CREATE OR REPLACE FUNCTION public.purge_expired_cards()
RETURNS TABLE (card_id UUID, keys TEXT[])
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  DELETE FROM public.cards c
  WHERE c.status = 'suspended' AND c.expires_at IS NOT NULL AND c.expires_at < NOW()
  RETURNING c.id, array_remove(ARRAY[c.logo_key, c.photo_key] ||
    ARRAY(SELECT g ->> 'key' FROM jsonb_array_elements(c.gallery) g), NULL);
END $$;
REVOKE ALL ON FUNCTION public.purge_expired_cards() FROM PUBLIC, anon, authenticated;

-- ---------- Settings used by the card flow (editable in admin) ----------
INSERT INTO public.settings (key, value) VALUES
  ('stripe.environment', '"live"'),
  ('stripe.price.card_monthly', '""'),
  ('stripe.price.card_yearly', '""')
ON CONFLICT (key) DO NOTHING;
