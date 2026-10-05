-- =============================================================================
-- SafeQuest ERP: departments, RBAC, and staff logins
-- Run once in Supabase Dashboard → SQL Editor (project frhlucffdbvpwwttvwui)
-- Password for every account below: safequest@.24
-- =============================================================================

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

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_password TEXT := crypt('safequest@.24', gen_salt('bf'));
  staff RECORD;
  uid UUID;
  dept_id UUID;
BEGIN
  FOR staff IN
    SELECT * FROM (VALUES
      ('safequest2022@gmail.com', 'Chief Executive Officer', 'admin'::public.app_role, 'EXEC'),
      ('safequest2022+manager@gmail.com', 'Operations Manager', 'manager'::public.app_role, 'MGMT'),
      ('safequest2022+accountant@gmail.com', 'Accountant', 'accountant'::public.app_role, 'FIN'),
      ('safequest2022+reception@gmail.com', 'Receptionist', 'receptionist'::public.app_role, 'RCPT'),
      ('safequest2022+field@gmail.com', 'Field Technician', 'technician'::public.app_role, 'FIELD'),
      ('safequest2022+loans@gmail.com', 'Loan Officer', 'loan_officer'::public.app_role, 'LOANS')
    ) AS t(email, full_name, role, dept_code)
  LOOP
    SELECT id INTO dept_id FROM public.departments WHERE code = staff.dept_code;
    SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(staff.email);

    IF uid IS NULL THEN
      uid := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        uid,
        'authenticated',
        'authenticated',
        lower(staff.email),
        v_password,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', staff.full_name),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        uid,
        jsonb_build_object('sub', uid::text, 'email', lower(staff.email), 'email_verified', true),
        'email',
        uid::text,
        now(),
        now(),
        now()
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = v_password,
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now(),
          raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', staff.full_name)
      WHERE id = uid;

      IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = uid AND provider = 'email') THEN
        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          uid,
          jsonb_build_object('sub', uid::text, 'email', lower(staff.email), 'email_verified', true),
          'email',
          uid::text,
          now(),
          now(),
          now()
        );
      END IF;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, department_id, job_title)
    VALUES (uid, lower(staff.email), staff.full_name, dept_id, staff.full_name)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      department_id = EXCLUDED.department_id,
      job_title = EXCLUDED.job_title,
      updated_at = now();

    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, staff.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END $$;

SELECT u.email, ur.role, d.name AS department, u.email_confirmed_at IS NOT NULL AS confirmed
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.departments d ON d.id = p.department_id
WHERE lower(u.email) LIKE 'safequest2022%'
ORDER BY u.email, ur.role;
