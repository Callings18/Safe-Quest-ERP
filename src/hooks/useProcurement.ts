import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: { name: string; contact_person?: string; email?: string; phone?: string; address?: string; city?: string; tax_id?: string; payment_terms?: number; notes?: string }) => {
      const { data, error } = await supabase.from("suppliers").insert(supplier).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Supplier added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchase_orders").select("*, suppliers(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (po: { order_number: string; supplier_id: string; expected_date?: string; notes?: string; subtotal?: number; tax_amount?: number; total?: number }) => {
      const { data, error } = await supabase.from("purchase_orders").insert(po).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["purchase_orders"] }); toast.success("Purchase order created"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdatePOStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["purchase_orders"] }); toast.success("Status updated"); },
  });
}

export function useProcurementStats() {
  return useQuery({
    queryKey: ["procurement_stats"],
    queryFn: async () => {
      const { data: pos, error } = await supabase.from("purchase_orders").select("status, total");
      if (error) throw error;
      const { data: suppliers } = await supabase.from("suppliers").select("id, is_active");
      const stats = { totalOrders: pos?.length || 0, pendingOrders: 0, totalSpend: 0, activeSuppliers: 0 };
      pos?.forEach(p => { stats.totalSpend += Number(p.total) || 0; if (p.status === 'draft' || p.status === 'approved') stats.pendingOrders++; });
      stats.activeSuppliers = suppliers?.filter(s => s.is_active).length || 0;
      return stats;
    },
  });
}
