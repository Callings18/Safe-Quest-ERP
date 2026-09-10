import { forwardRef } from "react";
import { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { formatZMW } from "@/lib/currency";
import { resolveDocumentBrand, SAFEQUEST_BRAND, amountInWords, type CompanyBrand } from "@/lib/branding";
import { LetterheadPage } from "@/components/documents/LetterheadPage";

interface DocumentPreviewProps {
  type: "invoice" | "quotation" | "delivery_note" | "receipt";
  document: any;
  items: any[];
  template?: InvoiceTemplate | null;
  company?: CompanyBrand;
  payments?: any[];
}

export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ type, document, items, template, company, payments }, ref) => {
    const t = resolveDocumentBrand(template, company);

    const typeLabels = {
      invoice: "INVOICE",
      quotation: "QUOTATION",
      delivery_note: "DELIVERY NOTE",
      receipt: "RECEIPT",
    };

    const documentNumber =
      type === "invoice" ? document.invoice_number :
      type === "quotation" ? document.quotation_number :
      type === "delivery_note" ? document.delivery_number :
      `RCP-${document.id?.substring(0, 8).toUpperCase()}`;

    const showMoney = type !== "delivery_note";
    const showBank = t.show_bank_details && (type === "invoice" || type === "quotation" || type === "receipt");

    return (
      <LetterheadPage ref={ref}>
        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-wide" style={{ color: SAFEQUEST_BRAND.navy }}>
              {typeLabels[type]}
            </h2>
            <p className="text-sm font-semibold">{documentNumber}</p>
          </div>
          <div className="text-right text-sm">
            <p>Date: {new Date(document.issue_date || document.delivery_date || document.created_at).toLocaleDateString()}</p>
            {type === "quotation" && document.valid_until && (
              <p>Valid until: {new Date(document.valid_until).toLocaleDateString()}</p>
            )}
            {type === "invoice" && document.due_date && (
              <p>Due date: {new Date(document.due_date).toLocaleDateString()}</p>
            )}
            {t.company_tpin && <p>TPIN: {t.company_tpin}</p>}
          </div>
        </div>

        <div className="mb-5 p-3 rounded border" style={{ borderColor: `${SAFEQUEST_BRAND.navy}22`, backgroundColor: "rgba(255,255,255,0.72)" }}>
          <h3 className="text-xs font-bold uppercase mb-1" style={{ color: SAFEQUEST_BRAND.navy }}>
            {type === "delivery_note" ? "Deliver to" : "Bill to"}
          </h3>
          <p className="font-semibold">{document.companies?.name || "Walk-in Customer"}</p>
          {document.contacts && (
            <p className="text-sm">Attn: {document.contacts.first_name} {document.contacts.last_name}</p>
          )}
          {document.companies?.address && <p className="text-sm">{document.companies.address}</p>}
          {document.companies?.phone && <p className="text-sm">Tel: {document.companies.phone}</p>}
          {document.companies?.email && <p className="text-sm">Email: {document.companies.email}</p>}
          {type === "delivery_note" && document.delivery_address && (
            <p className="text-sm mt-1">Delivery address: {document.delivery_address}</p>
          )}
        </div>

        <table className="w-full mb-5 text-sm">
          <thead>
            <tr style={{ backgroundColor: SAFEQUEST_BRAND.navy }} className="text-white">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Qty</th>
              {showMoney && (
                <>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? "bg-white/80" : "bg-white/50"}>
                <td className="p-2 border-b">{index + 1}</td>
                <td className="p-2 border-b">{item.description}</td>
                <td className="p-2 border-b text-right">{item.quantity}</td>
                {showMoney && (
                  <>
                    <td className="p-2 border-b text-right">{formatZMW(item.unit_price)}</td>
                    <td className="p-2 border-b text-right">{formatZMW(item.total)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {showMoney && (
          <div className="flex justify-end mb-4">
            <div className="w-72 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span>Subtotal:</span>
                <span>{formatZMW(document.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>VAT ({document.tax_rate || 16}%):</span>
                <span>{formatZMW(document.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base" style={{ color: SAFEQUEST_BRAND.navy }}>
                <span>Total:</span>
                <span>{formatZMW(document.total || 0)}</span>
              </div>
              <p className="text-xs italic text-gray-600">({amountInWords(Number(document.total) || 0)})</p>
              {type === "invoice" && Number(document.amount_paid) > 0 && (
                <>
                  <div className="flex justify-between py-1 border-t text-green-700">
                    <span>Amount paid:</span>
                    <span>{formatZMW(document.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span>Balance due:</span>
                    <span>{formatZMW(Number(document.total) - Number(document.amount_paid))}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {type === "receipt" && payments && payments.length > 0 && (
          <div className="mb-4 text-sm">
            <h3 className="font-semibold mb-1" style={{ color: SAFEQUEST_BRAND.navy }}>Payment details</h3>
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between py-0.5">
                <span>{new Date(payment.payment_date).toLocaleDateString()} — {payment.payment_method}</span>
                <span>{formatZMW(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {type === "delivery_note" && (
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Driver:</strong> {document.driver_name || "-"}</p>
              <p><strong>Vehicle:</strong> {document.vehicle_number || "-"}</p>
            </div>
            <div>
              <p><strong>Received by:</strong> {document.received_by || "________________"}</p>
              <p><strong>Date:</strong> {document.received_date || "________________"}</p>
              <p className="mt-3"><strong>Signature:</strong> ________________</p>
            </div>
          </div>
        )}

        {document.notes && (
          <div className="mb-3 text-sm">
            <h3 className="font-semibold" style={{ color: SAFEQUEST_BRAND.navy }}>Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{document.notes}</p>
          </div>
        )}

        {document.terms && (
          <div className="mb-3 text-sm">
            <h3 className="font-semibold" style={{ color: SAFEQUEST_BRAND.navy }}>Terms & conditions</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{document.terms}</p>
          </div>
        )}

        {showBank && (
          <div className="mt-4 text-xs uppercase tracking-wide" style={{ color: SAFEQUEST_BRAND.navy }}>
            <p><strong>Bank name:</strong> {t.bank_name || SAFEQUEST_BRAND.bankName}</p>
            <p><strong>Branch name:</strong> {t.bank_branch || SAFEQUEST_BRAND.bankBranch}</p>
            <p><strong>Account name:</strong> {company?.account_name || SAFEQUEST_BRAND.accountName}</p>
            <p><strong>Account number:</strong> {t.bank_account || SAFEQUEST_BRAND.accountNumber}</p>
            <p className="mt-2"><strong>Mobile money</strong></p>
            <p>{SAFEQUEST_BRAND.mobileMoney}</p>
            <p>{SAFEQUEST_BRAND.mobileMoneyName}</p>
          </div>
        )}
      </LetterheadPage>
    );
  },
);

DocumentPreview.displayName = "DocumentPreview";
