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
      // Get current invoice
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .select("total, amount_paid")
        .eq("id", payment.invoice_id)
        .single();

      if (invError) throw invError;

      // Insert payment
      const { data: paymentRecord, error: payError } = await supabase
        .from("payments")
        .insert({
          invoice_id: payment.invoice_id,
          amount: payment.amount,
          payment_method: payment.payment_method as "cash" | "bank_transfer" | "mobile_money" | "cheque" | "card",
          reference: payment.reference,
          notes: payment.notes,
          payment_date: payment.payment_date || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (payError) throw payError;

      // Update invoice amount_paid and status
      const newAmountPaid = (Number(invoice.amount_paid) || 0) + payment.amount;
      const total = Number(invoice.total) || 0;
      
      let newStatus: "partial" | "paid" = "partial";
      if (newAmountPaid >= total) {
        newStatus = "paid";
      }

      const { error: updateError } = await supabase
        .from("invoices")
        .update({ 
          amount_paid: newAmountPaid,
          status: newStatus
        })
        .eq("id", payment.invoice_id);

      if (updateError) throw updateError;

      return paymentRecord;
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
