import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { usePayslips } from "@/hooks/usePayroll";
import { toast } from "sonner";
import { formatZMW } from "@/lib/currency";
import { downloadElementPdf } from "@/lib/pdf";
import { SAFEQUEST_BRAND } from "@/lib/branding";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface PayslipViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRunId: string | null;
  payPeriod: string;
  payDate: string;
}

export function PayslipViewer({ open, onOpenChange, payrollRunId, payPeriod, payDate }: PayslipViewerProps) {
  const { data: payslips, isLoading } = usePayslips(payrollRunId || undefined);
  const { data: company } = useCompanySettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const payslipRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const currentPayslip = payslips?.[currentIndex];
  const employee = currentPayslip?.employees;

  const handleDownloadPDF = async () => {
    if (!payslipRef.current || !currentPayslip) return;
    
    setDownloading(true);
    try {
      await downloadElementPdf(
        payslipRef.current,
        `Payslip-${employee?.first_name}-${employee?.last_name}-${payPeriod.replace(/\s/g, "-")}.pdf`,
      );
      toast.success("Payslip downloaded");
    } catch (error) {
      toast.error("Failed to download payslip");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!payslipRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${employee?.first_name} ${employee?.last_name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
            .payslip { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="payslip">${payslipRef.current.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadAll = async () => {
    if (!payslips?.length) return;
    
    setDownloading(true);
    try {
      for (let i = 0; i < payslips.length; i++) {
        setCurrentIndex(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
        
        if (payslipRef.current) {
          const emp = payslips[i].employees;
          await downloadElementPdf(
            payslipRef.current,
            `Payslip-${emp?.first_name}-${emp?.last_name}-${payPeriod.replace(/\s/g, "-")}.pdf`,
          );
        }
      }
      toast.success(`Downloaded ${payslips.length} payslips`);
    } catch (error) {
      toast.error("Failed to download all payslips");
    } finally {
      setDownloading(false);
      setCurrentIndex(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payslips - {payPeriod}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!currentPayslip}>
                <Printer className="h-4 w-4 mr-1" />Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={!currentPayslip || downloading}>
                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                PDF
              </Button>
              <Button variant="default" size="sm" onClick={handleDownloadAll} disabled={!payslips?.length || downloading}>
                Download All
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !payslips?.length ? (
          <div className="text-center py-12 text-muted-foreground">No payslips found for this period.</div>
        ) : (
          <>
            {/* Navigation */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />Previous
              </Button>
              <span className="text-sm font-medium">
                {currentIndex + 1} of {payslips.length} employees
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(Math.min(payslips.length - 1, currentIndex + 1))}
                disabled={currentIndex === payslips.length - 1}
              >
                Next<ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Payslip Content */}
            <ScrollArea className="h-[60vh]">
              <div ref={payslipRef} className="bg-white p-6 rounded-lg text-black" style={{ minHeight: "500px" }}>
                <div className="h-1.5 w-full mb-4" style={{ background: `linear-gradient(90deg, ${SAFEQUEST_BRAND.navy} 70%, ${SAFEQUEST_BRAND.gold} 70%)` }} />
                <div className="border-b-2 pb-4 mb-6" style={{ borderColor: SAFEQUEST_BRAND.navy }}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <img src={company?.logo_url || SAFEQUEST_BRAND.logo} alt="SafeQuest" className="h-14 w-14 rounded-full object-cover bg-[#0B1F4A]" />
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: SAFEQUEST_BRAND.navy }}>{company?.company_name || SAFEQUEST_BRAND.name}</h2>
                        <p className="text-sm" style={{ color: SAFEQUEST_BRAND.gold }}>{SAFEQUEST_BRAND.tagline}</p>
                        {company?.city && <p className="text-xs text-gray-600">{company.city}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-semibold" style={{ color: SAFEQUEST_BRAND.navy }}>PAYSLIP</h3>
                      <p className="text-sm text-gray-600">{payPeriod}</p>
                      <p className="text-sm text-gray-600">Pay Date: {new Date(payDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Employee Details</h4>
                    <div className="space-y-1">
                      <p className="font-medium text-lg">{employee?.first_name} {employee?.last_name}</p>
                      <p className="text-sm">Employee #: {employee?.employee_number}</p>
                      <p className="text-sm">Job Title: {employee?.job_title || "N/A"}</p>
                      <p className="text-sm">Department: {employee?.department || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Statutory Numbers</h4>
                    <div className="space-y-1 text-sm">
                      <p>TPIN: {employee?.tax_pin || "N/A"}</p>
                      <p>NAPSA #: {employee?.napsa_number || "N/A"}</p>
                      <p>NHIMA #: {employee?.nhima_number || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Earnings */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3 pb-2 border-b">Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Basic Salary</span>
                        <span className="font-medium">{formatZMW(currentPayslip?.basic_salary || 0)}</span>
                      </div>
                      {Number(currentPayslip?.allowances || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Allowances</span>
                          <span className="font-medium">{formatZMW(currentPayslip?.allowances || 0)}</span>
                        </div>
                      )}
                      {Number(currentPayslip?.overtime || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Overtime</span>
                          <span className="font-medium">{formatZMW(currentPayslip?.overtime || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Gross Pay</span>
                        <span>{formatZMW(currentPayslip?.gross_pay || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3 pb-2 border-b">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-destructive">
                        <span>PAYE (Income Tax)</span>
                        <span>-{formatZMW(currentPayslip?.paye || 0)}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>NAPSA (Employee 5%)</span>
                        <span>-{formatZMW(currentPayslip?.napsa_employee || 0)}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>NHIMA (1%)</span>
                        <span>-{formatZMW(currentPayslip?.nhima || 0)}</span>
                      </div>
                      {Number(currentPayslip?.other_deductions || 0) > 0 && (
                        <div className="flex justify-between text-destructive">
                          <span>Other Deductions</span>
                          <span>-{formatZMW(currentPayslip?.other_deductions || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-semibold text-destructive">
                        <span>Total Deductions</span>
                        <span>{formatZMW(-(
                          Number(currentPayslip?.paye || 0) +
                          Number(currentPayslip?.napsa_employee || 0) +
                          Number(currentPayslip?.nhima || 0) +
                          Number(currentPayslip?.other_deductions || 0)
                        ))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Pay</span>
                    <span className="text-2xl font-bold text-success">{formatZMW(currentPayslip?.net_pay || 0)}</span>
                  </div>
                </div>

                {/* Bank Details */}
                {employee?.bank_name && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Payment Details</h4>
                    <p className="text-sm">Bank: {employee.bank_name}</p>
                    <p className="text-sm">Account: {employee.bank_account || "N/A"}</p>
                  </div>
                )}

                {/* Employer Contributions */}
                <div className="text-sm text-muted-foreground border-t pt-4">
                  <p className="font-medium mb-2">Employer Contributions (Not deducted from salary):</p>
                  <div className="flex gap-6">
                    <span>NAPSA (Employer 5%): {formatZMW(currentPayslip?.napsa_employer || 0)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t">
                  <p>This is a computer-generated payslip. No signature required.</p>
                  <p className="mt-1">Generated by {company?.company_name || SAFEQUEST_BRAND.name} Payroll</p>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EmployeePayslipsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
}

export function EmployeePayslipsDialog({ open, onOpenChange, employeeId, employeeName }: EmployeePayslipsProps) {
  const [selectedRun, setSelectedRun] = useState<any>(null);
  
  // This would need a separate query to fetch payslips for specific employee
  // For now, showing a placeholder
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payslips - {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          <p>View individual employee payslips from the Payroll History tab.</p>
          <p className="text-sm mt-2">Click on a payroll run to see all payslips for that period.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
