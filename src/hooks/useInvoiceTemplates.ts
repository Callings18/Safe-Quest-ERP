import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceTemplate {
  id: string;
  name: string;
  is_default: boolean;
  logo_url?: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_tpin?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  show_logo: boolean;
  show_bank_details: boolean;
  bank_name?: string;
  bank_account?: string;
  bank_branch?: string;
  footer_text?: string;
}

export function useInvoiceTemplates() {
  return useQuery({
    queryKey: ["invoice_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InvoiceTemplate[];
    },
  });
}

export function useDefaultTemplate() {
  return useQuery({
    queryKey: ["default_invoice_template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("is_default", true)
        .maybeSingle();
      if (error) throw error;
      return data as InvoiceTemplate | null;
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<InvoiceTemplate, "id">) => {
      // If this is default, unset other defaults
      if (template.is_default) {
        await supabase
          .from("invoice_templates")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const { data, error } = await supabase
        .from("invoice_templates")
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_templates"] });
      queryClient.invalidateQueries({ queryKey: ["default_invoice_template"] });
      toast.success("Template created");
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<InvoiceTemplate> & { id: string }) => {
      // If this is default, unset other defaults
      if (template.is_default) {
        await supabase
          .from("invoice_templates")
          .update({ is_default: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("invoice_templates")
        .update(template)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_templates"] });
      queryClient.invalidateQueries({ queryKey: ["default_invoice_template"] });
      toast.success("Template updated");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoice_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_templates"] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + error.message);
    },
  });
}
