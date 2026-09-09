import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { DocumentPreview } from "./DocumentPreview";
import { InvoiceTemplate } from "@/hooks/useInvoiceTemplates";
import { downloadElementPdf } from "@/lib/pdf";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { resolveDocumentBrand } from "@/lib/branding";

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "invoice" | "quotation" | "delivery_note" | "receipt";
  document: any;
  items: any[];
  template?: InvoiceTemplate | null;
  payments?: any[];
}

export function DocumentViewDialog({
  open,
  onOpenChange,
  type,
  document,
  items,
  template,
  payments,
}: DocumentViewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { data: company } = useCompanySettings();
  const branded = resolveDocumentBrand(template, company);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { margin: 0; padding: 0; font-family: ${branded.font_family}, sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    const content = printRef.current;
    if (!content) return;

    setDownloading(true);
    try {
      const docNumber = document?.invoice_number || document?.quotation_number || document?.delivery_number || "document";
      await downloadElementPdf(content, `${docNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const typeLabels = {
    invoice: "Invoice",
    quotation: "Quotation",
    delivery_note: "Delivery Note",
    receipt: "Receipt",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>View {typeLabels[type]}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="border rounded-lg overflow-hidden">
          <DocumentPreview
            ref={printRef}
            type={type}
            document={document}
            items={items}
            template={branded}
            company={company}
            payments={payments}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}