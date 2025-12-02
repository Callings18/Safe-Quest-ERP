import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateTemplate, useUpdateTemplate, InvoiceTemplate } from "@/hooks/useInvoiceTemplates";

interface TemplateFormProps {
  template?: InvoiceTemplate;
  onSuccess: () => void;
}

export function TemplateForm({ template, onSuccess }: TemplateFormProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [form, setForm] = useState({
    name: template?.name || "",
    is_default: template?.is_default || false,
    logo_url: template?.logo_url || "",
    company_name: template?.company_name || "",
    company_address: template?.company_address || "",
    company_phone: template?.company_phone || "",
    company_email: template?.company_email || "",
    company_tpin: template?.company_tpin || "",
    primary_color: template?.primary_color || "#0066cc",
    secondary_color: template?.secondary_color || "#f8fafc",
    font_family: template?.font_family || "Inter",
    show_logo: template?.show_logo ?? true,
    show_bank_details: template?.show_bank_details ?? true,
    bank_name: template?.bank_name || "",
    bank_account: template?.bank_account || "",
    bank_branch: template?.bank_branch || "",
    footer_text: template?.footer_text || "Thank you for your business!",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (template) {
      await updateTemplate.mutateAsync({ id: template.id, ...form });
    } else {
      await createTemplate.mutateAsync(form);
    }
    
    onSuccess();
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Standard Invoice"
            required
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            checked={form.is_default}
            onCheckedChange={(v) => setForm({ ...form, is_default: v })}
          />
          <Label>Set as default template</Label>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>TPIN</Label>
            <Input
              value={form.company_tpin}
              onChange={(e) => setForm({ ...form, company_tpin: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Address</Label>
            <Input
              value={form.company_address}
              onChange={(e) => setForm({ ...form, company_address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.company_phone}
              onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.company_email}
              onChange={(e) => setForm({ ...form, company_email: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Bank Details</h3>
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            checked={form.show_bank_details}
            onCheckedChange={(v) => setForm({ ...form, show_bank_details: v })}
          />
          <Label>Show bank details on invoice</Label>
        </div>
        {form.show_bank_details && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={form.bank_account}
                onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                value={form.bank_branch}
                onChange={(e) => setForm({ ...form, bank_branch: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Styling</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={form.secondary_color}
                onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={form.secondary_color}
                onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font</Label>
            <Input
              value={form.font_family}
              onChange={(e) => setForm({ ...form, font_family: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Footer Text</Label>
        <Textarea
          value={form.footer_text}
          onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {template ? "Update Template" : "Create Template"}
      </Button>
    </form>
  );
}
