-- Card layouts: how the card is arranged (independent of the colour theme).
ALTER TABLE public.cards ADD COLUMN layout TEXT NOT NULL DEFAULT 'classic'
  CHECK (layout IN ('classic', 'centered', 'links', 'hero'));
GRANT INSERT (layout), UPDATE (layout) ON public.cards TO authenticated;

CREATE OR REPLACE FUNCTION public.get_public_card(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT CASE
    WHEN c.status = 'active' THEN jsonb_build_object(
      'status', 'active', 'slug', c.slug, 'locale', c.locale, 'theme', c.theme, 'layout', c.layout, 'name', c.name, 'tagline', c.tagline,
      'description', c.description, 'phone', c.phone, 'email', c.email, 'website', c.website, 'address', c.address,
      'hours', c.hours, 'socials', c.socials, 'links', c.links, 'gallery', c.gallery,
      'logo_url', c.logo_url, 'photo_url', c.photo_url, 'updated_at', c.updated_at)
    WHEN c.status IN ('suspended', 'draft') THEN jsonb_build_object('status', c.status, 'slug', c.slug, 'locale', c.locale, 'name', c.name)
    ELSE NULL
  END
  FROM public.cards c WHERE c.slug = lower(p_slug);
$$;
