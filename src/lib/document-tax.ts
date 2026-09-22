import { effectiveVatRate, type TaxSettings } from "@/lib/zambia-tax";

/** Build VAT select options: 0%, company rate, and any rate already on the document. */
export function vatSelectOptions(tax: TaxSettings, currentRate?: number | string): number[] {
  const rates = new Set<number>([0]);
  if (tax.vat_enabled) {
    rates.add(Number(tax.vat_rate) || 0);
    if (tax.vat_rate !== 16) rates.add(16);
  }
  if (currentRate != null && currentRate !== "") rates.add(Number(currentRate) || 0);
  return Array.from(rates).sort((a, b) => a - b);
}

export function currentVatRate(tax: TaxSettings): number {
  return effectiveVatRate(tax);
}

export function lineTaxTotal(quantity: number, unitPrice: number, taxRate: number): number {
  return Math.round(quantity * unitPrice * (1 + taxRate / 100) * 100) / 100;
}
