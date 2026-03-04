import { AgentMonitoringDashboard } from "@/components/hq/AgentMonitoringDashboard";
import { StructuredLogsViewer } from "@/components/hq/diagnostics/StructuredLogsViewer";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";

export default function AgentsMonitoringPage() {
  usePageMeta({ title: "Monitoring Agents IA — HQ", noindex: true });

  return (
    <div className="animate-fade-in space-y-6">
      <ExecutiveHeader
        title="Monitoring Agents IA"
        subtitle="Supervision en temps réel des agents et logs structurés"
        source={{ source: "supabase", lastUpdated: new Date(), confidence: "high" }}
      />
      <AgentMonitoringDashboard />
      <StructuredLogsViewer />
    </div>
  );
}
