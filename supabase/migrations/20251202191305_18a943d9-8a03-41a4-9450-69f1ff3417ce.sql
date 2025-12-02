-- Create enums for the ERP system
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'accountant', 'sales', 'technician', 'loan_officer', 'hr');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.project_type AS ENUM ('construction', 'solar', 'maintenance', 'other');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE public.loan_status AS ENUM ('pending', 'approved', 'active', 'completed', 'defaulted', 'rejected');
CREATE TYPE public.payment_method AS ENUM ('cash', 'bank_transfer', 'mobile_money', 'cheque', 'card');
CREATE TYPE public.stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'transfer');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  branch_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Companies (CRM)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  branch_id UUID REFERENCES public.branches(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Contacts (CRM)
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Leads (CRM)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status lead_status DEFAULT 'new',
  value DECIMAL(15,2),
  probability INTEGER DEFAULT 0,
  source TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  expected_close_date DATE,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_type project_type DEFAULT 'construction',
  status project_status DEFAULT 'planning',
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  site_address TEXT,
  city TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  progress INTEGER DEFAULT 0,
  manager_id UUID REFERENCES auth.users(id),
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Warehouses
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  branch_id UUID REFERENCES public.branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Product categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.product_categories(id),
  unit TEXT DEFAULT 'pcs',
  cost_price DECIMAL(15,2) DEFAULT 0,
  selling_price DECIMAL(15,2) DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Inventory (stock per warehouse)
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (product_id, warehouse_id)
);

-- Stock movements
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) NOT NULL,
  movement_type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Purchase orders
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
  status TEXT DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_date DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  project_id UUID REFERENCES public.projects(id),
  status invoice_status DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Invoice line items
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method payment_method DEFAULT 'bank_transfer',
  reference TEXT,
  notes TEXT,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  employee_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  national_id TEXT,
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  termination_date DATE,
  job_title TEXT,
  department TEXT,
  branch_id UUID REFERENCES public.branches(id),
  basic_salary DECIMAL(15,2) DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  napsa_number TEXT,
  nhima_number TEXT,
  tax_pin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Payroll statutory rates
CREATE TABLE public.payroll_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type TEXT NOT NULL,
  rate_name TEXT NOT NULL,
  min_amount DECIMAL(15,2),
  max_amount DECIMAL(15,2),
  rate DECIMAL(10,4) NOT NULL,
  fixed_amount DECIMAL(15,2),
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Payroll runs
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_period TEXT NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  total_gross DECIMAL(15,2) DEFAULT 0,
  total_paye DECIMAL(15,2) DEFAULT 0,
  total_napsa_employee DECIMAL(15,2) DEFAULT 0,
  total_napsa_employer DECIMAL(15,2) DEFAULT 0,
  total_nhima DECIMAL(15,2) DEFAULT 0,
  total_net DECIMAL(15,2) DEFAULT 0,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Payslips
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  basic_salary DECIMAL(15,2) DEFAULT 0,
  allowances DECIMAL(15,2) DEFAULT 0,
  overtime DECIMAL(15,2) DEFAULT 0,
  gross_pay DECIMAL(15,2) DEFAULT 0,
  paye DECIMAL(15,2) DEFAULT 0,
  napsa_employee DECIMAL(15,2) DEFAULT 0,
  napsa_employer DECIMAL(15,2) DEFAULT 0,
  nhima DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  net_pay DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Loan products
CREATE TABLE public.loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  min_term INTEGER NOT NULL,
  max_term INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_type TEXT DEFAULT 'flat',
  processing_fee DECIMAL(5,2) DEFAULT 0,
  late_fee DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Loan applications / Loans
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT UNIQUE NOT NULL,
  loan_product_id UUID REFERENCES public.loan_products(id) NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_phone TEXT,
  borrower_email TEXT,
  borrower_national_id TEXT,
  borrower_address TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  monthly_income DECIMAL(15,2),
  principal DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  processing_fee DECIMAL(15,2) DEFAULT 0,
  total_interest DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  outstanding_principal DECIMAL(15,2),
  outstanding_amount DECIMAL(15,2),
  status loan_status DEFAULT 'pending',
  application_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE,
  disbursement_date DATE,
  maturity_date DATE,
  guarantor_name TEXT,
  guarantor_phone TEXT,
  guarantor_relation TEXT,
  collateral_type TEXT,
  collateral_value DECIMAL(15,2),
  collateral_description TEXT,
  loan_officer_id UUID REFERENCES auth.users(id),
  branch_id UUID REFERENCES public.branches(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Loan repayment schedule
CREATE TABLE public.loan_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_due DECIMAL(15,2) NOT NULL,
  interest_due DECIMAL(15,2) NOT NULL,
  total_due DECIMAL(15,2) NOT NULL,
  principal_paid DECIMAL(15,2) DEFAULT 0,
  interest_paid DECIMAL(15,2) DEFAULT 0,
  total_paid DECIMAL(15,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Loan repayments
CREATE TABLE public.loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) NOT NULL,
  schedule_id UUID REFERENCES public.loan_schedule(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method payment_method DEFAULT 'mobile_money',
  reference TEXT,
  notes TEXT,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Compliance documents
CREATE TABLE public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  description TEXT,
  issue_date DATE,
  expiry_date DATE,
  reminder_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'valid',
  file_url TEXT,
  project_id UUID REFERENCES public.projects(id),
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any role (is authenticated employee)
CREATE OR REPLACE FUNCTION public.is_employee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles (admin only for modifications)
CREATE POLICY "Users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for branches
CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies, contacts, leads (all authenticated can view/manage)
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage companies" ON public.companies FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage contacts" ON public.contacts FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage leads" ON public.leads FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

-- RLS Policies for projects
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

-- RLS Policies for inventory related tables
CREATE POLICY "Authenticated users can view warehouses" ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins/Managers can manage warehouses" ON public.warehouses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated users can view categories" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.product_categories FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stock movements" ON public.stock_movements FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase orders" ON public.purchase_orders FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

-- RLS Policies for invoices and payments
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage invoice items" ON public.invoice_items FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

CREATE POLICY "Authenticated users can view payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

-- RLS Policies for payroll (restricted access)
CREATE POLICY "HR/Admins can view employees" ON public.employees FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "HR/Admins can manage employees" ON public.employees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

CREATE POLICY "Accountants can view payroll rates" ON public.payroll_rates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Admins can manage payroll rates" ON public.payroll_rates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR/Accountants can view payroll runs" ON public.payroll_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "HR/Admins can manage payroll runs" ON public.payroll_runs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR/Accountants can view payslips" ON public.payslips FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "HR/Admins can manage payslips" ON public.payslips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for loans
CREATE POLICY "Loan officers can view loan products" ON public.loan_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage loan products" ON public.loan_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Loan officers can view loans" ON public.loans FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Loan officers can manage loans" ON public.loans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer'));

CREATE POLICY "Loan officers can view schedules" ON public.loan_schedule FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Loan officers can manage schedules" ON public.loan_schedule FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer'));

CREATE POLICY "Loan officers can view repayments" ON public.loan_repayments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Loan officers can manage repayments" ON public.loan_repayments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer'));

-- RLS Policies for compliance
CREATE POLICY "Authenticated users can view compliance docs" ON public.compliance_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage compliance docs" ON public.compliance_documents FOR ALL TO authenticated USING (public.is_employee(auth.uid()));

-- RLS Policies for activity log
CREATE POLICY "Authenticated users can view activity log" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_documents_updated_at BEFORE UPDATE ON public.compliance_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();