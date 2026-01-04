import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import KorteOpdrachten from "./pages/voor-professionals/korte-opdrachten";
import VasteContracten from "./pages/voor-professionals/vaste-contracten";
import FlexibeleInzet from "./pages/voor-bedrijven/flexibele-inzet";
import VastTalent from "./pages/voor-bedrijven/vast-talent";
import ProfessionalDashboard from "./pages/professionals/dashboard";
import ProfessionalWallet from "./pages/professionals/wallet";
import EmployerDashboard from "./pages/employers/dashboard";
import ChatList from "./pages/chat/index";
import ChatThread from "./pages/chat/[id]";

const queryClient = new QueryClient();

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/opdrachten" element={<Assignments />} />
          <Route path="/opdracht/:id" element={<AssignmentDetail />} />
          <Route path="/registreren" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Professional Landing Pages */}
          <Route path="/voor-professionals" element={<KorteOpdrachten />} />
          <Route path="/voor-professionals/korte-opdrachten" element={<KorteOpdrachten />} />
          <Route path="/voor-professionals/vaste-contracten" element={<VasteContracten />} />
          
          {/* Business Landing Pages */}
          <Route path="/voor-bedrijven" element={<FlexibeleInzet />} />
          <Route path="/voor-bedrijven/flexibele-inzet" element={<FlexibeleInzet />} />
          <Route path="/voor-bedrijven/vast-talent" element={<VastTalent />} />
          
          {/* Professional Pages */}
          <Route path="/professionals/dashboard" element={
            <ProtectedRoute>
              <ProfessionalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/professionals/wallet" element={
            <ProtectedRoute>
              <ProfessionalWallet />
            </ProtectedRoute>
          } />
          
          {/* Employer Pages */}
          <Route path="/employers/dashboard" element={
            <ProtectedRoute>
              <EmployerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Chat Pages */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } />
          <Route path="/chat/:id" element={
            <ProtectedRoute>
              <ChatThread />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;
