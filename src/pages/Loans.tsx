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
import { useLoans, useLoanProducts, useLoanStats, useCreateLoan } from "@/hooks/useLoans";
import { Loader2, Plus, Landmark, TrendingUp, AlertTriangle, CheckCircle2, Clock, User, Calendar, DollarSign } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  approved: { color: "bg-info/10 text-info border-info/20", icon: CheckCircle2 },
  active: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  completed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  defaulted: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

export default function Loans() {
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { data: products, isLoading: productsLoading } = useLoanProducts();
  const { data: stats, isLoading: statsLoading } = useLoanStats();
  const createLoan = useCreateLoan();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    loan_product_id: "",
    borrower_name: "",
    borrower_phone: "",
    borrower_email: "",
    borrower_national_id: "",
    principal: "",
    term_months: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLoan.mutateAsync({
      ...formData,
      principal: Number(formData.principal),
      term_months: Number(formData.term_months),
    });
    setDialogOpen(false);
    setFormData({ loan_product_id: "", borrower_name: "", borrower_phone: "", borrower_email: "", borrower_national_id: "", principal: "", term_months: "" });
  };

  const activeLoans = loans?.filter(l => l.status === "active") || [];
  const pendingLoans = loans?.filter(l => l.status === "pending") || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans & Lending</h1>
            <p className="text-muted-foreground">Manage loan applications, disbursements, and collections</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />New Application</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Loan Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Loan Product</Label>
                  <Select value={formData.loan_product_id} onValueChange={(v) => setFormData({ ...formData, loan_product_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.interest_rate}%)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Borrower Name</Label>
                  <Input value={formData.borrower_name} onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.borrower_phone} onChange={(e) => setFormData({ ...formData, borrower_phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>National ID</Label>
                    <Input value={formData.borrower_national_id} onChange={(e) => setFormData({ ...formData, borrower_national_id: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.borrower_email} onChange={(e) => setFormData({ ...formData, borrower_email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Principal (K)</Label>
                    <Input type="number" value={formData.principal} onChange={(e) => setFormData({ ...formData, principal: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Term (months)</Label>
                    <Input type="number" value={formData.term_months} onChange={(e) => setFormData({ ...formData, term_months: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createLoan.isPending}>
                  {createLoan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold">K{statsLoading ? "..." : ((stats?.totalDisbursed || 0) / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-primary">K{statsLoading ? "..." : ((stats?.outstanding || 0) / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-success">K{statsLoading ? "..." : ((stats?.collected || 0) / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{stats?.activeLoans || 0}</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Arrears</p>
              <p className="text-2xl font-bold text-destructive">K{statsLoading ? "..." : ((stats?.arrears || 0) / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({pendingLoans.length})</TabsTrigger>
            <TabsTrigger value="products">Loan Products</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                {loansLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : activeLoans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No active loans yet. Create your first loan application.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-medium text-muted-foreground">Borrower</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Principal</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Outstanding</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Monthly</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLoans.map((loan) => {
                          const config = statusConfig[loan.status || "pending"];
                          const StatusIcon = config.icon;
                          return (
                            <tr key={loan.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{loan.borrower_name}</p>
                                    <p className="text-sm text-muted-foreground">{loan.borrower_phone || "-"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-sm font-medium">{loan.loan_products?.name || "-"}</p>
                                <p className="text-xs text-muted-foreground">{loan.term_months} months @ {loan.interest_rate}%</p>
                              </td>
                              <td className="p-4 text-right font-medium">K{Number(loan.principal).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <span className="font-semibold text-primary">K{Number(loan.outstanding_amount || 0).toLocaleString()}</span>
                              </td>
                              <td className="p-4 text-right">K{Number(loan.monthly_payment).toLocaleString()}</td>
                              <td className="p-4">
                                <Badge variant="outline" className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />{loan.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Button variant="ghost" size="sm">Record Payment</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            {loansLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : pendingLoans.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No pending applications.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingLoans.map((loan) => (
                  <Card key={loan.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{loan.borrower_name}</h3>
                            <p className="text-sm text-muted-foreground">Applied {new Date(loan.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          <Clock className="h-3 w-3 mr-1" />pending
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount Requested</span>
                          <span className="font-semibold">K{Number(loan.principal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Product</span>
                          <span className="text-sm">{loan.loan_products?.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">Review</Button>
                        <Button size="sm" className="flex-1">Approve</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            {productsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {products?.map((product) => (
                  <Card key={product.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Landmark className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-2xl font-bold text-primary">{product.interest_rate}%</p>
                        <p className="text-sm text-muted-foreground">
                          K{Number(product.min_amount).toLocaleString()} - K{Number(product.max_amount).toLocaleString()} • {product.min_term}-{product.max_term} months
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
