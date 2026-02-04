import { describe, it, expect } from "vitest";
import { 
  AGENT_PROFILES, 
  DEPARTMENTS, 
  getAgentStats, 
  getAgentsByDepartment, 
  getDirectionAgents,
  getDepartmentHead,
  validateAgentStructure,
  getAgentProfile,
  getAgentsForRunType
} from "@/lib/agent-profiles";

describe("Agent Profiles", () => {
  describe("Structure Validation", () => {
    it("should have exactly 39 agents total", () => {
      expect(AGENT_PROFILES.length).toBe(39);
    });

    it("should have exactly 2 direction agents (CGO + QCO)", () => {
      const directionAgents = getDirectionAgents();
      expect(directionAgents.length).toBe(2);
      expect(directionAgents.map(a => a.roleKey)).toContain("CGO");
      expect(directionAgents.map(a => a.roleKey)).toContain("QCO");
    });

    it("should have exactly 37 department agents", () => {
      const stats = getAgentStats();
      expect(stats.departmentAgents).toBe(37);
    });

    it("should have exactly 11 departments", () => {
      expect(Object.keys(DEPARTMENTS).length).toBe(11);
    });

    it("should pass validateAgentStructure()", () => {
      expect(validateAgentStructure()).toBe(true);
    });
  });

  describe("Department Structure", () => {
    it("Marketing should have 5 agents", () => {
      expect(getAgentsByDepartment("marketing").length).toBe(5);
    });

    it("Commercial should have 4 agents", () => {
      expect(getAgentsByDepartment("commercial").length).toBe(4);
    });

    it("Finance should have 3 agents", () => {
      expect(getAgentsByDepartment("finance").length).toBe(3);
    });

    it("Security should have 3 agents", () => {
      expect(getAgentsByDepartment("security").length).toBe(3);
    });

    it("Product should have 4 agents", () => {
      expect(getAgentsByDepartment("product").length).toBe(4);
    });

    it("Engineering should have 5 agents", () => {
      expect(getAgentsByDepartment("engineering").length).toBe(5);
    });

    it("Data should have 4 agents", () => {
      expect(getAgentsByDepartment("data").length).toBe(4);
    });

    it("Support should have 3 agents", () => {
      expect(getAgentsByDepartment("support").length).toBe(3);
    });

    it("Governance should have 3 agents", () => {
      expect(getAgentsByDepartment("governance").length).toBe(3);
    });

    it("People should have 2 agents", () => {
      expect(getAgentsByDepartment("people").length).toBe(2);
    });

    it("Innovation should have 1 agent", () => {
      expect(getAgentsByDepartment("innovation").length).toBe(1);
    });
  });

  describe("Department Heads", () => {
    it("each department should have exactly one head", () => {
      Object.keys(DEPARTMENTS).forEach(deptKey => {
        const head = getDepartmentHead(deptKey);
        expect(head).toBeDefined();
        expect(head?.isHead).toBe(true);
      });
    });

    it("CMO should be Marketing head", () => {
      const head = getDepartmentHead("marketing");
      expect(head?.roleKey).toBe("CMO");
    });

    it("CTO should be Engineering head", () => {
      const head = getDepartmentHead("engineering");
      expect(head?.roleKey).toBe("CTO");
    });
  });

  describe("Agent Profile Helpers", () => {
    it("getAgentProfile should find existing agent", () => {
      const cgo = getAgentProfile("CGO");
      expect(cgo).toBeDefined();
      expect(cgo?.nameFr).toBe("Directeur de la Croissance");
    });

    it("getAgentProfile should return undefined for non-existent agent", () => {
      const fake = getAgentProfile("FAKE_AGENT");
      expect(fake).toBeUndefined();
    });

    it("getAgentsForRunType should find agents with matching capability", () => {
      const agents = getAgentsForRunType("DAILY_EXECUTIVE_BRIEF");
      expect(agents.length).toBeGreaterThan(0);
      expect(agents.some(a => a.roleKey === "CHIEF_OF_STAFF")).toBe(true);
    });

    it("getAgentsForRunType should return empty for non-existent run type", () => {
      const agents = getAgentsForRunType("FAKE_RUN_TYPE");
      expect(agents.length).toBe(0);
    });
  });

  describe("Agent Stats", () => {
    it("should calculate correct stats", () => {
      const stats = getAgentStats();
      expect(stats.direction).toBe(2);
      expect(stats.departmentAgents).toBe(37);
      expect(stats.total).toBe(39);
      expect(stats.totalDepartments).toBe(11);
    });

    it("byDepartment should contain all departments", () => {
      const stats = getAgentStats();
      expect(Object.keys(stats.byDepartment).length).toBe(11);
    });
  });

  describe("Agent Data Integrity", () => {
    it("all agents should have required fields", () => {
      AGENT_PROFILES.forEach(agent => {
        expect(agent.roleKey).toBeTruthy();
        expect(agent.name).toBeTruthy();
        expect(agent.nameFr).toBeTruthy();
        expect(agent.model).toBeTruthy();
        expect(agent.specialty).toBeTruthy();
        expect(agent.systemPrompt).toBeTruthy();
        expect(agent.capabilities).toBeInstanceOf(Array);
      });
    });

    it("all agents should have valid category", () => {
      AGENT_PROFILES.forEach(agent => {
        expect(["direction", "department"]).toContain(agent.category);
      });
    });

    it("all capabilities should have required fields", () => {
      AGENT_PROFILES.forEach(agent => {
        agent.capabilities.forEach(cap => {
          expect(cap.id).toBeTruthy();
          expect(cap.name).toBeTruthy();
          expect(cap.description).toBeTruthy();
          expect(cap.runTypes).toBeInstanceOf(Array);
        });
      });
    });
  });
});
