import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
import RGPDRegistryPage from "@/pages/legal/RGPDRegistryPage";

// HQ Pages - Cockpit
import BriefingRoom from "@/pages/hq/BriefingRoom";
import CockpitPage from "@/pages/hq/CockpitPage";
import HQPlateformesPage from "@/pages/hq/HQPlateformesPage";
import EquipeExecutivePage from "@/pages/hq/EquipeExecutivePage";

// HQ Pages - Opérations
import ReunionsPage from "@/pages/hq/ReunionsPage";
import ApprobationsPage from "@/pages/hq/ApprobationsPage";
import HistoriquePage from "@/pages/hq/HistoriquePage";

// HQ Pages - Fonctions
import SecuritePage from "@/pages/hq/SecuritePage";
import MarketingPage from "@/pages/hq/MarketingPage";
import VentesPage from "@/pages/hq/VentesPage";
import FinancePage from "@/pages/hq/FinancePage";
import ProduitPage from "@/pages/hq/ProduitPage";
import EngineeringPage from "@/pages/hq/EngineeringPage";
import SupportPage from "@/pages/hq/SupportPage";

// HQ Pages - Gouvernance
import AuditPage from "@/pages/hq/AuditPage";
import EntreprisePage from "@/pages/hq/EntreprisePage";
import DiagnosticsPage from "@/pages/hq/DiagnosticsPage";
import RHPage from "@/pages/hq/RHPage";
import ConformitePage from "@/pages/hq/ConformitePage";
import DataAnalyticsPage from "@/pages/hq/DataAnalyticsPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
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
                <Route path="/legal/rgpd" element={<RGPDRegistryPage />} />
              </Route>

              {/* Auth */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected HQ Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<HQLayout />}>
                  {/* Cockpit */}
                  <Route path="/hq" element={<BriefingRoom />} />
                  <Route path="/hq/cockpit" element={<CockpitPage />} />
                  <Route path="/hq/plateformes" element={<HQPlateformesPage />} />
                  <Route path="/hq/equipe-executive" element={<EquipeExecutivePage />} />
                  
                  {/* Opérations */}
                  <Route path="/hq/reunions" element={<ReunionsPage />} />
                  <Route path="/hq/approbations" element={<ApprobationsPage />} />
                  <Route path="/hq/historique" element={<HistoriquePage />} />
                  
                  {/* Fonctions */}
                  <Route path="/hq/securite" element={<SecuritePage />} />
                  <Route path="/hq/marketing" element={<MarketingPage />} />
                  <Route path="/hq/ventes" element={<VentesPage />} />
                  <Route path="/hq/finance" element={<FinancePage />} />
                  <Route path="/hq/produit" element={<ProduitPage />} />
                  <Route path="/hq/engineering" element={<EngineeringPage />} />
                  <Route path="/hq/support" element={<SupportPage />} />
                  
                  {/* Gouvernance */}
                  <Route path="/hq/audit" element={<AuditPage />} />
                  <Route path="/hq/entreprise" element={<EntreprisePage />} />
                  <Route path="/hq/diagnostics" element={<DiagnosticsPage />} />
                  <Route path="/hq/rh" element={<RHPage />} />
                  <Route path="/hq/conformite" element={<ConformitePage />} />
                  <Route path="/hq/data" element={<DataAnalyticsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
