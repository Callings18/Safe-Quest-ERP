import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useCreateQuotation, useUpdateQuotation } from "@/hooks/useQuotations";
import { formatZMW } from "@/lib/currency";
import { CustomerPicker } from "@/components/crm/CustomerPicker";

interface QuotationFormProps {
  onSuccess: () => void;
  editData?: {
    id: string;
    company_id?: string;
    valid_until?: string;
    tax_rate?: number;
    notes?: string;
    terms?: string;
    quotation_items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  } | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export function QuotationForm({ onSuccess, editData }: QuotationFormProps) {
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  const [form, setForm] = useState({
    company_id: "",
    valid_until: "",
    tax_rate: "16",
    notes: "",
    terms: "1. Quotation valid for 30 days\n2. 50% deposit required to commence work\n3. Balance due on completion",
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    if (editData) {
      setForm({
        company_id: editData.company_id || "",
        valid_until: editData.valid_until || "",
        tax_rate: String(editData.tax_rate || 16),
        notes: editData.notes || "",
        terms: editData.terms || "",
      });
      if (editData.quotation_items?.length) {
        setItems(editData.quotation_items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })));
      }
    }
  }, [editData]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (Number(form.tax_rate) / 100);
  const total = subtotal + taxAmount;

  const isEditing = !!editData?.id;
  const mutation = isEditing ? updateQuotation : createQuotation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.description && item.unit_price > 0);
    if (validItems.length === 0) {
      return;
    }

    const payload = {
      ...(isEditing && { id: editData.id }),
      company_id: form.company_id || undefined,
      valid_until: form.valid_until || undefined,
      tax_rate: Number(form.tax_rate),
      notes: form.notes || undefined,
      terms: form.terms || undefined,
      items: validItems,
    };

    await mutation.mutateAsync(payload as any);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <CustomerPicker value={form.company_id} onChange={(company_id) => setForm({ ...form, company_id })} />
        <div className="space-y-2">
          <Label>Valid Until</Label>
          <Input
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>VAT Rate (%)</Label>
        <Select value={form.tax_rate} onValueChange={(v) => setForm({ ...form, tax_rate: v })}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0%</SelectItem>
            <SelectItem value="16">16%</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unit_price || ""}
                  onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="w-28 text-right pt-2 font-medium">
                {formatZMW((item.quantity * item.unit_price))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatZMW(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({form.tax_rate}%):</span>
              <span>{formatZMW(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatZMW(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Additional notes for the customer"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Terms & Conditions</Label>
        <Textarea
          value={form.terms}
          onChange={(e) => setForm({ ...form, terms: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEditing ? "Update Quotation" : "Create Quotation"}
      </Button>
    </form>
  );
}