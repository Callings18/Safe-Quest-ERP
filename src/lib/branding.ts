import type { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";

export const SAFEQUEST_BRAND = {
  name: "SAFEQUEST (Z) LIMITED",
  legalName: "SAFEQUEST (Z) LIMITED",
  tagline: "Energy - Construction - Security",
  specialty:
    "Specialized in construction & electrical, solar power systems, CCTV cameras, solar pumps, transport & logistics and large format printing",
  logo: "/logo.png",
  letterhead: "/letterhead.png",
  navy: "#0B1F4A",
  gold: "#F5C400",
  paper: "#FFFBEB",
  ink: "#111827",
  muted: "#4B5563",
  font: "Inter",
  rc: "792022",
  address: "Bolabet Sport Betting Along Katima Mulilo Road, Upstairs",
  city: "Lusaka",
  phone: "+260770403190",
  email: "safequest2022@gmail.com",
  bankName: "FNB",
  bankBranch: "INDUSTRIAL",
  accountName: "SAFE QUEST ZAMBIA LTD",
  accountNumber: "6311311508",
  mobileMoney: "+26077764923",
  mobileMoneyName: "MACKSON KAMBIZYI",
};

export type CompanyBrand = {
  company_name?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  tpin?: string | null;
  bank_name?: string | null;
  bank_branch?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  logo_url?: string | null;
} | null | undefined;

export function resolveDocumentBrand(
  template?: InvoiceTemplate | null,
  company?: CompanyBrand,
): InvoiceTemplate {
  const address = [company?.address || SAFEQUEST_BRAND.address, company?.city || SAFEQUEST_BRAND.city]
    .filter(Boolean)
    .join(", ");
  return {
    id: template?.id || "safequest-brand",
    name: template?.name || "SafeQuest letterhead",
    is_default: template?.is_default ?? true,
    show_logo: false,
    show_bank_details: template?.show_bank_details ?? true,
    font_family: template?.font_family || SAFEQUEST_BRAND.font,
    primary_color: SAFEQUEST_BRAND.navy,
    secondary_color: SAFEQUEST_BRAND.paper,
    logo_url: SAFEQUEST_BRAND.letterhead,
    company_name: company?.company_name || SAFEQUEST_BRAND.name,
    company_address: address,
    company_phone: company?.phone || SAFEQUEST_BRAND.phone,
    company_email: company?.email || SAFEQUEST_BRAND.email,
    company_tpin: template?.company_tpin || company?.tpin || "",
    bank_name: company?.bank_name || SAFEQUEST_BRAND.bankName,
    bank_account: company?.account_number || SAFEQUEST_BRAND.accountNumber,
    bank_branch: company?.bank_branch || SAFEQUEST_BRAND.bankBranch,
    footer_text: "",
  };
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function chunkToWords(n: number): string {
  if (n === 0) return "";
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${ONES[n % 10]}` : ""}`;
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${chunkToWords(n % 100)}` : ""}`;
}

export function amountInWords(amount: number): string {
  const value = Math.round(Number(amount) || 0);
  if (value === 0) return "Zero kwacha only";
  const billions = Math.floor(value / 1_000_000_000);
  const millions = Math.floor((value % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1000);
  const rest = value % 1000;
  const parts: string[] = [];
  if (billions) parts.push(`${chunkToWords(billions)} billion`);
  if (millions) parts.push(`${chunkToWords(millions)} million`);
  if (thousands) parts.push(`${chunkToWords(thousands)} thousand`);
  if (rest) parts.push(chunkToWords(rest));
  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} kwacha only`;
}
