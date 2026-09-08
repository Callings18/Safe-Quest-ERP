/** ISO 4217 code for Zambian Kwacha. */
export const CURRENCY_CODE = "ZMW";

function toAmount(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Full amount, e.g. `ZMW 12,500.00`. Never uses a trailing thousands `K`. */
export function formatZMW(
  value: number | string | null | undefined,
  options?: { decimals?: number },
): string {
  const amount = toAmount(value);
  const decimals = options?.decimals ?? 2;
  const formatted = Math.abs(amount).toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${amount < 0 ? "-" : ""}ZMW ${formatted}`;
}

/** Compact axis labels only, e.g. `ZMW 12k` / `ZMW 1.2m`. */
export function formatZMWAxis(value: number | string | null | undefined): string {
  const n = toAmount(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}ZMW ${v >= 10 ? v.toFixed(0) : v.toFixed(1)}m`;
  }
  if (abs >= 10_000) {
    return `${sign}ZMW ${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
  }
  return formatZMW(n, { decimals: 0 });
}
