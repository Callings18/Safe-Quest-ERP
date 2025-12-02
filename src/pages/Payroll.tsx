import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees, usePayrollRates, usePayrollRuns } from "@/hooks/usePayroll";
import { Loader2, Calculator, Download, Send, Users, Wallet, FileText, AlertTriangle, CheckCircle2, Calendar, Building2 } from "lucide-react";

export default function Payroll() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: payrollRates, isLoading: ratesLoading } = usePayrollRates();
  const { data: payrollRuns, isLoading: runsLoading } = usePayrollRuns();

  const payeBands = payrollRates?.filter(r => r.rate_type === "PAYE") || [];
  const latestRun = payrollRuns?.[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
            <p className="text-muted-foreground">Zambia statutory payroll with PAYE, NAPSA, and NHIMA compliance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
            <Button className="gap-2"><Calculator className="h-4 w-4" />Run Payroll</Button>
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
                  <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" />Payslips</Button>
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
                          <th className="text-right p-4 font-medium text-muted-foreground">Basic Salary</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">NAPSA #</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">NHIMA #</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div><p className="font-medium">{emp.first_name} {emp.last_name}</p><p className="text-sm text-muted-foreground">{emp.job_title || "No title"} • {emp.department || "No department"}</p></div>
                            </td>
                            <td className="p-4 text-right font-medium">K{Number(emp.basic_salary || 0).toLocaleString()}</td>
                            <td className="p-4 text-sm">{emp.napsa_number || "-"}</td>
                            <td className="p-4 text-sm">{emp.nhima_number || "-"}</td>
                            <td className="p-4"><Button variant="ghost" size="sm">View Payslip</Button></td>
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
      </div>
    </AppLayout>
  );
}
