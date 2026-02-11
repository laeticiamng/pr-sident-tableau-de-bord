import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatusProvider } from "@/components/NetworkStatusProvider";
import { PageLoader } from "@/components/ui/skeleton-loader";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

// Layouts - loaded immediately (needed for structure)
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HQLayout } from "@/components/layout/HQLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Critical pages - loaded immediately
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";

// Public Pages - lazy loaded
const PlateformesPage = lazy(() => import("@/pages/PlateformesPage"));
const StatusPage = lazy(() => import("@/pages/StatusPage"));
const VisionPage = lazy(() => import("@/pages/VisionPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));

// Legal Pages - lazy loaded (rarely visited)
const MentionsLegalesPage = lazy(() => import("@/pages/legal/MentionsLegalesPage"));
const ConfidentialitePage = lazy(() => import("@/pages/legal/ConfidentialitePage"));
const CGVPage = lazy(() => import("@/pages/legal/CGVPage"));
const RGPDRegistryPage = lazy(() => import("@/pages/legal/RGPDRegistryPage"));

// HQ Pages - Cockpit (lazy loaded)
const BriefingRoom = lazy(() => import("@/pages/hq/BriefingRoom"));
const CockpitPage = lazy(() => import("@/pages/hq/CockpitPage"));
const HQPlateformesPage = lazy(() => import("@/pages/hq/HQPlateformesPage"));
const EquipeExecutivePage = lazy(() => import("@/pages/hq/EquipeExecutivePage"));
const GrowthPage = lazy(() => import("@/pages/hq/GrowthPage"));

// HQ Pages - Opérations (lazy loaded)
const ReunionsPage = lazy(() => import("@/pages/hq/ReunionsPage"));
const ApprobationsPage = lazy(() => import("@/pages/hq/ApprobationsPage"));
const HistoriquePage = lazy(() => import("@/pages/hq/HistoriquePage"));

// HQ Pages - Fonctions (lazy loaded)
const SecuritePage = lazy(() => import("@/pages/hq/SecuritePage"));
const MarketingPage = lazy(() => import("@/pages/hq/MarketingPage"));
const VentesPage = lazy(() => import("@/pages/hq/VentesPage"));
const FinancePage = lazy(() => import("@/pages/hq/FinancePage"));
const ProduitPage = lazy(() => import("@/pages/hq/ProduitPage"));
const EngineeringPage = lazy(() => import("@/pages/hq/EngineeringPage"));
const SupportPage = lazy(() => import("@/pages/hq/SupportPage"));
const VeillePage = lazy(() => import("@/pages/hq/VeillePage"));

// HQ Pages - Gouvernance (lazy loaded)
const AuditPage = lazy(() => import("@/pages/hq/AuditPage"));
const EntreprisePage = lazy(() => import("@/pages/hq/EntreprisePage"));
const DiagnosticsPage = lazy(() => import("@/pages/hq/DiagnosticsPage"));
const RHPage = lazy(() => import("@/pages/hq/RHPage"));
const ConformitePage = lazy(() => import("@/pages/hq/ConformitePage"));
const DataAnalyticsPage = lazy(() => import("@/pages/hq/DataAnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/hq/SettingsPage"));

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
          <NetworkStatusProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AnalyticsProvider />
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/plateformes" element={<PlateformesPage />} />
                  <Route path="/status" element={<StatusPage />} />
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
                    <Route path="/hq/growth" element={<GrowthPage />} />
                    
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
                    <Route path="/hq/veille" element={<VeillePage />} />

                    {/* Gouvernance */}
                    <Route path="/hq/audit" element={<AuditPage />} />
                    <Route path="/hq/entreprise" element={<EntreprisePage />} />
                    <Route path="/hq/diagnostics" element={<DiagnosticsPage />} />
                    <Route path="/hq/rh" element={<RHPage />} />
                    <Route path="/hq/conformite" element={<ConformitePage />} />
                    <Route path="/hq/data" element={<DataAnalyticsPage />} />
                    <Route path="/hq/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Dashboard aliases → redirect to HQ */}
                <Route path="/dashboard" element={<Navigate to="/hq" replace />} />
                <Route path="/dashboard/briefing" element={<Navigate to="/hq" replace />} />
                <Route path="/dashboard/audit" element={<Navigate to="/hq/audit" replace />} />
                <Route path="/dashboard/veille" element={<Navigate to="/hq/veille" replace />} />
                <Route path="/dashboard/actions" element={<Navigate to="/hq/approbations" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </NetworkStatusProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
