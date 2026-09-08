import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoans, useLoanProducts, useLoanStats, useCreateLoan, useApproveLoan } from "@/hooks/useLoans";
import { Loader2, Plus, Landmark, TrendingUp, AlertTriangle, CheckCircle2, Clock, User, Calendar, DollarSign, Shield, Eye, MoreHorizontal, Wallet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatZMW } from "@/lib/currency";

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  approved: { color: "bg-info/10 text-info border-info/20", icon: CheckCircle2 },
  active: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  completed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  defaulted: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

const collateralTypes = [
  "None",
  "Vehicle",
  "Property/Land",
  "Equipment",
  "Salary Deduction",
  "Guarantor Only",
  "Household Items",
  "Business Assets",
  "Other",
];

export default function Loans() {
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { data: products, isLoading: productsLoading } = useLoanProducts();
  const { data: stats, isLoading: statsLoading } = useLoanStats();
  const createLoan = useCreateLoan();
  const approveLoan = useApproveLoan();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewLoan, setViewLoan] = useState<any>(null);
  const [formData, setFormData] = useState({
    loan_product_id: "",
    borrower_name: "",
    borrower_phone: "",
    borrower_email: "",
    borrower_national_id: "",
    borrower_address: "",
    employer_name: "",
    employer_phone: "",
    monthly_income: "",
    guarantor_name: "",
    guarantor_phone: "",
    guarantor_relation: "",
    collateral_type: "",
    collateral_description: "",
    collateral_value: "",
    principal: "",
    term_months: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLoan.mutateAsync({
      ...formData,
      principal: Number(formData.principal),
      term_months: Number(formData.term_months),
      monthly_income: formData.monthly_income ? Number(formData.monthly_income) : undefined,
      collateral_value: formData.collateral_value ? Number(formData.collateral_value) : undefined,
    });
    setDialogOpen(false);
    setFormData({
      loan_product_id: "", borrower_name: "", borrower_phone: "", borrower_email: "",
      borrower_national_id: "", borrower_address: "", employer_name: "", employer_phone: "",
      monthly_income: "", guarantor_name: "", guarantor_phone: "", guarantor_relation: "",
      collateral_type: "", collateral_description: "", collateral_value: "", principal: "", term_months: "",
    });
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Loan Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Loan Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Loan Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loan Product *</Label>
                      <Select value={formData.loan_product_id} onValueChange={(v) => setFormData({ ...formData, loan_product_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.interest_rate}%)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Principal (ZMW) *</Label>
                        <Input type="number" value={formData.principal} onChange={(e) => setFormData({ ...formData, principal: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Term (months) *</Label>
                        <Input type="number" value={formData.term_months} onChange={(e) => setFormData({ ...formData, term_months: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Borrower Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Borrower Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input value={formData.borrower_name} onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>National ID (NRC)</Label>
                      <Input value={formData.borrower_national_id} onChange={(e) => setFormData({ ...formData, borrower_national_id: e.target.value })} placeholder="123456/78/1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={formData.borrower_phone} onChange={(e) => setFormData({ ...formData, borrower_phone: e.target.value })} placeholder="097XXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={formData.borrower_email} onChange={(e) => setFormData({ ...formData, borrower_email: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Address</Label>
                      <Input value={formData.borrower_address} onChange={(e) => setFormData({ ...formData, borrower_address: e.target.value })} placeholder="Physical address" />
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Employment Details</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Employer Name</Label>
                      <Input value={formData.employer_name} onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employer Phone</Label>
                      <Input value={formData.employer_phone} onChange={(e) => setFormData({ ...formData, employer_phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly income (ZMW)</Label>
                      <Input type="number" value={formData.monthly_income} onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Guarantor Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Guarantor Details</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Guarantor Name</Label>
                      <Input value={formData.guarantor_name} onChange={(e) => setFormData({ ...formData, guarantor_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={formData.guarantor_phone} onChange={(e) => setFormData({ ...formData, guarantor_phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input value={formData.guarantor_relation} onChange={(e) => setFormData({ ...formData, guarantor_relation: e.target.value })} placeholder="e.g. Brother, Friend" />
                    </div>
                  </div>
                </div>

                {/* Collateral Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Collateral / Security
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Collateral Type</Label>
                      <Select value={formData.collateral_type} onValueChange={(v) => setFormData({ ...formData, collateral_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {collateralTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated value (ZMW)</Label>
                      <Input type="number" value={formData.collateral_value} onChange={(e) => setFormData({ ...formData, collateral_value: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={formData.collateral_description} 
                        onChange={(e) => setFormData({ ...formData, collateral_description: e.target.value })} 
                        placeholder="Describe the collateral in detail (e.g., vehicle make/model/year, property location, etc.)"
                        rows={3}
                      />
                    </div>
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
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold">{statsLoading ? "..." : formatZMW(stats?.totalDisbursed || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-primary">{statsLoading ? "..." : formatZMW(stats?.outstanding || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold text-success">{statsLoading ? "..." : formatZMW(stats?.collected || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{stats?.activeLoans || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Arrears</p>
              <p className="text-2xl font-bold text-destructive">{statsLoading ? "..." : formatZMW(stats?.arrears || 0)}</p>
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
                          <th className="text-left p-4 font-medium text-muted-foreground">Collateral</th>
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
                              <td className="p-4 text-right font-medium">{formatZMW(loan.principal)}</td>
                              <td className="p-4 text-right">
                                <span className="font-semibold text-primary">{formatZMW(loan.outstanding_amount || 0)}</span>
                              </td>
                              <td className="p-4">
                                {loan.collateral_type ? (
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{loan.collateral_type}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />{loan.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewLoan(loan)}>
                                      <Eye className="h-4 w-4 mr-2" />View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Wallet className="h-4 w-4 mr-2" />Record Payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Calendar className="h-4 w-4 mr-2" />View Schedule
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                          <span className="font-semibold">{formatZMW(loan.principal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Product</span>
                          <span className="text-sm">{loan.loan_products?.name}</span>
                        </div>
                        {loan.collateral_type && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Collateral</span>
                            <span className="text-sm flex items-center gap-1">
                              <Shield className="h-3 w-3" />{loan.collateral_type}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewLoan(loan)}>Review</Button>
                        <Button size="sm" className="flex-1" onClick={() => approveLoan.mutate(loan.id)} disabled={approveLoan.isPending}>Approve</Button>
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
                          {formatZMW(product.min_amount)} - {formatZMW(product.max_amount)} • {product.min_term}-{product.max_term} months
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Loan Details Dialog */}
        <Dialog open={!!viewLoan} onOpenChange={() => setViewLoan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Loan Details - {viewLoan?.loan_number}</DialogTitle>
            </DialogHeader>
            {viewLoan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Borrower Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{viewLoan.borrower_name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">NRC:</span><span>{viewLoan.borrower_national_id || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{viewLoan.borrower_phone || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{viewLoan.borrower_email || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Address:</span><span>{viewLoan.borrower_address || "-"}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Loan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Principal:</span><span className="font-medium">{formatZMW(viewLoan.principal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate:</span><span>{viewLoan.interest_rate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Term:</span><span>{viewLoan.term_months} months</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Monthly Payment:</span><span className="font-medium">{formatZMW(viewLoan.monthly_payment)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Outstanding:</span><span className="font-medium text-primary">{formatZMW(viewLoan.outstanding_amount || 0)}</span></div>
                    </div>
                  </div>
                </div>
                
                {(viewLoan.guarantor_name || viewLoan.employer_name) && (
                  <div className="grid grid-cols-2 gap-6">
                    {viewLoan.employer_name && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Employment</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Employer:</span><span>{viewLoan.employer_name}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{viewLoan.employer_phone || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Income:</span><span>{formatZMW(viewLoan.monthly_income || 0)}</span></div>
                        </div>
                      </div>
                    )}
                    {viewLoan.guarantor_name && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Guarantor</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span>{viewLoan.guarantor_name}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{viewLoan.guarantor_phone || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Relation:</span><span>{viewLoan.guarantor_relation || "-"}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {viewLoan.collateral_type && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Collateral / Security
                    </h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium">{viewLoan.collateral_type}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Value:</span><span>{formatZMW(viewLoan.collateral_value || 0)}</span></div>
                      {viewLoan.collateral_description && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1">{viewLoan.collateral_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
