import { useEffect } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface NetworkStatusProviderProps {
  children: React.ReactNode;
}

/**
 * Provider qui surveille le statut réseau et affiche des toasts automatiques
 * quand la connexion est perdue ou rétablie.
 */
export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
  // Le hook gère automatiquement les toasts
  useNetworkStatus();
  
  return <>{children}</>;
}
