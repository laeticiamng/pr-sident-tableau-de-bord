import { describe, it, expect } from "vitest";
import {
  computeStrategicValueScore,
  simulateEquityDeal,
  OPPORTUNITY_STATUS_LABEL,
  CALL_TYPE_LABEL,
  DEAL_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
} from "@/lib/studio-types";

describe("simulateEquityDeal", () => {
  it("returns equity in [equityMin, equityMax] for a balanced project", () => {
    const out = simulateEquityDeal({
      involvementLevel: 3,
      projectSize: "medium",
      effort: "moderate",
      duration: "medium",
      riskLevel: "medium",
      executionProbability: "medium",
      teamQuality: "strong",
      futureValuePotential: "high",
    });
    expect(out.equityRecommended).toBeGreaterThanOrEqual(out.equityMin);
    expect(out.equityRecommended).toBeLessThanOrEqual(out.equityMax);
  });

  it("recommends advisory_monthly for level 1 involvement", () => {
    const out = simulateEquityDeal({
      involvementLevel: 1,
      projectSize: "small",
      effort: "light",
      duration: "short",
      riskLevel: "low",
      executionProbability: "high",
      teamQuality: "strong",
      futureValuePotential: "medium",
    });
    expect(out.recommendedDealType).toBe("advisory_monthly");
  });

  it("recommends direct_participation for level 5 involvement", () => {
    const out = simulateEquityDeal({
      involvementLevel: 5,
      projectSize: "flagship",
      effort: "heavy",
      duration: "long",
      riskLevel: "high",
      executionProbability: "high",
      teamQuality: "elite",
      futureValuePotential: "exceptional",
    });
    expect(out.recommendedDealType).toBe("direct_participation");
    expect(out.equityRecommended).toBeGreaterThan(5);
  });

  it("includes a shareholder pact requirement for high equity", () => {
    const out = simulateEquityDeal({
      involvementLevel: 5,
      projectSize: "flagship",
      effort: "heavy",
      duration: "long",
      riskLevel: "medium",
      executionProbability: "high",
      teamQuality: "elite",
      futureValuePotential: "exceptional",
    });
    expect(out.documentsRequired).toContain("shareholder_pact");
  });

  it("always includes the legal_checklist requirement", () => {
    const out = simulateEquityDeal({
      involvementLevel: 1,
      projectSize: "small",
      effort: "light",
      duration: "short",
      riskLevel: "low",
      executionProbability: "high",
      teamQuality: "average",
      futureValuePotential: "low",
    });
    expect(out.documentsRequired).toContain("legal_checklist");
  });
});

describe("computeStrategicValueScore", () => {
  it("returns 0 for an all-zero input", () => {
    expect(
      computeStrategicValueScore({
        marketPotential: 0,
        problemUrgency: 0,
        executionCapability: 0,
        differentiation: 0,
        fundingAccess: 0,
        strategicFit: 0,
        equityPotential: 0,
      }),
    ).toBe(0);
  });

  it("returns 100 for an all-100 input", () => {
    expect(
      computeStrategicValueScore({
        marketPotential: 100,
        problemUrgency: 100,
        executionCapability: 100,
        differentiation: 100,
        fundingAccess: 100,
        strategicFit: 100,
        equityPotential: 100,
      }),
    ).toBe(100);
  });

  it("clamps values above 100", () => {
    expect(
      computeStrategicValueScore({
        marketPotential: 200,
        problemUrgency: 200,
        executionCapability: 200,
        differentiation: 200,
        fundingAccess: 200,
        strategicFit: 200,
        equityPotential: 200,
      }),
    ).toBe(100);
  });
});

describe("Studio label maps", () => {
  it("provides a French label for every opportunity status", () => {
    expect(OPPORTUNITY_STATUS_LABEL.idea).toBe("Idée brute");
    expect(OPPORTUNITY_STATUS_LABEL.deal_signed).toBe("Deal signé");
  });
  it("labels every call type", () => {
    expect(CALL_TYPE_LABEL.appel_a_projets).toBe("Appel à projets");
    expect(CALL_TYPE_LABEL.ami).toBe("AMI");
  });
  it("labels every deal type", () => {
    expect(DEAL_TYPE_LABEL.advisory_monthly).toContain("Advisory");
  });
  it("labels every document type", () => {
    expect(DOCUMENT_TYPE_LABEL.blueprint_360).toBe("Blueprint 360°");
  });
});
