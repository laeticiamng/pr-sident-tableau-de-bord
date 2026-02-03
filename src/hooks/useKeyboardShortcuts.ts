import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutHandlers {
  onBrief?: () => void;
  onAudit?: () => void;
  onMarketing?: () => void;
  onCompetitive?: () => void;
}

export function useKeyboardShortcuts(handlers?: ShortcutHandlers) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Alt/Option + Key shortcuts for navigation
    if (event.altKey && !event.metaKey && !event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case "h":
          event.preventDefault();
          navigate("/hq");
          break;
        case "p":
          event.preventDefault();
          navigate("/hq/plateformes");
          break;
        case "e":
          event.preventDefault();
          navigate("/hq/equipe-executive");
          break;
        case "a":
          event.preventDefault();
          navigate("/hq/approbations");
          break;
        case "s":
          event.preventDefault();
          navigate("/hq/securite");
          break;
        case "m":
          event.preventDefault();
          navigate("/hq/marketing");
          break;
        case "f":
          event.preventDefault();
          navigate("/hq/finance");
          break;
      }
    }

    // Shift + Number shortcuts for quick actions
    if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
      switch (event.key) {
        case "1":
          event.preventDefault();
          handlers?.onBrief?.();
          break;
        case "2":
          event.preventDefault();
          handlers?.onAudit?.();
          break;
        case "3":
          event.preventDefault();
          handlers?.onMarketing?.();
          break;
        case "4":
          event.preventDefault();
          handlers?.onCompetitive?.();
          break;
      }
    }
  }, [navigate, handlers]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for showing keyboard shortcuts help
export function useShortcutsHelp() {
  const shortcuts = [
    { keys: "⌘K", description: "Ouvrir la palette de commandes" },
    { keys: "⌥H", description: "Aller au Briefing Room" },
    { keys: "⌥P", description: "Aller aux Plateformes" },
    { keys: "⌥E", description: "Équipe Executive" },
    { keys: "⌥A", description: "Approbations" },
    { keys: "⌥S", description: "Sécurité" },
    { keys: "⌥M", description: "Marketing" },
    { keys: "⌥F", description: "Finance" },
    { keys: "⇧1", description: "Brief Exécutif IA" },
    { keys: "⇧2", description: "Audit Sécurité" },
    { keys: "⇧3", description: "Plan Marketing" },
    { keys: "⇧4", description: "Veille Concurrentielle" },
  ];

  return shortcuts;
}
