-- A draft card's link used to answer "doesn't exist", which confused owners opening their own link.
-- Drafts now return their name only, like suspended cards, so the page can say "not published yet".
CREATE OR REPLACE FUNCTION public.get_public_card(p_slug text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT CASE
    WHEN c.status = 'active' THEN jsonb_build_object(
      'status', 'active', 'slug', c.slug, 'locale', c.locale, 'name', c.name, 'tagline', c.tagline,
      'description', c.description, 'phone', c.phone, 'email', c.email, 'website', c.website, 'address', c.address,
      'hours', c.hours, 'socials', c.socials, 'links', c.links, 'gallery', c.gallery,
      'logo_url', c.logo_url, 'photo_url', c.photo_url, 'updated_at', c.updated_at)
    WHEN c.status IN ('suspended', 'draft') THEN jsonb_build_object('status', c.status, 'slug', c.slug, 'locale', c.locale, 'name', c.name)
    ELSE NULL
  END
  FROM public.cards c WHERE c.slug = lower(p_slug);
$$;
