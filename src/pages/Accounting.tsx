import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useAccounts,
  useAgedReceivables,
  useCreateAccount,
  useCreateExpense,
  useCreateJournalEntry,
  useExpenseByCategory,
  useExpenses,
  useFinanceStats,
  useJournalEntries,
  useUpdateExpenseStatus,
  useVatSummary,
} from "@/hooks/useAccounting";
import { Loader2, Plus, Wallet, TrendingUp, Receipt, BookOpen } from "lucide-react";
import type { AccountType } from "@/hooks/useAccounting";
import { formatZMW } from "@/lib/currency";

export default function Accounting() {
  const { data: stats } = useFinanceStats();
  const { data: expenses, isLoading: expLoading } = useExpenses();
  const { data: accounts } = useAccounts();
  const { data: journals, isLoading: jeLoading } = useJournalEntries();
  const { data: byCategory } = useExpenseByCategory();
  const { data: aged } = useAgedReceivables();
  const { data: vat } = useVatSummary();
  const createExpense = useCreateExpense();
  const updateStatus = useUpdateExpenseStatus();
  const createAccount = useCreateAccount();
  const createJournal = useCreateJournalEntry();

  const [expOpen, setExpOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const [jeOpen, setJeOpen] = useState(false);
  const [expForm, setExpForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category: "general",
    payee: "",
    description: "",
    amount: "",
    tax_amount: "",
    payment_method: "bank_transfer" as const,
  });
  const [accForm, setAccForm] = useState({ account_code: "", name: "", account_type: "expense" as AccountType });
  const [jeForm, setJeForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    description: "",
    debit_account: "",
    credit_account: "",
    amount: "",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookkeeping</h1>
          <p className="text-muted-foreground">Chart of accounts, expenses, journals, VAT, and receivables for SAFEQUEST (Z) LIMITED</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Revenue", value: formatZMW(stats?.revenue || 0), icon: TrendingUp },
            { title: "Collected", value: formatZMW(stats?.received || 0), icon: Wallet },
            { title: "Expenses", value: formatZMW(stats?.totalExpenses || 0), icon: Receipt },
            { title: "Net VAT due", value: formatZMW(vat?.netVat || 0), icon: BookOpen },
          ].map((k) => (
            <Card key={k.title}>
              <CardContent className="p-4 flex items-center gap-3">
                <k.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{k.title}</p>
                  <p className="text-lg font-bold">{k.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="expenses">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="receivables">Receivables</TabsTrigger>
            <TabsTrigger value="vat">VAT (ZRA)</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={expOpen} onOpenChange={setExpOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Record expense</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createExpense.mutateAsync({
                        expense_date: expForm.expense_date,
                        category: expForm.category,
                        payee: expForm.payee,
                        description: expForm.description,
                        amount: Number(expForm.amount) || 0,
                        tax_amount: Number(expForm.tax_amount) || 0,
                        payment_method: expForm.payment_method,
                      });
                      setExpOpen(false);
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Date</Label><Input type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} /></div>
                      <div><Label>Category</Label><Input value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} /></div>
                      <div className="col-span-2"><Label>Payee</Label><Input value={expForm.payee} onChange={(e) => setExpForm({ ...expForm, payee: e.target.value })} /></div>
                      <div className="col-span-2"><Label>Description</Label><Input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} /></div>
                      <div><Label>Amount (ZMW)</Label><Input type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required /></div>
                      <div><Label>VAT (ZMW)</Label><Input type="number" value={expForm.tax_amount} onChange={(e) => setExpForm({ ...expForm, tax_amount: e.target.value })} /></div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createExpense.isPending}>Save</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              {expLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(expenses || []).map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.expense_number}</TableCell>
                        <TableCell>{e.expense_date}</TableCell>
                        <TableCell>{e.payee || "—"}</TableCell>
                        <TableCell>{e.category}</TableCell>
                        <TableCell className="text-right">{formatZMW(e.total)}</TableCell>
                        <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                        <TableCell>
                          {e.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: e.id, status: "approved" })}>Approve</Button>
                          )}
                          {e.status === "approved" && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: e.id, status: "paid" })}>Mark paid</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!expenses?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No expenses yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </Card>
            {!!byCategory?.length && (
              <Card>
                <CardHeader><CardTitle>By category</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {byCategory.map((c) => (
                    <div key={c.category} className="flex justify-between text-sm">
                      <span>{c.category}</span>
                      <span className="font-medium">{formatZMW(c.amount)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="receivables" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Aged accounts receivable</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Bucket</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(aged || []).map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.invoice_number}</TableCell>
                        <TableCell>{r.customer}</TableCell>
                        <TableCell>{r.due_date || r.issue_date}</TableCell>
                        <TableCell><Badge variant="outline">{r.bucket}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatZMW(r.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {!aged?.length && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No outstanding invoices</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vat" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Output VAT (sales)</p><p className="text-2xl font-bold">{formatZMW(vat?.outputVat || 0)}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Input VAT (purchases)</p><p className="text-2xl font-bold">{formatZMW(vat?.inputVat || 0)}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Net payable to ZRA</p><p className="text-2xl font-bold">{formatZMW(vat?.netVat || 0)}</p></CardContent></Card>
            </div>
            <p className="text-sm text-muted-foreground">
              Output VAT comes from sent/paid tax invoices. Input VAT comes from expense tax amounts. Remit using the ZRA VAT bank in Settings → Tax.
              Marking a tax invoice as <span className="font-medium">Sent</span> posts Sales + VAT Payable to the ledger automatically.
            </p>
          </TabsContent>

          <TabsContent value="journals" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={jeOpen} onOpenChange={setJeOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Journal entry</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Post journal</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const amt = Number(jeForm.amount) || 0;
                      await createJournal.mutateAsync({
                        entry_date: jeForm.entry_date,
                        description: jeForm.description,
                        lines: [
                          { account_id: jeForm.debit_account, debit: amt, credit: 0 },
                          { account_id: jeForm.credit_account, debit: 0, credit: amt },
                        ],
                      });
                      setJeOpen(false);
                    }}
                  >
                    <Label>Date</Label>
                    <Input type="date" value={jeForm.entry_date} onChange={(e) => setJeForm({ ...jeForm, entry_date: e.target.value })} />
                    <Label>Description</Label>
                    <Input value={jeForm.description} onChange={(e) => setJeForm({ ...jeForm, description: e.target.value })} required />
                    <Label>Debit account</Label>
                    <Select value={jeForm.debit_account} onValueChange={(v) => setJeForm({ ...jeForm, debit_account: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {(accounts || []).map((a) => <SelectItem key={a.id} value={a.id}>{a.account_code} {a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Label>Credit account</Label>
                    <Select value={jeForm.credit_account} onValueChange={(v) => setJeForm({ ...jeForm, credit_account: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {(accounts || []).map((a) => <SelectItem key={a.id} value={a.id}>{a.account_code} {a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Label>Amount (ZMW)</Label>
                    <Input type="number" value={jeForm.amount} onChange={(e) => setJeForm({ ...jeForm, amount: e.target.value })} required />
                    <Button type="submit" className="w-full" disabled={createJournal.isPending}>Post</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              {jeLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(journals || []).map((j) => (
                      <TableRow key={j.id}>
                        <TableCell>{j.entry_number}</TableCell>
                        <TableCell>{j.entry_date}</TableCell>
                        <TableCell>{j.description}</TableCell>
                        <TableCell className="text-right">{formatZMW(j.total_debit)}</TableCell>
                        <TableCell className="text-right">{formatZMW(j.total_credit)}</TableCell>
                      </TableRow>
                    ))}
                    {!journals?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No journal entries</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={accOpen} onOpenChange={setAccOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Add account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Chart of accounts</DialogTitle></DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createAccount.mutateAsync(accForm);
                      setAccOpen(false);
                    }}
                  >
                    <Label>Code</Label>
                    <Input value={accForm.account_code} onChange={(e) => setAccForm({ ...accForm, account_code: e.target.value })} required />
                    <Label>Name</Label>
                    <Input value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} required />
                    <Label>Type</Label>
                    <Select value={accForm.account_type} onValueChange={(v: AccountType) => setAccForm({ ...accForm, account_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" className="w-full" disabled={createAccount.isPending}>Save</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(accounts || []).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.account_code}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell className="capitalize">{a.account_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
