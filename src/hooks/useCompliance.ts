import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

export function useComplianceDocuments() {
  return useQuery({
    queryKey: ["compliance_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_documents")
        .select("*, projects(*)")
        .order("expiry_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: ["compliance_stats"],
    queryFn: async () => {
      const { data: documents, error } = await supabase
        .from("compliance_documents")
        .select("expiry_date, status");

      if (error) throw error;

      const today = new Date();
      const stats = {
        total: documents?.length || 0,
        valid: 0,
        expiringSoon: 0,
        expired: 0,
      };

      documents?.forEach((doc) => {
        if (!doc.expiry_date) {
          stats.valid++;
          return;
        }

        const expiryDate = new Date(doc.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        if (daysUntilExpiry < 0) {
          stats.expired++;
        } else if (daysUntilExpiry <= 30) {
          stats.expiringSoon++;
        } else {
          stats.valid++;
        }
      });

      return stats;
    },
  });
}

export function useCreateComplianceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: {
      name: string;
      document_type: string;
      description?: string;
      issue_date?: string;
      expiry_date?: string;
      reminder_days?: number;
      project_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("compliance_documents")
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance_documents"] });
      queryClient.invalidateQueries({ queryKey: ["compliance_stats"] });
      toast.success("Document added");
    },
    onError: (error) => {
      toast.error("Failed to add document: " + error.message);
    },
  });
}
