import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DocumentHeaderMode = "letterhead" | "logo";
export type DocumentTableStyle = "underline" | "solid";

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
  letterhead_url?: string;
  header_mode?: DocumentHeaderMode;
  logo_width?: number;
  account_name?: string;
  mobile_money?: string;
  mobile_money_name?: string;
  table_style?: DocumentTableStyle;
  margin_top?: number;
  margin_bottom?: number;
}

const STYLE_MARKER = /<!--sq-style:([\s\S]*?)-->/;

export function parseTemplateStyle(footer?: string | null) {
  const match = footer?.match(STYLE_MARKER);
  let style: Partial<InvoiceTemplate> = {};
  if (match?.[1]) {
    try {
      style = JSON.parse(match[1]);
    } catch {
      style = {};
    }
  }
  return {
    footer_text: (footer || "").replace(STYLE_MARKER, "").trim(),
    style,
  };
}

export function encodeTemplateStyle(footer: string | undefined, extra: Partial<InvoiceTemplate>) {
  const payload = {
    letterhead_url: extra.letterhead_url || "",
    header_mode: extra.header_mode || "letterhead",
    logo_width: extra.logo_width ?? 72,
    account_name: extra.account_name || "",
    mobile_money: extra.mobile_money || "",
    mobile_money_name: extra.mobile_money_name || "",
    table_style: extra.table_style || "underline",
    margin_top: extra.margin_top,
    margin_bottom: extra.margin_bottom,
  };
  const clean = (footer || "").replace(STYLE_MARKER, "").trim();
  return `${clean}${clean ? "\n" : ""}<!--sq-style:${JSON.stringify(payload)}-->`;
}

export function hydrateTemplate(row: InvoiceTemplate): InvoiceTemplate {
  const { footer_text, style } = parseTemplateStyle(row.footer_text);
  return { ...row, ...style, footer_text };
}

function toDbPayload(template: Partial<InvoiceTemplate>) {
  return {
    name: template.name,
    is_default: template.is_default,
    logo_url: template.logo_url,
    company_name: template.company_name,
    company_address: template.company_address,
    company_phone: template.company_phone,
    company_email: template.company_email,
    company_tpin: template.company_tpin,
    primary_color: template.primary_color,
    secondary_color: template.secondary_color,
    font_family: template.font_family,
    show_logo: template.show_logo,
    show_bank_details: template.show_bank_details,
    bank_name: template.bank_name,
    bank_account: template.bank_account,
    bank_branch: template.bank_branch,
    footer_text: encodeTemplateStyle(template.footer_text, template),
  };
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
      return (data as InvoiceTemplate[]).map(hydrateTemplate);
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
      return data ? hydrateTemplate(data as InvoiceTemplate) : null;
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<InvoiceTemplate, "id">) => {
      if (template.is_default) {
        await supabase
          .from("invoice_templates")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const { data, error } = await supabase
        .from("invoice_templates")
        .insert(toDbPayload(template))
        .select()
        .single();
      if (error) throw error;
      return hydrateTemplate(data as InvoiceTemplate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_templates"] });
      queryClient.invalidateQueries({ queryKey: ["default_invoice_template"] });
      toast.success("Document style saved");
    },
    onError: (error) => {
      toast.error("Failed to save document style: " + error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<InvoiceTemplate> & { id: string }) => {
      if (template.is_default) {
        await supabase
          .from("invoice_templates")
          .update({ is_default: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("invoice_templates")
        .update(toDbPayload(template))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice_templates"] });
      queryClient.invalidateQueries({ queryKey: ["default_invoice_template"] });
      toast.success("Document style saved");
    },
    onError: (error) => {
      toast.error("Failed to update document style: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["default_invoice_template"] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + error.message);
    },
  });
}
