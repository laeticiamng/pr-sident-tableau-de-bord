import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

// Dépendances réseau neutralisées : on teste uniquement l'ordre des hooks et la redirection.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/hooks/hq/useRuns", () => ({
  useRecentRuns: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/hq/useReliability", () => ({
  useDLQEntries: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/useJournal", () => ({
  useCreateJournalEntry: () => ({ mutate: vi.fn(), isPending: false }),
  useJournalEntries: () => ({ data: [] }),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

import ArchitecturePlatformDetailPage from "@/pages/hq/ArchitecturePlatformDetailPage";
import { PLATFORM_ARCHITECTURE } from "@/data/systemArchitecture";

function creerRouteur(cheminInitial: string) {
  return createMemoryRouter(
    [
      { path: "/hq/architecture", element: <div>Matrice architecture</div> },
      { path: "/hq/architecture/:platformKey", element: <ArchitecturePlatformDetailPage /> },
    ],
    { initialEntries: [cheminInitial] },
  );
}

describe("ArchitecturePlatformDetailPage", () => {
  const cleValide = String(PLATFORM_ARCHITECTURE[0].key);

  it("affiche la fiche d'une plateforme connue", () => {
    render(<RouterProvider router={creerRouteur(`/hq/architecture/${cleValide}`)} />);
    expect(screen.getByText(/Retour à la matrice/)).toBeInTheDocument();
  });

  it("redirige vers la matrice pour une plateforme inconnue", () => {
    render(<RouterProvider router={creerRouteur("/hq/architecture/plateforme-inexistante")} />);
    expect(screen.getByText("Matrice architecture")).toBeInTheDocument();
  });

  it("ne plante pas en passant d'une plateforme connue à une clé inconnue (ordre des hooks)", async () => {
    const routeur = creerRouteur(`/hq/architecture/${cleValide}`);
    render(<RouterProvider router={routeur} />);
    expect(screen.getByText(/Retour à la matrice/)).toBeInTheDocument();
    // Même élément de route, paramètre différent : React réutilise l'instance du composant.
    await act(async () => {
      await routeur.navigate("/hq/architecture/plateforme-inexistante");
    });
    expect(screen.getByText("Matrice architecture")).toBeInTheDocument();
  });
});
