CREATE OR REPLACE FUNCTION public.record_loan_repayment(
  p_loan_id UUID,
  p_amount NUMERIC,
  p_payment_method public.payment_method DEFAULT 'mobile_money',
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ln RECORD;
  sched RECORD;
  new_out NUMERIC;
  pay_id UUID;
  apply_amt NUMERIC;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'loan_officer')
    OR public.has_role(auth.uid(), 'accountant')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT * INTO ln FROM public.loans WHERE id = p_loan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  INSERT INTO public.loan_repayments (
    loan_id, amount, payment_method, reference, notes, payment_date, received_by
  ) VALUES (
    p_loan_id, p_amount, p_payment_method, p_reference, p_notes, CURRENT_DATE, auth.uid()
  ) RETURNING id INTO pay_id;

  apply_amt := p_amount;
  FOR sched IN
    SELECT * FROM public.loan_schedule
    WHERE loan_id = p_loan_id AND COALESCE(is_paid, false) = false
    ORDER BY installment_number
    FOR UPDATE
  LOOP
    EXIT WHEN apply_amt <= 0;
    IF apply_amt >= sched.total_due - COALESCE(sched.total_paid, 0) THEN
      apply_amt := apply_amt - (sched.total_due - COALESCE(sched.total_paid, 0));
      UPDATE public.loan_schedule
      SET total_paid = sched.total_due,
          principal_paid = sched.principal_due,
          interest_paid = sched.interest_due,
          is_paid = true,
          paid_date = CURRENT_DATE
      WHERE id = sched.id;
      UPDATE public.loan_repayments SET schedule_id = sched.id WHERE id = pay_id AND schedule_id IS NULL;
    ELSE
      UPDATE public.loan_schedule
      SET total_paid = COALESCE(total_paid, 0) + apply_amt
      WHERE id = sched.id;
      apply_amt := 0;
    END IF;
  END LOOP;

  new_out := GREATEST(COALESCE(ln.outstanding_amount, 0) - p_amount, 0);
  UPDATE public.loans
  SET outstanding_amount = new_out,
      outstanding_principal = GREATEST(COALESCE(outstanding_principal, 0) - p_amount, 0),
      status = CASE WHEN new_out <= 0.009 THEN 'completed'::public.loan_status ELSE status END
  WHERE id = p_loan_id;

  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, description)
  VALUES (auth.uid(), 'loan_repayment', 'loan', p_loan_id, 'Repayment of ' || p_amount::text);

  RETURN jsonb_build_object('repayment_id', pay_id, 'outstanding', new_out);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_loan_repayment(UUID, NUMERIC, public.payment_method, TEXT, TEXT) TO authenticated;
