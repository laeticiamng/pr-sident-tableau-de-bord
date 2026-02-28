import { describe, it, expect } from "vitest";
import {
  RUN_TYPE_CONFIG,
  shouldRequireApproval,
  canAutoExecute,
  formatRunType,
  getRiskLevelColor,
  getRiskLevelBadgeVariant,
} from "@/lib/run-engine";
import { RUN_TYPES_REGISTRY, ALL_RUN_TYPES } from "@/lib/run-types-registry";

describe("Run Engine", () => {
  describe("RUN_TYPE_CONFIG", () => {
    it("should have all expected run types configured", () => {
      const expectedTypes = [
        "DAILY_EXECUTIVE_BRIEF",
        "CEO_STANDUP_MEETING",
        "PLATFORM_STATUS_REVIEW",
        "SECURITY_AUDIT_RLS",
        "RELEASE_GATE_CHECK",
        "DEPLOY_TO_PRODUCTION",
        "RLS_POLICY_UPDATE",
        "COMPETITIVE_ANALYSIS",
        "QUALITY_AUDIT",
        "ADS_PERFORMANCE_REVIEW",
        "GROWTH_STRATEGY_REVIEW",
        "OKR_QUARTERLY_REVIEW",
        "COMPLIANCE_RGPD_CHECK",
        "SEO_AUDIT",
        "CONTENT_CALENDAR_PLAN",
        "REVENUE_FORECAST",
        "LEAD_SCORING_UPDATE",
        "FINANCIAL_REPORT",
        "RGPD_AUDIT",
        "VULNERABILITY_SCAN",
        "ROADMAP_UPDATE",
        "CODE_REVIEW",
        "DEPLOYMENT_CHECK",
        "DATA_INSIGHTS_REPORT",
        "AGENT_PERFORMANCE_REVIEW",
        "TECH_WATCH_REPORT",
        "MARKETING_WEEK_PLAN",
        "MASS_EMAIL_CAMPAIGN",
        "PRICING_CHANGE",
      ];

      expectedTypes.forEach((type) => {
        expect(RUN_TYPE_CONFIG[type]).toBeDefined();
        expect(RUN_TYPE_CONFIG[type].title).toBeTruthy();
        expect(RUN_TYPE_CONFIG[type].riskLevel).toBeTruthy();
        expect(RUN_TYPE_CONFIG[type].steps.length).toBeGreaterThan(0);
      });
    });

    it("should have valid risk levels for all run types", () => {
      const validRiskLevels = ["low", "medium", "high", "critical"];

      Object.values(RUN_TYPE_CONFIG).forEach((config) => {
        expect(validRiskLevels).toContain(config.riskLevel);
      });
    });
  });

  describe("shouldRequireApproval", () => {
    it("should require approval for critical risk runs", () => {
      expect(shouldRequireApproval("DEPLOY_TO_PRODUCTION", "critical")).toBe(true);
      expect(shouldRequireApproval("PRICING_CHANGE", "critical")).toBe(true);
    });

    it("should require approval for high risk runs", () => {
      expect(shouldRequireApproval("RELEASE_GATE_CHECK", "high")).toBe(true);
      expect(shouldRequireApproval("MASS_EMAIL_CAMPAIGN", "high")).toBe(true);
    });

    it("should not require approval for low risk runs", () => {
      expect(shouldRequireApproval("DAILY_EXECUTIVE_BRIEF")).toBe(false);
      expect(shouldRequireApproval("CEO_STANDUP_MEETING")).toBe(false);
    });

    it("should require approval for unknown run types", () => {
      expect(shouldRequireApproval("UNKNOWN_TYPE")).toBe(true);
    });
  });

  describe("canAutoExecute", () => {
    it("should allow auto-execute for low risk runs when autopilot enabled", () => {
      expect(canAutoExecute("DAILY_EXECUTIVE_BRIEF", true)).toBe(true);
      expect(canAutoExecute("CEO_STANDUP_MEETING", true)).toBe(true);
    });

    it("should not allow auto-execute when autopilot disabled", () => {
      expect(canAutoExecute("DAILY_EXECUTIVE_BRIEF", false)).toBe(false);
    });

    it("should not allow auto-execute for critical runs", () => {
      expect(canAutoExecute("DEPLOY_TO_PRODUCTION", true)).toBe(false);
      expect(canAutoExecute("PRICING_CHANGE", true)).toBe(false);
    });

    it("should not allow auto-execute for unknown run types", () => {
      expect(canAutoExecute("UNKNOWN_TYPE", true)).toBe(false);
    });
  });

  describe("formatRunType", () => {
    it("should return the title for known run types", () => {
      expect(formatRunType("DAILY_EXECUTIVE_BRIEF")).toBe("Brief Exécutif Quotidien");
      expect(formatRunType("DEPLOY_TO_PRODUCTION")).toBe("Déploiement Production");
    });

    it("should format unknown run types nicely", () => {
      expect(formatRunType("SOME_UNKNOWN_TYPE")).toBe("SOME UNKNOWN TYPE");
    });
  });

  describe("getRiskLevelColor", () => {
    it("should return correct colors for each risk level", () => {
      expect(getRiskLevelColor("low")).toBe("text-success");
      expect(getRiskLevelColor("medium")).toBe("text-warning");
      expect(getRiskLevelColor("high")).toBe("text-orange-500");
      expect(getRiskLevelColor("critical")).toBe("text-destructive");
    });
  });

  describe("getRiskLevelBadgeVariant", () => {
    it("should return correct badge variants", () => {
      expect(getRiskLevelBadgeVariant("low")).toBe("subtle");
      expect(getRiskLevelBadgeVariant("medium")).toBe("gold");
      expect(getRiskLevelBadgeVariant("high")).toBe("destructive");
      expect(getRiskLevelBadgeVariant("critical")).toBe("destructive");
    });
  });

  describe("Registry ↔ Config sync", () => {
    it("every key in RUN_TYPES_REGISTRY must exist in RUN_TYPE_CONFIG", () => {
      ALL_RUN_TYPES.forEach((key) => {
        expect(RUN_TYPE_CONFIG[key]).toBeDefined();
        expect(RUN_TYPE_CONFIG[key].title).toBeTruthy();
      });
    });

    it("every key in RUN_TYPE_CONFIG must exist in RUN_TYPES_REGISTRY", () => {
      Object.keys(RUN_TYPE_CONFIG).forEach((key) => {
        expect(RUN_TYPES_REGISTRY[key as keyof typeof RUN_TYPES_REGISTRY]).toBeDefined();
      });
    });

    it("should have exactly 29 run types", () => {
      expect(ALL_RUN_TYPES.length).toBe(29);
      expect(Object.keys(RUN_TYPE_CONFIG).length).toBe(29);
    });
  });
});
