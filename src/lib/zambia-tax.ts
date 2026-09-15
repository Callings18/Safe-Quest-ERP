export type TaxBank = {
  bank_name: string;
  bank_branch: string;
  account_name: string;
  account_number: string;
};

export type PayeBand = {
  rate_name: string;
  min_amount: number;
  max_amount: number | null;
  rate: number;
};

export type TaxSettings = {
  vat_enabled: boolean;
  vat_rate: number;
  paye_enabled: boolean;
  napsa_enabled: boolean;
  nhima_enabled: boolean;
  napsa_ceiling: number;
  napsa_employee_rate: number;
  napsa_employer_rate: number;
  nhima_employee_rate: number;
  nhima_employer_rate: number;
  paye_bands: PayeBand[];
  zra_paye: TaxBank;
  zra_vat: TaxBank;
  napsa: TaxBank;
  nhima: TaxBank;
};

export const emptyTaxBank = (): TaxBank => ({
  bank_name: "",
  bank_branch: "",
  account_name: "",
  account_number: "",
});

/** ZRA monthly PAYE bands from 1 January 2026. PAYE is charged on gross emoluments. */
export const ZAMBIA_PAYE_2026: PayeBand[] = [
  { rate_name: "Tax-free band (0%)", min_amount: 0, max_amount: 5100, rate: 0 },
  { rate_name: "20% band", min_amount: 5100, max_amount: 7100, rate: 0.2 },
  { rate_name: "30% band", min_amount: 7100, max_amount: 9200, rate: 0.3 },
  { rate_name: "37% band", min_amount: 9200, max_amount: null, rate: 0.37 },
];

/** NAPSA 2026 monthly insurable earnings ceiling (5% + 5%). */
export const NAPSA_CEILING_2026 = 37236;

export const ZAMBIA_TAX_DEFAULTS: TaxSettings = {
  vat_enabled: true,
  vat_rate: 16,
  paye_enabled: true,
  napsa_enabled: true,
  nhima_enabled: true,
  napsa_ceiling: NAPSA_CEILING_2026,
  napsa_employee_rate: 0.05,
  napsa_employer_rate: 0.05,
  nhima_employee_rate: 0.01,
  nhima_employer_rate: 0.01,
  paye_bands: ZAMBIA_PAYE_2026,
  zra_paye: emptyTaxBank(),
  zra_vat: emptyTaxBank(),
  napsa: emptyTaxBank(),
  nhima: emptyTaxBank(),
};

export function roundMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function calculatePAYE(grossPay: number, bands: PayeBand[] = ZAMBIA_PAYE_2026): number {
  const sorted = [...bands].sort((a, b) => a.min_amount - b.min_amount);
  let tax = 0;
  for (const band of sorted) {
    if (grossPay <= band.min_amount) continue;
    const upper = band.max_amount == null ? Infinity : band.max_amount;
    const taxable = Math.min(grossPay, upper) - band.min_amount;
    if (taxable > 0) tax += taxable * (Number(band.rate) || 0);
  }
  return roundMoney(tax);
}

export function calculateNAPSA(
  grossPay: number,
  ceiling = NAPSA_CEILING_2026,
  employeeRate = 0.05,
  employerRate = 0.05,
): { employee: number; employer: number } {
  const capped = Math.min(Math.max(grossPay, 0), ceiling);
  return {
    employee: roundMoney(capped * employeeRate),
    employer: roundMoney(capped * employerRate),
  };
}

export function calculateNHIMA(
  grossPay: number,
  employeeRate = 0.01,
  employerRate = 0.01,
): { employee: number; employer: number } {
  const base = Math.max(grossPay, 0);
  return {
    employee: roundMoney(base * employeeRate),
    employer: roundMoney(base * employerRate),
  };
}

export type StatutoryBreakdown = {
  gross: number;
  paye: number;
  napsaEmployee: number;
  napsaEmployer: number;
  nhimaEmployee: number;
  nhimaEmployer: number;
  employeeDeductions: number;
  net: number;
  employerCost: number;
};

export function calculateStatutory(grossPay: number, settings: TaxSettings): StatutoryBreakdown {
  const gross = roundMoney(grossPay);
  const paye = settings.paye_enabled ? calculatePAYE(gross, settings.paye_bands) : 0;
  const napsa = settings.napsa_enabled
    ? calculateNAPSA(gross, settings.napsa_ceiling, settings.napsa_employee_rate, settings.napsa_employer_rate)
    : { employee: 0, employer: 0 };
  const nhima = settings.nhima_enabled
    ? calculateNHIMA(gross, settings.nhima_employee_rate, settings.nhima_employer_rate)
    : { employee: 0, employer: 0 };
  const employeeDeductions = roundMoney(paye + napsa.employee + nhima.employee);
  const net = roundMoney(gross - employeeDeductions);
  const employerCost = roundMoney(gross + napsa.employer + nhima.employer);
  return {
    gross,
    paye,
    napsaEmployee: napsa.employee,
    napsaEmployer: napsa.employer,
    nhimaEmployee: nhima.employee,
    nhimaEmployer: nhima.employer,
    employeeDeductions,
    net,
    employerCost,
  };
}

export function effectiveVatRate(settings: Pick<TaxSettings, "vat_enabled" | "vat_rate">): number {
  return settings.vat_enabled ? Number(settings.vat_rate) || 0 : 0;
}

function asBank(value: unknown): TaxBank {
  const v = (value || {}) as Partial<TaxBank>;
  return {
    bank_name: String(v.bank_name || ""),
    bank_branch: String(v.bank_branch || ""),
    account_name: String(v.account_name || ""),
    account_number: String(v.account_number || ""),
  };
}

function asBands(value: unknown): PayeBand[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  return value.map((b) => ({
    rate_name: String(b?.rate_name || "Band"),
    min_amount: Number(b?.min_amount) || 0,
    max_amount: b?.max_amount == null || b?.max_amount === "" ? null : Number(b.max_amount),
    rate: Number(b?.rate) || 0,
  }));
}

export function parseTaxConfig(raw: unknown): Partial<TaxSettings> {
  if (!raw || typeof raw !== "object") return {};
  const v = raw as Record<string, unknown>;
  const out: Partial<TaxSettings> = {};
  if (typeof v.vat_enabled === "boolean") out.vat_enabled = v.vat_enabled;
  if (v.vat_rate != null) out.vat_rate = Number(v.vat_rate);
  if (typeof v.paye_enabled === "boolean") out.paye_enabled = v.paye_enabled;
  if (typeof v.napsa_enabled === "boolean") out.napsa_enabled = v.napsa_enabled;
  if (typeof v.nhima_enabled === "boolean") out.nhima_enabled = v.nhima_enabled;
  if (v.napsa_ceiling != null) out.napsa_ceiling = Number(v.napsa_ceiling);
  if (v.napsa_employee_rate != null) out.napsa_employee_rate = Number(v.napsa_employee_rate);
  if (v.napsa_employer_rate != null) out.napsa_employer_rate = Number(v.napsa_employer_rate);
  if (v.nhima_employee_rate != null) out.nhima_employee_rate = Number(v.nhima_employee_rate);
  if (v.nhima_employer_rate != null) out.nhima_employer_rate = Number(v.nhima_employer_rate);
  const bands = asBands(v.paye_bands);
  if (bands) out.paye_bands = bands;
  if (v.zra_paye) out.zra_paye = asBank(v.zra_paye);
  if (v.zra_vat) out.zra_vat = asBank(v.zra_vat);
  if (v.napsa) out.napsa = asBank(v.napsa);
  if (v.nhima) out.nhima = asBank(v.nhima);
  return out;
}

export function formatBankLine(bank: TaxBank): string {
  const parts = [bank.bank_name, bank.bank_branch, bank.account_name, bank.account_number].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Not configured";
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
