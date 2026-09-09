import { forwardRef } from "react";
import { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { formatZMW } from "@/lib/currency";
import { resolveDocumentBrand, SAFEQUEST_BRAND, type CompanyBrand } from "@/lib/branding";

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

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-[210mm] mx-auto shadow-lg"
        style={{ fontFamily: t.font_family, minHeight: "297mm" }}
      >
        {/* Header */}
        <div className="h-1.5 w-full mb-6" style={{ background: `linear-gradient(90deg, ${SAFEQUEST_BRAND.navy} 70%, ${SAFEQUEST_BRAND.gold} 70%)` }} />
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2" style={{ borderColor: t.primary_color }}>
          <div>
            {t.show_logo && (
              <img src={t.logo_url || SAFEQUEST_BRAND.logo} alt={t.company_name || "SafeQuest"} className="h-16 w-16 rounded-full object-cover mb-2 bg-[#0B1F4A]" />
            )}
            <h1 className="text-2xl font-bold tracking-wide" style={{ color: t.primary_color }}>
              {t.company_name}
            </h1>
            <p className="text-xs font-medium mb-1" style={{ color: SAFEQUEST_BRAND.gold }}>{SAFEQUEST_BRAND.tagline}</p>
            <p className="text-sm text-gray-600">{t.company_address}</p>
            <p className="text-sm text-gray-600">{t.company_phone}</p>
            <p className="text-sm text-gray-600">{t.company_email}</p>
            {t.company_tpin && (
              <p className="text-sm text-gray-600">TPIN: {t.company_tpin}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2" style={{ color: t.primary_color }}>
              {typeLabels[type]}
            </h2>
            <p className="text-lg font-semibold">{documentNumber}</p>
            <p className="text-sm text-gray-600">
              Date: {new Date(document.issue_date || document.delivery_date || document.created_at).toLocaleDateString()}
            </p>
            {type === "quotation" && document.valid_until && (
              <p className="text-sm text-gray-600">
                Valid Until: {new Date(document.valid_until).toLocaleDateString()}
              </p>
            )}
            {type === "invoice" && document.due_date && (
              <p className="text-sm text-gray-600">
                Due Date: {new Date(document.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 rounded" style={{ backgroundColor: t.secondary_color }}>
          <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>
            {type === "delivery_note" ? "Deliver To:" : "Bill To:"}
          </h3>
          <p className="font-semibold">{document.companies?.name || "Walk-in Customer"}</p>
          {document.contacts && (
            <p className="text-sm">
              Attn: {document.contacts.first_name} {document.contacts.last_name}
            </p>
          )}
          {document.companies?.address && <p className="text-sm">{document.companies.address}</p>}
          {document.companies?.phone && <p className="text-sm">Tel: {document.companies.phone}</p>}
          {document.companies?.email && <p className="text-sm">Email: {document.companies.email}</p>}
          {type === "delivery_note" && document.delivery_address && (
            <p className="text-sm mt-2">Delivery Address: {document.delivery_address}</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr style={{ backgroundColor: t.primary_color }} className="text-white">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Qty</th>
              {type !== "delivery_note" && (
                <>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-3 border-b">{index + 1}</td>
                <td className="p-3 border-b">{item.description}</td>
                <td className="p-3 border-b text-right">{item.quantity}</td>
                {type !== "delivery_note" && (
                  <>
                    <td className="p-3 border-b text-right">{formatZMW(item.unit_price)}</td>
                    <td className="p-3 border-b text-right">{formatZMW(item.total)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals (not for delivery note) */}
        {type !== "delivery_note" && (
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal:</span>
                <span>{formatZMW(document.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>VAT ({document.tax_rate || 16}%):</span>
                <span>{formatZMW(document.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg" style={{ color: t.primary_color }}>
                <span>Total:</span>
                <span>{formatZMW(document.total || 0)}</span>
              </div>
              {type === "invoice" && Number(document.amount_paid) > 0 && (
                <>
                  <div className="flex justify-between py-2 border-t text-green-600">
                    <span>Amount Paid:</span>
                    <span>{formatZMW(document.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Balance Due:</span>
                    <span>{formatZMW((Number(document.total) - Number(document.amount_paid)))}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Receipt - Payment Details */}
        {type === "receipt" && payments && payments.length > 0 && (
          <div className="mb-8 p-4 rounded" style={{ backgroundColor: t.secondary_color }}>
            <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>Payment Details:</h3>
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between py-1">
                <span>{new Date(payment.payment_date).toLocaleDateString()} - {payment.payment_method}</span>
                <span>{formatZMW(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Note - Driver Info */}
        {type === "delivery_note" && (
          <div className="mb-8 grid grid-cols-2 gap-4 p-4 rounded" style={{ backgroundColor: t.secondary_color }}>
            <div>
              <p className="text-sm"><strong>Driver:</strong> {document.driver_name || "-"}</p>
              <p className="text-sm"><strong>Vehicle:</strong> {document.vehicle_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm"><strong>Received By:</strong> {document.received_by || "________________"}</p>
              <p className="text-sm"><strong>Date:</strong> {document.received_date || "________________"}</p>
              <p className="text-sm mt-4"><strong>Signature:</strong> ________________</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>Notes:</h3>
            <p className="text-sm text-gray-600">{document.notes}</p>
          </div>
        )}

        {/* Terms */}
        {document.terms && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>Terms & Conditions:</h3>
            <p className="text-sm text-gray-600">{document.terms}</p>
          </div>
        )}

        {/* Bank Details */}
        {t.show_bank_details && type === "invoice" && (
          <div className="mb-8 p-4 rounded" style={{ backgroundColor: t.secondary_color }}>
            <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>Bank Details:</h3>
            <p className="text-sm">Bank: {t.bank_name}</p>
            <p className="text-sm">Account: {t.bank_account}</p>
            <p className="text-sm">Branch: {t.bank_branch}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6 text-center border-t text-sm text-gray-500">
          <div className="h-1 w-24 mx-auto mb-3" style={{ backgroundColor: SAFEQUEST_BRAND.gold }} />
          {t.footer_text}
        </div>
      </div>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";
