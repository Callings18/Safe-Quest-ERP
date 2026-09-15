import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  calculateNAPSA as napsaFromGross,
  calculateNHIMA as nhimaFromGross,
  calculatePAYE as payeFromBands,
  NAPSA_CEILING_2026,
  type PayeBand,
} from "@/lib/zambia-tax";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });
}

export function usePayrollRates() {
  return useQuery({
    queryKey: ["payroll_rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_rates")
        .select("*")
        .eq("is_active", true)
        .order("rate_type")
        .order("min_amount");
      if (error) throw error;
      return data;
    },
  });
}

export function usePayrollRuns() {
  return useQuery({
    queryKey: ["payroll_runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("pay_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePayslips(payrollRunId?: string) {
  return useQuery({
    queryKey: ["payslips", payrollRunId],
    queryFn: async () => {
      let query = supabase
        .from("payslips")
        .select("*, employees(*)");
      
      if (payrollRunId) {
        query = query.eq("payroll_run_id", payrollRunId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!payrollRunId,
  });
}

function bandsFromRates(rates: any[]): PayeBand[] {
  return rates
    .filter((r) => r.rate_type === "PAYE")
    .map((r) => ({
      rate_name: r.rate_name,
      min_amount: Number(r.min_amount) || 0,
      max_amount: r.max_amount == null ? null : Number(r.max_amount),
      rate: Number(r.rate) || 0,
    }));
}

export function calculatePAYE(grossPay: number, rates: any[]): number {
  return payeFromBands(grossPay, bandsFromRates(rates));
}

export function calculateNAPSA(grossPay: number, rates: any[]): { employee: number; employer: number } {
  const napsaEmployee = rates.find((r) => r.rate_type === "NAPSA_EMPLOYEE");
  const napsaEmployer = rates.find((r) => r.rate_type === "NAPSA_EMPLOYER");
  return napsaFromGross(
    grossPay,
    napsaEmployee?.max_amount != null ? Number(napsaEmployee.max_amount) : NAPSA_CEILING_2026,
    napsaEmployee ? Number(napsaEmployee.rate) : 0.05,
    napsaEmployer ? Number(napsaEmployer.rate) : 0.05,
  );
}

export function calculateNHIMA(grossPay: number, rates: any[]): number {
  const nhimaRate = rates.find((r) => r.rate_type === "NHIMA_EMPLOYEE");
  return nhimaFromGross(grossPay, nhimaRate ? Number(nhimaRate.rate) : 0.01, 0.01).employee;
}

export function calculateNHIMAEmployer(grossPay: number, rates: any[]): number {
  const nhimaRate = rates.find((r) => r.rate_type === "NHIMA_EMPLOYER") || rates.find((r) => r.rate_type === "NHIMA_EMPLOYEE");
  return nhimaFromGross(grossPay, 0.01, nhimaRate ? Number(nhimaRate.rate) : 0.01).employer;
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payrollRun: {
      pay_period: string;
      pay_date: string;
    }) => {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("process-payroll", {
        body: { pay_period: payrollRun.pay_period, pay_date: payrollRun.pay_date },
      });
      if (!fnError && fnData && !(fnData as { error?: string }).error) {
        return (fnData as { run: unknown }).run;
      }
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true);

      if (empError) throw empError;
      if (!employees || employees.length === 0) {
        throw new Error("No active employees to process");
      }

      // Get rates
      const { data: rates, error: ratesError } = await supabase
        .from("payroll_rates")
        .select("*")
        .eq("is_active", true);

      if (ratesError) throw ratesError;

      // Calculate totals
      let totalGross = 0;
      let totalPaye = 0;
      let totalNapsaEmployee = 0;
      let totalNapsaEmployer = 0;
      let totalNhima = 0;
      let totalNet = 0;

      const payslips = employees.map((emp) => {
        const basic = Number(emp.basic_salary) || 0;
        const grossPay = basic;
        const paye = calculatePAYE(grossPay, rates || []);
        const napsa = calculateNAPSA(grossPay, rates || []);
        const nhima = calculateNHIMA(grossPay, rates || []);
        const netPay = grossPay - paye - napsa.employee - nhima;

        totalGross += grossPay;
        totalPaye += paye;
        totalNapsaEmployee += napsa.employee;
        totalNapsaEmployer += napsa.employer;
        totalNhima += nhima;
        totalNet += netPay;

        return {
          employee_id: emp.id,
          basic_salary: basic,
          gross_pay: grossPay,
          paye,
          napsa_employee: napsa.employee,
          napsa_employer: napsa.employer,
          nhima,
          net_pay: netPay,
        };
      });

      // Create payroll run
      const { data: run, error: runError } = await supabase
        .from("payroll_runs")
        .insert({
          pay_period: payrollRun.pay_period,
          pay_date: payrollRun.pay_date,
          total_gross: totalGross,
          total_paye: totalPaye,
          total_napsa_employee: totalNapsaEmployee,
          total_napsa_employer: totalNapsaEmployer,
          total_nhima: totalNhima,
          total_net: totalNet,
          status: "draft",
        })
        .select()
        .single();

      if (runError) throw runError;

      // Create payslips
      const payslipsWithRunId = payslips.map((p) => ({
        ...p,
        payroll_run_id: run.id,
      }));

      const { error: slipsError } = await supabase
        .from("payslips")
        .insert(payslipsWithRunId);

      if (slipsError) throw slipsError;

      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_runs"] });
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
      toast.success("Payroll run created");
    },
    onError: (error) => {
      toast.error("Failed to create payroll run: " + error.message);
    },
  });
}
