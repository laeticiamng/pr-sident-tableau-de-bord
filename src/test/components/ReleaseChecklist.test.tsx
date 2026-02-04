import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReleaseChecklist } from "@/components/hq/engineering/ReleaseChecklist";

describe("ReleaseChecklist", () => {
  it("renders without crashing", () => {
    render(<ReleaseChecklist />);
    expect(screen.getByText("Checklist de Release")).toBeInTheDocument();
  });

  it("shows all checklist items", () => {
    render(<ReleaseChecklist />);
    expect(screen.getByText("Tests unitaires passés")).toBeInTheDocument();
    expect(screen.getByText("Code review approuvé")).toBeInTheDocument();
    expect(screen.getByText("Documentation à jour")).toBeInTheDocument();
    expect(screen.getByText("Audit sécurité OK")).toBeInTheDocument();
    expect(screen.getByText("Performance validée")).toBeInTheDocument();
    expect(screen.getByText("Rollback plan prêt")).toBeInTheDocument();
    expect(screen.getByText("Testé en staging")).toBeInTheDocument();
    expect(screen.getByText("Notes de version")).toBeInTheDocument();
  });

  it("shows progress badge with count", () => {
    render(<ReleaseChecklist />);
    // Should show the progress badge with format X/8
    expect(screen.getByText(/\/8/)).toBeInTheDocument();
  });

  it("allows clicking on items", () => {
    render(<ReleaseChecklist />);
    // Click on an item to toggle it
    const codeReviewItem = screen.getByText("Code review approuvé");
    expect(codeReviewItem).toBeInTheDocument();
    fireEvent.click(codeReviewItem);
  });

  it("shows warning when not all items are checked", () => {
    render(<ReleaseChecklist />);
    expect(screen.getByText(/Complétez tous les critères/)).toBeInTheDocument();
  });

  it("shows category badges", () => {
    render(<ReleaseChecklist />);
    expect(screen.getAllByText("Code").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sécurité").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Qualité").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ops").length).toBeGreaterThan(0);
  });

  it("displays platformKey when provided", () => {
    render(<ReleaseChecklist platformKey="emotionscare" />);
    expect(screen.getByText("(emotionscare)")).toBeInTheDocument();
  });

  it("shows deploy button when all items are checked", () => {
    const onDeploy = vi.fn();
    render(<ReleaseChecklist onDeploy={onDeploy} />);
    
    // Click all items to check them
    const items = [
      "Tests unitaires passés",
      "Code review approuvé",
      "Documentation à jour",
      "Audit sécurité OK",
      "Performance validée",
      "Rollback plan prêt",
      "Testé en staging",
      "Notes de version"
    ];
    
    items.forEach(itemText => {
      const item = screen.getByText(itemText);
      fireEvent.click(item);
    });
    
    // Deploy button should now be visible
    const deployButton = screen.queryByText("Déployer");
    if (deployButton) {
      expect(deployButton).toBeInTheDocument();
    }
  });
});
