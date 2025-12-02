import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryNotes() {
  return useQuery({
    queryKey: ["delivery_notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_notes")
        .select("*, companies(*), contacts(*), invoices(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeliveryNote(id: string | undefined) {
  return useQuery({
    queryKey: ["delivery_note", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("delivery_notes")
        .select("*, companies(*), contacts(*), invoices(*), delivery_note_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: {
      invoice_id?: string;
      company_id?: string;
      contact_id?: string;
      delivery_address?: string;
      driver_name?: string;
      vehicle_number?: string;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unit?: string;
      }>;
    }) => {
      const delivery_number = `DN-${Date.now().toString(36).toUpperCase()}`;

      const { data: dn, error: dnError } = await supabase
        .from("delivery_notes")
        .insert({
          delivery_number,
          invoice_id: note.invoice_id,
          company_id: note.company_id,
          contact_id: note.contact_id,
          delivery_address: note.delivery_address,
          driver_name: note.driver_name,
          vehicle_number: note.vehicle_number,
          notes: note.notes,
          status: "pending",
        })
        .select()
        .single();

      if (dnError) throw dnError;

      const items = note.items.map((item) => ({
        delivery_note_id: dn.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || "pcs",
      }));

      const { error: itemsError } = await supabase
        .from("delivery_note_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return dn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_notes"] });
      toast.success("Delivery note created");
    },
    onError: (error) => {
      toast.error("Failed to create delivery note: " + error.message);
    },
  });
}

export function useUpdateDeliveryNoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, received_by, received_date }: { 
      id: string; 
      status: "pending" | "dispatched" | "delivered" | "cancelled";
      received_by?: string;
      received_date?: string;
    }) => {
      const { error } = await supabase
        .from("delivery_notes")
        .update({ status, received_by, received_date })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_notes"] });
      toast.success("Delivery note updated");
    },
  });
}

export function useCreateDeliveryNoteFromInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      // Get invoice with items
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .select("*, companies(*), contacts(*), invoice_items(*)")
        .eq("id", invoiceId)
        .single();

      if (invError) throw invError;

      const delivery_number = `DN-${Date.now().toString(36).toUpperCase()}`;

      const { data: dn, error: dnError } = await supabase
        .from("delivery_notes")
        .insert({
          delivery_number,
          invoice_id: invoiceId,
          company_id: invoice.company_id,
          contact_id: invoice.contact_id,
          delivery_address: invoice.companies?.address,
          status: "pending",
        })
        .select()
        .single();

      if (dnError) throw dnError;

      const items = invoice.invoice_items.map((item: any) => ({
        delivery_note_id: dn.id,
        description: item.description,
        quantity: item.quantity,
        unit: "pcs",
      }));

      const { error: itemsError } = await supabase
        .from("delivery_note_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return dn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_notes"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Delivery note created from invoice");
    },
    onError: (error) => {
      toast.error("Failed to create delivery note: " + error.message);
    },
  });
}
