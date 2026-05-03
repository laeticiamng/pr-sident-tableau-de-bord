import { forwardRef, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { NetworkStatusProvider } from "@/components/NetworkStatusProvider";
import { PageLoader } from "@/components/ui/skeleton-loader";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProductionBootGuard } from "@/components/ProductionBootGuard";

// Layouts - loaded immediately (needed for structure)
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HQLayout } from "@/components/layout/HQLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModuleGuard } from "@/components/auth/ModuleGuard";

// Critical pages - loaded immediately
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/NotFound";

// Public Pages - lazy loaded
const PlateformesPage = lazy(() => import("@/pages/PlateformesPage"));
const StatusPage = lazy(() => import("@/pages/StatusPage"));
const VisionPage = lazy(() => import("@/pages/VisionPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const TrustPage = lazy(() => import("@/pages/TrustPage"));
const TarifsPage = lazy(() => import("@/pages/TarifsPage"));

// Legal Pages - lazy loaded (rarely visited)
const MentionsLegalesPage = lazy(() => import("@/pages/legal/MentionsLegalesPage"));
const ConfidentialitePage = lazy(() => import("@/pages/legal/ConfidentialitePage"));
const CGVPage = lazy(() => import("@/pages/legal/CGVPage"));
const RGPDRegistryPage = lazy(() => import("@/pages/legal/RGPDRegistryPage"));
const CookiesPage = lazy(() => import("@/pages/legal/CookiesPage"));

// HQ Pages - Cockpit (lazy loaded)
const BriefingRoom = lazy(() => import("@/pages/hq/BriefingRoom"));
const CockpitPage = lazy(() => import("@/pages/hq/CockpitPage"));
const COSPage = lazy(() => import("@/pages/hq/COSPage"));
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
const AgentsMonitoringPage = lazy(() => import("@/pages/hq/AgentsMonitoringPage"));
const MessagesPage = lazy(() => import("@/pages/hq/MessagesPage"));
const JournalPage = lazy(() => import("@/pages/hq/JournalPage"));
const UserManagementPage = lazy(() => import("@/pages/hq/UserManagementPage"));
const GovernancePage = lazy(() => import("@/pages/hq/GovernancePage"));
const ArchitecturePage = lazy(() => import("@/pages/hq/ArchitecturePage"));
const ArchitecturePlatformDetailPage = lazy(() => import("@/pages/hq/ArchitecturePlatformDetailPage"));
const BootErrorPage = lazy(() => import("@/pages/BootErrorPage"));

// HQ Pages - EmotionSphere Studio (lazy loaded)
const StudioCockpitPage = lazy(() => import("@/pages/hq/studio/StudioCockpitPage"));
const StudioOpportunitiesPage = lazy(() => import("@/pages/hq/studio/StudioOpportunitiesPage"));
const StudioCallsPage = lazy(() => import("@/pages/hq/studio/StudioCallsPage"));
const StudioBlueprintsPage = lazy(() => import("@/pages/hq/studio/StudioBlueprintsPage"));
const StudioDealsPage = lazy(() => import("@/pages/hq/studio/StudioDealsPage"));
const StudioAdvisoryPage = lazy(() => import("@/pages/hq/studio/StudioAdvisoryPage"));
const StudioTemplatesPage = lazy(() => import("@/pages/hq/studio/StudioTemplatesPage"));
const StudioLegalPage = lazy(() => import("@/pages/hq/studio/StudioLegalPage"));

// Public Studio Page (lazy loaded)
const PublicStudioPage = lazy(() => import("@/pages/StudioPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = forwardRef<HTMLDivElement>(function App(_props, ref) {
  return (
  <div ref={ref} className="contents">
  <ErrorBoundary>
    <ProductionBootGuard>
    <div className="contents">
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <LanguageProvider>
          <AuthProvider>
          <NetworkStatusProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
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
                  <Route path="/trust" element={<TrustPage />} />
                  <Route path="/tarifs" element={<TarifsPage />} />
                  <Route path="/legal/mentions" element={<MentionsLegalesPage />} />
                  <Route path="/legal/confidentialite" element={<ConfidentialitePage />} />
                  <Route path="/legal/cgv" element={<CGVPage />} />
                  <Route path="/legal/rgpd" element={<RGPDRegistryPage />} />
                  <Route path="/legal/cookies" element={<CookiesPage />} />
                  <Route path="/studio" element={<PublicStudioPage />} />
                </Route>

                {/* Auth */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/boot-error" element={<BootErrorPage />} />

                {/* Protected HQ Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<HQLayout />}>
                    {/* Cockpit */}
                    <Route path="/hq" element={<BriefingRoom />} />
                    <Route path="/hq/cockpit" element={<CockpitPage />} />
                    <Route path="/hq/cos" element={<COSPage />} />
                    <Route path="/hq/plateformes" element={<HQPlateformesPage />} />
                    <Route path="/hq/equipe-executive" element={<EquipeExecutivePage />} />
                    <Route path="/hq/growth" element={<GrowthPage />} />
                    
                    {/* Opérations */}
                    <Route path="/hq/reunions" element={<ReunionsPage />} />
                    <Route path="/hq/approbations" element={<ApprobationsPage />} />
                    <Route path="/hq/historique" element={<HistoriquePage />} />
                    
                    {/* Fonctions */}
                    <Route path="/hq/securite" element={<ModuleGuard module="security"><SecuritePage /></ModuleGuard>} />
                    <Route path="/hq/marketing" element={<ModuleGuard module="marketing"><MarketingPage /></ModuleGuard>} />
                    <Route path="/hq/ventes" element={<ModuleGuard module="sales"><VentesPage /></ModuleGuard>} />
                    <Route path="/hq/finance" element={<ModuleGuard module="finance"><FinancePage /></ModuleGuard>} />
                    <Route path="/hq/produit" element={<ModuleGuard module="product"><ProduitPage /></ModuleGuard>} />
                    <Route path="/hq/engineering" element={<ModuleGuard module="engineering"><EngineeringPage /></ModuleGuard>} />
                    <Route path="/hq/support" element={<ModuleGuard module="support"><SupportPage /></ModuleGuard>} />
                    <Route path="/hq/veille" element={<VeillePage />} />

                    {/* Gouvernance */}
                    <Route path="/hq/audit" element={<ModuleGuard module="audit"><AuditPage /></ModuleGuard>} />
                    <Route path="/hq/entreprise" element={<EntreprisePage />} />
                    <Route path="/hq/diagnostics" element={<ModuleGuard module="diagnostics"><DiagnosticsPage /></ModuleGuard>} />
                    <Route path="/hq/rh" element={<ModuleGuard module="hr"><RHPage /></ModuleGuard>} />
                    <Route path="/hq/conformite" element={<ModuleGuard module="compliance"><ConformitePage /></ModuleGuard>} />
                    <Route path="/hq/data" element={<DataAnalyticsPage />} />
                    <Route path="/hq/settings" element={<SettingsPage />} />
                    <Route path="/hq/agents-monitoring" element={<AgentsMonitoringPage />} />
                    <Route path="/hq/messages" element={<MessagesPage />} />
                    <Route path="/hq/journal" element={<JournalPage />} />
                    <Route path="/hq/utilisateurs" element={<UserManagementPage />} />
                    <Route path="/hq/governance" element={<GovernancePage />} />
                    <Route path="/hq/architecture" element={<ArchitecturePage />} />
                    <Route path="/hq/architecture/:platformKey" element={<ArchitecturePlatformDetailPage />} />

                    {/* EmotionSphere Studio */}
                    <Route path="/hq/studio" element={<StudioCockpitPage />} />
                    <Route path="/hq/studio/opportunites" element={<StudioOpportunitiesPage />} />
                    <Route path="/hq/studio/appels" element={<StudioCallsPage />} />
                    <Route path="/hq/studio/blueprints" element={<StudioBlueprintsPage />} />
                    <Route path="/hq/studio/deals" element={<StudioDealsPage />} />
                    <Route path="/hq/studio/advisory" element={<StudioAdvisoryPage />} />
                    <Route path="/hq/studio/templates" element={<StudioTemplatesPage />} />
                    <Route path="/hq/studio/legal" element={<StudioLegalPage />} />
                  </Route>
                </Route>

                {/* Dashboard aliases → redirect to HQ */}
                <Route path="/dashboard" element={<Navigate to="/hq" replace />} />
                <Route path="/dashboard/briefing" element={<Navigate to="/hq" replace />} />
                <Route path="/dashboard/audit" element={<Navigate to="/hq/audit" replace />} />
                <Route path="/dashboard/veille" element={<Navigate to="/hq/veille" replace />} />
                <Route path="/dashboard/actions" element={<Navigate to="/hq/approbations" replace />} />

                <Route element={<PublicLayout />}>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              </Suspense>
            </BrowserRouter>
          </NetworkStatusProvider>
          </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </div>
    </ProductionBootGuard>
  </ErrorBoundary>
  </div>
  );
});

export default App;
