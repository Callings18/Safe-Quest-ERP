
-- Create quotation status enum
CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted');

-- Create delivery note status enum  
CREATE TYPE delivery_note_status AS ENUM ('pending', 'dispatched', 'delivered', 'cancelled');

-- Quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  project_id UUID REFERENCES public.projects(id),
  status quotation_status DEFAULT 'draft',
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 16,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  notes TEXT,
  terms TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quotation items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Delivery notes table
CREATE TABLE public.delivery_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_number TEXT NOT NULL UNIQUE,
  invoice_id UUID REFERENCES public.invoices(id),
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  status delivery_note_status DEFAULT 'pending',
  delivery_date DATE DEFAULT CURRENT_DATE,
  delivery_address TEXT,
  driver_name TEXT,
  vehicle_number TEXT,
  notes TEXT,
  received_by TEXT,
  received_date DATE,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Delivery note items table
CREATE TABLE public.delivery_note_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_note_id UUID NOT NULL REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice templates for customization
CREATE TABLE public.invoice_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  logo_url TEXT,
  company_name TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_tpin TEXT,
  primary_color TEXT DEFAULT '#0066cc',
  secondary_color TEXT DEFAULT '#f5f5f5',
  font_family TEXT DEFAULT 'Inter',
  show_logo BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT true,
  bank_name TEXT,
  bank_account TEXT,
  bank_branch TEXT,
  footer_text TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add converted_from_quotation_id to invoices
ALTER TABLE public.invoices ADD COLUMN quotation_id UUID REFERENCES public.quotations(id);
ALTER TABLE public.invoices ADD COLUMN template_id UUID REFERENCES public.invoice_templates(id);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Authenticated users can manage quotations" ON public.quotations FOR ALL USING (is_employee(auth.uid()));
CREATE POLICY "Authenticated users can view quotations" ON public.quotations FOR SELECT USING (true);

-- RLS Policies for quotation_items
CREATE POLICY "Authenticated users can manage quotation items" ON public.quotation_items FOR ALL USING (is_employee(auth.uid()));
CREATE POLICY "Authenticated users can view quotation items" ON public.quotation_items FOR SELECT USING (true);

-- RLS Policies for delivery_notes
CREATE POLICY "Authenticated users can manage delivery notes" ON public.delivery_notes FOR ALL USING (is_employee(auth.uid()));
CREATE POLICY "Authenticated users can view delivery notes" ON public.delivery_notes FOR SELECT USING (true);

-- RLS Policies for delivery_note_items
CREATE POLICY "Authenticated users can manage delivery note items" ON public.delivery_note_items FOR ALL USING (is_employee(auth.uid()));
CREATE POLICY "Authenticated users can view delivery note items" ON public.delivery_note_items FOR SELECT USING (true);

-- RLS Policies for invoice_templates
CREATE POLICY "Authenticated users can manage templates" ON public.invoice_templates FOR ALL USING (is_employee(auth.uid()));
CREATE POLICY "Authenticated users can view templates" ON public.invoice_templates FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_notes_updated_at BEFORE UPDATE ON public.delivery_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
