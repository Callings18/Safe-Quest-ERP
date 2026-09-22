import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, companies(*)")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, companies(*), contacts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ["lead_stats"],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("status, value");

      if (error) throw error;

      const stats = {
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0,
        totalValue: 0,
      };

      leads?.forEach((lead) => {
        stats[lead.status as keyof typeof stats]++;
        if (lead.status !== "lost") {
          stats.totalValue += Number(lead.value) || 0;
        }
      });

      return stats;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: {
      title: string;
      description?: string;
      company_id?: string;
      contact_id?: string;
      value?: number;
      source?: string;
      expected_close_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      await logActivity("Lead created", "lead", data.id, data.title);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_activity"] });
      queryClient.invalidateQueries({ queryKey: ["activity_log"] });
      toast.success("Lead created");
    },
    onError: (error) => {
      toast.error("Failed to create lead: " + error.message);
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company: {
      name: string;
      industry?: string;
      website?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
    }) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Customer added");
    },
    onError: (error) => {
      toast.error("Failed to create company: " + error.message);
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: {
      first_name: string;
      last_name?: string;
      email?: string;
      phone?: string;
      job_title?: string;
      company_id?: string;
    }) => {
      const { data, error } = await supabase.from("contacts").insert({
        ...contact,
        company_id: contact.company_id || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_stats"] });
      toast.success("Lead updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Create a draft quotation from a lead (single line from estimated value). */
export function useConvertLeadToQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (error) throw error;

      const { nextDocumentNumber } = await import("@/lib/documents");
      const { lineTaxTotal } = await import("@/lib/document-tax");
      const { effectiveVatRate, parseTaxConfig } = await import("@/lib/zambia-tax");

      let taxRate = 16;
      try {
        const raw = localStorage.getItem("safequest_tax_config");
        if (raw) taxRate = effectiveVatRate(parseTaxConfig(JSON.parse(raw)));
        else {
          const { data: settings } = await supabase.from("company_settings").select("tax_config").limit(1).maybeSingle();
          if (settings?.tax_config) taxRate = effectiveVatRate(parseTaxConfig(settings.tax_config));
        }
      } catch {
        /* default 16% */
      }

      const unitPrice = Number(lead.value) || 0;
      const subtotal = unitPrice;
      const tax_amount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
      const total = Math.round((subtotal + tax_amount) * 100) / 100;

      const { data: qt, error: qErr } = await supabase
        .from("quotations")
        .insert({
          quotation_number: await nextDocumentNumber("QT"),
          company_id: lead.company_id || null,
          contact_id: lead.contact_id || null,
          status: "draft",
          subtotal,
          tax_rate: taxRate,
          tax_amount,
          total,
          notes: `From lead: ${lead.title}${lead.description ? ` — ${lead.description}` : ""}`,
        })
        .select()
        .single();
      if (qErr) throw qErr;

      const { error: iErr } = await supabase.from("quotation_items").insert({
        quotation_id: qt.id,
        description: lead.title,
        quantity: 1,
        unit_price: unitPrice,
        tax_rate: taxRate,
        total: lineTaxTotal(1, unitPrice, taxRate),
      });
      if (iErr) throw iErr;

      if (lead.status !== "won" && lead.status !== "lost") {
        await supabase.from("leads").update({ status: "proposal" }).eq("id", leadId);
      }

      await logActivity("Quotation from lead", "quotation", qt.id, qt.quotation_number);
      return qt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_stats"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_activity"] });
      toast.success("Draft quotation created from lead");
    },
    onError: (error: Error) => toast.error("Failed to create quotation: " + error.message),
  });
}
