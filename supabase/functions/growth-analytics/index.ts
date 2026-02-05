import { createClient } from "npm:@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 const GROWTH_OS_BASE_URL = "https://goiklfzouhshghsvpxjo.supabase.co/functions/v1";
 
 interface GrowthOSResponse {
   success: boolean;
   data?: any;
   error?: string;
 }
 
 // Helper to call Growth OS API
 async function callGrowthOS(endpoint: string, payload: any, token: string): Promise<GrowthOSResponse> {
   try {
     const response = await fetch(`${GROWTH_OS_BASE_URL}${endpoint}`, {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${token}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify(payload),
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`Growth OS API error [${response.status}]:`, errorText);
       return { success: false, error: `API error: ${response.status}` };
     }
 
     const data = await response.json();
     return { success: true, data };
   } catch (error) {
     console.error("Growth OS API call failed:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return { success: false, error: errorMessage };
   }
 }
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     // Validate auth
     const authHeader = req.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const supabase = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_ANON_KEY")!,
       { global: { headers: { Authorization: authHeader } } }
     );
 
     const token = authHeader.replace("Bearer ", "");
     const { data: claims, error: authError } = await supabase.auth.getClaims(token);
     if (authError || !claims?.claims) {
       return new Response(JSON.stringify({ error: "Invalid token" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Verify owner role
     const { data: isOwner } = await supabase.rpc("is_owner");
     if (!isOwner) {
       return new Response(JSON.stringify({ error: "Forbidden" }), {
         status: 403,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const body = await req.json();
     const { action, params = {} } = body;
 
     const growthOsToken = Deno.env.get("GROWTH_OS_API_TOKEN");
     if (!growthOsToken) {
       return new Response(JSON.stringify({ error: "GROWTH_OS_API_TOKEN not configured" }), {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     console.log(`Growth Analytics: Processing action "${action}"`);
 
     let result: any = null;
 
     switch (action) {
       // ===== ANALYTICS DATA =====
       case "sync-ga4":
         // Sync Google Analytics 4 data (funnel, rétention, sessions)
         result = await callGrowthOS("/sync-ga4", {
           date_range: params.dateRange || "last_30_days",
           metrics: params.metrics || ["sessions", "users", "pageviews", "bounceRate", "avgSessionDuration"],
           dimensions: params.dimensions || ["date", "source", "medium"],
         }, growthOsToken);
         break;
 
       case "sync-kpis":
         // Aggregate all KPIs from various sources
         result = await callGrowthOS("/kpi-sync", {
           sources: params.sources || ["ga4", "gsc", "meta", "stripe"],
           date_range: params.dateRange || "last_30_days",
         }, growthOsToken);
         break;
 
       case "sync-gsc":
         // Google Search Console data (SEO performance)
         result = await callGrowthOS("/sync-gsc", {
           date_range: params.dateRange || "last_30_days",
           dimensions: params.dimensions || ["query", "page", "country"],
         }, growthOsToken);
         break;
 
       case "sync-meta-ads":
         // Meta Ads performance data
         result = await callGrowthOS("/sync-meta-ads", {
           date_range: params.dateRange || "last_30_days",
           account_id: params.accountId,
         }, growthOsToken);
         break;
 
       case "sync-google-ads":
         // Google Ads performance data
         result = await callGrowthOS("/sync-ads", {
           date_range: params.dateRange || "last_30_days",
           customer_id: params.customerId,
         }, growthOsToken);
         break;
 
       // ===== MONITORING & ALERTS =====
       case "monitoring-metrics":
         // System health and performance metrics
         result = await callGrowthOS("/monitoring-metrics", {
           metric_types: params.metricTypes || ["cpu", "memory", "latency", "errors"],
           time_range: params.timeRange || "1h",
         }, growthOsToken);
         break;
 
       case "analytics-guardian":
         // AI-powered analytics alerts
         result = await callGrowthOS("/analytics-guardian", {
           alert_types: params.alertTypes || ["anomaly", "threshold", "trend"],
           severity: params.severity || "all",
         }, growthOsToken);
         break;
 
       // ===== REPORTS =====
       case "generate-report":
         // Generate comprehensive report
         result = await callGrowthOS("/generate-report", {
           report_type: params.reportType || "executive_summary",
           format: params.format || "json",
           date_range: params.dateRange || "last_30_days",
           sections: params.sections || ["overview", "acquisition", "engagement", "revenue"],
         }, growthOsToken);
         break;
 
       // ===== AI ASSISTANT =====
       case "ai-insights":
         // Get AI-powered insights
         result = await callGrowthOS("/ai-assistant", {
           context: "growth_analytics",
           question: params.question || "Quelles sont les principales tendances de croissance ?",
           data_context: params.dataContext || {},
         }, growthOsToken);
         break;
 
       case "perplexity-research":
         // Deep research via Perplexity
         result = await callGrowthOS("/perplexity-research", {
           query: params.query,
           focus: params.focus || "business",
         }, growthOsToken);
         break;
 
       // ===== AGGREGATED DATA =====
       case "full-sync":
         // Comprehensive sync of all analytics sources
         console.log("Executing full sync across all sources...");
         
         const [ga4Result, kpisResult, gscResult, metricsResult] = await Promise.all([
           callGrowthOS("/sync-ga4", { date_range: "last_30_days" }, growthOsToken),
           callGrowthOS("/kpi-sync", { sources: ["ga4", "gsc", "stripe"] }, growthOsToken),
           callGrowthOS("/sync-gsc", { date_range: "last_30_days" }, growthOsToken),
           callGrowthOS("/monitoring-metrics", { time_range: "24h" }, growthOsToken),
         ]);
 
         result = {
           success: true,
           data: {
             ga4: ga4Result.data,
             kpis: kpisResult.data,
             gsc: gscResult.data,
             monitoring: metricsResult.data,
             synced_at: new Date().toISOString(),
           },
         };
         break;
 
       default:
         return new Response(JSON.stringify({ 
           error: `Unknown action: ${action}`,
           available_actions: [
             "sync-ga4", "sync-kpis", "sync-gsc", "sync-meta-ads", "sync-google-ads",
             "monitoring-metrics", "analytics-guardian", "generate-report",
             "ai-insights", "perplexity-research", "full-sync"
           ]
         }), {
           status: 400,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
     }
 
     console.log(`Growth Analytics: Action "${action}" completed successfully`);
 
     return new Response(JSON.stringify({
       success: true,
       action,
       timestamp: new Date().toISOString(),
       ...result,
     }), {
       status: 200,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
 
   } catch (error) {
     console.error("Growth Analytics error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(JSON.stringify({ 
       success: false,
       error: errorMessage 
     }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });