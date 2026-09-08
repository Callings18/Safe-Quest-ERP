-- ============ ENUMS ============
CREATE TYPE public.boq_status AS ENUM ('draft','priced','submitted','approved','revised');
CREATE TYPE public.account_type AS ENUM ('asset','liability','equity','income','expense');
CREATE TYPE public.expense_status AS ENUM ('pending','approved','rejected','paid');
CREATE TYPE public.contract_status AS ENUM ('draft','active','expired','terminated','completed','renewed');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','half_day','on_leave','holiday');
CREATE TYPE public.leave_status AS ENUM ('pending','approved','rejected','cancelled');

-- ============ BOQ ============
CREATE TABLE public.boqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_number text NOT NULL UNIQUE,
  title text NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  discipline text,
  status public.boq_status NOT NULL DEFAULT 'draft',
  markup_percent numeric NOT NULL DEFAULT 0,
  contingency_percent numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boqs TO authenticated;
GRANT ALL ON public.boqs TO service_role;
ALTER TABLE public.boqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view boqs" ON public.boqs FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can create boqs" ON public.boqs FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Managers can update boqs" ON public.boqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant') OR created_by = auth.uid());
CREATE POLICY "Managers can delete boqs" ON public.boqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE public.boq_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.boqs(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boq_sections TO authenticated;
GRANT ALL ON public.boq_sections TO service_role;
ALTER TABLE public.boq_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view boq sections" ON public.boq_sections FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can manage boq sections" ON public.boq_sections FOR ALL TO authenticated USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));

CREATE TABLE public.boq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.boqs(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.boq_sections(id) ON DELETE SET NULL,
  item_code text,
  description text NOT NULL,
  unit text NOT NULL DEFAULT 'each',
  quantity numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  wastage_percent numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boq_items TO authenticated;
GRANT ALL ON public.boq_items TO service_role;
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view boq items" ON public.boq_items FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can manage boq items" ON public.boq_items FOR ALL TO authenticated USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));

-- ============ ACCOUNTING ============
CREATE TABLE public.chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code text NOT NULL UNIQUE,
  name text NOT NULL,
  account_type public.account_type NOT NULL,
  parent_id uuid REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chart_of_accounts TO authenticated;
GRANT ALL ON public.chart_of_accounts TO service_role;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view accounts" ON public.chart_of_accounts FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Finance can manage accounts" ON public.chart_of_accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_number text NOT NULL UNIQUE,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  account_id uuid REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
  payee text,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method public.payment_method,
  reference text,
  receipt_url text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status public.expense_status NOT NULL DEFAULT 'pending',
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can create expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Finance can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant') OR (created_by = auth.uid() AND status = 'pending'));
CREATE POLICY "Finance can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text NOT NULL UNIQUE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  reference text,
  total_debit numeric NOT NULL DEFAULT 0,
  total_credit numeric NOT NULL DEFAULT 0,
  is_posted boolean NOT NULL DEFAULT false,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view journals" ON public.journal_entries FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Finance can manage journals" ON public.journal_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

CREATE TABLE public.journal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  description text,
  debit numeric NOT NULL DEFAULT 0,
  credit numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_lines TO authenticated;
GRANT ALL ON public.journal_lines TO service_role;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view journal lines" ON public.journal_lines FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Finance can manage journal lines" ON public.journal_lines FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

-- ============ CONTRACTS & DOCUMENTS ============
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text NOT NULL UNIQUE,
  title text NOT NULL,
  contract_type text NOT NULL DEFAULT 'client',
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  description text,
  value numeric NOT NULL DEFAULT 0,
  retention_percent numeric NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  renewal_reminder_days integer NOT NULL DEFAULT 30,
  signed_date date,
  signed_by text,
  counterparty_signatory text,
  status public.contract_status NOT NULL DEFAULT 'draft',
  file_url text,
  notes text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view contracts" ON public.contracts FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can create contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Managers can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "Managers can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE public.document_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document_type text NOT NULL DEFAULT 'general',
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  version integer NOT NULL DEFAULT 1,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  notes text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_files TO authenticated;
GRANT ALL ON public.document_files TO service_role;
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view documents" ON public.document_files FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can upload documents" ON public.document_files FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Managers can update documents" ON public.document_files FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR uploaded_by = auth.uid());
CREATE POLICY "Managers can delete documents" ON public.document_files FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR uploaded_by = auth.uid());

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz,
  clock_out timestamptz,
  clock_in_lat numeric,
  clock_in_lng numeric,
  clock_out_lat numeric,
  clock_out_lng numeric,
  site_name text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  hours_worked numeric NOT NULL DEFAULT 0,
  overtime_hours numeric NOT NULL DEFAULT 0,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT ALL ON public.attendance_records TO service_role;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view attendance" ON public.attendance_records FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can record attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Managers can update attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'hr') OR recorded_by = auth.uid());
CREATE POLICY "Managers can delete attendance" ON public.attendance_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr'));

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'annual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL DEFAULT 1,
  reason text,
  status public.leave_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view leave" ON public.leave_requests FOR SELECT TO authenticated USING (public.is_employee(auth.uid()));
CREATE POLICY "Staff can request leave" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (public.is_employee(auth.uid()));
CREATE POLICY "Managers can update leave" ON public.leave_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'hr'));
CREATE POLICY "Managers can delete leave" ON public.leave_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr'));

-- ============ VALIDATION TRIGGER (leave dates) ============
CREATE OR REPLACE FUNCTION public.validate_leave_dates()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'End date cannot be before start date';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_leave_dates_trg BEFORE INSERT OR UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.validate_leave_dates();

-- ============ UPDATED_AT TRIGGERS ============
CREATE TRIGGER update_boqs_updated_at BEFORE UPDATE ON public.boqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON public.chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INDEXES ============
CREATE INDEX idx_boq_items_boq ON public.boq_items(boq_id);
CREATE INDEX idx_boq_sections_boq ON public.boq_sections(boq_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX idx_journal_lines_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(work_date DESC);
CREATE INDEX idx_attendance_employee ON public.attendance_records(employee_id);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX idx_document_files_contract ON public.document_files(contract_id);