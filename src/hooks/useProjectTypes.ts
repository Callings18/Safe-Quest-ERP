import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const FALLBACK_PROJECT_TYPES = [
  { id: "construction", name: "Construction", slug: "construction", is_active: true, sort_order: 1 },
  { id: "solar", name: "Solar", slug: "solar", is_active: true, sort_order: 2 },
  { id: "maintenance", name: "Maintenance", slug: "maintenance", is_active: true, sort_order: 3 },
  { id: "other", name: "Other", slug: "other", is_active: true, sort_order: 4 },
];

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    || "other";
}

export function useProjectTypes() {
  return useQuery({
    queryKey: ["project_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name");
      if (error) return FALLBACK_PROJECT_TYPES;
      return data?.length ? data : FALLBACK_PROJECT_TYPES;
    },
  });
}

export function useCreateProjectType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const slug = slugify(name);
      const { data, error } = await supabase
        .from("project_types")
        .insert({ name: name.trim(), slug, is_active: true, sort_order: 50 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project_types"] });
      toast.success("Project type added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
