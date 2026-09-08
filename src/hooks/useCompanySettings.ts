import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompanySettings() {
  return useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data: existing } = await supabase.from("company_settings").select("id").limit(1).maybeSingle();
      const { data: user } = await supabase.auth.getUser();
      if (existing?.id) {
        const { error } = await supabase
          .from("company_settings")
          .update({ ...payload, updated_at: new Date().toISOString(), updated_by: user.user?.id })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("company_settings").insert({
          ...payload,
          updated_by: user.user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company_settings"] });
      toast.success("Company settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyRoles() {
  return useQuery({
    queryKey: ["my_roles"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.user.id);
      if (error) throw error;
      return (data || []).map((r) => r.role);
    },
  });
}

export function useStaffUsers() {
  return useQuery({
    queryKey: ["staff_users"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      return (profiles || []).map((p) => ({
        ...p,
        roles: (roles || []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role, enabled }: { userId: string; role: string; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as never });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff_users"] });
      toast.success("Roles updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
