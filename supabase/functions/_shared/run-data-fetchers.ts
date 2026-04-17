// Helpers de collecte de données externes pour les runs exécutifs
// Extrait de executive-run/index.ts (Horizon 3 — Axe 4)
import { MANAGED_REPOS } from "./run-templates.ts";

interface GitHubCommit {
  commit?: { message?: string; author?: { date?: string } };
}
interface GitHubIssue {
  number: number;
  title: string;
  pull_request?: unknown;
}

export async function fetchGitHubData(token: string | undefined, platformKey?: string): Promise<string> {
  if (!token) return "GitHub non connecté - token manquant";

  const repos = platformKey
    ? MANAGED_REPOS.filter((r) => r.key === platformKey)
    : MANAGED_REPOS;

  let contextData = "\n\n📊 DONNÉES GITHUB RÉELLES:\n";

  for (const { key, repo } of repos) {
    try {
      const headers = { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" };
      const [commitsRes, issuesRes, prsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, { headers }),
        fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=10`, { headers }),
        fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=10`, { headers }),
      ]);

      const commits: GitHubCommit[] = commitsRes.ok ? await commitsRes.json() : [];
      const issuesAll: GitHubIssue[] = issuesRes.ok ? await issuesRes.json() : [];
      const issues = issuesAll.filter((i) => !i.pull_request);
      const prs = prsRes.ok ? await prsRes.json() : [];

      contextData += `\n📁 ${key.toUpperCase()}\n`;
      contextData += `   Issues ouvertes: ${issues.length}\n`;
      contextData += `   PRs en attente: ${prs.length}\n`;

      if (commits.length > 0) {
        contextData += `   Dernier commit: ${commits[0]?.commit?.message?.split("\n")[0] || "N/A"} (${commits[0]?.commit?.author?.date?.split("T")[0] || "N/A"})\n`;
      }
      if (issues.length > 0) {
        contextData += `   Issues récentes: ${issues.slice(0, 3).map((i) => `#${i.number}: ${i.title}`).join(", ")}\n`;
      }
    } catch {
      contextData += `\n📁 ${key.toUpperCase()}: Erreur de récupération\n`;
    }
  }
  return contextData;
}

export async function fetchPerplexityData(apiKey: string | undefined, query: string): Promise<string> {
  if (!apiKey) return "\n\n🔍 VEILLE STRATÉGIQUE: Perplexity non configuré";

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Tu es un analyste de veille stratégique. Réponds en français, de manière concise et factuelle." },
          { role: "user", content: query },
        ],
        search_recency_filter: "week",
      }),
    });
    if (!response.ok) return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur API Perplexity";

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];
    return `\n\n🔍 VEILLE STRATÉGIQUE (Perplexity):\n${content}\n\n📎 Sources: ${citations.slice(0, 3).join(", ") || "N/A"}`;
  } catch {
    return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur de connexion";
  }
}

export function buildPerplexityQuery(runType: string): string {
  if (runType === "DAILY_EXECUTIVE_BRIEF") {
    return "Actualités et tendances du marché des logiciels applicatifs en France cette semaine. No-code, IA, plateformes.";
  }
  if (runType === "MARKETING_WEEK_PLAN") {
    return "Stratégies marketing digital efficaces pour éditeurs de logiciels B2B en 2025. Tendances, canaux, exemples.";
  }
  if (runType === "COMPETITIVE_ANALYSIS") {
    return "Principaux éditeurs de logiciels applicatifs français. Analyse concurrentielle, positionnement, forces.";
  }
  return "Actualités tech et software en France";
}
