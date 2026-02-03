import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Finance metrics
export interface FinanceMetrics {
  revenue: number;
  expenses: number;
  grossMargin: number;
  treasury: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  paybackMonths: number;
  platformCosts: PlatformCost[];
}

export interface PlatformCost {
  platformKey: string;
  platformName: string;
  hosting: number;
  compute: number;
  total: number;
}

// Sales metrics
export interface SalesMetrics {
  monthlyRevenue: number;
  activeDeals: number;
  conversionRate: number;
  activeClients: number;
  pipeline: PipelineStage[];
  recentDeals: Deal[];
}

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  createdAt: string;
}

// Support metrics
export interface SupportMetrics {
  openTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  ticketsByPriority: TicketPriority[];
  ticketsByPlatform: TicketByPlatform[];
}

export interface TicketPriority {
  priority: "critical" | "high" | "medium" | "low";
  count: number;
}

export interface TicketByPlatform {
  platformKey: string;
  platformName: string;
  count: number;
}

// Product metrics
export interface ProductMetrics {
  features: {
    delivered: number;
    inProgress: number;
    blocked: number;
  };
  okrs: OKR[];
  upcomingReleases: Release[];
  featureRequests: FeatureRequest[];
}

export interface OKR {
  objective: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "at_risk";
}

export interface Release {
  id: string;
  platformKey: string;
  version: string;
  plannedDate: string;
  status: "planned" | "in_progress" | "released";
}

export interface FeatureRequest {
  id: string;
  title: string;
  votes: number;
  status: "pending" | "planned" | "rejected";
}

// Marketing metrics
export interface MarketingMetrics {
  monthlyVisitors: number;
  conversionRate: number;
  emailsSent: number;
  socialEngagement: number;
  campaigns: Campaign[];
  contentCalendar: ContentItem[];
}

export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  results: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  type: "blog" | "social" | "email" | "video";
  platform: string;
  scheduledDate: string;
  status: "draft" | "scheduled" | "published";
}

// Mock data generators (to be replaced with real API calls)
function getMockFinanceMetrics(): FinanceMetrics {
  return {
    revenue: 0,
    expenses: 0,
    grossMargin: 0,
    treasury: 0,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    paybackMonths: 0,
    platformCosts: [
      { platformKey: "emotionscare", platformName: "EmotionsCare", hosting: 0, compute: 0, total: 0 },
      { platformKey: "pixel-perfect-replica", platformName: "Pixel Perfect Replica", hosting: 0, compute: 0, total: 0 },
      { platformKey: "system-compass", platformName: "System Compass", hosting: 0, compute: 0, total: 0 },
      { platformKey: "growth-copilot", platformName: "Growth Copilot", hosting: 0, compute: 0, total: 0 },
      { platformKey: "med-mng", platformName: "Med MNG", hosting: 0, compute: 0, total: 0 },
    ],
  };
}

function getMockSalesMetrics(): SalesMetrics {
  return {
    monthlyRevenue: 0,
    activeDeals: 0,
    conversionRate: 0,
    activeClients: 0,
    pipeline: [
      { name: "Prospects", count: 0, value: 0 },
      { name: "Qualification", count: 0, value: 0 },
      { name: "Proposition", count: 0, value: 0 },
      { name: "Négociation", count: 0, value: 0 },
      { name: "Clôture", count: 0, value: 0 },
    ],
    recentDeals: [],
  };
}

function getMockSupportMetrics(): SupportMetrics {
  return {
    openTickets: 0,
    avgResponseTime: 0,
    resolutionRate: 0,
    customerSatisfaction: 0,
    ticketsByPriority: [
      { priority: "critical", count: 0 },
      { priority: "high", count: 0 },
      { priority: "medium", count: 0 },
      { priority: "low", count: 0 },
    ],
    ticketsByPlatform: [],
  };
}

function getMockProductMetrics(): ProductMetrics {
  return {
    features: {
      delivered: 0,
      inProgress: 0,
      blocked: 0,
    },
    okrs: [
      { objective: "Améliorer l'expérience utilisateur", progress: 0, status: "not_started" },
      { objective: "Augmenter la rétention", progress: 0, status: "not_started" },
      { objective: "Lancer de nouvelles fonctionnalités", progress: 0, status: "not_started" },
    ],
    upcomingReleases: [],
    featureRequests: [],
  };
}

function getMockMarketingMetrics(): MarketingMetrics {
  return {
    monthlyVisitors: 0,
    conversionRate: 0,
    emailsSent: 0,
    socialEngagement: 0,
    campaigns: [],
    contentCalendar: [],
  };
}

// Hooks for each metric type
export function useFinanceMetrics() {
  return useQuery({
    queryKey: ["metrics", "finance"],
    queryFn: async (): Promise<FinanceMetrics> => {
      // TODO: Replace with real API call
      // const { data, error } = await supabase.rpc("get_finance_metrics");
      return getMockFinanceMetrics();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSalesMetrics() {
  return useQuery({
    queryKey: ["metrics", "sales"],
    queryFn: async (): Promise<SalesMetrics> => {
      // TODO: Replace with real API call
      return getMockSalesMetrics();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSupportMetrics() {
  return useQuery({
    queryKey: ["metrics", "support"],
    queryFn: async (): Promise<SupportMetrics> => {
      // TODO: Replace with real API call
      return getMockSupportMetrics();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductMetrics() {
  return useQuery({
    queryKey: ["metrics", "product"],
    queryFn: async (): Promise<ProductMetrics> => {
      // TODO: Replace with real API call
      return getMockProductMetrics();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useMarketingMetrics() {
  return useQuery({
    queryKey: ["metrics", "marketing"],
    queryFn: async (): Promise<MarketingMetrics> => {
      // TODO: Replace with real API call
      return getMockMarketingMetrics();
    },
    staleTime: 1000 * 60 * 5,
  });
}
