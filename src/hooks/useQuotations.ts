import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nextDocumentNumber } from "@/lib/documents";
import { lineTaxTotal } from "@/lib/document-tax";

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
      const quotation_number = await nextDocumentNumber("QT");
      
      let subtotal = 0;
      const taxRate = Number(quotation.tax_rate ?? 0);
      
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
        tax_rate: item.tax_rate ?? taxRate,
        total: lineTaxTotal(item.quantity, item.unit_price, item.tax_rate ?? taxRate),
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

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...quotation }: {
      id: string;
      company_id?: string;
      valid_until?: string;
      notes?: string;
      terms?: string;
      tax_rate?: number;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
      }>;
    }) => {
      let subtotal = 0;
      const taxRate = Number(quotation.tax_rate ?? 0);
      
      quotation.items.forEach((item) => {
        subtotal += item.quantity * item.unit_price;
      });

      const tax_amount = subtotal * (taxRate / 100);
      const total = subtotal + tax_amount;

      const { error: qtError } = await supabase
        .from("quotations")
        .update({
          company_id: quotation.company_id,
          valid_until: quotation.valid_until,
          notes: quotation.notes,
          terms: quotation.terms,
          tax_rate: taxRate,
          subtotal,
          tax_amount,
          total,
        })
        .eq("id", id);

      if (qtError) throw qtError;

      // Delete existing items and insert new ones
      await supabase.from("quotation_items").delete().eq("quotation_id", id);

      const items = quotation.items.map((item) => ({
        quotation_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: taxRate,
        total: lineTaxTotal(item.quantity, item.unit_price, taxRate),
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(items);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation updated");
    },
    onError: (error) => {
      toast.error("Failed to update quotation: " + error.message);
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
      const { data: quotation, error: qtError } = await supabase
        .from("quotations")
        .select("*, quotation_items(*)")
        .eq("id", quotationId)
        .single();

      if (qtError) throw qtError;

      const invoice_number = await nextDocumentNumber("INV");
      const headerRate = Number(quotation.tax_rate) || 0;

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
          tax_rate: headerRate,
          tax_amount: quotation.tax_amount,
          total: quotation.total,
          status: "draft",
          is_proforma: false,
        } as never)
        .select()
        .single();

      if (invError) throw invError;

      const items = quotation.quotation_items.map((item: any) => {
        const rate = Number(item.tax_rate) || headerRate;
        return {
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: rate,
          total: lineTaxTotal(Number(item.quantity), Number(item.unit_price), rate),
        };
      });

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;

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
