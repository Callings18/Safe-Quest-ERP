import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nextDocumentNumber } from "@/lib/documents";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { effectiveVatRate } from "@/lib/zambia-tax";

export type BOQItemInput = {
  section_name?: string;
  item_code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  wastage_percent?: number;
};

export function calcItemAmount(item: { quantity: number; rate: number; wastage_percent?: number }) {
  const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
  return Math.round(base * (1 + (Number(item.wastage_percent) || 0) / 100) * 100) / 100;
}

export function useBOQs() {
  return useQuery({
    queryKey: ["boqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boqs")
        .select("*, projects(name), companies(name), boq_items(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useBOQ(id?: string) {
  return useQuery({
    queryKey: ["boq", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("boqs")
        .select("*, projects(name), companies(name), boq_items(*), boq_sections(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useBOQStats() {
  return useQuery({
    queryKey: ["boq_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("boqs").select("status, total");
      if (error) throw error;
      const stats = { total: data?.length || 0, draft: 0, approved: 0, value: 0 };
      data?.forEach((b) => {
        if (b.status === "draft") stats.draft++;
        if (b.status === "approved") stats.approved++;
        stats.value += Number(b.total) || 0;
      });
      return stats;
    },
  });
}

function computeTotals(items: BOQItemInput[], markup: number, contingency: number) {
  const subtotal = items.reduce((s, i) => s + calcItemAmount(i), 0);
  const total = subtotal * (1 + (markup || 0) / 100) * (1 + (contingency || 0) / 100);
  return { subtotal: Math.round(subtotal * 100) / 100, total: Math.round(total * 100) / 100 };
}

export function useSaveBOQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      title: string;
      discipline?: string;
      project_id?: string | null;
      company_id?: string | null;
      markup_percent: number;
      contingency_percent: number;
      notes?: string;
      items: BOQItemInput[];
    }) => {
      const { subtotal, total } = computeTotals(input.items, input.markup_percent, input.contingency_percent);
      const payload = {
        title: input.title,
        discipline: input.discipline || null,
        project_id: input.project_id || null,
        company_id: input.company_id || null,
        markup_percent: input.markup_percent || 0,
        contingency_percent: input.contingency_percent || 0,
        notes: input.notes || null,
        subtotal,
        total,
      };

      let boqId = input.id;
      if (boqId) {
        const { error } = await supabase.from("boqs").update(payload).eq("id", boqId);
        if (error) throw error;
        await supabase.from("boq_items").delete().eq("boq_id", boqId);
      } else {
        const boq_number = await nextDocumentNumber("BOQ");
        const { data, error } = await supabase
          .from("boqs")
          .insert({ ...payload, boq_number })
          .select()
          .single();
        if (error) throw error;
        boqId = data.id;
      }

      const rows = input.items.map((i, idx) => ({
        boq_id: boqId!,
        item_code: i.item_code || null,
        description: i.description,
        unit: i.unit || "each",
        quantity: Number(i.quantity) || 0,
        rate: Number(i.rate) || 0,
        wastage_percent: Number(i.wastage_percent) || 0,
        amount: calcItemAmount(i),
        notes: i.section_name || null,
        sort_order: idx,
      }));
      if (rows.length) {
        const { error } = await supabase.from("boq_items").insert(rows);
        if (error) throw error;
      }
      return boqId!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boqs"] });
      qc.invalidateQueries({ queryKey: ["boq_stats"] });
      toast.success("BOQ saved");
    },
    onError: (e: Error) => toast.error("Failed to save BOQ: " + e.message),
  });
}

export function useUpdateBOQStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "priced" | "submitted" | "approved" | "revised" }) => {
      const { error } = await supabase.from("boqs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boqs"] });
      qc.invalidateQueries({ queryKey: ["boq_stats"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteBOQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boqs"] });
      qc.invalidateQueries({ queryKey: ["boq_stats"] });
      toast.success("BOQ deleted");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

// Convert a BOQ into a quotation with one line per BOQ item
export function useConvertBOQToQuotation() {
  const qc = useQueryClient();
  const { settings: tax } = useTaxSettings();
  const vatRate = effectiveVatRate(tax);
  return useMutation({
    mutationFn: async (boqId: string) => {
      const { data: boq, error } = await supabase
        .from("boqs")
        .select("*, boq_items(*)")
        .eq("id", boqId)
        .single();
      if (error) throw error;

      const uplift =
        (1 + (Number(boq.markup_percent) || 0) / 100) * (1 + (Number(boq.contingency_percent) || 0) / 100);

      const items = (boq.boq_items || []).map((i: any) => {
        const qty = Number(i.quantity) || 0;
        const unitPrice = Math.round(((Number(i.amount) || 0) / (qty || 1)) * uplift * 100) / 100;
        return {
          description: `${i.item_code ? i.item_code + " - " : ""}${i.description} (${i.unit})`,
          quantity: qty,
          unit_price: unitPrice,
          tax_rate: vatRate,
          total: Math.round(qty * unitPrice * (1 + vatRate / 100) * 100) / 100,
        };
      });

      const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.unit_price, 0);
      const tax_amount = subtotal * (vatRate / 100);

      const { data: quote, error: qErr } = await supabase
        .from("quotations")
        .insert({
          quotation_number: await nextDocumentNumber("QT"),
          company_id: boq.company_id,
          project_id: boq.project_id,
          status: "draft",
          subtotal,
          tax_rate: vatRate,
          tax_amount,
          total: subtotal + tax_amount,
          notes: `Generated from ${boq.boq_number} - ${boq.title}`,
        })
        .select()
        .single();
      if (qErr) throw qErr;

      if (items.length) {
        const { error: iErr } = await supabase
          .from("quotation_items")
          .insert(items.map((i: any) => ({ ...i, quotation_id: quote.id })));
        if (iErr) throw iErr;
      }

      await supabase.from("boqs").update({ quotation_id: quote.id, status: "submitted" }).eq("id", boqId);
      return quote;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boqs"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created from BOQ");
    },
    onError: (e: Error) => toast.error("Failed to convert: " + e.message),
  });
}
