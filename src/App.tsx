// SAFEQUEST ERP System
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CRM from "./pages/CRM";
import Projects from "./pages/Projects";
import Payroll from "./pages/Payroll";
import Loans from "./pages/Loans";
import Inventory from "./pages/Inventory";
import Invoicing from "./pages/Invoicing";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/procurement" element={<ProtectedRoute><ComingSoon title="Procurement" description="Supplier management, RFQ workflows, and purchase order approvals." /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><ComingSoon title="Assets & Fleet" description="Asset register, depreciation tracking, and fleet management." /></ProtectedRoute>} />
            <Route path="/hr" element={<ProtectedRoute><ComingSoon title="HR & Employees" description="Employee profiles, performance reviews, and training management." /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ComingSoon title="Reports & Analytics" description="Executive dashboards, financial reports, and custom report builder." /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><ComingSoon title="Notifications" description="Communication center for all system alerts and messages." /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
