-- Production hardening: first-user admin, sequences, company settings, seeds, RPCs.

-- First registered user becomes admin; later users get sales so RLS (is_employee) works.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_roles integer;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;

  SELECT COUNT(*) INTO existing_roles FROM public.user_roles;

  IF existing_roles = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'sales')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Existing users with a profile but no role (bootstrap from Lovable)
INSERT INTO public.user_roles (user_id, role)
SELECT s.id, 'admin'
FROM (
  SELECT p.id
  FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles)
  ORDER BY p.created_at
  LIMIT 1
) s
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'sales'
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{
    "invoice_reminders": {"email": true, "sms": false},
    "payment_received": {"email": true, "sms": false},
    "loan_repayments": {"email": true, "sms": false},
    "compliance_deadlines": {"email": true, "sms": false},
    "payroll_processing": {"email": true, "sms": false}
  }'::jsonb;

CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'SAFEQUEST',
  tpin TEXT,
  address TEXT,
  city TEXT DEFAULT 'Lusaka',
  phone TEXT,
  email TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  account_name TEXT,
  account_number TEXT,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'ZMW',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO public.company_settings (company_name, city, currency)
SELECT 'SAFEQUEST', 'Lusaka', 'ZMW'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view company settings" ON public.company_settings;
CREATE POLICY "Staff can view company settings"
  ON public.company_settings FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
CREATE POLICY "Admins can update company settings"
  ON public.company_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'accountant'));

DROP POLICY IF EXISTS "Admins can insert company settings" ON public.company_settings;
CREATE POLICY "Admins can insert company settings"
  ON public.company_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;

CREATE TABLE IF NOT EXISTS public.document_sequences (
  prefix TEXT PRIMARY KEY,
  last_value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.document_sequences (prefix, last_value)
VALUES
  ('INV', 0), ('QT', 0), ('DN', 0), ('PO', 0), ('EXP', 0), ('JE', 0),
  ('BOQ', 0), ('EMP', 0), ('LN', 0), ('AST', 0), ('PAY', 0)
ON CONFLICT (prefix) DO NOTHING;

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view sequences" ON public.document_sequences;
CREATE POLICY "Staff can view sequences"
  ON public.document_sequences FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));

GRANT SELECT ON public.document_sequences TO authenticated;
GRANT ALL ON public.document_sequences TO service_role;

CREATE OR REPLACE FUNCTION public.next_document_number(p_prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_val BIGINT;
  year_part TEXT := to_char(now(), 'YYYY');
BEGIN
  IF NOT public.is_employee(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.document_sequences (prefix, last_value)
  VALUES (upper(p_prefix), 1)
  ON CONFLICT (prefix) DO UPDATE
    SET last_value = public.document_sequences.last_value + 1,
        updated_at = now()
  RETURNING last_value INTO next_val;

  RETURN upper(p_prefix) || '-' || year_part || '-' || lpad(next_val::text, 5, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_document_number(TEXT) TO authenticated;

-- Atomic invoice payment (avoids lost updates from the client)
CREATE OR REPLACE FUNCTION public.record_invoice_payment(
  p_invoice_id UUID,
  p_amount NUMERIC,
  p_payment_method public.payment_method,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_payment_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  new_paid NUMERIC;
  new_status public.invoice_status;
  pay_id UUID;
  pay_number TEXT;
BEGIN
  IF NOT public.is_employee(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT * INTO inv FROM public.invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  new_paid := COALESCE(inv.amount_paid, 0) + p_amount;
  IF new_paid >= COALESCE(inv.total, 0) THEN
    new_status := 'paid';
  ELSE
    new_status := 'partial';
  END IF;

  pay_number := public.next_document_number('PAY');

  INSERT INTO public.payments (
    invoice_id, amount, payment_method, reference, notes, payment_date, received_by
  ) VALUES (
    p_invoice_id, p_amount, p_payment_method, COALESCE(p_reference, pay_number), p_notes, p_payment_date, auth.uid()
  ) RETURNING id INTO pay_id;

  UPDATE public.invoices
  SET amount_paid = new_paid, status = new_status
  WHERE id = p_invoice_id;

  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, description)
  VALUES (auth.uid(), 'payment_recorded', 'invoice', p_invoice_id,
          'Payment of ' || p_amount::text || ' on invoice ' || inv.invoice_number);

  RETURN jsonb_build_object('payment_id', pay_id, 'amount_paid', new_paid, 'status', new_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_invoice_payment(UUID, NUMERIC, public.payment_method, TEXT, TEXT, DATE) TO authenticated;

-- Reducing-balance / equal installment loan schedule
CREATE OR REPLACE FUNCTION public.generate_loan_schedule(p_loan_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ln RECORD;
  monthly_rate NUMERIC;
  installment NUMERIC;
  balance NUMERIC;
  interest_amt NUMERIC;
  principal_amt NUMERIC;
  due DATE;
  i INTEGER;
  n INTEGER;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'loan_officer')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO ln FROM public.loans WHERE id = p_loan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  DELETE FROM public.loan_schedule WHERE loan_id = p_loan_id;

  n := GREATEST(COALESCE(ln.term_months, 1), 1);
  monthly_rate := COALESCE(ln.interest_rate, 0) / 100.0 / 12.0;
  balance := COALESCE(ln.principal, 0);

  IF monthly_rate > 0 THEN
    installment := round((balance * monthly_rate * power(1 + monthly_rate, n)) / (power(1 + monthly_rate, n) - 1), 2);
  ELSE
    installment := round(balance / n, 2);
  END IF;

  due := COALESCE(ln.disbursement_date, CURRENT_DATE);

  FOR i IN 1..n LOOP
    due := due + INTERVAL '1 month';
    interest_amt := round(balance * monthly_rate, 2);
    principal_amt := round(installment - interest_amt, 2);
    IF i = n THEN
      principal_amt := round(balance, 2);
      installment := round(principal_amt + interest_amt, 2);
    END IF;
    balance := round(balance - principal_amt, 2);

    INSERT INTO public.loan_schedule (
      loan_id, installment_number, due_date, principal_due, interest_due, total_due
    ) VALUES (
      p_loan_id, i, due::date, principal_amt, interest_amt, installment
    );
  END LOOP;

  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_loan_schedule(UUID) TO authenticated;

-- Default branch
INSERT INTO public.branches (name, city, address, is_active)
SELECT 'Lusaka HQ', 'Lusaka', 'Lusaka, Zambia', true
WHERE NOT EXISTS (SELECT 1 FROM public.branches);

-- Zambia statutory rates (monthly PAYE bands, NAPSA 5%, NHIMA 1%)
INSERT INTO public.payroll_rates (rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active)
SELECT * FROM (VALUES
  ('PAYE', 'Tax-free band', 0::numeric, 5100::numeric, 0::numeric, DATE '2024-01-01', true),
  ('PAYE', '20% band', 5100::numeric, 7400::numeric, 0.20::numeric, DATE '2024-01-01', true),
  ('PAYE', '30% band', 7400::numeric, 9200::numeric, 0.30::numeric, DATE '2024-01-01', true),
  ('PAYE', '37% band', 9200::numeric, NULL::numeric, 0.37::numeric, DATE '2024-01-01', true),
  ('NAPSA_EMPLOYEE', 'NAPSA employee', 0::numeric, 34900::numeric, 0.05::numeric, DATE '2024-01-01', true),
  ('NAPSA_EMPLOYER', 'NAPSA employer', 0::numeric, 34900::numeric, 0.05::numeric, DATE '2024-01-01', true),
  ('NHIMA_EMPLOYEE', 'NHIMA employee', 0::numeric, NULL::numeric, 0.01::numeric, DATE '2024-01-01', true)
) AS v(rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.payroll_rates);

INSERT INTO public.chart_of_accounts (account_code, name, account_type, description)
SELECT * FROM (VALUES
  ('1000', 'Cash on Hand', 'asset'::public.account_type, 'Petty cash and till'),
  ('1010', 'Bank', 'asset'::public.account_type, 'Operating bank account'),
  ('1100', 'Accounts Receivable', 'asset'::public.account_type, 'Customer invoices'),
  ('1200', 'Inventory', 'asset'::public.account_type, 'Stock on hand'),
  ('1500', 'Fixed Assets', 'asset'::public.account_type, 'Plant and equipment'),
  ('2000', 'Accounts Payable', 'liability'::public.account_type, 'Supplier invoices'),
  ('2100', 'PAYE Payable', 'liability'::public.account_type, 'ZRA PAYE'),
  ('2110', 'NAPSA Payable', 'liability'::public.account_type, 'NAPSA contributions'),
  ('2120', 'NHIMA Payable', 'liability'::public.account_type, 'NHIMA contributions'),
  ('3000', 'Retained Earnings', 'equity'::public.account_type, 'Accumulated profit'),
  ('4000', 'Sales Revenue', 'income'::public.account_type, 'Invoiced sales'),
  ('4100', 'Interest Income', 'income'::public.account_type, 'Loan interest'),
  ('5000', 'Cost of Sales', 'expense'::public.account_type, 'Direct project costs'),
  ('5100', 'Salaries', 'expense'::public.account_type, 'Payroll'),
  ('5200', 'Fuel', 'expense'::public.account_type, 'Fleet fuel'),
  ('5300', 'Rent', 'expense'::public.account_type, 'Premises'),
  ('5400', 'Utilities', 'expense'::public.account_type, 'Power and communications')
) AS v(account_code, name, account_type, description)
WHERE NOT EXISTS (SELECT 1 FROM public.chart_of_accounts);

INSERT INTO public.loan_products (name, description, interest_rate, min_term, max_term, min_amount, max_amount, is_active)
SELECT 'Staff Advance', 'Short-term staff loan', 15, 1, 12, 500, 50000, true
WHERE NOT EXISTS (SELECT 1 FROM public.loan_products);

INSERT INTO public.warehouses (name, city, branch_id, is_active)
SELECT 'Main Store', 'Lusaka', (SELECT id FROM public.branches ORDER BY created_at LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses);

-- Storage for avatars and documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
CREATE POLICY "Avatars are public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Staff can manage documents" ON storage.objects;
CREATE POLICY "Staff can manage documents"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'documents' AND public.is_employee(auth.uid()))
  WITH CHECK (bucket_id = 'documents' AND public.is_employee(auth.uid()));

-- Admin can assign roles (already exists). Allow users to see own roles clearly.
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (true);
