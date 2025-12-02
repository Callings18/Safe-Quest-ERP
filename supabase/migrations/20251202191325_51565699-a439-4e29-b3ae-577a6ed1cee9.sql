-- Fix function search path warning for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Insert default Zambia PAYE tax bands (2024)
INSERT INTO public.payroll_rates (rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active) VALUES
('PAYE', 'Band 1 - 0%', 0, 5100, 0, '2024-01-01', true),
('PAYE', 'Band 2 - 20%', 5100.01, 7100, 0.20, '2024-01-01', true),
('PAYE', 'Band 3 - 30%', 7100.01, 9200, 0.30, '2024-01-01', true),
('PAYE', 'Band 4 - 37.5%', 9200.01, NULL, 0.375, '2024-01-01', true);

-- Insert NAPSA rates (5% employee, 5% employer, ceiling 1,339,200 annually / 111,600 monthly)
INSERT INTO public.payroll_rates (rate_type, rate_name, min_amount, max_amount, rate, fixed_amount, effective_from, is_active) VALUES
('NAPSA_EMPLOYEE', 'Employee Contribution', 0, 111600, 0.05, NULL, '2024-01-01', true),
('NAPSA_EMPLOYER', 'Employer Contribution', 0, 111600, 0.05, NULL, '2024-01-01', true);

-- Insert NHIMA rates (1% each employee and employer)
INSERT INTO public.payroll_rates (rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active) VALUES
('NHIMA_EMPLOYEE', 'Employee Contribution', 0, NULL, 0.01, '2024-01-01', true),
('NHIMA_EMPLOYER', 'Employer Contribution', 0, NULL, 0.01, '2024-01-01', true);

-- Insert default branch
INSERT INTO public.branches (name, city, is_active) VALUES
('Head Office - Lusaka', 'Lusaka', true);

-- Insert default loan products
INSERT INTO public.loan_products (name, description, min_amount, max_amount, min_term, max_term, interest_rate, interest_type, processing_fee, late_fee, is_active) VALUES
('Personal Loan', 'Short-term personal loan for employees', 500, 50000, 1, 12, 25.00, 'flat', 3.00, 5.00, true),
('Business Loan', 'Working capital for small businesses', 5000, 500000, 3, 24, 20.00, 'declining', 2.50, 3.00, true),
('Emergency Loan', 'Quick emergency loans', 100, 10000, 1, 6, 30.00, 'flat', 5.00, 10.00, true);

-- Insert default product categories
INSERT INTO public.product_categories (name, description) VALUES
('Construction Materials', 'Building and construction materials'),
('Solar Equipment', 'Solar panels, inverters, batteries'),
('Electrical', 'Electrical wiring, switches, accessories'),
('Plumbing', 'Pipes, fittings, fixtures'),
('Tools & Equipment', 'Hand tools, power tools, safety equipment');

-- Insert default warehouse
INSERT INTO public.warehouses (name, city, is_active) VALUES
('Main Warehouse - Lusaka', 'Lusaka', true);