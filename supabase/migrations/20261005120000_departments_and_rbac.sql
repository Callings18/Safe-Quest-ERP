-- Departments + receptionist role + staff bootstrap (SafeQuest RBAC)

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'receptionist';

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  default_role public.app_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_title TEXT;

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view departments" ON public.departments;
CREATE POLICY "Authenticated can view departments"
  ON public.departments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
CREATE POLICY "Admins manage departments"
  ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

INSERT INTO public.departments (code, name, description, default_role) VALUES
  ('EXEC', 'Executive', 'CEO / owner — full system control', 'admin'),
  ('MGMT', 'Management', 'Day-to-day operations across departments', 'manager'),
  ('FIN', 'Finance & Accounting', 'Bookkeeping, VAT, payroll support', 'accountant'),
  ('RCPT', 'Reception', 'Front desk, CRM, quotations and walk-ins', 'receptionist'),
  ('FIELD', 'Field Operations', 'Technicians, sites, inventory and assets', 'technician'),
  ('LOANS', 'Loans', 'Loan origination, schedules and collections', 'loan_officer'),
  ('HR', 'Human Resources', 'Employees and payroll administration', 'hr')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_role = EXCLUDED.default_role,
  is_active = true;

CREATE OR REPLACE FUNCTION public.bootstrap_staff_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  rec RECORD;
  touched INT := 0;
  confirmed INT := 0;
BEGIN
  UPDATE auth.users u
  SET email_confirmed_at = COALESCE(u.email_confirmed_at, now()),
      updated_at = now()
  WHERE lower(u.email) IN (
    'safequest2022@gmail.com',
    'safequest2022+manager@gmail.com',
    'safequest2022+accountant@gmail.com',
    'safequest2022+reception@gmail.com',
    'safequest2022+field@gmail.com',
    'safequest2022+loans@gmail.com'
  )
  AND u.email_confirmed_at IS NULL;
  GET DIAGNOSTICS confirmed = ROW_COUNT;

  FOR rec IN
    SELECT * FROM (VALUES
      ('safequest2022@gmail.com', 'admin'::public.app_role, 'EXEC', 'Chief Executive Officer'),
      ('safequest2022+manager@gmail.com', 'manager'::public.app_role, 'MGMT', 'Operations Manager'),
      ('safequest2022+accountant@gmail.com', 'accountant'::public.app_role, 'FIN', 'Accountant'),
      ('safequest2022+reception@gmail.com', 'receptionist'::public.app_role, 'RCPT', 'Receptionist'),
      ('safequest2022+field@gmail.com', 'technician'::public.app_role, 'FIELD', 'Field Technician'),
      ('safequest2022+loans@gmail.com', 'loan_officer'::public.app_role, 'LOANS', 'Loan Officer')
    ) AS t(email, role, dept_code, title)
  LOOP
    UPDATE public.profiles p
    SET
      department_id = d.id,
      job_title = rec.title,
      full_name = COALESCE(NULLIF(trim(p.full_name), ''), rec.title),
      updated_at = now()
    FROM public.departments d
    WHERE d.code = rec.dept_code
      AND lower(p.email) = lower(rec.email);

    INSERT INTO public.user_roles (user_id, role)
    SELECT p.id, rec.role
    FROM public.profiles p
    WHERE lower(p.email) = lower(rec.email)
    ON CONFLICT (user_id, role) DO NOTHING;

    touched := touched + 1;
  END LOOP;

  RETURN jsonb_build_object('confirmed_emails', confirmed, 'staff_rows', touched);
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_staff_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_staff_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_staff_access() TO service_role;
