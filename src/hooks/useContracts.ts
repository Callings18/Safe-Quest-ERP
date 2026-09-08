import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nextDocumentNumber } from "@/lib/documents";
import { logActivity } from "@/lib/activity";
import { differenceInDays } from "date-fns";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, companies(name), suppliers(name), projects(name), document_files(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useContractStats() {
  return useQuery({
    queryKey: ["contract_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts").select("status, value, end_date");
      if (error) throw error;
      const today = new Date();
      const stats = { total: data?.length || 0, active: 0, expiringSoon: 0, expired: 0, value: 0 };
      data?.forEach((c) => {
        if (c.status === "active") stats.active++;
        stats.value += Number(c.value) || 0;
        if (c.end_date) {
          const days = differenceInDays(new Date(c.end_date), today);
          if (days < 0) stats.expired++;
          else if (days <= 60) stats.expiringSoon++;
        }
      });
      return stats;
    },
  });
}

export function useSaveContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contract: {
      id?: string;
      title: string;
      contract_type: string;
      company_id?: string | null;
      supplier_id?: string | null;
      project_id?: string | null;
      description?: string;
      value: number;
      retention_percent?: number;
      start_date?: string | null;
      end_date?: string | null;
      renewal_reminder_days?: number;
      signed_date?: string | null;
      signed_by?: string;
      counterparty_signatory?: string;
      status: "draft" | "active" | "expired" | "terminated" | "completed" | "renewed";
      notes?: string;
    }) => {
      const { id, ...rest } = contract;
      const payload = {
        ...rest,
        company_id: rest.company_id || null,
        supplier_id: rest.supplier_id || null,
        project_id: rest.project_id || null,
        start_date: rest.start_date || null,
        end_date: rest.end_date || null,
        signed_date: rest.signed_date || null,
        value: Number(rest.value) || 0,
        retention_percent: Number(rest.retention_percent) || 0,
        renewal_reminder_days: Number(rest.renewal_reminder_days) || 30,
      };
      if (id) {
        const { error } = await supabase.from("contracts").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("contracts")
        .insert({ ...payload, contract_number: await nextDocumentNumber("CTR") })
        .select()
        .single();
      if (error) throw error;
      await logActivity("Contract saved", "contract", data.id, payload.title);
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["contract_stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard_activity"] });
      qc.invalidateQueries({ queryKey: ["activity_log"] });
      toast.success("Contract saved");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["contract_stats"] });
      toast.success("Contract deleted");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useDocumentFiles(contractId?: string) {
  return useQuery({
    queryKey: ["document_files", contractId],
    queryFn: async () => {
      let query = supabase
        .from("document_files")
        .select("*, contracts(contract_number, title), projects(name)");
      if (contractId) query = query.eq("contract_id", contractId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      name,
      document_type,
      contract_id,
      project_id,
      notes,
    }: {
      file: File;
      name: string;
      document_type: string;
      contract_id?: string | null;
      project_id?: string | null;
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const path = `${user.user?.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) throw upErr;

      const { data, error } = await supabase
        .from("document_files")
        .insert({
          name,
          document_type,
          file_url: path,
          file_size: file.size,
          mime_type: file.type,
          contract_id: contract_id || null,
          project_id: project_id || null,
          notes: notes || null,
          uploaded_by: user.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document_files"] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Document uploaded");
    },
    onError: (e: Error) => toast.error("Upload failed: " + e.message),
  });
}

export async function getDocumentUrl(path: string) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file_url }: { id: string; file_url: string }) => {
      await supabase.storage.from("documents").remove([file_url]);
      const { error } = await supabase.from("document_files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document_files"] });
      toast.success("Document deleted");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}
