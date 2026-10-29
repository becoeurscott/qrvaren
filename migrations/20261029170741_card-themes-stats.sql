-- Card themes (visual templates) and finer stats: QR scans vs link opens, and button taps.

-- ---------- Theme ----------
ALTER TABLE public.cards ADD COLUMN theme TEXT NOT NULL DEFAULT 'lavender'
  CHECK (theme IN ('lavender', 'midnight', 'minimal', 'sunset'));
GRANT INSERT (theme), UPDATE (theme) ON public.cards TO authenticated;

CREATE OR REPLACE FUNCTION public.get_public_card(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT CASE
    WHEN c.status = 'active' THEN jsonb_build_object(
      'status', 'active', 'slug', c.slug, 'locale', c.locale, 'theme', c.theme, 'name', c.name, 'tagline', c.tagline,
      'description', c.description, 'phone', c.phone, 'email', c.email, 'website', c.website, 'address', c.address,
      'hours', c.hours, 'socials', c.socials, 'links', c.links, 'gallery', c.gallery,
      'logo_url', c.logo_url, 'photo_url', c.photo_url, 'updated_at', c.updated_at)
    WHEN c.status IN ('suspended', 'draft') THEN jsonb_build_object('status', c.status, 'slug', c.slug, 'locale', c.locale, 'name', c.name)
    ELSE NULL
  END
  FROM public.cards c WHERE c.slug = lower(p_slug);
$$;

-- ---------- Views: QR scans counted apart (views stays the total) ----------
ALTER TABLE public.card_view_daily ADD COLUMN scans INT NOT NULL DEFAULT 0;

DROP FUNCTION public.record_card_view(TEXT);
CREATE FUNCTION public.record_card_view(p_slug TEXT, p_source TEXT DEFAULT 'link')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_id UUID; v_scan INT := CASE WHEN p_source = 'qr' THEN 1 ELSE 0 END;
BEGIN
  SELECT id INTO v_id FROM public.cards WHERE slug = lower(p_slug) AND status = 'active';
  IF v_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.card_view_daily (card_id, day, views, scans) VALUES (v_id, CURRENT_DATE, 1, v_scan)
  ON CONFLICT (card_id, day) DO UPDATE
    SET views = public.card_view_daily.views + 1, scans = public.card_view_daily.scans + v_scan;
END $$;

-- ---------- Button taps (daily aggregate per card and button) ----------
CREATE TABLE public.card_click_daily (
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('call', 'save', 'directions', 'website', 'email', 'link',
    'instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'youtube', 'whatsapp')),
  clicks INT NOT NULL DEFAULT 0,
  PRIMARY KEY (card_id, day, target)
);
ALTER TABLE public.card_click_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.card_click_daily FOR SELECT TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.cards c WHERE c.id = card_id AND c.owner_id = (SELECT auth.uid())));
REVOKE ALL ON public.card_click_daily FROM anon, authenticated;
GRANT SELECT ON public.card_click_daily TO authenticated;

CREATE FUNCTION public.record_card_click(p_slug TEXT, p_target TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE v_id UUID;
BEGIN
  IF p_target NOT IN ('call', 'save', 'directions', 'website', 'email', 'link',
    'instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'youtube', 'whatsapp') THEN RETURN; END IF;
  SELECT id INTO v_id FROM public.cards WHERE slug = lower(p_slug) AND status = 'active';
  IF v_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.card_click_daily (card_id, day, target, clicks) VALUES (v_id, CURRENT_DATE, p_target, 1)
  ON CONFLICT (card_id, day, target) DO UPDATE SET clicks = public.card_click_daily.clicks + 1;
END $$;

REVOKE ALL ON FUNCTION public.record_card_view(TEXT, TEXT), public.record_card_click(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_card_view(TEXT, TEXT), public.record_card_click(TEXT, TEXT) TO anon, authenticated;
