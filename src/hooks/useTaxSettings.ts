import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { usePayrollRates } from "@/hooks/usePayroll";
import {
  NAPSA_CEILING_2026,
  parseTaxConfig,
  ZAMBIA_TAX_DEFAULTS,
  type PayeBand,
  type TaxSettings,
} from "@/lib/zambia-tax";

const STORAGE_KEY = "safequest_tax_config";

function readLocal(): Partial<TaxSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseTaxConfig(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function bandsFromRates(rates: Array<{
  rate_type: string;
  rate_name: string;
  min_amount: number | null;
  max_amount: number | null;
  rate: number;
}>): PayeBand[] | null {
  const paye = rates
    .filter((r) => r.rate_type === "PAYE")
    .sort((a, b) => Number(a.min_amount) - Number(b.min_amount))
    .map((r) => ({
      rate_name: r.rate_name,
      min_amount: Number(r.min_amount) || 0,
      max_amount: r.max_amount == null ? null : Number(r.max_amount),
      rate: Number(r.rate) || 0,
    }));
  return paye.length ? paye : null;
}

function mergeSettings(
  companyRaw: unknown,
  rates: Array<{
    rate_type: string;
    rate_name: string;
    min_amount: number | null;
    max_amount: number | null;
    rate: number;
  }> | undefined,
): TaxSettings {
  const stored = { ...readLocal(), ...parseTaxConfig(companyRaw) };
  const merged: TaxSettings = { ...ZAMBIA_TAX_DEFAULTS, ...stored };
  if (!rates?.length) return merged;

  const stalePaye = rates.some((r) => r.rate_type === "PAYE" && Number(r.rate) >= 0.375);
  const staleNapsa = rates.some(
    (r) => r.rate_type === "NAPSA_EMPLOYEE" && (Number(r.max_amount) === 111600 || Number(r.max_amount) === 34900),
  );

  if (!stored.paye_bands && !stalePaye) {
    const paye = bandsFromRates(rates);
    if (paye) merged.paye_bands = paye;
  }

  const napsaEmp = rates.find((r) => r.rate_type === "NAPSA_EMPLOYEE");
  const napsaEr = rates.find((r) => r.rate_type === "NAPSA_EMPLOYER");
  const nhimaEmp = rates.find((r) => r.rate_type === "NHIMA_EMPLOYEE");
  const nhimaEr = rates.find((r) => r.rate_type === "NHIMA_EMPLOYER");
  if (stored.napsa_ceiling == null && !staleNapsa && napsaEmp?.max_amount != null) {
    merged.napsa_ceiling = Number(napsaEmp.max_amount) || NAPSA_CEILING_2026;
  }
  if (stored.napsa_employee_rate == null && napsaEmp) merged.napsa_employee_rate = Number(napsaEmp.rate);
  if (stored.napsa_employer_rate == null && napsaEr) merged.napsa_employer_rate = Number(napsaEr.rate);
  if (stored.nhima_employee_rate == null && nhimaEmp) merged.nhima_employee_rate = Number(nhimaEmp.rate);
  if (stored.nhima_employer_rate == null && nhimaEr) merged.nhima_employer_rate = Number(nhimaEr.rate);
  return merged;
}

async function syncPayrollRates(settings: TaxSettings) {
  const today = new Date().toISOString().slice(0, 10);
  const { error: deactivateError } = await supabase
    .from("payroll_rates")
    .update({ is_active: false, effective_to: today })
    .eq("is_active", true);
  if (deactivateError) throw deactivateError;

  const rows = [
    ...settings.paye_bands.map((band) => ({
      rate_type: "PAYE",
      rate_name: band.rate_name,
      min_amount: band.min_amount,
      max_amount: band.max_amount,
      rate: settings.paye_enabled ? band.rate : 0,
      effective_from: today,
      is_active: true,
    })),
    {
      rate_type: "NAPSA_EMPLOYEE",
      rate_name: "NAPSA employee",
      min_amount: 0,
      max_amount: settings.napsa_ceiling,
      rate: settings.napsa_enabled ? settings.napsa_employee_rate : 0,
      effective_from: today,
      is_active: true,
    },
    {
      rate_type: "NAPSA_EMPLOYER",
      rate_name: "NAPSA employer",
      min_amount: 0,
      max_amount: settings.napsa_ceiling,
      rate: settings.napsa_enabled ? settings.napsa_employer_rate : 0,
      effective_from: today,
      is_active: true,
    },
    {
      rate_type: "NHIMA_EMPLOYEE",
      rate_name: "NHIMA employee",
      min_amount: 0,
      max_amount: null,
      rate: settings.nhima_enabled ? settings.nhima_employee_rate : 0,
      effective_from: today,
      is_active: true,
    },
    {
      rate_type: "NHIMA_EMPLOYER",
      rate_name: "NHIMA employer",
      min_amount: 0,
      max_amount: null,
      rate: settings.nhima_enabled ? settings.nhima_employer_rate : 0,
      effective_from: today,
      is_active: true,
    },
  ];

  const { error } = await supabase.from("payroll_rates").insert(rows);
  if (error) throw error;
}

export function useTaxSettings() {
  const queryClient = useQueryClient();
  const { data: company, isLoading: companyLoading } = useCompanySettings();
  const { data: rates, isLoading: ratesLoading } = usePayrollRates();

  const settings = useMemo(
    () => mergeSettings((company as { tax_config?: unknown } | null)?.tax_config, rates || undefined),
    [company, rates],
  );

  const save = useMutation({
    mutationFn: async (next: TaxSettings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      const { data: existing } = await supabase.from("company_settings").select("id").limit(1).maybeSingle();
      const { data: user } = await supabase.auth.getUser();
      let persisted = false;
      if (existing?.id) {
        const { error } = await supabase
          .from("company_settings")
          .update({
            tax_config: next as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
            updated_by: user.user?.id,
          } as never)
          .eq("id", existing.id);
        if (!error) persisted = true;
        else if (!/tax_config|column/i.test(error.message)) throw error;
      } else {
        const { error } = await supabase.from("company_settings").insert({
          company_name: "SAFEQUEST",
          currency: "ZMW",
          tax_config: next as unknown as Record<string, unknown>,
          updated_by: user.user?.id,
        } as never);
        if (!error) persisted = true;
        else if (!/tax_config|column/i.test(error.message)) throw error;
      }

      await syncPayrollRates(next);
      return persisted;
    },
    onSuccess: (persisted) => {
      queryClient.invalidateQueries({ queryKey: ["company_settings"] });
      queryClient.invalidateQueries({ queryKey: ["payroll_rates"] });
      toast.success(
        persisted
          ? "Tax settings saved"
          : "Tax settings saved on this device. Run the tax_config migration to share them with all users.",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { settings, save, isLoading: companyLoading || ratesLoading };
}
