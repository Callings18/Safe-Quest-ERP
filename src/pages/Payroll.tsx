import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Download,
  Send,
  Users,
  Wallet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
} from "lucide-react";

const payrollSummary = {
  month: "November 2024",
  status: "processed",
  employees: 42,
  grossPay: 485200,
  paye: 72450,
  napsa: 24260,
  nhima: 4852,
  otherDeductions: 0,
  netPay: 383638,
};

const employees = [
  {
    id: 1,
    name: "John Mwamba",
    position: "Managing Director",
    department: "Executive",
    grossPay: 45000,
    paye: 12150,
    napsa: 2250,
    nhima: 450,
    netPay: 30150,
  },
  {
    id: 2,
    name: "Sarah Tembo",
    position: "Finance Manager",
    department: "Finance",
    grossPay: 32000,
    paye: 7200,
    napsa: 1600,
    nhima: 320,
    netPay: 22880,
  },
  {
    id: 3,
    name: "James Phiri",
    position: "Sales Manager",
    department: "Sales",
    grossPay: 28000,
    paye: 5600,
    napsa: 1400,
    nhima: 280,
    netPay: 20720,
  },
  {
    id: 4,
    name: "Mary Banda",
    position: "Project Engineer",
    department: "Projects",
    grossPay: 25000,
    paye: 4500,
    napsa: 1250,
    nhima: 250,
    netPay: 19000,
  },
  {
    id: 5,
    name: "Peter Zimba",
    position: "Solar Technician",
    department: "Operations",
    grossPay: 12000,
    paye: 960,
    napsa: 600,
    nhima: 120,
    netPay: 10320,
  },
];

// PAYE Tax Bands for Zambia (2024)
const payeBands = [
  { from: 0, to: 5100, rate: 0 },
  { from: 5100.01, to: 7100, rate: 20 },
  { from: 7100.01, to: 9200, rate: 30 },
  { from: 9200.01, to: null, rate: 37 },
];

export default function Payroll() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
            <p className="text-muted-foreground">
              Zambia statutory payroll with PAYE, NAPSA, and NHIMA compliance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Calculator className="h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Payroll Period Summary */}
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-3 animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{payrollSummary.month} Payroll</CardTitle>
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Processed
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Payslips
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Send className="h-4 w-4" />
                    Send All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-5">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gross Pay</p>
                  <p className="text-2xl font-bold">K{payrollSummary.grossPay.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PAYE</p>
                  <p className="text-xl font-semibold text-destructive">-K{payrollSummary.paye.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NAPSA (10%)</p>
                  <p className="text-xl font-semibold text-destructive">-K{payrollSummary.napsa.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NHIMA (1%)</p>
                  <p className="text-xl font-semibold text-destructive">-K{payrollSummary.nhima.toLocaleString()}</p>
                </div>
                <div className="space-y-1 p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-success">Net Pay</p>
                  <p className="text-2xl font-bold text-success">K{payrollSummary.netPay.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Employees</span>
                </div>
                <span className="text-2xl font-bold">{payrollSummary.employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Pay Date</span>
                </div>
                <span className="font-medium">25th Nov</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Branches</span>
                </div>
                <span className="font-medium">3</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statutory Reminders */}
        <Card className="border-warning/30 bg-warning/5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold">Statutory Submission Deadlines</h4>
                <div className="grid gap-4 md:grid-cols-3 mt-3">
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <span className="text-sm">PAYE (ZRA)</span>
                    <Badge variant="outline">Due: 10th Dec</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <span className="text-sm">NAPSA</span>
                    <Badge variant="outline">Due: 10th Dec</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <span className="text-sm">NHIMA</span>
                    <Badge variant="outline">Due: 10th Dec</Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">Generate Reports</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
            <TabsTrigger value="taxbands">PAYE Tax Bands</TabsTrigger>
            <TabsTrigger value="reports">Statutory Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Gross Pay</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">PAYE</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">NAPSA</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">NHIMA</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Net Pay</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-sm text-muted-foreground">{emp.position} • {emp.department}</p>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">K{emp.grossPay.toLocaleString()}</td>
                          <td className="p-4 text-right text-destructive">-K{emp.paye.toLocaleString()}</td>
                          <td className="p-4 text-right text-destructive">-K{emp.napsa.toLocaleString()}</td>
                          <td className="p-4 text-right text-destructive">-K{emp.nhima.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-success">K{emp.netPay.toLocaleString()}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">View Payslip</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxbands">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zambia PAYE Tax Bands (2024)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payeBands.map((band, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">
                          K{band.from.toLocaleString()} - {band.to ? `K${band.to.toLocaleString()}` : "Above"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={band.rate === 0 ? "bg-success/10 text-success" : ""}
                      >
                        {band.rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  * Tax bands are updated annually by ZRA. Admin can update these in Settings → Payroll Configuration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">PAYE Return</h3>
                    <p className="text-sm text-muted-foreground">Generate ZRA PAYE submission file</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="font-semibold">NAPSA Schedule</h3>
                    <p className="text-sm text-muted-foreground">Generate NAPSA contribution schedule</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-info" />
                    </div>
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
