import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, companies(*), contacts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("invoices")
        .select("*, companies(*), contacts(*), invoice_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoice_stats"],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("total, amount_paid, status");
      
      if (error) throw error;

      const stats = {
        totalInvoiced: 0,
        paid: 0,
        outstanding: 0,
        overdue: 0,
        draftCount: 0,
      };

      invoices?.forEach((inv) => {
        const total = Number(inv.total) || 0;
        const paid = Number(inv.amount_paid) || 0;
        
        stats.totalInvoiced += total;
        stats.paid += paid;
        
        if (inv.status === "overdue") {
          stats.overdue += total - paid;
        }
        if (inv.status === "draft") {
          stats.draftCount++;
        }
        if (inv.status !== "paid" && inv.status !== "cancelled") {
          stats.outstanding += total - paid;
        }
      });

      return stats;
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: {
      company_id?: string;
      contact_id?: string;
      project_id?: string;
      due_date?: string;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
    }) => {
      const invoice_number = `INV-${Date.now().toString(36).toUpperCase()}`;
      
      let subtotal = 0;
      let tax_amount = 0;
      
      invoice.items.forEach((item) => {
        const lineTotal = item.quantity * item.unit_price;
        subtotal += lineTotal;
        tax_amount += lineTotal * ((item.tax_rate || 0) / 100);
      });

      const total = subtotal + tax_amount;

      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .insert({
          invoice_number,
          company_id: invoice.company_id,
          contact_id: invoice.contact_id,
          project_id: invoice.project_id,
          due_date: invoice.due_date,
          notes: invoice.notes,
          subtotal,
          tax_amount,
          total,
          status: "draft",
        })
        .select()
        .single();

      if (invError) throw invError;

      const items = invoice.items.map((item) => ({
        invoice_id: inv.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        total: item.quantity * item.unit_price * (1 + (item.tax_rate || 0) / 100),
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      toast.success("Invoice created");
    },
    onError: (error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...invoice }: {
      id: string;
      company_id?: string;
      due_date?: string;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
    }) => {
      let subtotal = 0;
      let tax_amount = 0;
      
      invoice.items.forEach((item) => {
        const lineTotal = item.quantity * item.unit_price;
        subtotal += lineTotal;
        tax_amount += lineTotal * ((item.tax_rate || 0) / 100);
      });

      const total = subtotal + tax_amount;

      const { error: invError } = await supabase
        .from("invoices")
        .update({
          company_id: invoice.company_id,
          due_date: invoice.due_date,
          notes: invoice.notes,
          subtotal,
          tax_amount,
          total,
        })
        .eq("id", id);

      if (invError) throw invError;

      // Delete existing items and insert new ones
      await supabase.from("invoice_items").delete().eq("invoice_id", id);

      const items = invoice.items.map((item) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        total: item.quantity * item.unit_price * (1 + (item.tax_rate || 0) / 100),
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      toast.success("Invoice updated");
    },
    onError: (error) => {
      toast.error("Failed to update invoice: " + error.message);
    },
  });
}
