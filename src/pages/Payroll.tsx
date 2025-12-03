import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees, usePayrollRates, usePayrollRuns, useCreatePayrollRun } from "@/hooks/usePayroll";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Calculator, Download, Send, Users, Wallet, FileText, AlertTriangle, CheckCircle2, Calendar, Building2, Plus, UserPlus, Pencil, MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PayslipViewer } from "@/components/payroll/PayslipViewer";

const departments = ["Administration", "Finance", "Operations", "Sales", "Engineering", "HR", "IT", "Projects", "Field Operations"];

export default function Payroll() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: payrollRates, isLoading: ratesLoading } = usePayrollRates();
  const { data: payrollRuns, isLoading: runsLoading } = usePayrollRuns();
  const createPayrollRun = useCreatePayrollRun();
  const queryClient = useQueryClient();

  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [payrollDialog, setPayrollDialog] = useState(false);
  const [payslipDialog, setPayslipDialog] = useState(false);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<any>(null);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [empForm, setEmpForm] = useState({
    employee_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    national_id: "",
    date_of_birth: "",
    hire_date: "",
    job_title: "",
    department: "",
    basic_salary: "",
    bank_name: "",
    bank_account: "",
    tax_pin: "",
    napsa_number: "",
    nhima_number: "",
  });
  const [payrollForm, setPayrollForm] = useState({
    pay_period: "",
    pay_date: "",
  });

  const handleViewPayslips = (run: any) => {
    setSelectedPayrollRun(run);
    setPayslipDialog(true);
  };

  const createEmployee = useMutation({
    mutationFn: async (data: typeof empForm) => {
      const employee_number = data.employee_number || `EMP-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("employees").insert({
        employee_number,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        national_id: data.national_id || null,
        date_of_birth: data.date_of_birth || null,
        hire_date: data.hire_date || new Date().toISOString().split("T")[0],
        job_title: data.job_title || null,
        department: data.department || null,
        basic_salary: Number(data.basic_salary) || 0,
        bank_name: data.bank_name || null,
        bank_account: data.bank_account || null,
        tax_pin: data.tax_pin || null,
        napsa_number: data.napsa_number || null,
        nhima_number: data.nhima_number || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");
      setEmployeeDialog(false);
      resetEmpForm();
    },
    onError: (error: any) => {
      toast.error("Failed to add employee: " + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof empForm) => {
      const { error } = await supabase.from("employees").update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        national_id: data.national_id || null,
        date_of_birth: data.date_of_birth || null,
        hire_date: data.hire_date,
        job_title: data.job_title || null,
        department: data.department || null,
        basic_salary: Number(data.basic_salary) || 0,
        bank_name: data.bank_name || null,
        bank_account: data.bank_account || null,
        tax_pin: data.tax_pin || null,
        napsa_number: data.napsa_number || null,
        nhima_number: data.nhima_number || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated");
      setEmployeeDialog(false);
      setEditEmployee(null);
      resetEmpForm();
    },
    onError: (error: any) => {
      toast.error("Failed to update employee: " + error.message);
    },
  });

  const resetEmpForm = () => {
    setEmpForm({
      employee_number: "", first_name: "", last_name: "", email: "", phone: "",
      national_id: "", date_of_birth: "", hire_date: "", job_title: "", department: "",
      basic_salary: "", bank_name: "", bank_account: "", tax_pin: "", napsa_number: "", nhima_number: "",
    });
  };

  const handleEditEmployee = (emp: any) => {
    setEditEmployee(emp);
    setEmpForm({
      employee_number: emp.employee_number,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email || "",
      phone: emp.phone || "",
      national_id: emp.national_id || "",
      date_of_birth: emp.date_of_birth || "",
      hire_date: emp.hire_date || "",
      job_title: emp.job_title || "",
      department: emp.department || "",
      basic_salary: String(emp.basic_salary || ""),
      bank_name: emp.bank_name || "",
      bank_account: emp.bank_account || "",
      tax_pin: emp.tax_pin || "",
      napsa_number: emp.napsa_number || "",
      nhima_number: emp.nhima_number || "",
    });
    setEmployeeDialog(true);
  };

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editEmployee) {
      updateEmployee.mutate({ id: editEmployee.id, ...empForm });
    } else {
      createEmployee.mutate(empForm);
    }
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayrollRun.mutateAsync({
      pay_period: payrollForm.pay_period,
      pay_date: payrollForm.pay_date,
    });
    setPayrollDialog(false);
    setPayrollForm({ pay_period: "", pay_date: "" });
  };

  const payeBands = payrollRates?.filter(r => r.rate_type === "PAYE") || [];
  const latestRun = payrollRuns?.[0];

  const totalPayroll = employees?.reduce((sum, emp) => sum + Number(emp.basic_salary || 0), 0) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HR & Payroll</h1>
            <p className="text-muted-foreground">Employee management with Zambian statutory compliance (PAYE, NAPSA, NHIMA)</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={employeeDialog} onOpenChange={(open) => { setEmployeeDialog(open); if (!open) { setEditEmployee(null); resetEmpForm(); } }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" />Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitEmployee} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input value={empForm.first_name} onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input value={empForm.last_name} onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>National ID (NRC)</Label>
                        <Input value={empForm.national_id} onChange={(e) => setEmpForm({ ...empForm, national_id: e.target.value })} placeholder="123456/78/1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={empForm.date_of_birth} onChange={(e) => setEmpForm({ ...empForm, date_of_birth: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="097XXXXXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Employment Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Employee Number</Label>
                        <Input value={empForm.employee_number} onChange={(e) => setEmpForm({ ...empForm, employee_number: e.target.value })} placeholder="Auto-generated if empty" />
                      </div>
                      <div className="space-y-2">
                        <Label>Hire Date *</Label>
                        <Input type="date" value={empForm.hire_date} onChange={(e) => setEmpForm({ ...empForm, hire_date: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input value={empForm.job_title} onChange={(e) => setEmpForm({ ...empForm, job_title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={empForm.department} onValueChange={(v) => setEmpForm({ ...empForm, department: v })}>
                          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent>
                            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Basic Salary (K) *</Label>
                        <Input type="number" value={empForm.basic_salary} onChange={(e) => setEmpForm({ ...empForm, basic_salary: e.target.value })} required />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input value={empForm.bank_name} onChange={(e) => setEmpForm({ ...empForm, bank_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input value={empForm.bank_account} onChange={(e) => setEmpForm({ ...empForm, bank_account: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Statutory Numbers */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Statutory Registration</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>TPIN (ZRA)</Label>
                        <Input value={empForm.tax_pin} onChange={(e) => setEmpForm({ ...empForm, tax_pin: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>NAPSA Number</Label>
                        <Input value={empForm.napsa_number} onChange={(e) => setEmpForm({ ...empForm, napsa_number: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>NHIMA Number</Label>
                        <Input value={empForm.nhima_number} onChange={(e) => setEmpForm({ ...empForm, nhima_number: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={createEmployee.isPending || updateEmployee.isPending}>
                    {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editEmployee ? "Update Employee" : "Add Employee"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={payrollDialog} onOpenChange={setPayrollDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Calculator className="h-4 w-4" />Run Payroll</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Run Payroll</DialogTitle></DialogHeader>
                <form onSubmit={handleRunPayroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pay Period *</Label>
                    <Input value={payrollForm.pay_period} onChange={(e) => setPayrollForm({ ...payrollForm, pay_period: e.target.value })} required placeholder="e.g., November 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Date *</Label>
                    <Input type="date" value={payrollForm.pay_date} onChange={(e) => setPayrollForm({ ...payrollForm, pay_date: e.target.value })} required />
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Employees:</span><span className="font-medium">{employees?.length || 0}</span></div>
                    <div className="flex justify-between"><span>Total Gross:</span><span className="font-medium">K{totalPayroll.toLocaleString()}</span></div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createPayrollRun.isPending}>
                    {createPayrollRun.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Process Payroll
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-3 animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{latestRun?.pay_period || "No payroll runs yet"}</CardTitle>
                  {latestRun && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />{latestRun.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => latestRun && handleViewPayslips(latestRun)}><FileText className="h-4 w-4" />Payslips</Button>
                  <Button variant="outline" size="sm" className="gap-1"><Send className="h-4 w-4" />Send All</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : !latestRun ? (
                <p className="text-muted-foreground text-center py-8">No payroll runs yet. Add employees and run your first payroll.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-5">
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">Gross Pay</p><p className="text-2xl font-bold">K{Number(latestRun.total_gross || 0).toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">PAYE</p><p className="text-xl font-semibold text-destructive">-K{Number(latestRun.total_paye || 0).toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">NAPSA (10%)</p><p className="text-xl font-semibold text-destructive">-K{Number(latestRun.total_napsa_employee || 0).toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-sm text-muted-foreground">NHIMA (1%)</p><p className="text-xl font-semibold text-destructive">-K{Number(latestRun.total_nhima || 0).toLocaleString()}</p></div>
                  <div className="space-y-1 p-4 rounded-lg bg-success/10 border border-success/20"><p className="text-sm text-success">Net Pay</p><p className="text-2xl font-bold text-success">K{Number(latestRun.total_net || 0).toLocaleString()}</p></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-sm">Employees</span></div>
                <span className="text-2xl font-bold">{employees?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /><span className="text-sm">Monthly Payroll</span></div>
                <span className="font-medium">K{totalPayroll.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span className="text-sm">Pay Date</span></div>
                <span className="font-medium">{latestRun?.pay_date ? new Date(latestRun.pay_date).toLocaleDateString() : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-warning/30 bg-warning/5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold">Statutory Submission Deadlines</h4>
                <div className="grid gap-4 md:grid-cols-3 mt-3">
                  <div className="flex items-center justify-between p-2 rounded bg-background/50"><span className="text-sm">PAYE (ZRA)</span><Badge variant="outline">Due: 10th</Badge></div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50"><span className="text-sm">NAPSA</span><Badge variant="outline">Due: 10th</Badge></div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50"><span className="text-sm">NHIMA</span><Badge variant="outline">Due: 10th</Badge></div>
                </div>
              </div>
              <Button variant="outline" size="sm">Generate Reports</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees ({employees?.length || 0})</TabsTrigger>
            <TabsTrigger value="payroll-history">Payroll History</TabsTrigger>
            <TabsTrigger value="taxbands">PAYE Tax Bands</TabsTrigger>
            <TabsTrigger value="reports">Statutory Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardContent className="p-0">
                {employeesLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !employees?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No employees yet. Add employees to run payroll.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Basic Salary</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">NAPSA #</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="font-medium text-primary">{emp.first_name[0]}{emp.last_name[0]}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                                  <p className="text-sm text-muted-foreground">{emp.job_title || "No title"} • {emp.employee_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{emp.department || "-"}</td>
                            <td className="p-4 text-right font-medium">K{Number(emp.basic_salary || 0).toLocaleString()}</td>
                            <td className="p-4 text-sm">{emp.napsa_number || "-"}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={emp.is_active ? "bg-success/10 text-success" : "bg-muted"}>
                                {emp.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditEmployee(emp)}>
                                    <Pencil className="h-4 w-4 mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />View Payslips
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll-history">
            <Card>
              <CardContent className="p-0">
                {runsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : !payrollRuns?.length ? (
                  <div className="text-center py-12 text-muted-foreground">No payroll runs yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Period</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Pay Date</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Gross</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Deductions</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Net</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollRuns.map((run) => (
                          <tr key={run.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-medium">{run.pay_period}</td>
                            <td className="p-4 text-sm">{new Date(run.pay_date).toLocaleDateString()}</td>
                            <td className="p-4 text-right">K{Number(run.total_gross || 0).toLocaleString()}</td>
                            <td className="p-4 text-right text-destructive">
                              -K{(Number(run.total_paye || 0) + Number(run.total_napsa_employee || 0) + Number(run.total_nhima || 0)).toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-semibold text-success">K{Number(run.total_net || 0).toLocaleString()}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="bg-success/10 text-success">{run.status}</Badge>
                            </td>
                            <td className="p-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewPayslips(run)}>
                                <Eye className="h-4 w-4 mr-1" />Payslips
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxbands">
            <Card>
              <CardHeader><CardTitle className="text-lg">Zambia PAYE Tax Bands (2024)</CardTitle></CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {payeBands.map((band, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{band.rate_name}</p>
                          <p className="text-sm text-muted-foreground">K{Number(band.min_amount || 0).toLocaleString()} - {band.max_amount ? `K${Number(band.max_amount).toLocaleString()}` : "Above"}</p>
                        </div>
                        <Badge variant="outline" className={Number(band.rate) === 0 ? "bg-success/10 text-success" : ""}>{(Number(band.rate) * 100).toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">* Tax bands are updated annually by ZRA. Admin can update these in Settings.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-6 w-6 text-primary" /></div>
                    <h3 className="font-semibold">PAYE Return</h3>
                    <p className="text-sm text-muted-foreground">Generate ZRA PAYE submission file</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><FileText className="h-6 w-6 text-success" /></div>
                    <h3 className="font-semibold">NAPSA Schedule</h3>
                    <p className="text-sm text-muted-foreground">Generate NAPSA contribution schedule</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center"><FileText className="h-6 w-6 text-info" /></div>
                    <h3 className="font-semibold">NHIMA Report</h3>
                    <p className="text-sm text-muted-foreground">Generate NHIMA contribution report</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payslip Viewer Dialog */}
        <PayslipViewer
          open={payslipDialog}
          onOpenChange={setPayslipDialog}
          payrollRunId={selectedPayrollRun?.id || null}
          payPeriod={selectedPayrollRun?.pay_period || ""}
          payDate={selectedPayrollRun?.pay_date || ""}
        />
      </div>
    </AppLayout>
  );
}
