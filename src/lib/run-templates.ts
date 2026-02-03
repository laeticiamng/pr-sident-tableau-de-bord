/**
 * Run Templates - Templates de runs personnalisables
 * Permet à l'utilisateur de créer ses propres workflows IA avec prompts et variables
 */

export interface RunTemplateVariable {
  key: string;
  label: string;
  type: "text" | "select" | "platform" | "date";
  required: boolean;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}

export interface RunTemplate {
  id: string;
  name: string;
  description: string;
  category: "strategic" | "operational" | "technical" | "marketing" | "finance" | "custom";
  systemPrompt: string;
  userPromptTemplate: string;
  variables: RunTemplateVariable[];
  model: "default" | "reasoning" | "coding" | "summary";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  steps: string[];
  dataSources: {
    useGitHub?: boolean;
    usePerplexity?: boolean;
    useFirecrawl?: boolean;
    useStripe?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isBuiltIn: boolean;
}

// Templates prédéfinis (built-in)
export const BUILT_IN_TEMPLATES: RunTemplate[] = [
  {
    id: "daily_executive_brief",
    name: "Brief Exécutif Quotidien",
    description: "Synthèse stratégique quotidienne pour la Présidente",
    category: "strategic",
    systemPrompt: `Tu es le Directeur Général (CEO Agent) d'EMOTIONSCARE SASU.
Tu génères le briefing exécutif quotidien avec les données RÉELLES des systèmes.

Structure:
1. 🎯 RÉSUMÉ EXÉCUTIF (3 phrases max)
2. 📊 STATUT RAG DES PLATEFORMES
3. ⚡ TOP 3 PRIORITÉS DU JOUR
4. ⏳ DÉCISIONS EN ATTENTE
5. 🚨 ALERTES CRITIQUES
6. 📈 VEILLE STRATÉGIQUE`,
    userPromptTemplate: `Date: {{date}}
Entreprise: EMOTIONSCARE SASU
{{#if platformFilter}}Filtre plateforme: {{platformFilter}}{{/if}}

Génère le brief exécutif quotidien.`,
    variables: [
      { key: "platformFilter", label: "Filtrer par plateforme", type: "platform", required: false }
    ],
    model: "reasoning",
    riskLevel: "low",
    requiresApproval: false,
    steps: ["Sync GitHub", "Collecte métriques", "Veille marché", "Synthèse IA"],
    dataSources: { useGitHub: true, usePerplexity: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: "platform_deep_dive",
    name: "Analyse Approfondie Plateforme",
    description: "Analyse complète d'une plateforme avec toutes les données disponibles",
    category: "operational",
    systemPrompt: `Tu es le CTO effectuant une analyse technique approfondie.
Analyse la plateforme spécifiée avec données réelles:

1. 🏗️ ARCHITECTURE & SANTÉ TECHNIQUE
2. 📊 MÉTRIQUES DE PERFORMANCE
3. 🔐 ÉTAT DE SÉCURITÉ
4. 🐛 ISSUES ET DETTE TECHNIQUE
5. 🚀 RECOMMANDATIONS PRIORITAIRES`,
    userPromptTemplate: `Plateforme: {{platform}}
Type d'analyse: {{analysisType}}
{{#if focusArea}}Focus: {{focusArea}}{{/if}}

Génère l'analyse approfondie.`,
    variables: [
      { key: "platform", label: "Plateforme", type: "platform", required: true },
      { 
        key: "analysisType", 
        label: "Type d'analyse", 
        type: "select", 
        required: true,
        options: [
          { value: "full", label: "Analyse complète" },
          { value: "performance", label: "Performance uniquement" },
          { value: "security", label: "Sécurité uniquement" },
          { value: "code_quality", label: "Qualité code" }
        ]
      },
      { key: "focusArea", label: "Zone de focus (optionnel)", type: "text", required: false }
    ],
    model: "reasoning",
    riskLevel: "low",
    requiresApproval: false,
    steps: ["Fetch GitHub data", "Analyse métriques", "Scan sécurité", "Rapport"],
    dataSources: { useGitHub: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: "competitive_intel",
    name: "Veille Concurrentielle",
    description: "Analyse stratégique d'un concurrent ou du marché",
    category: "marketing",
    systemPrompt: `Tu es le Directeur Stratégie effectuant une veille concurrentielle.

Structure:
1. 🏢 PROFIL DU CONCURRENT
2. 💪 FORCES & FAIBLESSES
3. 📊 POSITIONNEMENT MARCHÉ
4. 🔧 STACK TECHNOLOGIQUE
5. 📈 OPPORTUNITÉS POUR NOUS
6. ⚔️ MENACES À SURVEILLER`,
    userPromptTemplate: `Cible: {{target}}
Type de veille: {{watchType}}
{{#if keywords}}Mots-clés: {{keywords}}{{/if}}

Génère l'analyse concurrentielle.`,
    variables: [
      { key: "target", label: "Nom du concurrent ou secteur", type: "text", required: true },
      { 
        key: "watchType", 
        label: "Type de veille", 
        type: "select", 
        required: true,
        options: [
          { value: "competitor", label: "Concurrent direct" },
          { value: "market", label: "Tendances marché" },
          { value: "technology", label: "Veille technologique" }
        ]
      },
      { key: "keywords", label: "Mots-clés additionnels", type: "text", required: false }
    ],
    model: "reasoning",
    riskLevel: "low",
    requiresApproval: false,
    steps: ["Recherche Perplexity", "Scraping web", "Analyse SWOT", "Recommandations"],
    dataSources: { usePerplexity: true, useFirecrawl: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: "financial_report",
    name: "Rapport Financier",
    description: "Synthèse des KPIs financiers avec recommandations",
    category: "finance",
    systemPrompt: `Tu es le CFO générant un rapport financier structuré.

Structure:
1. 💰 CHIFFRES CLÉS (MRR, ARR, Churn)
2. 📊 ÉVOLUTION VS PÉRIODE PRÉCÉDENTE
3. 🎯 ATTEINTE DES OBJECTIFS
4. ⚠️ ALERTES FINANCIÈRES
5. 📈 PRÉVISIONS
6. 💡 RECOMMANDATIONS`,
    userPromptTemplate: `Période: {{period}}
{{#if compareTo}}Comparer à: {{compareTo}}{{/if}}

Génère le rapport financier.`,
    variables: [
      { 
        key: "period", 
        label: "Période", 
        type: "select", 
        required: true,
        options: [
          { value: "week", label: "Cette semaine" },
          { value: "month", label: "Ce mois" },
          { value: "quarter", label: "Ce trimestre" },
          { value: "year", label: "Cette année" }
        ]
      },
      { key: "compareTo", label: "Comparer à (optionnel)", type: "text", required: false }
    ],
    model: "summary",
    riskLevel: "low",
    requiresApproval: false,
    steps: ["Fetch Stripe data", "Calcul KPIs", "Analyse tendances", "Rapport"],
    dataSources: { useStripe: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: "agent_task",
    name: "Tâche Agent Personnalisée",
    description: "Assigner une tâche à un agent IA spécifique",
    category: "custom",
    systemPrompt: `Tu es l'agent {{agentRole}} d'EMOTIONSCARE SASU.
Exécute la tâche demandée avec professionnalisme et rigueur.
Fournis un rapport structuré de ton travail.`,
    userPromptTemplate: `Agent: {{agentRole}}
Tâche: {{taskDescription}}
{{#if context}}Contexte: {{context}}{{/if}}
{{#if deliverable}}Livrable attendu: {{deliverable}}{{/if}}

Exécute cette tâche.`,
    variables: [
      { 
        key: "agentRole", 
        label: "Agent", 
        type: "select", 
        required: true,
        options: [
          { value: "CEO", label: "Directeur Général" },
          { value: "CTO", label: "Directeur Technique" },
          { value: "CFO", label: "Directeur Financier" },
          { value: "CMO", label: "Directeur Marketing" },
          { value: "COO", label: "Directeur des Opérations" },
          { value: "CPO", label: "Directeur Produit" },
          { value: "CISO", label: "Directeur Sécurité" },
          { value: "CRO", label: "Directeur Commercial" },
          { value: "GC", label: "Directeur Juridique" },
          { value: "HEAD_ENGINEERING", label: "Responsable Engineering" },
          { value: "HEAD_DESIGN", label: "Responsable Design" },
          { value: "HEAD_DATA", label: "Responsable Data" }
        ]
      },
      { key: "taskDescription", label: "Description de la tâche", type: "text", required: true },
      { key: "context", label: "Contexte additionnel", type: "text", required: false },
      { key: "deliverable", label: "Livrable attendu", type: "text", required: false }
    ],
    model: "default",
    riskLevel: "low",
    requiresApproval: false,
    steps: ["Analyse contexte", "Exécution tâche", "Rapport"],
    dataSources: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
  },
];

// Storage key for custom templates
const CUSTOM_TEMPLATES_KEY = "hq_custom_run_templates";

// Get all templates (built-in + custom)
export function getAllTemplates(): RunTemplate[] {
  const customTemplates = getCustomTemplates();
  return [...BUILT_IN_TEMPLATES, ...customTemplates];
}

// Get custom templates from localStorage
export function getCustomTemplates(): RunTemplate[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save a custom template
export function saveCustomTemplate(template: Omit<RunTemplate, "id" | "createdAt" | "updatedAt" | "isBuiltIn">): RunTemplate {
  const newTemplate: RunTemplate = {
    ...template,
    id: `custom_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: false,
  };
  
  const templates = getCustomTemplates();
  templates.push(newTemplate);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  
  return newTemplate;
}

// Update a custom template
export function updateCustomTemplate(id: string, updates: Partial<RunTemplate>): RunTemplate | null {
  const templates = getCustomTemplates();
  const index = templates.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  return templates[index];
}

// Delete a custom template
export function deleteCustomTemplate(id: string): boolean {
  const templates = getCustomTemplates();
  const filtered = templates.filter(t => t.id !== id);
  
  if (filtered.length === templates.length) return false;
  
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

// Get template by ID
export function getTemplateById(id: string): RunTemplate | undefined {
  return getAllTemplates().find(t => t.id === id);
}

// Process template variables in prompt
export function processTemplatePrompt(template: string, variables: Record<string, string>): string {
  let processed = template;
  
  // Replace simple variables: {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  });
  
  // Handle conditionals: {{#if variable}}content{{/if}}
  processed = processed.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, varName, content) => {
    return variables[varName] ? content : '';
  });
  
  // Add date automatically
  processed = processed.replace(/{{date}}/g, new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }));
  
  return processed.trim();
}

// Get templates by category
export function getTemplatesByCategory(category: RunTemplate['category']): RunTemplate[] {
  return getAllTemplates().filter(t => t.category === category);
}

// Category labels
export const TEMPLATE_CATEGORY_LABELS: Record<RunTemplate['category'], string> = {
  strategic: "Stratégique",
  operational: "Opérationnel",
  technical: "Technique",
  marketing: "Marketing",
  finance: "Finance",
  custom: "Personnalisé",
};
