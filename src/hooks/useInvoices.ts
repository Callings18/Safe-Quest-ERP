import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nextDocumentNumber } from "@/lib/documents";
import { toast } from "sonner";
import { lineTaxTotal } from "@/lib/document-tax";
import { postInvoiceToLedger } from "@/lib/bookkeeping";

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
        .select("total, amount_paid, status, is_proforma");

      if (error) {
        // Column may not exist until migration runs
        const fallback = await supabase.from("invoices").select("total, amount_paid, status");
        if (fallback.error) throw fallback.error;
        const stats = { totalInvoiced: 0, paid: 0, outstanding: 0, overdue: 0, draftCount: 0, proformaCount: 0 };
        fallback.data?.forEach((inv) => {
          const total = Number(inv.total) || 0;
          const paid = Number(inv.amount_paid) || 0;
          stats.totalInvoiced += total;
          stats.paid += paid;
          if (inv.status === "overdue") stats.overdue += total - paid;
          if (inv.status === "draft") stats.draftCount++;
          if (inv.status !== "paid" && inv.status !== "cancelled") stats.outstanding += total - paid;
        });
        return stats;
      }

      const stats = {
        totalInvoiced: 0,
        paid: 0,
        outstanding: 0,
        overdue: 0,
        draftCount: 0,
        proformaCount: 0,
      };

      invoices?.forEach((inv: any) => {
        if (inv.is_proforma) {
          stats.proformaCount++;
          return;
        }
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

function summarizeItems(items: Array<{ quantity: number; unit_price: number; tax_rate?: number }>) {
  let subtotal = 0;
  let tax_amount = 0;
  items.forEach((item) => {
    const lineTotal = item.quantity * item.unit_price;
    subtotal += lineTotal;
    tax_amount += lineTotal * ((item.tax_rate || 0) / 100);
  });
  const rates = items.map((i) => Number(i.tax_rate) || 0);
  const tax_rate = rates.length ? rates.sort((a, b) => b - a)[0] : 0;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    total: Math.round((subtotal + tax_amount) * 100) / 100,
    tax_rate,
  };
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
      is_proforma?: boolean;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
    }) => {
      const isProforma = !!invoice.is_proforma;
      const invoice_number = await nextDocumentNumber(isProforma ? "PFI" : "INV");
      const totals = summarizeItems(invoice.items);

      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .insert({
          invoice_number,
          company_id: invoice.company_id,
          contact_id: invoice.contact_id,
          project_id: invoice.project_id,
          due_date: invoice.due_date,
          notes: invoice.notes,
          subtotal: totals.subtotal,
          tax_rate: totals.tax_rate,
          tax_amount: totals.tax_amount,
          total: totals.total,
          status: "draft",
          is_proforma: isProforma,
        } as never)
        .select()
        .single();

      if (invError) {
        // Fallback if is_proforma column not migrated yet
        if (/is_proforma|column/i.test(invError.message)) {
          const { data: inv2, error: err2 } = await supabase
            .from("invoices")
            .insert({
              invoice_number,
              company_id: invoice.company_id,
              contact_id: invoice.contact_id,
              project_id: invoice.project_id,
              due_date: invoice.due_date,
              notes: invoice.notes,
              subtotal: totals.subtotal,
              tax_rate: totals.tax_rate,
              tax_amount: totals.tax_amount,
              total: totals.total,
              status: "draft",
            })
            .select()
            .single();
          if (err2) throw err2;
          const { error: itemsError } = await supabase.from("invoice_items").insert(
            invoice.items.map((item) => ({
              invoice_id: inv2.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              tax_rate: item.tax_rate || 0,
              total: lineTaxTotal(item.quantity, item.unit_price, item.tax_rate || 0),
            })),
          );
          if (itemsError) throw itemsError;
          return inv2;
        }
        throw invError;
      }

      const { error: itemsError } = await supabase.from("invoice_items").insert(
        invoice.items.map((item) => ({
          invoice_id: inv.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          total: lineTaxTotal(item.quantity, item.unit_price, item.tax_rate || 0),
        })),
      );

      if (itemsError) throw itemsError;

      return inv;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      toast.success(vars.is_proforma ? "Proforma created" : "Invoice created");
    },
    onError: (error) => {
      toast.error("Failed to create invoice: " + error.message);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...invoice
    }: {
      id: string;
      company_id?: string;
      due_date?: string;
      notes?: string;
      is_proforma?: boolean;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
      }>;
    }) => {
      const totals = summarizeItems(invoice.items);

      const { error: invError } = await supabase
        .from("invoices")
        .update({
          company_id: invoice.company_id,
          due_date: invoice.due_date,
          notes: invoice.notes,
          subtotal: totals.subtotal,
          tax_rate: totals.tax_rate,
          tax_amount: totals.tax_amount,
          total: totals.total,
          is_proforma: !!invoice.is_proforma,
        } as never)
        .eq("id", id);

      if (invError && !/is_proforma|column/i.test(invError.message)) throw invError;
      if (invError && /is_proforma|column/i.test(invError.message)) {
        const { error } = await supabase
          .from("invoices")
          .update({
            company_id: invoice.company_id,
            due_date: invoice.due_date,
            notes: invoice.notes,
            subtotal: totals.subtotal,
            tax_rate: totals.tax_rate,
            tax_amount: totals.tax_amount,
            total: totals.total,
          })
          .eq("id", id);
        if (error) throw error;
      }

      await supabase.from("invoice_items").delete().eq("invoice_id", id);

      const { error: itemsError } = await supabase.from("invoice_items").insert(
        invoice.items.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          total: lineTaxTotal(item.quantity, item.unit_price, item.tax_rate || 0),
        })),
      );

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

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
    }) => {
      const { data: inv, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;

      if (status === "sent" && !(inv as any).is_proforma) {
        try {
          await postInvoiceToLedger(inv as any);
        } catch (e) {
          console.warn("Ledger post skipped:", e);
        }
      }
      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["finance_stats"] });
      toast.success("Invoice status updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useConvertProformaToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proformaId: string) => {
      const { data: proforma, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("id", proformaId)
        .single();
      if (error) throw error;

      const invoice_number = await nextDocumentNumber("INV");
      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({
          invoice_number,
          company_id: proforma.company_id,
          contact_id: proforma.contact_id,
          project_id: proforma.project_id,
          notes: `Converted from proforma ${proforma.invoice_number}${proforma.notes ? `\n${proforma.notes}` : ""}`,
          terms: proforma.terms,
          due_date: proforma.due_date,
          subtotal: proforma.subtotal,
          tax_rate: proforma.tax_rate,
          tax_amount: proforma.tax_amount,
          total: proforma.total,
          status: "draft",
          is_proforma: false,
        } as never)
        .select()
        .single();
      if (invErr) throw invErr;

      const items = (proforma.invoice_items || []).map((item: any) => ({
        invoice_id: inv.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        total: item.total,
      }));
      if (items.length) {
        const { error: iErr } = await supabase.from("invoice_items").insert(items);
        if (iErr) throw iErr;
      }

      await supabase
        .from("invoices")
        .update({ status: "cancelled", notes: `${proforma.notes || ""}\nConverted to ${invoice_number}`.trim() } as never)
        .eq("id", proformaId);

      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_stats"] });
      toast.success("Proforma converted to tax invoice");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
