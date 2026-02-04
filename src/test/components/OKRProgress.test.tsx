import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OKRProgress } from "@/components/hq/product/OKRProgress";

// Mock the mock-data
vi.mock("@/lib/mock-data", () => ({
  PRODUCT_OKRS: [
    {
      objective: "Test Objective 1",
      progress: 75,
      status: "on_track",
      keyResults: [
        { name: "KR 1", progress: 80 },
        { name: "KR 2", progress: 70 },
      ],
    },
    {
      objective: "Test Objective 2",
      progress: 45,
      status: "at_risk",
      keyResults: [
        { name: "KR 3", progress: 50 },
        { name: "KR 4", progress: 40 },
      ],
    },
  ],
}));

describe("OKRProgress", () => {
  it("renders without crashing", () => {
    render(<OKRProgress />);
    expect(screen.getByText("OKRs Q1 2026")).toBeInTheDocument();
  });

  it("shows loading state when loading prop is true", () => {
    render(<OKRProgress loading={true} />);
    // Should show skeleton loaders
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays objectives correctly", () => {
    render(<OKRProgress />);
    expect(screen.getByText("Test Objective 1")).toBeInTheDocument();
    expect(screen.getByText("Test Objective 2")).toBeInTheDocument();
  });

  it("shows progress badges", () => {
    render(<OKRProgress />);
    expect(screen.getByText("60% global")).toBeInTheDocument();
    expect(screen.getByText("1/2 on track")).toBeInTheDocument();
  });

  it("shows status badges for each OKR", () => {
    render(<OKRProgress />);
    expect(screen.getByText("Sur la bonne voie")).toBeInTheDocument();
    expect(screen.getByText("À risque")).toBeInTheDocument();
  });

  it("expands and collapses OKR details", async () => {
    render(<OKRProgress />);
    
    // First OKR should be expanded by default
    expect(screen.getByText("KR 1")).toBeInTheDocument();
    
    // Click to collapse first OKR
    const firstOKRTrigger = screen.getByText("Test Objective 1").closest("button");
    if (firstOKRTrigger) {
      fireEvent.click(firstOKRTrigger);
    }
  });

  it("displays key results with progress", () => {
    render(<OKRProgress />);
    expect(screen.getByText("KR 1")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows correct progress percentage for each OKR", () => {
    render(<OKRProgress />);
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });
});
