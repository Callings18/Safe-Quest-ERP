import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { useCompanies } from "@/hooks/useCRM";

interface InvoiceFormProps {
  onSuccess: () => void;
  editData?: {
    id: string;
    company_id?: string;
    due_date?: string;
    notes?: string;
    invoice_items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      tax_rate: number;
    }>;
  } | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export function InvoiceForm({ onSuccess, editData }: InvoiceFormProps) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: companies } = useCompanies();

  const [form, setForm] = useState({
    company_id: "",
    due_date: "",
    notes: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, tax_rate: 16 },
  ]);

  useEffect(() => {
    if (editData) {
      setForm({
        company_id: editData.company_id || "",
        due_date: editData.due_date || "",
        notes: editData.notes || "",
      });
      if (editData.invoice_items?.length) {
        setItems(editData.invoice_items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate: Number(item.tax_rate) || 16,
        })));
      }
    }
  }, [editData]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, tax_rate: 16 }]);
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
  const taxAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price * (item.tax_rate / 100), 0);
  const total = subtotal + taxAmount;

  const isEditing = !!editData?.id;
  const mutation = isEditing ? updateInvoice : createInvoice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.description && item.unit_price > 0);
    if (validItems.length === 0) {
      return;
    }

    const payload = {
      ...(isEditing && { id: editData.id }),
      company_id: form.company_id || undefined,
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
      items: validItems,
    };

    await mutation.mutateAsync(payload as any);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {companies?.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </div>
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
              <div className="w-20">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unit_price || ""}
                  onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="w-20">
                <Select 
                  value={String(item.tax_rate)} 
                  onValueChange={(v) => updateItem(index, "tax_rate", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="16">16%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 text-right pt-2 font-medium">
                K{(item.quantity * item.unit_price * (1 + item.tax_rate / 100)).toLocaleString()}
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
              <span>K{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT:</span>
              <span>K{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>K{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Additional notes"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEditing ? "Update Invoice" : "Create Invoice"}
      </Button>
    </form>
  );
}