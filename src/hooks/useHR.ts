import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("first_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: {
      employee_number: string; first_name: string; last_name: string; email?: string; phone?: string;
      national_id?: string; job_title?: string; department?: string; hire_date: string;
      basic_salary?: number; bank_name?: string; bank_account?: string;
      napsa_number?: string; nhima_number?: string; tax_pin?: string;
    }) => {
      const { data, error } = await supabase.from("employees").insert(emp).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("employees").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee updated"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: ["employee_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("is_active, department, basic_salary");
      if (error) throw error;
      const stats = { total: data?.length || 0, active: 0, departments: new Set<string>(), totalSalary: 0 };
      data?.forEach(e => {
        if (e.is_active) stats.active++;
        if (e.department) stats.departments.add(e.department);
        stats.totalSalary += Number(e.basic_salary) || 0;
      });
      return { ...stats, departmentCount: stats.departments.size };
    },
  });
}
