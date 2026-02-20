import { AgentMonitoringDashboard } from "@/components/hq/AgentMonitoringDashboard";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AgentsMonitoringPage() {
  usePageMeta({ title: "Monitoring Agents IA — HQ", noindex: true });

  return (
    <div className="animate-fade-in">
      <AgentMonitoringDashboard />
    </div>
  );
}
