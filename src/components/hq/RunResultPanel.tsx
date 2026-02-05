import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Cpu,
  Link2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface RunResultPanelProps {
  runResult: {
    run_type?: string;
    run_id?: string;
    executive_summary: string;
    model_used?: string;
    data_sources?: string[];
    steps?: string[];
    completed_at?: string;
  } | null;
  onClose?: () => void;
  className?: string;
}

// Mapping run types to friendly names
const RUN_TYPE_LABELS: Record<string, string> = {
  DAILY_EXECUTIVE_BRIEF: "Brief Exécutif Quotidien",
  CEO_STANDUP_MEETING: "Standup CEO",
  PLATFORM_STATUS_REVIEW: "Revue Plateforme",
  SECURITY_AUDIT_RLS: "Audit Sécurité RLS",
  MARKETING_WEEK_PLAN: "Plan Marketing",
  RELEASE_GATE_CHECK: "Validation Release",
  COMPETITIVE_ANALYSIS: "Analyse Concurrentielle",
};

export function RunResultPanel({ runResult, onClose, className }: RunResultPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!runResult) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(runResult.executive_summary);
      setCopied(true);
      toast.success("Résumé copié dans le presse-papiers");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const runTypeLabel = runResult.run_type
    ? RUN_TYPE_LABELS[runResult.run_type] || runResult.run_type
    : "Run IA";

  return (
    <Card className={cn("card-executive border-accent/30", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    Résultat : {runTypeLabel}
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                  {runResult.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(runResult.completed_at).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Metadata Row */}
            <div className="flex flex-wrap gap-4 pb-3 border-b">
              {/* Model Used */}
              {runResult.model_used && (
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="subtle" className="font-mono text-xs">
                    {runResult.model_used}
                  </Badge>
                </div>
              )}

              {/* Data Sources */}
              {runResult.data_sources && runResult.data_sources.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  {runResult.data_sources.map((source, i) => (
                    <Badge key={i} variant="subtle" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Executive Summary - Markdown */}
            <ScrollArea className="max-h-[400px]">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed mb-2">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 space-y-1 text-sm">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 space-y-1 text-sm">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-accent pl-3 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {runResult.executive_summary}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
