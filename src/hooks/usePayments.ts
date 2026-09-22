import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { postPaymentToLedger } from "@/lib/bookkeeping";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, invoices(*, companies(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePaymentsByInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: {
      invoice_id: string;
      amount: number;
      payment_method: string;
      reference?: string;
      notes?: string;
      payment_date?: string;
    }) => {
      const paymentDate = payment.payment_date || new Date().toISOString().split("T")[0];
      const { data: invoiceMeta } = await supabase
        .from("invoices")
        .select("invoice_number, total, amount_paid, is_proforma")
        .eq("id", payment.invoice_id)
        .single();

      const { error: payError } = await supabase.rpc("record_invoice_payment", {
        p_invoice_id: payment.invoice_id,
        p_amount: payment.amount,
        p_payment_method: payment.payment_method as "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card",
        p_reference: payment.reference ?? null,
        p_notes: payment.notes ?? null,
        p_payment_date: paymentDate,
      });

      let paymentId: string | null = null;

      if (!payError) {
        const { data: latest } = await supabase
          .from("payments")
          .select("id")
          .eq("invoice_id", payment.invoice_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        paymentId = latest?.id || null;
      } else {
        if (!invoiceMeta) throw payError;

        const { data: inserted, error: insertErr } = await supabase
          .from("payments")
          .insert({
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            payment_method: payment.payment_method as "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card",
            reference: payment.reference,
            notes: payment.notes,
            payment_date: paymentDate,
          })
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        paymentId = inserted.id;

        const newAmountPaid = (Number(invoiceMeta.amount_paid) || 0) + payment.amount;
        const total = Number(invoiceMeta.total) || 0;
        await supabase
          .from("invoices")
          .update({ amount_paid: newAmountPaid, status: newAmountPaid >= total ? "paid" : "partial" })
          .eq("id", payment.invoice_id);
      }

      if (paymentId && !(invoiceMeta as { is_proforma?: boolean } | null)?.is_proforma) {
        try {
          await postPaymentToLedger({
            id: paymentId,
            amount: payment.amount,
            payment_date: paymentDate,
            reference: payment.reference,
            invoice_number: invoiceMeta?.invoice_number,
          });
        } catch (e) {
          console.warn("Payment ledger post skipped:", e);
        }
      }

      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["finance_stats"] });
      toast.success("Payment recorded");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}
