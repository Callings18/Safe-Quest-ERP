import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Upload } from "lucide-react";
import {
  InvoiceTemplate,
  useCreateTemplate,
  useUpdateTemplate,
} from "@/hooks/useInvoiceTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { SAFEQUEST_BRAND } from "@/lib/branding";
import { DocumentPreview } from "@/components/invoicing/DocumentPreview";
import { toast } from "sonner";

const FONTS = ["Arial", "Helvetica", "Inter", "Calibri", "Georgia", "Times New Roman", "Verdana"];

type PreviewKind = "quotation" | "invoice" | "delivery_note" | "receipt";

function sampleDocument(type: PreviewKind) {
  const today = new Date().toISOString();
  const later = new Date(Date.now() + 14 * 86400000).toISOString();
  return {
    id: "preview",
    invoice_number: "INV-2026-0001",
    quotation_number: "QT-2026-0001",
    delivery_number: "DN-2026-0001",
    issue_date: today,
    delivery_date: today,
    created_at: today,
    valid_until: later,
    due_date: later,
    subtotal: 18500,
    total: 18500,
    amount_paid: type === "receipt" ? 18500 : 0,
    notes: "Prices are in Zambian Kwacha.",
    companies: {
      name: "Sample Customer Ltd",
      address: "Cairo Road, Lusaka",
      phone: "+260977000000",
      email: "accounts@sample.co.zm",
    },
    driver_name: "J. Phiri",
    vehicle_number: "ALB 1234",
  };
}

const SAMPLE_ITEMS = [
  { id: "1", description: "Solar pump installation", quantity: 1, unit_price: 12500, total: 12500 },
  { id: "2", description: "CCTV camera kit", quantity: 2, unit_price: 3000, total: 6000 },
];

async function uploadBrandFile(userId: string, file: File, kind: "logo" | "letterhead") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/document-${kind}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export function DocumentStudio({
  template,
  onSuccess,
}: {
  template?: InvoiceTemplate | null;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const { data: company } = useCompanySettings();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const [previewType, setPreviewType] = useState<PreviewKind>("quotation");
  const [uploading, setUploading] = useState<"logo" | "letterhead" | null>(null);

  const [form, setForm] = useState<Omit<InvoiceTemplate, "id">>({
    name: "Company documents",
    is_default: true,
    logo_url: SAFEQUEST_BRAND.logo,
    company_name: SAFEQUEST_BRAND.name,
    company_address: `${SAFEQUEST_BRAND.address}, ${SAFEQUEST_BRAND.city}`,
    company_phone: SAFEQUEST_BRAND.phone,
    company_email: SAFEQUEST_BRAND.email,
    company_tpin: "",
    primary_color: SAFEQUEST_BRAND.navy,
    secondary_color: SAFEQUEST_BRAND.paper,
    font_family: "Arial",
    show_logo: false,
    show_bank_details: true,
    bank_name: SAFEQUEST_BRAND.bankName,
    bank_account: SAFEQUEST_BRAND.accountNumber,
    bank_branch: SAFEQUEST_BRAND.bankBranch,
    footer_text: "Thank you for your business.",
    letterhead_url: SAFEQUEST_BRAND.letterhead,
    header_mode: "letterhead",
    logo_width: 72,
    account_name: SAFEQUEST_BRAND.accountName,
    mobile_money: SAFEQUEST_BRAND.mobileMoney,
    mobile_money_name: SAFEQUEST_BRAND.mobileMoneyName,
    table_style: "underline",
    margin_top: 54,
    margin_bottom: 44,
  });

  useEffect(() => {
    if (!template && !company) return;
    setForm((current) => ({
      ...current,
      name: template?.name || current.name,
      is_default: template?.is_default ?? true,
      logo_url: template?.logo_url || company?.logo_url || current.logo_url,
      company_name: template?.company_name || company?.company_name || current.company_name,
      company_address: template?.company_address || [company?.address, company?.city].filter(Boolean).join(", ") || current.company_address,
      company_phone: template?.company_phone || company?.phone || current.company_phone,
      company_email: template?.company_email || company?.email || current.company_email,
      company_tpin: template?.company_tpin || company?.tpin || current.company_tpin,
      primary_color: template?.primary_color || current.primary_color,
      secondary_color: template?.secondary_color || current.secondary_color,
      font_family: template?.font_family || current.font_family,
      show_logo: template?.show_logo ?? current.show_logo,
      show_bank_details: template?.show_bank_details ?? current.show_bank_details,
      bank_name: template?.bank_name || company?.bank_name || current.bank_name,
      bank_account: template?.bank_account || company?.account_number || current.bank_account,
      bank_branch: template?.bank_branch || company?.bank_branch || current.bank_branch,
      footer_text: template?.footer_text || current.footer_text,
      letterhead_url: template?.letterhead_url || current.letterhead_url,
      header_mode: template?.header_mode || current.header_mode,
      logo_width: template?.logo_width ?? current.logo_width,
      account_name: template?.account_name || company?.account_name || current.account_name,
      mobile_money: template?.mobile_money || current.mobile_money,
      mobile_money_name: template?.mobile_money_name || current.mobile_money_name,
      table_style: template?.table_style || current.table_style,
      margin_top: template?.margin_top ?? current.margin_top,
      margin_bottom: template?.margin_bottom ?? current.margin_bottom,
    }));
  }, [template, company]);

  const liveTemplate = useMemo<InvoiceTemplate>(
    () => ({ id: template?.id || "draft", ...form }),
    [form, template?.id],
  );

  const handleUpload = async (kind: "logo" | "letterhead", file?: File) => {
    if (!file || !user?.id) return;
    setUploading(kind);
    try {
      const url = await uploadBrandFile(user.id, file, kind);
      if (kind === "logo") setForm((f) => ({ ...f, logo_url: url, show_logo: true }));
      else setForm((f) => ({ ...f, letterhead_url: url, header_mode: "letterhead" }));
      toast.success(kind === "logo" ? "Logo uploaded" : "Letterhead uploaded");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (template?.id) {
      await updateTemplate.mutateAsync({ id: template.id, ...form });
    } else {
      await createTemplate.mutateAsync(form);
    }
    onSuccess?.();
  };

  const pending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2">
            <Label>Style name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
            <Label>Use this look on every document</Label>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold">Header</h3>
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={form.header_mode}
              onValueChange={(value: "letterhead" | "logo") =>
                setForm({
                  ...form,
                  header_mode: value,
                  show_logo: value === "logo" ? true : form.show_logo,
                  margin_top: value === "letterhead" ? 54 : 18,
                  margin_bottom: value === "letterhead" ? 44 : 18,
                })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="letterhead">Official letterhead background</SelectItem>
                <SelectItem value="logo">Logo and company header</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Letterhead image</Label>
            <div className="flex gap-2">
              <Input
                value={form.letterhead_url || ""}
                onChange={(e) => setForm({ ...form, letterhead_url: e.target.value })}
                placeholder="/letterhead.png"
              />
              <Button type="button" variant="outline" disabled={uploading === "letterhead"} asChild>
                <label className="cursor-pointer">
                  {uploading === "letterhead" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("letterhead", e.target.files?.[0])} />
                </label>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.show_logo} onCheckedChange={(v) => setForm({ ...form, show_logo: v })} />
            <Label>Show logo on the document</Label>
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex gap-2">
              <Input value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              <Button type="button" variant="outline" disabled={uploading === "logo"} asChild>
                <label className="cursor-pointer">
                  {uploading === "logo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("logo", e.target.files?.[0])} />
                </label>
              </Button>
            </div>
            {form.logo_url && <img src={form.logo_url} alt="" className="h-12 object-contain bg-white border rounded p-1" />}
          </div>
          <div className="space-y-2">
            <Label>Logo width ({form.logo_width}px)</Label>
            <Input
              type="range"
              min={36}
              max={180}
              value={form.logo_width}
              onChange={(e) => setForm({ ...form, logo_width: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold">Colors and type</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Accent color</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Row tint</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Font</Label>
              <Select value={form.font_family} onValueChange={(font_family) => setForm({ ...form, font_family })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Table style</Label>
              <Select value={form.table_style} onValueChange={(table_style: "underline" | "solid") => setForm({ ...form, table_style })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="underline">Simple lines</SelectItem>
                  <SelectItem value="solid">Filled header</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Top margin ({form.margin_top}mm)</Label>
              <Input type="range" min={12} max={70} value={form.margin_top} onChange={(e) => setForm({ ...form, margin_top: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Bottom margin ({form.margin_bottom}mm)</Label>
              <Input type="range" min={12} max={60} value={form.margin_bottom} onChange={(e) => setForm({ ...form, margin_bottom: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold">Company on documents</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2"><Label>Name</Label><Input value={form.company_name || ""} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>Address</Label><Input value={form.company_address || ""} onChange={(e) => setForm({ ...form, company_address: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.company_phone || ""} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.company_email || ""} onChange={(e) => setForm({ ...form, company_email: e.target.value })} /></div>
            <div className="space-y-2 col-span-2"><Label>TPIN</Label><Input value={form.company_tpin || ""} onChange={(e) => setForm({ ...form, company_tpin: e.target.value })} /></div>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch checked={form.show_bank_details} onCheckedChange={(v) => setForm({ ...form, show_bank_details: v })} />
            <Label>Show bank and mobile money</Label>
          </div>
          {form.show_bank_details && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Bank</Label><Input value={form.bank_name || ""} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Branch</Label><Input value={form.bank_branch || ""} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} /></div>
              <div className="space-y-2"><Label>Account name</Label><Input value={form.account_name || ""} onChange={(e) => setForm({ ...form, account_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Account number</Label><Input value={form.bank_account || ""} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} /></div>
              <div className="space-y-2"><Label>Mobile money</Label><Input value={form.mobile_money || ""} onChange={(e) => setForm({ ...form, mobile_money: e.target.value })} /></div>
              <div className="space-y-2"><Label>Mobile money name</Label><Input value={form.mobile_money_name || ""} onChange={(e) => setForm({ ...form, mobile_money_name: e.target.value })} /></div>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>Footer text</Label>
          <Textarea rows={2} value={form.footer_text || ""} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} />
        </div>

        <Button type="submit" className="w-full gap-2" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save document look
        </Button>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Live preview</h3>
          <Select value={previewType} onValueChange={(value: PreviewKind) => setPreviewType(value)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="quotation">Quotation</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="delivery_note">Delivery note</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-auto rounded-lg border bg-neutral-200 p-3 max-h-[80vh]">
          <div className="origin-top-left scale-[0.62] w-[162%]">
            <DocumentPreview
              type={previewType}
              document={sampleDocument(previewType)}
              items={SAMPLE_ITEMS}
              template={liveTemplate}
              company={company}
              payments={previewType === "receipt" ? [{ id: "p1", payment_date: new Date().toISOString(), payment_method: "bank_transfer", amount: 18500 }] : []}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
