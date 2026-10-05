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
import Assets from "./pages/Assets";
import Procurement from "./pages/Procurement";
import HR from "./pages/HR";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Accounting from "./pages/Accounting";
import NotFound from "./pages/NotFound";
import DocumentPreviewPage from "./pages/DocumentPreviewPage";

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
            <Route path="/document-preview" element={<DocumentPreviewPage />} />
            <Route path="/" element={<ProtectedRoute module="dashboard"><Index /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute module="crm"><CRM /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute module="projects"><Projects /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute module="payroll"><Payroll /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute module="loans"><Loans /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute module="invoicing"><Invoicing /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute module="compliance"><Compliance /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
            <Route path="/procurement" element={<ProtectedRoute module="procurement"><Procurement /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute module="assets"><Assets /></ProtectedRoute>} />
            <Route path="/hr" element={<ProtectedRoute module="hr"><HR /></ProtectedRoute>} />
            <Route path="/accounting" element={<ProtectedRoute module="accounting"><Accounting /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute module="notifications"><Notifications /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
