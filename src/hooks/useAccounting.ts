import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nextDocumentNumber } from "@/lib/documents";

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export function useAccounts() {
  return useQuery({
    queryKey: ["chart_of_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("account_code");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (account: {
      account_code: string;
      name: string;
      account_type: AccountType;
      description?: string;
    }) => {
      const { data, error } = await supabase.from("chart_of_accounts").insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chart_of_accounts"] });
      toast.success("Account added");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, chart_of_accounts(name, account_code), projects(name), suppliers(name)")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expense: {
      expense_date: string;
      category: string;
      account_id?: string | null;
      payee?: string;
      supplier_id?: string | null;
      description?: string;
      amount: number;
      tax_amount?: number;
      payment_method?: "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card";
      reference?: string;
      project_id?: string | null;
    }) => {
      const amount = Number(expense.amount) || 0;
      const tax = Number(expense.tax_amount) || 0;
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...expense,
          account_id: expense.account_id || null,
          supplier_id: expense.supplier_id || null,
          project_id: expense.project_id || null,
          expense_number: await nextDocumentNumber("EXP"),
          amount,
          tax_amount: tax,
          total: amount + tax,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["finance_stats"] });
      toast.success("Expense recorded");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateExpenseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" | "paid" }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data: expense, error } = await supabase
        .from("expenses")
        .update({
          status,
          approved_by: status === "approved" || status === "paid" ? user.user?.id : null,
          approved_at: status === "approved" || status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;

      if (status === "paid" && expense) {
        try {
          const { postExpenseToLedger } = await import("@/lib/bookkeeping");
          await postExpenseToLedger(expense as any);
        } catch (e) {
          console.warn("Expense ledger post skipped:", e);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["finance_stats"] });
      qc.invalidateQueries({ queryKey: ["journal_entries"] });
      toast.success("Expense updated");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useAgedReceivables() {
  return useQuery({
    queryKey: ["aged_receivables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, issue_date, due_date, total, amount_paid, status, companies(name), is_proforma")
        .neq("status", "cancelled")
        .order("due_date", { ascending: true });
      if (error) throw error;
      const today = new Date();
      return (data || [])
        .filter((inv: any) => !inv.is_proforma && inv.status !== "draft")
        .map((inv: any) => {
          const balance = Math.max(0, (Number(inv.total) || 0) - (Number(inv.amount_paid) || 0));
          const due = inv.due_date ? new Date(inv.due_date) : new Date(inv.issue_date);
          const days = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          let bucket = "current";
          if (balance > 0 && days > 90) bucket = "90+";
          else if (balance > 0 && days > 60) bucket = "61-90";
          else if (balance > 0 && days > 30) bucket = "31-60";
          else if (balance > 0 && days > 0) bucket = "1-30";
          return {
            ...inv,
            balance,
            days_overdue: Math.max(0, days),
            bucket,
            customer: inv.companies?.name || "—",
          };
        })
        .filter((r) => r.balance > 0.01);
    },
  });
}

export function useVatSummary() {
  return useQuery({
    queryKey: ["vat_summary"],
    queryFn: async () => {
      const [{ data: invoices }, { data: expenses }] = await Promise.all([
        supabase.from("invoices").select("tax_amount, status, is_proforma, issue_date"),
        supabase.from("expenses").select("tax_amount, status, expense_date"),
      ]);
      let outputVat = 0;
      let inputVat = 0;
      invoices?.forEach((inv: any) => {
        if (inv.is_proforma || inv.status === "draft" || inv.status === "cancelled") return;
        outputVat += Number(inv.tax_amount) || 0;
      });
      expenses?.forEach((exp) => {
        if (exp.status === "rejected") return;
        inputVat += Number(exp.tax_amount) || 0;
      });
      return {
        outputVat: Math.round(outputVat * 100) / 100,
        inputVat: Math.round(inputVat * 100) / 100,
        netVat: Math.round((outputVat - inputVat) * 100) / 100,
      };
    },
  });
}

export function useFinanceStats() {
  return useQuery({
    queryKey: ["finance_stats"],
    queryFn: async () => {
      const [{ data: invoices, error: iErr }, { data: expenses, error: eErr }] = await Promise.all([
        supabase.from("invoices").select("total, amount_paid, status, issue_date, is_proforma"),
        supabase.from("expenses").select("total, status, expense_date"),
      ]);
      if (iErr) throw iErr;
      if (eErr) throw eErr;

      const monthStart = new Date();
      monthStart.setDate(1);

      let revenue = 0;
      let received = 0;
      invoices?.forEach((i: any) => {
        if (i.status === "cancelled" || i.status === "draft" || i.is_proforma) return;
        revenue += Number(i.total) || 0;
        received += Number(i.amount_paid) || 0;
      });

      let totalExpenses = 0;
      let pendingApproval = 0;
      let monthExpenses = 0;
      expenses?.forEach((e) => {
        const amt = Number(e.total) || 0;
        if (e.status === "rejected") return;
        totalExpenses += amt;
        if (e.status === "pending") pendingApproval += amt;
        if (e.expense_date && new Date(e.expense_date) >= monthStart) monthExpenses += amt;
      });

      return {
        revenue,
        received,
        totalExpenses,
        pendingApproval,
        monthExpenses,
        grossProfit: revenue - totalExpenses,
        margin: revenue > 0 ? ((revenue - totalExpenses) / revenue) * 100 : 0,
      };
    },
  });
}

export function useExpenseByCategory() {
  return useQuery({
    queryKey: ["expense_by_category"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("category, total, status");
      if (error) throw error;
      const map = new Map<string, number>();
      data?.forEach((e) => {
        if (e.status === "rejected") return;
        map.set(e.category, (map.get(e.category) || 0) + (Number(e.total) || 0));
      });
      return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
    },
  });
}

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, journal_lines(*, chart_of_accounts(name, account_code))")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      entry_date: string;
      description: string;
      reference?: string;
      lines: Array<{ account_id: string; description?: string; debit: number; credit: number }>;
    }) => {
      const total_debit = entry.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
      const total_credit = entry.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
      if (Math.abs(total_debit - total_credit) > 0.01) {
        throw new Error("Debits and credits must balance");
      }
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          entry_number: await nextDocumentNumber("JE"),
          entry_date: entry.entry_date,
          description: entry.description,
          reference: entry.reference || null,
          total_debit,
          total_credit,
          is_posted: true,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: lErr } = await supabase.from("journal_lines").insert(
        entry.lines.map((l) => ({
          journal_entry_id: data.id,
          account_id: l.account_id,
          description: l.description || null,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
        }))
      );
      if (lErr) throw lErr;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal_entries"] });
      toast.success("Journal entry posted");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}
