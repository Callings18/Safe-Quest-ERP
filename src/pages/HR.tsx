import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useEmployeeStats } from "@/hooks/useHR";
import { useAttendance, useClockIn, useClockOut } from "@/hooks/useAttendance";
import { Loader2, Plus, Users, Building2, DollarSign, UserCheck, Search, Pencil } from "lucide-react";
import { format } from "date-fns";

export default function HR() {
  const { data: employees, isLoading } = useEmployees();
  const { data: stats } = useEmployeeStats();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: attendance } = useAttendance();
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    employee_number: "", first_name: "", last_name: "", email: "", phone: "",
    national_id: "", job_title: "", department: "", hire_date: "",
    basic_salary: "", bank_name: "", bank_account: "",
    napsa_number: "", nhima_number: "", tax_pin: "",
  });

  const openEdit = (emp: any) => {
    setEditingId(emp.id);
    setForm({
      employee_number: emp.employee_number, first_name: emp.first_name, last_name: emp.last_name,
      email: emp.email || "", phone: emp.phone || "", national_id: emp.national_id || "",
      job_title: emp.job_title || "", department: emp.department || "", hire_date: emp.hire_date,
      basic_salary: String(emp.basic_salary || ""), bank_name: emp.bank_name || "",
      bank_account: emp.bank_account || "", napsa_number: emp.napsa_number || "",
      nhima_number: emp.nhima_number || "", tax_pin: emp.tax_pin || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ employee_number: "", first_name: "", last_name: "", email: "", phone: "", national_id: "", job_title: "", department: "", hire_date: "", basic_salary: "", bank_name: "", bank_account: "", napsa_number: "", nhima_number: "", tax_pin: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, basic_salary: Number(form.basic_salary) || 0 };
    if (editingId) {
      await updateEmployee.mutateAsync({ id: editingId, ...payload });
    } else {
      await createEmployee.mutateAsync(payload as any);
    }
    setDialogOpen(false);
    resetForm();
  };

  const filtered = employees?.filter(e =>
    `${e.first_name} ${e.last_name} ${e.employee_number} ${e.department || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HR & Employees</h1>
            <p className="text-muted-foreground">Manage employee records and departments</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Add Employee</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Total Employees", value: stats?.total || 0, icon: Users },
            { title: "Active", value: stats?.active || 0, icon: UserCheck },
            { title: "Departments", value: stats?.departmentCount || 0, icon: Building2 },
            { title: "Monthly Payroll", value: `K${((stats?.totalSalary || 0) / 1000).toFixed(0)}K`, icon: DollarSign },
          ].map(kpi => (
            <Card key={kpi.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><kpi.icon className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-sm text-muted-foreground">{kpi.title}</p><p className="text-xl font-bold">{kpi.value}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold">Today's attendance</p>
            <div className="space-y-2">
              {(employees || []).filter((e) => e.is_active).map((emp) => {
                const rec = attendance?.find((a) => a.employee_id === emp.id);
                return (
                  <div key={emp.id} className="flex items-center justify-between text-sm border-b last:border-0 py-2">
                    <span>{emp.first_name} {emp.last_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{rec ? rec.status : "not clocked"}</span>
                      {!rec?.clock_in && (
                        <Button size="sm" variant="outline" onClick={() => clockIn.mutate({ employee_id: emp.id })}>Clock in</Button>
                      )}
                      {rec?.clock_in && !rec.clock_out && (
                        <Button size="sm" onClick={() => clockOut.mutate({ id: rec.id, clock_in: rec.clock_in })}>Clock out</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employee_number}</TableCell>
                    <TableCell>{emp.first_name} {emp.last_name}</TableCell>
                    <TableCell>{emp.department || "—"}</TableCell>
                    <TableCell>{emp.job_title || "—"}</TableCell>
                    <TableCell>{emp.phone || "—"}</TableCell>
                    <TableCell>{format(new Date(emp.hire_date), "dd MMM yyyy")}</TableCell>
                    <TableCell><Badge variant={emp.is_active ? "default" : "secondary"}>{emp.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => openEdit(emp)}><Pencil className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={v => { if (!v) resetForm(); setDialogOpen(v); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Employee # *</Label><Input required value={form.employee_number} onChange={e => setForm(f => ({ ...f, employee_number: e.target.value }))} placeholder="EMP-001" /></div>
                <div><Label>First Name *</Label><Input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>National ID (NRC)</Label><Input value={form.national_id} onChange={e => setForm(f => ({ ...f, national_id: e.target.value }))} /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
                <div><Label>Job Title</Label><Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} /></div>
                <div><Label>Hire Date *</Label><Input required type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} /></div>
                <div><Label>Basic Salary (K)</Label><Input type="number" value={form.basic_salary} onChange={e => setForm(f => ({ ...f, basic_salary: e.target.value }))} /></div>
                <div><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                <div><Label>Bank Account</Label><Input value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} /></div>
                <div><Label>TPIN</Label><Input value={form.tax_pin} onChange={e => setForm(f => ({ ...f, tax_pin: e.target.value }))} /></div>
                <div><Label>NAPSA Number</Label><Input value={form.napsa_number} onChange={e => setForm(f => ({ ...f, napsa_number: e.target.value }))} /></div>
                <div><Label>NHIMA Number</Label><Input value={form.nhima_number} onChange={e => setForm(f => ({ ...f, nhima_number: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createEmployee.isPending || updateEmployee.isPending}>
                {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingId ? "Update Employee" : "Add Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
