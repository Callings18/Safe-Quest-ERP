import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRecordPayment } from "@/hooks/usePayments";

interface PaymentFormProps {
  invoiceId: string;
  balanceDue: number;
  onSuccess: () => void;
}

export function PaymentForm({ invoiceId, balanceDue, onSuccess }: PaymentFormProps) {
  const recordPayment = useRecordPayment();

  const [form, setForm] = useState({
    amount: balanceDue,
    payment_method: "bank_transfer",
    reference: "",
    notes: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await recordPayment.mutateAsync({
      invoice_id: invoiceId,
      amount: form.amount,
      payment_method: form.payment_method,
      reference: form.reference || undefined,
      notes: form.notes || undefined,
      payment_date: form.payment_date,
    });
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Balance Due</p>
        <p className="text-2xl font-bold">K{balanceDue.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount Received</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            max={balanceDue}
            min={0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Date</Label>
          <Input
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Reference Number</Label>
        <Input
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
          placeholder="e.g., Transaction ID, Cheque number"
        />
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

      <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
        {recordPayment.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Record Payment
      </Button>
    </form>
  );
}
