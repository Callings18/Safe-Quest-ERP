import { forwardRef } from "react";
import { LetterheadPage } from "@/components/documents/LetterheadPage";
import { formatZMW } from "@/lib/currency";
import { SAFEQUEST_BRAND } from "@/lib/branding";

export const ContractPreview = forwardRef<HTMLDivElement, { contract: any }>(
  ({ contract }, ref) => {
    return (
      <LetterheadPage ref={ref}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: SAFEQUEST_BRAND.navy }}>CONTRACT</h2>
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
            <p className="font-semibold" style={{ color: SAFEQUEST_BRAND.navy }}>Notes</p>
            <p className="whitespace-pre-wrap">{contract.notes}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
          <div>
            <p className="font-semibold mb-8">For {SAFEQUEST_BRAND.name}</p>
            <p>____________________________</p>
            <p>{contract.signed_by || "Authorised signatory"}</p>
          </div>
          <div>
            <p className="font-semibold mb-8">For the counterparty</p>
            <p>____________________________</p>
            <p>{contract.counterparty_signatory || "Signatory"}</p>
          </div>
        </div>
      </LetterheadPage>
    );
  },
);

ContractPreview.displayName = "ContractPreview";
