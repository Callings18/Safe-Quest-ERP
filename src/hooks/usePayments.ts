import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { error: payError } = await supabase.rpc("record_invoice_payment", {
        p_invoice_id: payment.invoice_id,
        p_amount: payment.amount,
        p_payment_method: payment.payment_method as "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card",
        p_reference: payment.reference ?? null,
        p_notes: payment.notes ?? null,
        p_payment_date: payment.payment_date || new Date().toISOString().split("T")[0],
      });

      if (!payError) return { ok: true };

      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .select("total, amount_paid")
        .eq("id", payment.invoice_id)
        .single();
      if (invError) throw payError;

      const { error: insertErr } = await supabase.from("payments").insert({
        invoice_id: payment.invoice_id,
        amount: payment.amount,
        payment_method: payment.payment_method as "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card",
        reference: payment.reference,
        notes: payment.notes,
        payment_date: payment.payment_date || new Date().toISOString().split("T")[0],
      });
      if (insertErr) throw insertErr;

      const newAmountPaid = (Number(invoice.amount_paid) || 0) + payment.amount;
      const total = Number(invoice.total) || 0;
      await supabase
        .from("invoices")
        .update({ amount_paid: newAmountPaid, status: newAmountPaid >= total ? "paid" : "partial" })
        .eq("id", payment.invoice_id);

      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      toast.success("Payment recorded");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}
