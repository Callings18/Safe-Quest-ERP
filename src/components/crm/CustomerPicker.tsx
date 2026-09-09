import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCRM";
import { CustomerFormDialog } from "./CustomerFormDialog";

export function CustomerPicker({
  value,
  onChange,
  label = "Customer",
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const { data: companies } = useCompanies();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setOpen(true)}>
          Add customer
        </Button>
      </div>
      <Select value={value || undefined} onValueChange={onChange}>
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
      <CustomerFormDialog open={open} onOpenChange={setOpen} onCreated={onChange} />
    </div>
  );
}
