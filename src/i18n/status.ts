export const statusTranslations = {
  fr: {
    meta: { title: "Statut des Services", description: "Disponibilité en temps réel des 8 plateformes SaaS EMOTIONSCARE." },
    hero: {
      badge: "Statut des services",
      title: "Statut des",
      titleAccent: "Plateformes",
      allOperational: "Tous les systèmes sont opérationnels",
      someIssues: "Certains systèmes nécessitent attention",
      publicFallback: "Statut basé sur les derniers déploiements",
      lastCheck: "Dernière vérification",
    },
    summary: {
      inProduction: "en production",
      prototypes: "prototypes",
      incidents: "incident",
      refresh: "Actualiser",
    },
    sections: {
      production: "Plateformes en production",
      prototypes: "Prototypes en développement",
    },
    status: {
      operational: "Opérationnel",
      prototypeActive: "Prototype actif",
    },
    labels: {
      modules: "modules",
      commits: "commits",
      lastUpdate: "MAJ",
      visit: "Visiter",
    },
    legend: {
      title: "Comprendre les indicateurs",
      items: [
        { color: "green", label: "Opérationnel", description: "Le service fonctionne normalement" },
        { color: "amber", label: "Prototype", description: "En développement actif, fonctionnalités limitées" },
        { color: "red", label: "Incident", description: "Dysfonctionnement détecté, résolution en cours" },
      ],
      updateNote: "Les données de cette page sont mises à jour manuellement à chaque déploiement. Le monitoring automatisé est accessible via le tableau de bord interne.",
    },
  },
  en: {
    meta: { title: "Service Status", description: "Real-time availability of EMOTIONSCARE's 8 SaaS platforms." },
    hero: {
      badge: "Service status",
      title: "Platform",
      titleAccent: "Status",
      allOperational: "All systems are operational",
      someIssues: "Some systems need attention",
      publicFallback: "Status based on latest deployments",
      lastCheck: "Last check",
    },
    summary: {
      inProduction: "in production",
      prototypes: "prototypes",
      incidents: "incident",
      refresh: "Refresh",
    },
    sections: {
      production: "Platforms in production",
      prototypes: "Prototypes in development",
    },
    status: {
      operational: "Operational",
      prototypeActive: "Active prototype",
    },
    labels: {
      modules: "modules",
      commits: "commits",
      lastUpdate: "Updated",
      visit: "Visit",
    },
    legend: {
      title: "Understanding indicators",
      items: [
        { color: "green", label: "Operational", description: "Service is running normally" },
        { color: "amber", label: "Prototype", description: "Under active development, limited features" },
        { color: "red", label: "Incident", description: "Issue detected, resolution in progress" },
      ],
      updateNote: "This page's data is updated manually with each deployment. Automated monitoring is accessible via the internal dashboard.",
    },
  },
  de: {
    meta: { title: "Service-Status", description: "Echtzeit-Verfügbarkeit der 8 SaaS-Plattformen von EMOTIONSCARE." },
    hero: {
      badge: "Service-Status",
      title: "Plattform-",
      titleAccent: "Status",
      allOperational: "Alle Systeme sind betriebsbereit",
      someIssues: "Einige Systeme benötigen Aufmerksamkeit",
      lastCheck: "Letzte Überprüfung",
    },
    summary: {
      inProduction: "in Produktion",
      prototypes: "Prototypen",
      incidents: "Vorfall",
      refresh: "Aktualisieren",
    },
    sections: {
      production: "Plattformen in Produktion",
      prototypes: "Prototypen in Entwicklung",
    },
    status: {
      operational: "Betriebsbereit",
      prototypeActive: "Aktiver Prototyp",
    },
    labels: {
      modules: "Module",
      commits: "Commits",
      lastUpdate: "Aktualisiert",
      visit: "Besuchen",
    },
    legend: {
      title: "Indikatoren verstehen",
      items: [
        { color: "green", label: "Betriebsbereit", description: "Der Dienst funktioniert normal" },
        { color: "amber", label: "Prototyp", description: "In aktiver Entwicklung, eingeschränkte Funktionen" },
        { color: "red", label: "Vorfall", description: "Problem erkannt, Lösung in Bearbeitung" },
      ],
      updateNote: "Die Daten auf dieser Seite werden manuell bei jedem Deployment aktualisiert. Automatisiertes Monitoring ist über das interne Dashboard zugänglich.",
    },
  },
} as const;
