import { supabase } from "@/integrations/supabase/client";
import { nextDocumentNumber } from "@/lib/documents";

type AccountRow = { id: string; account_code: string };

async function findAccounts(codes: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("chart_of_accounts")
    .select("id, account_code")
    .in("account_code", codes);
  if (error) throw error;
  const map: Record<string, string> = {};
  (data || []).forEach((a: AccountRow) => {
    map[a.account_code] = a.id;
  });
  return map;
}

async function alreadyPosted(sourceType: string, sourceId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("source_type", sourceType)
      .eq("source_id", sourceId)
      .limit(1);
    if (error) return false;
    return !!(data && data.length);
  } catch {
    return false;
  }
}

async function postBalancedEntry(opts: {
  description: string;
  entryDate: string;
  sourceType: string;
  sourceId: string;
  lines: Array<{ accountId: string; debit: number; credit: number }>;
}) {
  if (await alreadyPosted(opts.sourceType, opts.sourceId)) return null;

  const total_debit = opts.lines.reduce((s, l) => s + l.debit, 0);
  const total_credit = opts.lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(total_debit - total_credit) > 0.01) {
    throw new Error("Bookkeeping entry does not balance");
  }

  const entryNumber = await nextDocumentNumber("JE");
  const base = {
    entry_number: entryNumber,
    entry_date: opts.entryDate,
    description: opts.description,
    reference: `${opts.sourceType}:${opts.sourceId}`,
    total_debit,
    total_credit,
    is_posted: true,
  };

  let entry: { id: string } | null = null;
  const withSource = await supabase
    .from("journal_entries")
    .insert({
      ...base,
      source_type: opts.sourceType,
      source_id: opts.sourceId,
    } as never)
    .select("id")
    .single();

  if (withSource.error && /source_type|column/i.test(withSource.error.message)) {
    const fallback = await supabase.from("journal_entries").insert(base).select("id").single();
    if (fallback.error) throw fallback.error;
    entry = fallback.data;
  } else if (withSource.error) {
    throw withSource.error;
  } else {
    entry = withSource.data;
  }

  if (!entry) return null;

  const { error: linesErr } = await supabase.from("journal_lines").insert(
    opts.lines.map((l) => ({
      journal_entry_id: entry!.id,
      account_id: l.accountId,
      debit: l.debit,
      credit: l.credit,
    })),
  );
  if (linesErr) throw linesErr;
  return entry;
}

/** DR Accounts Receivable / CR Sales + VAT Payable when a tax invoice is issued. */
export async function postInvoiceToLedger(invoice: {
  id: string;
  invoice_number: string;
  issue_date?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total?: number | null;
  is_proforma?: boolean | null;
}) {
  if (invoice.is_proforma) return null;
  const total = Number(invoice.total) || 0;
  const tax = Number(invoice.tax_amount) || 0;
  const net = Number(invoice.subtotal) || total - tax;
  if (total <= 0) return null;

  const accounts = await findAccounts(["1100", "4000", "2130", "2140"]);
  const ar = accounts["1100"];
  const sales = accounts["4000"];
  const vat = accounts["2130"] || accounts["2140"];
  if (!ar || !sales) return null;

  const lines = [
    { accountId: ar, debit: Math.round(total * 100) / 100, credit: 0 },
    { accountId: sales, debit: 0, credit: Math.round(net * 100) / 100 },
  ];
  if (tax > 0 && vat) {
    lines.push({ accountId: vat, debit: 0, credit: Math.round(tax * 100) / 100 });
  } else if (tax > 0) {
    lines[1].credit = Math.round(total * 100) / 100;
  }

  return postBalancedEntry({
    description: `Sales invoice ${invoice.invoice_number}`,
    entryDate: invoice.issue_date || new Date().toISOString().slice(0, 10),
    sourceType: "invoice",
    sourceId: invoice.id,
    lines,
  });
}

/** DR Bank / CR Accounts Receivable when payment is received. */
export async function postPaymentToLedger(payment: {
  id: string;
  amount: number;
  payment_date?: string | null;
  reference?: string | null;
  invoice_number?: string;
}) {
  const amount = Number(payment.amount) || 0;
  if (amount <= 0) return null;

  const accounts = await findAccounts(["1010", "1000", "1100"]);
  const bank = accounts["1010"] || accounts["1000"];
  const ar = accounts["1100"];
  if (!bank || !ar) return null;

  return postBalancedEntry({
    description: `Payment ${payment.reference || ""} on ${payment.invoice_number || "invoice"}`.trim(),
    entryDate: payment.payment_date || new Date().toISOString().slice(0, 10),
    sourceType: "payment",
    sourceId: payment.id,
    lines: [
      { accountId: bank, debit: Math.round(amount * 100) / 100, credit: 0 },
      { accountId: ar, debit: 0, credit: Math.round(amount * 100) / 100 },
    ],
  });
}

/** DR Expense (+ Input VAT) / CR Bank when an expense is paid. */
export async function postExpenseToLedger(expense: {
  id: string;
  expense_number?: string | null;
  expense_date?: string | null;
  amount: number;
  tax_amount?: number | null;
  total?: number | null;
  account_id?: string | null;
}) {
  const net = Number(expense.amount) || 0;
  const tax = Number(expense.tax_amount) || 0;
  const total = Number(expense.total) || net + tax;
  if (total <= 0) return null;

  const accounts = await findAccounts(["1010", "1000", "1130", "5000"]);
  const bank = accounts["1010"] || accounts["1000"];
  const expenseAccount = expense.account_id || accounts["5000"];
  const inputVat = accounts["1130"];
  if (!bank || !expenseAccount) return null;

  const lines = [
    { accountId: expenseAccount, debit: Math.round(net * 100) / 100, credit: 0 },
    { accountId: bank, debit: 0, credit: Math.round(total * 100) / 100 },
  ];
  if (tax > 0 && inputVat) {
    lines.splice(1, 0, { accountId: inputVat, debit: Math.round(tax * 100) / 100, credit: 0 });
  }

  return postBalancedEntry({
    description: `Expense ${expense.expense_number || expense.id.slice(0, 8)}`,
    entryDate: expense.expense_date || new Date().toISOString().slice(0, 10),
    sourceType: "expense",
    sourceId: expense.id,
    lines,
  });
}
