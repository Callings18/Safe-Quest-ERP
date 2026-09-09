import type { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";

export const SAFEQUEST_BRAND = {
  name: "SAFEQUEST",
  legalName: "SafeQuest Limited",
  tagline: "Construction, Solar & Lending",
  logo: "/logo.png",
  navy: "#0B1F4A",
  gold: "#F5B800",
  paper: "#F7F4EA",
  ink: "#111827",
  muted: "#4B5563",
  font: "Inter",
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
  const address = [company?.address, company?.city].filter(Boolean).join(", ");
  return {
    id: template?.id || "safequest-brand",
    name: template?.name || "SafeQuest",
    is_default: template?.is_default ?? true,
    show_logo: template?.show_logo ?? true,
    show_bank_details: template?.show_bank_details ?? true,
    font_family: template?.font_family || SAFEQUEST_BRAND.font,
    primary_color: SAFEQUEST_BRAND.navy,
    secondary_color: SAFEQUEST_BRAND.paper,
    logo_url: template?.logo_url || company?.logo_url || SAFEQUEST_BRAND.logo,
    company_name: template?.company_name || company?.company_name || SAFEQUEST_BRAND.name,
    company_address: template?.company_address || address || "Lusaka, Zambia",
    company_phone: template?.company_phone || company?.phone || "",
    company_email: template?.company_email || company?.email || "",
    company_tpin: template?.company_tpin || company?.tpin || "",
    bank_name: template?.bank_name || company?.bank_name || "",
    bank_account: template?.bank_account || company?.account_number || "",
    bank_branch: template?.bank_branch || company?.bank_branch || "",
    footer_text:
      template?.footer_text ||
      `Thank you for choosing ${company?.company_name || SAFEQUEST_BRAND.name}. ${SAFEQUEST_BRAND.tagline}.`,
  };
}
