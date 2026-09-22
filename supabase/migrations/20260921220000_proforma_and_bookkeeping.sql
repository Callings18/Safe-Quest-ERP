ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS is_proforma BOOLEAN NOT NULL DEFAULT false;

-- VAT control accounts for Zambian bookkeeping
INSERT INTO public.chart_of_accounts (account_code, name, account_type, description)
SELECT * FROM (VALUES
  ('1130', 'Input VAT (receivable)', 'asset'::public.account_type, 'VAT claimed on purchases'),
  ('2130', 'VAT Payable (ZRA)', 'liability'::public.account_type, 'Output VAT due to ZRA'),
  ('2140', 'Output VAT clearing', 'liability'::public.account_type, 'VAT collected on sales pending return')
) AS v(account_code, name, account_type, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.chart_of_accounts c WHERE c.account_code = v.account_code
);

-- Soft link journals to source documents (nullable; no FK to keep deploy simple)
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id UUID;
