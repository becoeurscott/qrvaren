-- Phase 2b: link-in-bio pages next to business cards, and full design customisation for both.
-- One row per product per account (kind = 'card' | 'bio'), same slugs/URLs, stats and moderation.
-- Billing tells the two subscriptions apart by Stripe price (stripe.price.bio_* in settings).

ALTER TABLE public.cards ADD COLUMN kind TEXT NOT NULL DEFAULT 'card' CHECK (kind IN ('card', 'bio'));
ALTER TABLE public.cards DROP CONSTRAINT cards_owner_id_key;
ALTER TABLE public.cards ADD CONSTRAINT cards_owner_kind_key UNIQUE (owner_id, kind);

-- Design: header layout, background, buttons, fonts and colours (validated in the app, size-capped here).
-- theme now names the preset the design started from ('custom' once edited); layout moved into design.
ALTER TABLE public.cards ADD COLUMN design JSONB NOT NULL DEFAULT '{}'
  CHECK (jsonb_typeof(design) = 'object' AND pg_column_size(design) < 8192);
ALTER TABLE public.cards DROP CONSTRAINT cards_theme_check;
ALTER TABLE public.cards ADD CONSTRAINT cards_theme_check CHECK (theme ~ '^[a-z0-9-]{1,30}$');
UPDATE public.cards SET design = jsonb_build_object('header', jsonb_build_object('layout', CASE layout
  WHEN 'centered' THEN 'banner' WHEN 'links' THEN 'classic' WHEN 'hero' THEN 'hero' ELSE 'banner' END));
ALTER TABLE public.cards DROP COLUMN layout;
GRANT INSERT (kind, design), UPDATE (design) ON public.cards TO authenticated;

-- Expired pages also free their design images.
CREATE OR REPLACE FUNCTION public.purge_expired_cards()
RETURNS TABLE (card_id UUID, keys TEXT[])
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  DELETE FROM public.cards c
  WHERE c.status = 'suspended' AND c.expires_at IS NOT NULL AND c.expires_at < NOW()
  RETURNING c.id, array_remove(ARRAY[c.logo_key, c.photo_key, c.design #>> '{bg,image_key}', c.design #>> '{header,title_logo_key}'] ||
    ARRAY(SELECT g ->> 'key' FROM jsonb_array_elements(c.gallery) g), NULL);
END $$;
REVOKE ALL ON FUNCTION public.purge_expired_cards() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_card(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT CASE
    WHEN c.status = 'active' THEN jsonb_build_object(
      'status', 'active', 'slug', c.slug, 'locale', c.locale, 'kind', c.kind, 'theme', c.theme, 'design', c.design, 'name', c.name, 'tagline', c.tagline,
      'description', c.description, 'phone', c.phone, 'email', c.email, 'website', c.website, 'address', c.address,
      'hours', c.hours, 'socials', c.socials, 'links', c.links, 'gallery', c.gallery,
      'logo_url', c.logo_url, 'photo_url', c.photo_url, 'updated_at', c.updated_at)
    WHEN c.status IN ('suspended', 'draft') THEN jsonb_build_object('status', c.status, 'slug', c.slug, 'locale', c.locale, 'name', c.name)
    ELSE NULL
  END
  FROM public.cards c WHERE c.slug = lower(p_slug);
$$;

CREATE OR REPLACE FUNCTION public.apply_card_billing_event(
  p_provider TEXT, p_environment TEXT, p_event_id TEXT, p_event_type TEXT, p_payload JSONB
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  o JSONB := p_payload -> 'data' -> 'object';
  v_type TEXT;
  v_user TEXT;
  v_end BIGINT;
  v_interval TEXT;
  v_grace INT;
  v_rows INT;
  v_price TEXT;
  v_kind TEXT;
BEGIN
  IF p_provider <> 'stripe' OR p_event_type NOT IN ('invoice.paid', 'customer.subscription.deleted', 'customer.subscription.updated') THEN
    RETURN 'ignored';
  END IF;

  -- Billing subject: subscription metadata on the event first, then the customer mapping.
  v_type := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_type',
                     o -> 'metadata' ->> 'insforge_subject_type');
  v_user := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_id',
                     o -> 'metadata' ->> 'insforge_subject_id');
  IF v_user IS NULL THEN
    SELECT m.subject_type, m.subject_id INTO v_type, v_user
    FROM payments.customer_mappings m
    WHERE m.provider = p_provider AND m.environment = p_environment AND m.provider_customer_id = o ->> 'customer';
  END IF;
  IF v_user IS NULL OR v_type IS DISTINCT FROM 'user' THEN
    INSERT INTO public.billing_dead_letters (provider_event_id, event_type, reason) VALUES (p_event_id, p_event_type, 'no user billing subject');
    RETURN 'dead_letter';
  END IF;

  -- Which product: the bio page's Stripe prices are listed in settings, anything else is the card.
  v_price := COALESCE(o -> 'lines' -> 'data' -> 0 -> 'pricing' -> 'price_details' ->> 'price',
                      o -> 'lines' -> 'data' -> 0 -> 'price' ->> 'id',
                      o -> 'items' -> 'data' -> 0 -> 'price' ->> 'id');
  v_kind := CASE WHEN v_price IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.settings WHERE key IN ('stripe.price.bio_monthly', 'stripe.price.bio_yearly') AND value #>> '{}' = v_price)
    THEN 'bio' ELSE 'card' END;

  IF p_event_type = 'invoice.paid' THEN
    v_end := (o -> 'lines' -> 'data' -> 0 -> 'period' ->> 'end')::BIGINT;
    v_interval := COALESCE(o -> 'lines' -> 'data' -> 0 -> 'pricing' -> 'price_details' ->> 'interval',
                           o -> 'lines' -> 'data' -> 0 -> 'price' -> 'recurring' ->> 'interval');
    UPDATE public.cards SET
      status = CASE WHEN status = 'hidden' THEN 'hidden' ELSE 'active' END,
      plan = CASE WHEN v_interval = 'year' THEN 'yearly' WHEN v_interval = 'month' THEN 'monthly' ELSE plan END,
      paid_until = CASE WHEN v_end IS NOT NULL THEN to_timestamp(v_end) ELSE paid_until END,
      suspended_at = NULL,
      expires_at = NULL
    WHERE owner_id::text = v_user AND kind = v_kind;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN CASE WHEN v_rows > 0 THEN 'activated' ELSE 'no_card' END;
  ELSIF p_event_type = 'customer.subscription.deleted'
     OR (p_event_type = 'customer.subscription.updated' AND o ->> 'status' IN ('canceled', 'unpaid', 'incomplete_expired')) THEN
    SELECT COALESCE((value #>> '{}')::INT, 30) INTO v_grace FROM public.settings WHERE key = 'card.grace_days';
    UPDATE public.cards SET
      status = CASE WHEN status = 'active' THEN 'suspended' ELSE status END,
      suspended_at = COALESCE(suspended_at, NOW()),
      expires_at = COALESCE(expires_at, NOW() + make_interval(days => COALESCE(v_grace, 30)))
    WHERE owner_id::text = v_user AND kind = v_kind AND status IN ('active', 'draft');
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN CASE WHEN v_rows > 0 THEN 'suspended' ELSE 'no_card' END;
  END IF;
  RETURN 'ignored';
END $$;

INSERT INTO public.settings (key, value) VALUES
  ('stripe.price.bio_monthly', '""'),
  ('stripe.price.bio_yearly', '""'),
  ('price.bio.monthly_usd', '2.99'),
  ('price.bio.yearly_usd', '29.99')
ON CONFLICT (key) DO NOTHING;
