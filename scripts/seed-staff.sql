-- SafeQuest staff seed: departments/RBAC must be migrated first (20261005120000).
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- Password for every account: safequest@.24

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

SELECT email, email_confirmed_at IS NOT NULL AS confirmed
FROM auth.users
WHERE lower(email) LIKE 'safequest2022%'
ORDER BY email;
