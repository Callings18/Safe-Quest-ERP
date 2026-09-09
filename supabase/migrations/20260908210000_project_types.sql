CREATE TABLE IF NOT EXISTS public.project_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.project_types (name, slug, sort_order)
VALUES
  ('Construction', 'construction', 1),
  ('Solar', 'solar', 2),
  ('Maintenance', 'maintenance', 3),
  ('Other', 'other', 4)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view project types" ON public.project_types;
CREATE POLICY "Staff can view project types"
  ON public.project_types FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Staff can manage project types" ON public.project_types;
CREATE POLICY "Staff can manage project types"
  ON public.project_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_types TO authenticated;
GRANT ALL ON public.project_types TO service_role;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'project_type'
      AND udt_name = 'project_type'
  ) THEN
    ALTER TABLE public.projects ALTER COLUMN project_type DROP DEFAULT;
    ALTER TABLE public.projects
      ALTER COLUMN project_type TYPE text
      USING project_type::text;
    ALTER TABLE public.projects ALTER COLUMN project_type SET DEFAULT 'construction';
  END IF;
END $$;
