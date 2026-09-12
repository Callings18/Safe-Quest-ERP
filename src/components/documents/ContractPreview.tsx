import { forwardRef } from "react";
import { LetterheadPage } from "@/components/documents/LetterheadPage";
import { formatZMW } from "@/lib/currency";
import { resolveDocumentBrand, SAFEQUEST_BRAND, type CompanyBrand } from "@/lib/branding";
import type { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";

export const ContractPreview = forwardRef<
  HTMLDivElement,
  { contract: any; template?: InvoiceTemplate | null; company?: CompanyBrand }
>(({ contract, template, company }, ref) => {
  const t = resolveDocumentBrand(template, company);
  const accent = t.primary_color || SAFEQUEST_BRAND.navy;

  return (
    <LetterheadPage
      ref={ref}
      headerMode={t.header_mode}
      letterheadUrl={t.letterhead_url}
      fontFamily={t.font_family}
      marginTop={t.margin_top}
      marginBottom={t.margin_bottom}
    >
      {(t.show_logo || t.header_mode === "logo") && t.logo_url && (
        <div className="flex items-center gap-3 mb-4">
          <img src={t.logo_url} alt="" style={{ width: t.logo_width || 72, height: "auto" }} />
          <div>
            <p className="font-bold" style={{ color: accent }}>{t.company_name}</p>
            <p className="text-xs">{t.company_address}</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: accent }}>CONTRACT</h2>
          <p className="text-sm font-semibold">{contract.contract_number}</p>
        </div>
        <div className="text-right text-sm">
          <p className="uppercase">{contract.status}</p>
          {contract.signed_date && <p>Signed: {new Date(contract.signed_date).toLocaleDateString()}</p>}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4">{contract.title}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <p><strong>Type:</strong> {contract.contract_type}</p>
        <p><strong>Value:</strong> {formatZMW(contract.value)}</p>
        <p><strong>Start:</strong> {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : "—"}</p>
        <p><strong>End:</strong> {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "—"}</p>
        <p><strong>Customer:</strong> {contract.companies?.name || "—"}</p>
        <p><strong>Project:</strong> {contract.projects?.name || "—"}</p>
      </div>
      {contract.description && <p className="text-sm mb-4 whitespace-pre-wrap">{contract.description}</p>}
      {contract.notes && (
        <div className="text-sm mb-4">
          <p className="font-semibold" style={{ color: accent }}>Notes</p>
          <p className="whitespace-pre-wrap">{contract.notes}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
        <div>
          <p className="font-semibold mb-8">For {t.company_name || SAFEQUEST_BRAND.name}</p>
          <p>____________________________</p>
          <p>{contract.signed_by || "Authorised signatory"}</p>
        </div>
        <div>
          <p className="font-semibold mb-8">For the counterparty</p>
          <p>____________________________</p>
          <p>{contract.counterparty_signatory || "Signatory"}</p>
        </div>
      </div>
      {t.footer_text && <p className="text-xs mt-8 text-muted-foreground">{t.footer_text}</p>}
    </LetterheadPage>
  );
});

ContractPreview.displayName = "ContractPreview";
