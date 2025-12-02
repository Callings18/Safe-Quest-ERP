import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_stats"] });
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
      toast.success("Company created");
    },
    onError: (error) => {
      toast.error("Failed to create company: " + error.message);
    },
  });
}
