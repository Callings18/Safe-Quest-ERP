import { useState } from "react";
import { DocumentPreview } from "@/components/invoicing/DocumentPreview";
import { Button } from "@/components/ui/button";

const SAMPLE = {
  id: "preview",
  invoice_number: "INV-2026-0001",
  quotation_number: "QT-2026-0001",
  issue_date: new Date().toISOString(),
  valid_until: new Date(Date.now() + 14 * 86400000).toISOString(),
  due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
  subtotal: 18500,
  total: 18500,
  amount_paid: 0,
  notes: "Prices are in Zambian Kwacha.",
  companies: {
    name: "Sample Customer Ltd",
    address: "Cairo Road, Lusaka",
    phone: "+260977000000",
    email: "accounts@sample.co.zm",
  },
};

const ITEMS = [
  { id: "1", description: "Solar pump installation", quantity: 1, unit_price: 12500, total: 12500 },
  { id: "2", description: "CCTV camera kit", quantity: 2, unit_price: 3000, total: 6000 },
];

export default function DocumentPreviewPage() {
  const [type, setType] = useState<"quotation" | "invoice">("quotation");

  return (
    <div className="min-h-screen bg-neutral-200 p-6">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Document look check</h1>
          <p className="text-sm text-muted-foreground">Sample quotation and invoice on the SafeQuest letterhead.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={type === "quotation" ? "default" : "outline"} size="sm" onClick={() => setType("quotation")}>
            Quotation
          </Button>
          <Button variant={type === "invoice" ? "default" : "outline"} size="sm" onClick={() => setType("invoice")}>
            Invoice
          </Button>
        </div>
      </div>
      <DocumentPreview type={type} document={SAMPLE} items={ITEMS} />
    </div>
  );
}
