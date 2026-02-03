import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HQLayout } from "@/components/layout/HQLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import HomePage from "@/pages/HomePage";
import PlateformesPage from "@/pages/PlateformesPage";
import VisionPage from "@/pages/VisionPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/AuthPage";

// Legal Pages
import MentionsLegalesPage from "@/pages/legal/MentionsLegalesPage";
import ConfidentialitePage from "@/pages/legal/ConfidentialitePage";
import CGVPage from "@/pages/legal/CGVPage";

// HQ Pages
import BriefingRoom from "@/pages/hq/BriefingRoom";
import HQPlateformesPage from "@/pages/hq/HQPlateformesPage";
import EntreprisePage from "@/pages/hq/EntreprisePage";
import ApprobationsPage from "@/pages/hq/ApprobationsPage";
import SecuritePage from "@/pages/hq/SecuritePage";
import EquipeExecutivePage from "@/pages/hq/EquipeExecutivePage";
import AuditPage from "@/pages/hq/AuditPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/plateformes" element={<PlateformesPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal/mentions" element={<MentionsLegalesPage />} />
            <Route path="/legal/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/legal/cgv" element={<CGVPage />} />
          </Route>

          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected HQ Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<HQLayout />}>
              <Route path="/hq" element={<BriefingRoom />} />
              <Route path="/hq/plateformes" element={<HQPlateformesPage />} />
              <Route path="/hq/equipe-executive" element={<EquipeExecutivePage />} />
              <Route path="/hq/approbations" element={<ApprobationsPage />} />
              <Route path="/hq/securite" element={<SecuritePage />} />
              <Route path="/hq/audit" element={<AuditPage />} />
              <Route path="/hq/entreprise" element={<EntreprisePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
