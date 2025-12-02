import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CRM from "./pages/CRM";
import Projects from "./pages/Projects";
import Payroll from "./pages/Payroll";
import Loans from "./pages/Loans";
import Inventory from "./pages/Inventory";
import Invoicing from "./pages/Invoicing";
import Compliance from "./pages/Compliance";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/invoicing" element={<Invoicing />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/procurement" element={<ComingSoon title="Procurement" description="Supplier management, RFQ workflows, and purchase order approvals." />} />
          <Route path="/assets" element={<ComingSoon title="Assets & Fleet" description="Asset register, depreciation tracking, and fleet management." />} />
          <Route path="/hr" element={<ComingSoon title="HR & Employees" description="Employee profiles, performance reviews, and training management." />} />
          <Route path="/reports" element={<ComingSoon title="Reports & Analytics" description="Executive dashboards, financial reports, and custom report builder." />} />
          <Route path="/notifications" element={<ComingSoon title="Notifications" description="Communication center for all system alerts and messages." />} />
          <Route path="/settings" element={<ComingSoon title="Settings" description="System configuration, user management, and integrations." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
