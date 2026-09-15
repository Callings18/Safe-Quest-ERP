import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import {
  calculateStatutory,
  ZAMBIA_TAX_DEFAULTS,
  type TaxBank,
  type TaxSettings,
} from "@/lib/zambia-tax";
import { formatZMW } from "@/lib/currency";

function BankFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TaxBank;
  onChange: (next: TaxBank) => void;
}) {
  const set = (key: keyof TaxBank, v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Bank name</Label>
          <Input value={value.bank_name} onChange={(e) => set("bank_name", e.target.value)} placeholder="e.g. Zanaco" />
        </div>
        <div className="space-y-2">
          <Label>Branch</Label>
          <Input value={value.bank_branch} onChange={(e) => set("bank_branch", e.target.value)} placeholder="e.g. Cairo Road" />
        </div>
        <div className="space-y-2">
          <Label>Account name</Label>
          <Input value={value.account_name} onChange={(e) => set("account_name", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Account number</Label>
          <Input value={value.account_number} onChange={(e) => set("account_number", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export function TaxSettingsPanel() {
  const { settings, save, isLoading } = useTaxSettings();
  const [form, setForm] = useState<TaxSettings>(ZAMBIA_TAX_DEFAULTS);
  const [sampleGross, setSampleGross] = useState("12000");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const preview = calculateStatutory(Number(sampleGross) || 0, form);

  const updateBand = (index: number, patch: Partial<TaxSettings["paye_bands"][number]>) => {
    setForm({
      ...form,
      paye_bands: form.paye_bands.map((band, i) => (i === index ? { ...band, ...patch } : band)),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VAT (ZRA)</CardTitle>
          <CardDescription>Standard Zambian VAT is 16%. Turn it off for zero-rated or VAT-exclusive documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Charge VAT on invoices and quotations</p>
              <p className="text-sm text-muted-foreground">When off, new documents default to 0% VAT.</p>
            </div>
            <Switch checked={form.vat_enabled} onCheckedChange={(vat_enabled) => setForm({ ...form, vat_enabled })} />
          </div>
          <div className="max-w-xs space-y-2">
            <Label>VAT rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              disabled={!form.vat_enabled}
              value={form.vat_rate}
              onChange={(e) => setForm({ ...form, vat_rate: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>PAYE (ZRA) — 2026 monthly bands</CardTitle>
            <CardDescription>
              Charged on gross monthly emoluments. NAPSA and NHIMA are not deducted before PAYE.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, ...ZAMBIA_TAX_DEFAULTS, zra_paye: form.zra_paye, zra_vat: form.zra_vat, napsa: form.napsa, nhima: form.nhima })}>
            Reset to ZRA 2026
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <p className="font-medium">Deduct PAYE on payroll</p>
            <Switch checked={form.paye_enabled} onCheckedChange={(paye_enabled) => setForm({ ...form, paye_enabled })} />
          </div>
          {form.paye_bands.map((band, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-4 items-end rounded-lg bg-muted/40 p-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Band name</Label>
                <Input value={band.rate_name} onChange={(e) => updateBand(index, { rate_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>From (ZMW)</Label>
                <Input type="number" value={band.min_amount} onChange={(e) => updateBand(index, { min_amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>To (ZMW)</Label>
                <Input
                  type="number"
                  placeholder="and above"
                  value={band.max_amount ?? ""}
                  onChange={(e) => updateBand(index, { max_amount: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rate (%)</Label>
                <Input
                  type="number"
                  step={0.1}
                  value={roundPercent(band.rate)}
                  onChange={(e) => updateBand(index, { rate: Number(e.target.value) / 100 })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NAPSA and NHIMA</CardTitle>
          <CardDescription>
            NAPSA is 5% employee + 5% employer on insurable earnings, capped at K{form.napsa_ceiling.toLocaleString()} a month (2026 ceiling K37,236). NHIMA is 1% + 1% with no ceiling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <p className="font-medium">Deduct NAPSA on payroll</p>
            <Switch checked={form.napsa_enabled} onCheckedChange={(napsa_enabled) => setForm({ ...form, napsa_enabled })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <p className="font-medium">Deduct NHIMA on payroll</p>
            <Switch checked={form.nhima_enabled} onCheckedChange={(nhima_enabled) => setForm({ ...form, nhima_enabled })} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>NAPSA monthly ceiling (ZMW)</Label>
              <Input type="number" value={form.napsa_ceiling} onChange={(e) => setForm({ ...form, napsa_ceiling: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>NAPSA employee (%)</Label>
              <Input type="number" step={0.1} value={roundPercent(form.napsa_employee_rate)} onChange={(e) => setForm({ ...form, napsa_employee_rate: Number(e.target.value) / 100 })} />
            </div>
            <div className="space-y-2">
              <Label>NAPSA employer (%)</Label>
              <Input type="number" step={0.1} value={roundPercent(form.napsa_employer_rate)} onChange={(e) => setForm({ ...form, napsa_employer_rate: Number(e.target.value) / 100 })} />
            </div>
            <div className="space-y-2">
              <Label>NHIMA employee (%)</Label>
              <Input type="number" step={0.1} value={roundPercent(form.nhima_employee_rate)} onChange={(e) => setForm({ ...form, nhima_employee_rate: Number(e.target.value) / 100 })} />
            </div>
            <div className="space-y-2">
              <Label>NHIMA employer (%)</Label>
              <Input type="number" step={0.1} value={roundPercent(form.nhima_employer_rate)} onChange={(e) => setForm({ ...form, nhima_employer_rate: Number(e.target.value) / 100 })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax remittance banks</CardTitle>
          <CardDescription>Accounts used to pay PAYE, VAT, NAPSA and NHIMA. Shown on payroll statutory reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BankFields label="ZRA PAYE" value={form.zra_paye} onChange={(zra_paye) => setForm({ ...form, zra_paye })} />
          <BankFields label="ZRA VAT" value={form.zra_vat} onChange={(zra_vat) => setForm({ ...form, zra_vat })} />
          <BankFields label="NAPSA" value={form.napsa} onChange={(napsa) => setForm({ ...form, napsa })} />
          <BankFields label="NHIMA" value={form.nhima} onChange={(nhima) => setForm({ ...form, nhima })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payslip preview</CardTitle>
          <CardDescription>Check a monthly salary against the current bands before you save.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label>Gross monthly salary (ZMW)</Label>
            <Input value={sampleGross} onChange={(e) => setSampleGross(e.target.value)} />
          </div>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <Row label="PAYE" value={preview.paye} />
            <Row label="NAPSA (employee)" value={preview.napsaEmployee} />
            <Row label="NHIMA (employee)" value={preview.nhimaEmployee} />
            <Row label="Net pay" value={preview.net} strong />
            <Row label="NAPSA (employer)" value={preview.napsaEmployer} />
            <Row label="NHIMA (employer)" value={preview.nhimaEmployer} />
            <Row label="Total employer cost" value={preview.employerCost} strong />
          </div>
        </CardContent>
      </Card>

      <Button className="gap-2" onClick={() => save.mutate(form)} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save tax settings
      </Button>
    </div>
  );
}

function roundPercent(rate: number) {
  return Math.round(rate * 1000) / 10;
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between rounded-md border px-3 py-2 ${strong ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span>{formatZMW(value)}</span>
    </div>
  );
}
 