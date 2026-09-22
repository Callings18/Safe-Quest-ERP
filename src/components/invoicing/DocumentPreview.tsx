import { forwardRef } from "react";
import { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { formatZMW } from "@/lib/currency";
import { resolveDocumentBrand, SAFEQUEST_BRAND, amountInWords, type CompanyBrand } from "@/lib/branding";
import { LetterheadPage } from "@/components/documents/LetterheadPage";

interface DocumentPreviewProps {
  type: "invoice" | "quotation" | "delivery_note" | "receipt" | "proforma";
  document: any;
  items: any[];
  template?: InvoiceTemplate | null;
  company?: CompanyBrand;
  payments?: any[];
}

export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ type, document, items, template, company, payments }, ref) => {
    const t = resolveDocumentBrand(template, company);
    const accent = t.primary_color || SAFEQUEST_BRAND.navy;
    const solidTable = t.table_style === "solid";

    const typeLabels = {
      invoice: "TAX INVOICE",
      proforma: "PROFORMA INVOICE",
      quotation: "QUOTATION",
      delivery_note: "DELIVERY NOTE",
      receipt: "RECEIPT",
    };

    const documentNumber =
      type === "invoice" || type === "proforma" || type === "receipt" ? document.invoice_number :
      type === "quotation" ? document.quotation_number :
      type === "delivery_note" ? document.delivery_number :
      `RCP-${document.id?.substring(0, 8).toUpperCase()}`;

    const showMoney = type !== "delivery_note";
    const showBank = t.show_bank_details && (type === "invoice" || type === "proforma" || type === "quotation" || type === "receipt");
    const headerCell = solidTable
      ? { textAlign: "left" as const, backgroundColor: accent, color: "#fff", padding: "7px 6px" }
      : { textAlign: "left" as const, borderBottom: `2px solid ${accent}`, padding: "6px 4px" };
    const headerRight = { ...headerCell, textAlign: "right" as const };
    const bodyCell = { padding: "6px 4px", borderBottom: "1px solid #ddd" };

    return (
      <LetterheadPage
        ref={ref}
        headerMode={t.header_mode}
        letterheadUrl={t.letterhead_url}
        fontFamily={t.font_family}
        marginTop={t.margin_top}
        marginBottom={t.margin_bottom}
      >
        <div style={{ fontSize: "11pt", lineHeight: 1.45, fontFamily: t.font_family }}>
          {(t.show_logo || t.header_mode === "logo") && t.logo_url && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <img src={t.logo_url} alt="" style={{ width: t.logo_width || 72, height: "auto", objectFit: "contain" }} />
              <div>
                <div style={{ fontWeight: 700, color: accent }}>{t.company_name}</div>
                {t.company_address && <div style={{ fontSize: "9pt" }}>{t.company_address}</div>}
                {(t.company_phone || t.company_email) && (
                  <div style={{ fontSize: "9pt" }}>{[t.company_phone, t.company_email].filter(Boolean).join("  ·  ")}</div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: "16pt", fontWeight: 700, letterSpacing: "0.04em", color: accent }}>
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
              {t.company_tpin && <div>TPIN: {t.company_tpin}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: accent }}>
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
                <th style={headerCell}>Product</th>
                <th style={headerRight}>Quantity</th>
                {showMoney && (
                  <>
                    <th style={headerRight}>Unit price</th>
                    <th style={headerRight}>Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} style={solidTable && index % 2 ? { backgroundColor: t.secondary_color } : undefined}>
                  <td style={bodyCell}>{item.description}</td>
                  <td style={{ ...bodyCell, textAlign: "right" }}>{item.quantity}</td>
                  {showMoney && (
                    <>
                      <td style={{ ...bodyCell, textAlign: "right" }}>{formatZMW(item.unit_price)}</td>
                      <td style={{ ...bodyCell, textAlign: "right" }}>{formatZMW(item.total)}</td>
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
                {Number(document.tax_amount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                    <span>VAT{document.tax_rate != null ? ` (${document.tax_rate}%)` : ""}:</span>
                    <span>{formatZMW(document.tax_amount)}</span>
                  </div>
                )}
                {Number(document.tax_amount) === 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                    <span>VAT:</span>
                    <span>{formatZMW(0)} {document.tax_rate === 0 ? "(zero-rated / off)" : ""}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Total:</span>
                  <span style={{ fontWeight: 700, color: accent }}>{formatZMW(document.total || 0)}</span>
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
              <div>Bank name : {t.bank_name}</div>
              <div>Branch name : {t.bank_branch}</div>
              <div>Account name : {t.account_name || company?.account_name || SAFEQUEST_BRAND.accountName}</div>
              <div>Account number : {t.bank_account}</div>
              {(t.mobile_money || t.mobile_money_name) && (
                <>
                  <div style={{ marginTop: 8 }}>Mobile money</div>
                  {t.mobile_money && <div>{t.mobile_money}</div>}
                  {t.mobile_money_name && <div>{t.mobile_money_name}</div>}
                </>
              )}
            </div>
          )}

          {t.footer_text && (
            <div style={{ marginTop: 16, fontSize: "9pt", color: SAFEQUEST_BRAND.muted }}>{t.footer_text}</div>
          )}
        </div>
      </LetterheadPage>
    );
  },
);

DocumentPreview.displayName = "DocumentPreview";
