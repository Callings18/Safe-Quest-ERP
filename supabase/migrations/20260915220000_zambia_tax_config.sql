ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS tax_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Close pre-2026 statutory rates and seed ZRA / NAPSA / NHIMA 2026 figures.
UPDATE public.payroll_rates
SET is_active = false,
    effective_to = COALESCE(effective_to, DATE '2025-12-31')
WHERE is_active = true
  AND effective_from < DATE '2026-01-01';

INSERT INTO public.payroll_rates (rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active)
SELECT * FROM (VALUES
  ('PAYE', 'Tax-free band (0%)', 0::numeric, 5100::numeric, 0::numeric, DATE '2026-01-01', true),
  ('PAYE', '20% band', 5100::numeric, 7100::numeric, 0.20::numeric, DATE '2026-01-01', true),
  ('PAYE', '30% band', 7100::numeric, 9200::numeric, 0.30::numeric, DATE '2026-01-01', true),
  ('PAYE', '37% band', 9200::numeric, NULL::numeric, 0.37::numeric, DATE '2026-01-01', true),
  ('NAPSA_EMPLOYEE', 'NAPSA employee', 0::numeric, 37236::numeric, 0.05::numeric, DATE '2026-01-01', true),
  ('NAPSA_EMPLOYER', 'NAPSA employer', 0::numeric, 37236::numeric, 0.05::numeric, DATE '2026-01-01', true),
  ('NHIMA_EMPLOYEE', 'NHIMA employee', 0::numeric, NULL::numeric, 0.01::numeric, DATE '2026-01-01', true),
  ('NHIMA_EMPLOYER', 'NHIMA employer', 0::numeric, NULL::numeric, 0.01::numeric, DATE '2026-01-01', true)
) AS v(rate_type, rate_name, min_amount, max_amount, rate, effective_from, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.payroll_rates
  WHERE rate_type = 'PAYE' AND effective_from = DATE '2026-01-01' AND is_active = true
);
