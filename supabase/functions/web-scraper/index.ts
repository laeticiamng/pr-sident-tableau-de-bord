import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapeRequest {
  url: string;
  action: "scrape" | "search" | "map";
  options?: {
    formats?: string[];
    query?: string;
    limit?: number;
    onlyMainContent?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl API non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, action = "scrape", options = {} }: ScrapeRequest = await req.json();

    if (action !== "search" && !url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let endpoint: string;
    let body: Record<string, any>;

    switch (action) {
      case "scrape":
        endpoint = "https://api.firecrawl.dev/v1/scrape";
        // Formater l'URL
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = `https://${formattedUrl}`;
        }
        body = {
          url: formattedUrl,
          formats: options.formats || ["markdown", "links"],
          onlyMainContent: options.onlyMainContent ?? true,
        };
        break;

      case "search":
        endpoint = "https://api.firecrawl.dev/v1/search";
        body = {
          query: options.query || url,
          limit: options.limit || 10,
          scrapeOptions: { formats: ["markdown"] },
        };
        break;

      case "map":
        endpoint = "https://api.firecrawl.dev/v1/map";
        let mapUrl = url.trim();
        if (!mapUrl.startsWith("http://") && !mapUrl.startsWith("https://")) {
          mapUrl = `https://${mapUrl}`;
        }
        body = {
          url: mapUrl,
          limit: options.limit || 100,
        };
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Action inconnue: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Firecrawl ${action}: ${url || options.query}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", response.status, data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `Erreur Firecrawl: ${response.status}` 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Firecrawl ${action} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        ...data,
        scraped_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Web scraper error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
