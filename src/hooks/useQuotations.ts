import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useQuotations() {
  return useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*, companies(*), contacts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("quotations")
        .select("*, companies(*), contacts(*), quotation_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotation: {
      company_id?: string;
      contact_id?: string;
      project_id?: string;
      valid_until?: string;
      notes?: string;
      terms?: string;
      tax_rate?: number;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
    }) => {
      const quotation_number = `QT-${Date.now().toString(36).toUpperCase()}`;
      
      let subtotal = 0;
      const taxRate = quotation.tax_rate || 16;
      
      quotation.items.forEach((item) => {
        subtotal += item.quantity * item.unit_price;
      });

      const tax_amount = subtotal * (taxRate / 100);
      const total = subtotal + tax_amount;

      const { data: qt, error: qtError } = await supabase
        .from("quotations")
        .insert({
          quotation_number,
          company_id: quotation.company_id,
          contact_id: quotation.contact_id,
          project_id: quotation.project_id,
          valid_until: quotation.valid_until,
          notes: quotation.notes,
          terms: quotation.terms,
          tax_rate: taxRate,
          subtotal,
          tax_amount,
          total,
          status: "draft",
        })
        .select()
        .single();

      if (qtError) throw qtError;

      const items = quotation.items.map((item) => ({
        quotation_id: qt.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        total: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return qt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created");
    },
    onError: (error) => {
      toast.error("Failed to create quotation: " + error.message);
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted" }) => {
      const { error } = await supabase
        .from("quotations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation status updated");
    },
  });
}

export function useConvertQuotationToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      // Get quotation with items
      const { data: quotation, error: qtError } = await supabase
        .from("quotations")
        .select("*, quotation_items(*)")
        .eq("id", quotationId)
        .single();

      if (qtError) throw qtError;

      const invoice_number = `INV-${Date.now().toString(36).toUpperCase()}`;

      // Create invoice
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .insert({
          invoice_number,
          company_id: quotation.company_id,
          contact_id: quotation.contact_id,
          project_id: quotation.project_id,
          quotation_id: quotationId,
          notes: quotation.notes,
          terms: quotation.terms,
          subtotal: quotation.subtotal,
          tax_rate: quotation.tax_rate,
          tax_amount: quotation.tax_amount,
          total: quotation.total,
          status: "draft",
        })
        .select()
        .single();

      if (invError) throw invError;

      // Copy items
      const items = quotation.quotation_items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;

      // Update quotation status
      await supabase
        .from("quotations")
        .update({ status: "converted" })
        .eq("id", quotationId);

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Quotation converted to invoice");
    },
    onError: (error) => {
      toast.error("Failed to convert: " + error.message);
    },
  });
}
