import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, companies(*), contacts(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectStats() {
  return useQuery({
    queryKey: ["project_stats"],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("status, budget, actual_cost, project_type");

      if (error) throw error;

      const stats = {
        active: 0,
        completed: 0,
        totalBudget: 0,
        construction: 0,
        solar: 0,
      };

      projects?.forEach((p) => {
        if (p.status === "in_progress" || p.status === "planning") {
          stats.active++;
        }
        if (p.status === "completed") {
          stats.completed++;
        }
        stats.totalBudget += Number(p.budget) || 0;
        if (p.project_type === "construction") {
          stats.construction++;
        }
        if (p.project_type === "solar") {
          stats.solar++;
        }
      });

      return stats;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: {
      name: string;
      description?: string;
      project_type?: string;
      company_id?: string;
      site_address?: string;
      city?: string;
      start_date?: string;
      end_date?: string;
      budget?: number;
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project_stats"] });
      toast.success("Project created");
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });
}

export function useProjectDocuments(projectId?: string | null) {
  return useQuery({
    queryKey: ["project_documents", projectId],
    queryFn: async () => {
      if (!projectId) return { quotations: [], invoices: [], boqs: [] };
      const [q, inv, boq] = await Promise.all([
        supabase
          .from("quotations")
          .select("id, quotation_number, status, total, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("id, invoice_number, status, total, is_proforma, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("boqs")
          .select("id, boq_number, title, status, total, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ]);
      if (q.error) throw q.error;
      if (inv.error) throw inv.error;
      if (boq.error) throw boq.error;
      return {
        quotations: q.data || [],
        invoices: inv.data || [],
        boqs: boq.data || [],
      };
    },
    enabled: !!projectId,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...project
    }: {
      id: string;
      name?: string;
      description?: string;
      project_type?: string;
      company_id?: string | null;
      site_address?: string | null;
      city?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      budget?: number | null;
      status?: string;
      progress?: number;
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(project as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project_stats"] });
      toast.success("Project updated");
    },
    onError: (error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });
}

