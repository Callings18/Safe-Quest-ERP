import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMaintenanceRecords() {
  return useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*, assets(name, asset_number), vehicles(registration_number, make, model)")
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useFuelLogs() {
  return useQuery({
    queryKey: ["fuel_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuel_logs")
        .select("*, vehicles(registration_number, make, model)")
        .order("fill_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: {
      asset_number: string; name: string; category: string; description?: string;
      serial_number?: string; purchase_date?: string; purchase_price?: number;
      current_value?: number; depreciation_rate?: number; location?: string;
      assigned_to?: string; warranty_expiry?: string; notes?: string;
    }) => {
      const { data, error } = await supabase.from("assets").insert(asset).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset created"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: {
      registration_number: string; make: string; model: string; year?: number;
      color?: string; vin?: string; engine_number?: string; fuel_type?: string;
      tank_capacity?: number; current_mileage?: number; purchase_date?: string;
      purchase_price?: number; insurance_expiry?: string; fitness_expiry?: string;
      assigned_driver?: string; notes?: string;
    }) => {
      const { data, error } = await supabase.from("vehicles").insert(vehicle).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Vehicle added"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useCreateMaintenanceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: {
      asset_id?: string; vehicle_id?: string; maintenance_type?: string;
      description: string; scheduled_date?: string; completed_date?: string;
      cost?: number; vendor?: string; mileage_at_service?: number;
      next_service_date?: string; next_service_mileage?: number; notes?: string;
    }) => {
      const { data, error } = await supabase.from("maintenance_records").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance_records"] }); toast.success("Maintenance record created"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useCreateFuelLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      vehicle_id: string; fill_date?: string; fuel_type?: string;
      quantity: number; unit_price: number; total_cost: number;
      mileage_at_fill?: number; station?: string; driver?: string;
      receipt_number?: string; notes?: string;
    }) => {
      const { data, error } = await supabase.from("fuel_logs").insert(log).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fuel_logs"] }); toast.success("Fuel log recorded"); },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useAssetStats() {
  return useQuery({
    queryKey: ["asset_stats"],
    queryFn: async () => {
      const [{ data: assets }, { data: vehicles }, { data: maintenance }] = await Promise.all([
        supabase.from("assets").select("id, status, current_value"),
        supabase.from("vehicles").select("id, status, insurance_expiry, fitness_expiry"),
        supabase.from("maintenance_records").select("id, status, scheduled_date"),
      ]);

      const totalAssetValue = assets?.reduce((s, a) => s + (Number(a.current_value) || 0), 0) || 0;
      const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0;
      const now = new Date().toISOString().split('T')[0];
      const overdueMaintenance = maintenance?.filter(m => m.status === 'scheduled' && m.scheduled_date && m.scheduled_date < now).length || 0;
      const expiringInsurance = vehicles?.filter(v => {
        if (!v.insurance_expiry) return false;
        const diff = (new Date(v.insurance_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diff <= 30 && diff >= 0;
      }).length || 0;

      return { totalAssets: assets?.length || 0, totalAssetValue, totalVehicles: vehicles?.length || 0, activeVehicles, overdueMaintenance, expiringInsurance };
    },
  });
}
