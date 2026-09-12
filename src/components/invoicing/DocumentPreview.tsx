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
        <div style={{ fontSize: "11pt", lineHeight: 1.45 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: "16pt", fontWeight: 700, letterSpacing: "0.04em", color: SAFEQUEST_BRAND.navy }}>
                {typeLabels[type]}
              </div>
              <div style={{ fontWeight: 600 }}>{documentNumber}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>Date: {new Date(document.issue_date || document.delivery_date || document.created_at).toLocaleDateString("en-GB")}</div>
              {type === "quotation" && document.valid_until && (
                <div>Valid until: {new Date(document.valid_until).toLocaleDateString("en-GB")}</div>
              )}
              {type === "invoice" && document.due_date && (
                <div>Due date: {new Date(document.due_date).toLocaleDateString("en-GB")}</div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase" }}>
              {type === "delivery_note" ? "Deliver to" : "Bill to"}
            </div>
            <div style={{ fontWeight: 700 }}>{document.companies?.name || "Walk-in Customer"}</div>
            {document.contacts && (
              <div>Attn: {document.contacts.first_name} {document.contacts.last_name}</div>
            )}
            {document.companies?.address && <div>{document.companies.address}</div>}
            {document.companies?.phone && <div>Tel: {document.companies.phone}</div>}
            {document.companies?.email && <div>{document.companies.email}</div>}
            {type === "delivery_note" && document.delivery_address && (
              <div>Delivery address: {document.delivery_address}</div>
            )}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: "10pt" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: `2px solid ${SAFEQUEST_BRAND.navy}`, padding: "6px 4px" }}>Product</th>
                <th style={{ textAlign: "right", borderBottom: `2px solid ${SAFEQUEST_BRAND.navy}`, padding: "6px 4px" }}>Quantity</th>
                {showMoney && (
                  <>
                    <th style={{ textAlign: "right", borderBottom: `2px solid ${SAFEQUEST_BRAND.navy}`, padding: "6px 4px" }}>Unit price</th>
                    <th style={{ textAlign: "right", borderBottom: `2px solid ${SAFEQUEST_BRAND.navy}`, padding: "6px 4px" }}>Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={{ padding: "6px 4px", borderBottom: "1px solid #ddd" }}>{item.description}</td>
                  <td style={{ padding: "6px 4px", borderBottom: "1px solid #ddd", textAlign: "right" }}>{item.quantity}</td>
                  {showMoney && (
                    <>
                      <td style={{ padding: "6px 4px", borderBottom: "1px solid #ddd", textAlign: "right" }}>{formatZMW(item.unit_price)}</td>
                      <td style={{ padding: "6px 4px", borderBottom: "1px solid #ddd", textAlign: "right" }}>{formatZMW(item.total)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {showMoney && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <div style={{ width: "240px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Subtotal:</span>
                  <span>{formatZMW(document.subtotal || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Total:</span>
                  <span style={{ fontWeight: 700 }}>{formatZMW(document.total || 0)}</span>
                </div>
                <div style={{ fontSize: "9pt", fontStyle: "italic", marginTop: 4 }}>
                  ({amountInWords(Number(document.total) || 0)})
                </div>
                {type === "invoice" && Number(document.amount_paid) > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", marginTop: 6 }}>
                      <span>Amount paid:</span>
                      <span>{formatZMW(document.amount_paid)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontWeight: 700 }}>
                      <span>Balance due:</span>
                      <span>{formatZMW(Number(document.total) - Number(document.amount_paid))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {type === "receipt" && payments && payments.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {payments.map((payment) => (
                <div key={payment.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{new Date(payment.payment_date).toLocaleDateString("en-GB")} — {payment.payment_method}</span>
                  <span>{formatZMW(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {type === "delivery_note" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
              <div>
                <div><strong>Driver:</strong> {document.driver_name || "-"}</div>
                <div><strong>Vehicle:</strong> {document.vehicle_number || "-"}</div>
              </div>
              <div>
                <div><strong>Received by:</strong> {document.received_by || "________________"}</div>
                <div><strong>Date:</strong> {document.received_date || "________________"}</div>
                <div style={{ marginTop: 12 }}><strong>Signature:</strong> ________________</div>
              </div>
            </div>
          )}

          {document.notes && <div style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>{document.notes}</div>}
          {document.terms && <div style={{ marginBottom: 10, whiteSpace: "pre-wrap", fontSize: "9pt" }}>{document.terms}</div>}

          {showBank && (
            <div style={{ marginTop: 18, fontSize: "10pt", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              <div>Bank name : {t.bank_name || SAFEQUEST_BRAND.bankName}</div>
              <div>Branch name : {t.bank_branch || SAFEQUEST_BRAND.bankBranch}</div>
              <div>Account name : {company?.account_name || SAFEQUEST_BRAND.accountName}</div>
              <div>Account number : {t.bank_account || SAFEQUEST_BRAND.accountNumber}</div>
              <div style={{ marginTop: 8 }}>Mobile money</div>
              <div>{SAFEQUEST_BRAND.mobileMoney}</div>
              <div>{SAFEQUEST_BRAND.mobileMoneyName}</div>
            </div>
          )}
        </div>
      </LetterheadPage>
    );
  },
);

DocumentPreview.displayName = "DocumentPreview";
