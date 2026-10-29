-- Ready-made QR code style presets users can start from.
CREATE TABLE IF NOT EXISTS public.qr_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  fg_color text NOT NULL DEFAULT '#000000',
  bg_color text NOT NULL DEFAULT '#FFFFFF',
  dot_style text NOT NULL DEFAULT 'square',
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_templates ENABLE ROW LEVEL SECURITY;

-- Public catalog: anyone can read; writes only via admin/API key.
REVOKE INSERT, UPDATE, DELETE ON public.qr_templates FROM anon, authenticated;
GRANT SELECT ON public.qr_templates TO anon, authenticated;

DROP POLICY IF EXISTS qr_templates_read ON public.qr_templates;
CREATE POLICY qr_templates_read ON public.qr_templates
  FOR SELECT TO anon, authenticated USING (true);
