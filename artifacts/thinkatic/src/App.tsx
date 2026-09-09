/**
 * App.tsx — Root application component.
 *
 * Optimisations applied here:
 * - All page components are lazy-loaded (code splitting per route)
 * - Suspense boundary shows PageSkeleton while chunks load
 * - ErrorBoundary wraps the whole router
 * - CookieBanner rendered outside router (global)
 * - Analytics page-view tracking via usePageTracking()
 * - Admin routes are excluded from preloading
 */

import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { FloatingChat } from "@/components/FloatingChat";
import CookieBanner from "@/components/CookieBanner";
import { usePageTracking, initAnalytics } from "@/lib/analytics";
import { useEffect } from "react";

// ── Lazy-loaded page components ───────────────────────────────────────────────
// Each import() call creates a separate JS chunk (code splitting).
// Heavy 3-D / Three.js pages get their own chunks automatically via manualChunks.

const Home               = lazy(() => import("@/pages/Home"));
const ServicesPage       = lazy(() => import("@/pages/ServicesPage"));
const ServiceDetailPage  = lazy(() => import("@/pages/ServiceDetailPage"));
const CaseStudiesPage    = lazy(() => import("@/pages/CaseStudiesPage"));
const ProcessPage        = lazy(() => import("@/pages/ProcessPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const ContactPage        = lazy(() => import("@/pages/ContactPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const PrivacyPolicyPage  = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsPage          = lazy(() => import("@/pages/TermsPage"));
const CookiePolicyPage   = lazy(() => import("@/pages/CookiePolicyPage"));
const FAQPage            = lazy(() => import("@/pages/FAQPage"));
const BlogPage           = lazy(() => import("@/pages/BlogPage"));
const CareersPage        = lazy(() => import("@/pages/CareersPage"));
const TechnologyPage     = lazy(() => import("@/pages/TechnologyPage"));
const RequestProposalPage = lazy(() => import("@/pages/RequestProposalPage"));
const ApplyOnlinePage    = lazy(() => import("@/pages/ApplyOnlinePage"));
const NotFound           = lazy(() => import("@/pages/not-found"));

// Admin pages — only loaded when explicitly navigated to
const AdminLoginPage     = lazy(() => import("@/pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminControlCentrePage = lazy(() => import("@/pages/AdminControlCentrePage"));

// Client Portal & Dashboard pages
const UserAuthPage       = lazy(() => import("@/pages/UserAuthPage"));
const UserDashboardPage  = lazy(() => import("@/pages/UserDashboardPage"));
const PartnerDashboardPage = lazy(() => import("@/pages/PartnerDashboardPage"));

// ── React Query client ────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5-min stale time prevents redundant re-fetches on tab focus
      staleTime: 5 * 60 * 1000,
      // Retry once on error with exponential back-off
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
});

// ── Router with analytics tracking ───────────────────────────────────────────

function Router() {
  usePageTracking();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/services/:slug" component={ServiceDetailPage} />
        <Route path="/case-studies" component={CaseStudiesPage} />
        <Route path="/process" component={ProcessPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/cookie-policy" component={CookiePolicyPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/technology" component={TechnologyPage} />
        <Route path="/request-proposal" component={RequestProposalPage} />
        <Route path="/apply-online" component={ApplyOnlinePage} />
        <Route path="/admin-login" component={AdminLoginPage} />
        <Route path="/admin/control-centre" component={AdminControlCentrePage} />
        <Route path="/admin" component={AdminDashboardPage} />
        <Route path="/login" component={UserAuthPage} />
        <Route path="/signup" component={UserAuthPage} />
        <Route path="/auth" component={UserAuthPage} />
        <Route path="/dashboard" component={UserDashboardPage} />
        <Route path="/partner" component={PartnerDashboardPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────

function App() {
  // Initialise analytics on mount (consent-gated — only fires if user has
  // previously accepted cookies, or after they do so via CookieBanner)
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          {/* Global overlays — rendered outside the page tree */}
          <CookieBanner />
          <FloatingChat />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
