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
      project_type?: "construction" | "solar" | "maintenance" | "other";
      company_id?: string;
      site_address?: string;
      city?: string;
      start_date?: string;
      end_date?: string;
      budget?: number;
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
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
