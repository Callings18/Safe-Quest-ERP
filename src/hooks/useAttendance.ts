import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const today = () => new Date().toISOString().slice(0, 10);

export function useAttendance(date?: string) {
  const workDate = date || today();
  return useQuery({
    queryKey: ["attendance_records", workDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, employees(first_name, last_name, employee_number, job_title), projects(name)")
        .eq("work_date", workDate)
        .order("clock_in", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAttendanceStats(date?: string) {
  const workDate = date || today();
  return useQuery({
    queryKey: ["attendance_stats", workDate],
    queryFn: async () => {
      const [{ data: records, error }, { count: empCount }] = await Promise.all([
        supabase.from("attendance_records").select("status, hours_worked, overtime_hours, clock_out").eq("work_date", workDate),
        supabase.from("employees").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      if (error) throw error;
      const stats = {
        totalEmployees: empCount || 0,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0,
        stillClockedIn: 0,
        hours: 0,
        overtime: 0,
      };
      records?.forEach((r) => {
        if (r.status === "present") stats.present++;
        if (r.status === "late") { stats.present++; stats.late++; }
        if (r.status === "absent") stats.absent++;
        if (r.status === "on_leave") stats.onLeave++;
        if (!r.clock_out) stats.stillClockedIn++;
        stats.hours += Number(r.hours_worked) || 0;
        stats.overtime += Number(r.overtime_hours) || 0;
      });
      stats.absent = Math.max(stats.absent, stats.totalEmployees - stats.present - stats.onLeave);
      return stats;
    },
  });
}

async function getPosition(): Promise<{ lat: number | null; lng: number | null }> {
  if (!navigator.geolocation) return { lat: null, lng: null };
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ lat: null, lng: null }), 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve({ lat: null, lng: null });
      },
      { timeout: 5000 }
    );
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { employee_id: string; site_name?: string; project_id?: string | null; useLocation?: boolean }) => {
      const pos = input.useLocation ? await getPosition() : { lat: null, lng: null };
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("attendance_records")
        .upsert(
          {
            employee_id: input.employee_id,
            work_date: today(),
            clock_in: new Date().toISOString(),
            clock_in_lat: pos.lat,
            clock_in_lng: pos.lng,
            site_name: input.site_name || null,
            project_id: input.project_id || null,
            status: new Date().getHours() >= 9 ? "late" : "present",
            recorded_by: user.user?.id,
          },
          { onConflict: "employee_id,work_date" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance_records"] });
      qc.invalidateQueries({ queryKey: ["attendance_stats"] });
      toast.success("Clocked in");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clock_in, useLocation }: { id: string; clock_in: string | null; useLocation?: boolean }) => {
      const pos = useLocation ? await getPosition() : { lat: null, lng: null };
      const out = new Date();
      let hours = 0;
      if (clock_in) hours = Math.round(((out.getTime() - new Date(clock_in).getTime()) / 3600000) * 100) / 100;
      const overtime = hours > 8 ? Math.round((hours - 8) * 100) / 100 : 0;
      const { error } = await supabase
        .from("attendance_records")
        .update({
          clock_out: out.toISOString(),
          clock_out_lat: pos.lat,
          clock_out_lng: pos.lng,
          hours_worked: hours,
          overtime_hours: overtime,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance_records"] });
      qc.invalidateQueries({ queryKey: ["attendance_stats"] });
      toast.success("Clocked out");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employee_id,
      status,
      work_date,
      notes,
    }: {
      employee_id: string;
      status: "present" | "absent" | "late" | "half_day" | "on_leave" | "holiday";
      work_date?: string;
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("attendance_records").upsert(
        {
          employee_id,
          work_date: work_date || today(),
          status,
          notes: notes || null,
          recorded_by: user.user?.id,
        },
        { onConflict: "employee_id,work_date" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance_records"] });
      qc.invalidateQueries({ queryKey: ["attendance_stats"] });
      toast.success("Attendance recorded");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: ["leave_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*, employees(first_name, last_name, employee_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leave: {
      employee_id: string;
      leave_type: string;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => {
      const days =
        Math.round(
          (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / 86400000
        ) + 1;
      const { data, error } = await supabase
        .from("leave_requests")
        .insert({ ...leave, days: Math.max(days, 1) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave_requests"] });
      toast.success("Leave request submitted");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateLeaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" | "cancelled" }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status,
          approved_by: status === "approved" ? user.user?.id : null,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave_requests"] });
      toast.success("Leave updated");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });
}
