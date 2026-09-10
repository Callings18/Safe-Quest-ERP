import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { usePayslips } from "@/hooks/usePayroll";
import { toast } from "sonner";
import { formatZMW } from "@/lib/currency";
import { downloadElementPdf } from "@/lib/pdf";
import { LetterheadPage } from "@/components/documents/LetterheadPage";

interface PayslipViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRunId: string | null;
  payPeriod: string;
  payDate: string;
}

export function PayslipViewer({ open, onOpenChange, payrollRunId, payPeriod, payDate }: PayslipViewerProps) {
  const { data: payslips, isLoading } = usePayslips(payrollRunId || undefined);
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
            @page { size: A4; margin: 0; }
            body { margin: 0; font-family: Inter, Arial, sans-serif; }
            .letterhead-page {
              width: 210mm;
              min-height: 297mm;
              background-image: url("${window.location.origin}/letterhead.png");
              background-size: 210mm 297mm;
              background-repeat: repeat-y;
            }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${payslipRef.current.outerHTML}</body>
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
              <LetterheadPage ref={payslipRef}>
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-2xl font-bold" style={{ color: "#0B1F4A" }}>PAYSLIP</h3>
                  <div className="text-right text-sm">
                    <p>{payPeriod}</p>
                    <p>Pay date: {new Date(payDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                  <div className="space-y-1">
                    <h4 className="font-semibold uppercase text-xs">Employee details</h4>
                    <p className="font-medium text-lg">{employee?.first_name} {employee?.last_name}</p>
                    <p>Employee #: {employee?.employee_number}</p>
                    <p>Job title: {employee?.job_title || "N/A"}</p>
                    <p>Department: {employee?.department || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold uppercase text-xs">Statutory numbers</h4>
                    <p>TPIN: {employee?.tax_pin || "N/A"}</p>
                    <p>NAPSA #: {employee?.napsa_number || "N/A"}</p>
                    <p>NHIMA #: {employee?.nhima_number || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                  <div>
                    <h4 className="font-semibold uppercase text-xs mb-3 pb-2 border-b">Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Basic salary</span>
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
                        <span>Gross pay</span>
                        <span>{formatZMW(currentPayslip?.gross_pay || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold uppercase text-xs mb-3 pb-2 border-b">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>PAYE (Income tax)</span>
                        <span>-{formatZMW(currentPayslip?.paye || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NAPSA (Employee 5%)</span>
                        <span>-{formatZMW(currentPayslip?.napsa_employee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NHIMA (1%)</span>
                        <span>-{formatZMW(currentPayslip?.nhima || 0)}</span>
                      </div>
                      {Number(currentPayslip?.other_deductions || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Other deductions</span>
                          <span>-{formatZMW(currentPayslip?.other_deductions || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Total deductions</span>
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

                <div className="border rounded-lg p-4 mb-6" style={{ borderColor: "#0B1F4A" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net pay</span>
                    <span className="text-2xl font-bold" style={{ color: "#0B1F4A" }}>{formatZMW(currentPayslip?.net_pay || 0)}</span>
                  </div>
                </div>

                {employee?.bank_name && (
                  <div className="mb-6 text-sm">
                    <h4 className="font-semibold uppercase text-xs mb-2">Payment details</h4>
                    <p>Bank: {employee.bank_name}</p>
                    <p>Account: {employee.bank_account || "N/A"}</p>
                  </div>
                )}

                <div className="text-sm border-t pt-4">
                  <p className="font-medium mb-2">Employer contributions (not deducted from salary):</p>
                  <span>NAPSA (Employer 5%): {formatZMW(currentPayslip?.napsa_employer || 0)}</span>
                </div>
                <p className="text-center text-xs text-gray-500 mt-6">This is a computer-generated payslip. No signature required.</p>
              </LetterheadPage>
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
